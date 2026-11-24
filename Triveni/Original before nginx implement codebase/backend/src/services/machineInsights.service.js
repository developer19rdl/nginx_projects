const machineRepository = require('../repositories/machine.repository');
const shiftRepository = require('../repositories/shift.repository');
const poDetailRepository = require('../repositories/poDetail.repository');
const downtimeLogRepository = require('../repositories/downtimeLog.repository');
const auditLogRepository = require('../repositories/auditLog.repository');
const qualityInspectionRepository = require('../repositories/qualityInspection.repository');
const ApiError = require('../utils/ApiError');
const { MACHINE_STATUS } = require('../config/constants');

// The one downtime reason that represents changeover/setup rather than an actual stoppage - see
// the seed list in db/migrations/024_downtime.sql. Split out of "Downtime" so the Runtime
// Analytics breakdown can show it as its own bucket, same as the Machine Insights spec asks for.
const SETUP_REASON_NAME = 'Changeover / Setup';

// Live Running/Idle detection only ever overrides these two "normal operation" master statuses -
// a machine an admin has explicitly pulled into Maintenance/Breakdown/Inactive via Machine Master
// keeps showing that manually-set state untouched; live detection only ever decides Running vs
// Idle for a machine that's otherwise in normal service.
const LIVE_DERIVED_STATUSES = [MACHINE_STATUS.AVAILABLE, MACHINE_STATUS.RUNNING];

/** The single source of truth for "live" machine status, shared by the floor dashboard
 * (dashboard.service.js) and the Machine Insights panel (getMachineInsights below) - they used to
 * each derive this independently, which is exactly how they drifted out of sync (the dashboard
 * card correctly showed Idle while the Insights page still showed the stale machines.status
 * master value of Running). Running only when a machine_planning row is actually
 * production_status = 'RUNNING' right now; otherwise Idle - unless the master status is a
 * deliberate admin override (Maintenance/Breakdown/Inactive), which passes through untouched. */
function deriveLiveStatus(masterStatus, hasActiveProduction) {
  if (!LIVE_DERIVED_STATUSES.includes(masterStatus)) return masterStatus;
  return hasActiveProduction ? MACHINE_STATUS.RUNNING : MACHINE_STATUS.AVAILABLE;
}

function todayStr(now) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Which of the active shifts is happening right now - mirrors dashboard.service.js's
 * resolveCurrentShift (itself mirroring the operator app's Home.jsx), duplicated locally rather
 * than shared since each of the three copies is small and independently owned by its module. */
function resolveCurrentShift(shifts, now) {
  if (!shifts?.length) return null;
  const nowStr = now.toTimeString().slice(0, 8);
  return (
    shifts.find((s) =>
      s.end_time > s.start_time ? nowStr >= s.start_time && nowStr < s.end_time : nowStr >= s.start_time || nowStr < s.end_time
    ) || null
  );
}

/** Turns a Date + Shift into a concrete [start, end) datetime window - mirrors
 * downtimeLog.service.js#shiftWindow exactly (handles a shift crossing midnight into the next
 * calendar day). Returned as 'YYYY-MM-DD HH:MM:SS' strings, the same naive-local representation
 * the rest of the app stores DATETIME columns as, so string/Date comparisons here line up with
 * what MariaDB itself would compare. */
function shiftWindow(scheduleDate, shift) {
  const [y, m, d] = scheduleDate.split('-').map(Number);
  const startOfDay = new Date(Date.UTC(y, m - 1, d));
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
  const dateStr = (date) => date.toISOString().slice(0, 10);
  const windowStart = `${dateStr(startOfDay)} ${shift.start_time}`;
  const windowEnd = shift.crosses_midnight ? `${dateStr(nextDay)} ${shift.end_time}` : `${dateStr(startOfDay)} ${shift.end_time}`;
  return { windowStart, windowEnd };
}

function toDate(datetimeStr) {
  return new Date(String(datetimeStr).replace(' ', 'T'));
}

function minutesBetween(a, b) {
  return Math.max(0, (b.getTime() - a.getTime()) / 60000);
}

/** Every "how much of the target/capacity was achieved" percentage in this file (Efficiency,
 * Achievement, Availability, Utilization, OEE and its factors, ...) is a bounded 0-100 scale metric
 * by definition, even though the raw ratio behind it can mathematically exceed 1 - overproduction
 * (produced > target) is entirely valid data, it just means the *displayed percentage* must be
 * capped at 100%, the same way this file already capped performancePercent. Never apply this to a
 * deliberately unbounded comparison/delta metric (e.g. MachineCard's "+X% vs target", or Downtime
 * Trends' month-over-month change%) - those are supposed to go over 100 (or negative). */
function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

/** Running/Idle/Downtime/Setup minutes (+ produced/target qty) for one machine over an arbitrary
 * [windowStart, windowEnd) datetime window, "so far" (clipped at `now` if the window is still in
 * progress). The shared core behind computeRuntimeAnalytics (one shift's window) and
 * computeDayRuntimeAnalytics (the whole calendar day's window) - same math either way, just a
 * different window.
 * Running/Produced/Downtime/Setup/Idle are all driven by when work was actually *submitted* -
 * production_start_at/production_end_at (the Start/Stop/Resume timer) and produced_qty on
 * whichever rows genuinely ran during this window, and downtime_logs (already timestamp-based) -
 * never by a row's own schedule_date/shift_id fields, which just say what was originally planned
 * and can go stale relative to when it was actually worked (a plan uploaded for one date but run
 * days later, for instance). A row that was Reset (or never started) has no production_start_at
 * and simply doesn't show up here yet. Idle is whatever time is left over once Running/Downtime/
 * Setup are accounted for - "the machine was available but nothing was actually running on it".
 *
 * Target is the one exception: when `planned` ({machineId, scheduleDate, shiftId}) is given (i.e.
 * this is a single shift's window, from computeRuntimeAnalytics), Target is what was actually
 * *scheduled* to this machine for that shift (schedule_date + shift_id) via poDetailRepository.
 * findByMachine, independent of whether production has started - a machine that hasn't begun its
 * assigned lot yet should still show a real Target, not 0. Without `planned` (the whole-day window
 * has no single shift_id to filter by), Target falls back to summing quantity across the same
 * actual-window rows Produced/Running use. */
async function computeRuntimeForWindow(machineId, windowStart, windowEnd, now, planned) {
  const windowStartDate = toDate(windowStart);
  const windowEndDate = toDate(windowEnd);
  const elapsedEnd = now < windowEndDate ? now : windowEndDate;
  const elapsedMinutes = Math.round(minutesBetween(windowStartDate, elapsedEnd));

  const logs = await downtimeLogRepository.findByMachineWindow(machineId, windowStart, windowEnd);
  let setupMinutes = 0;
  let downtimeMinutes = 0;
  for (const log of logs) {
    const start = toDate(log.started_at);
    const end = log.ended_at ? toDate(log.ended_at) : now;
    const clippedStart = start < windowStartDate ? windowStartDate : start;
    const clippedEnd = end > elapsedEnd ? elapsedEnd : end;
    const duration = minutesBetween(clippedStart, clippedEnd);
    if (log.reason_name === SETUP_REASON_NAME) setupMinutes += duration;
    else downtimeMinutes += duration;
  }
  setupMinutes = Math.round(setupMinutes);
  downtimeMinutes = Math.round(downtimeMinutes);

  const planRows = await poDetailRepository.findByMachineActualWindow(machineId, windowStart, windowEnd);
  let runningMinutes = 0;
  let producedQty = 0;
  let actualTargetQty = 0;
  for (const row of planRows) {
    const start = toDate(row.production_start_at);
    const end = row.production_end_at ? toDate(row.production_end_at) : now;
    const clippedStart = start < windowStartDate ? windowStartDate : start;
    const clippedEnd = end > elapsedEnd ? elapsedEnd : end;
    if (clippedEnd > clippedStart) runningMinutes += minutesBetween(clippedStart, clippedEnd);
    producedQty += Number(row.produced_qty) || 0;
    actualTargetQty += Number(row.quantity) || 0;
  }
  runningMinutes = Math.round(runningMinutes);

  // Target = what was actually scheduled/assigned to this machine for this shift (schedule_date +
  // shift_id), independent of whether production has started yet - not "whatever happened to
  // overlap in real time" like Produced/Runtime above, which stay driven by the Start/Stop/Resume
  // timer. Only meaningful for a single shift's window (`planned` is passed only from
  // computeRuntimeAnalytics); the whole-day window (computeDayRuntimeAnalytics, no one shift_id to
  // filter by) falls back to the actual-window rows' own quantity sum, same as before.
  let targetQty = actualTargetQty;
  if (planned) {
    const plannedRows = await poDetailRepository.findByMachine(planned);
    targetQty = plannedRows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
  }

  const idleMinutes = Math.max(0, elapsedMinutes - runningMinutes - setupMinutes - downtimeMinutes);

  return {
    elapsedMinutes,
    runningMinutes,
    idleMinutes,
    downtimeMinutes,
    setupMinutes,
    producedQty,
    targetQty,
  };
}

/** Same as computeRuntimeForWindow, just for one shift's window on one date - kept as its own
 * name since every existing call site already reads as "this shift's runtime". */
async function computeRuntimeAnalytics(machineId, scheduleDate, shift, now) {
  const { windowStart, windowEnd } = shiftWindow(scheduleDate, shift);
  return computeRuntimeForWindow(machineId, windowStart, windowEnd, now, { machineId, scheduleDate, shiftId: shift.id });
}

/** Same as computeRuntimeAnalytics, but for the whole calendar day rather than one shift - powers
 * the "Machine Utilization %" figure, which is meant to read as "today", not "this shift". */
async function computeDayRuntimeAnalytics(machineId, scheduleDate, now) {
  const { windowStart, windowEnd } = dayWindow(scheduleDate);
  return computeRuntimeForWindow(machineId, windowStart, windowEnd, now);
}

/** Reconstructs today's hourly production output from the audit trail every produced_qty edit
 * already writes (poAssignment.service.js#updateProducedQty) - there's no dedicated production-
 * history table, but the audit log already captures exactly this. Which rows to pull from the
 * trail is decided the same "actually worked today" way as computeRuntimeAnalytics (production_
 * start_at falling in today's calendar window), not by schedule_date. */
async function computeProductionTrend(machineId, dayWindowStart, dayWindowEnd, scheduleDate, now, machine) {
  const todaysRows = await poDetailRepository.findByMachineActualWindow(machineId, dayWindowStart, dayWindowEnd);
  const rowIds = todaysRows.map((r) => r.id);
  const trail = rowIds.length
    ? await auditLogRepository.findProducedQtyTrail(rowIds, `${scheduleDate} 00:00:00`, `${scheduleDate} 23:59:59`)
    : [];

  // Track each row's last-known produced_qty so every audit entry contributes only its
  // incremental delta to that hour's bucket - summing raw cumulative values would count a row's
  // earlier progress again on every later edit.
  const lastKnown = new Map();
  const hourlyDeltas = new Map();

  for (const entry of trail) {
    let newQty;
    let oldQty;
    try {
      const newVal = typeof entry.new_value === 'string' ? JSON.parse(entry.new_value) : entry.new_value;
      const oldVal = typeof entry.old_value === 'string' ? JSON.parse(entry.old_value) : entry.old_value;
      newQty = Number(newVal?.produced_qty);
      oldQty = Number(oldVal?.produced_qty);
    } catch {
      continue;
    }
    if (!Number.isFinite(newQty)) continue;

    const baseline = lastKnown.has(entry.record_id) ? lastKnown.get(entry.record_id) : Number.isFinite(oldQty) ? oldQty : 0;
    const delta = Math.max(0, newQty - baseline);
    lastKnown.set(entry.record_id, newQty);
    if (delta <= 0) continue;

    const hour = toDate(entry.created_at).getHours();
    hourlyDeltas.set(hour, (hourlyDeltas.get(hour) || 0) + delta);
  }

  const currentHour = now.getHours();
  const hourly = [];
  for (let h = 0; h <= currentHour; h++) {
    hourly.push({ hour: `${String(h).padStart(2, '0')}:00`, produced: Math.round(hourlyDeltas.get(h) || 0) });
  }

  const totalProduced = hourly.reduce((sum, p) => sum + p.produced, 0);
  const averageRatePerHour = hourly.length ? Math.round((totalProduced / hourly.length) * 10) / 10 : 0;

  return { hourly, averageRatePerHour, targetRatePerHour: Number(machine.production_rate) || 0 };
}

/**
 * Standard three-factor OEE for whichever shift is happening right now:
 *  - Availability = Run Time / Planned Production Time, where Planned Production Time excludes
 *    Setup (a scheduled changeover, not a loss) and Run Time also treats Idle (no work assigned)
 *    as a loss - the machine was scheduled to be available and wasn't producing.
 *  - Performance  = actual observed rate / the machine's configured ideal rate, capped at 100%
 *    (a rate reading above nominal is far more likely a data/config artifact than a real gain).
 *  - Quality      = accepted qty / (accepted + rejected qty) from this shift's quality_inspections
 *    - defaults to 100% when nothing has been inspected yet, the same convention most OEE tools
 *      use for "no adverse signal recorded", not a claim that everything produced is known-good.
 */
async function computeOee(machineId, scheduleDate, shift, runtime, machine) {
  const plannedMinutes = Math.max(0, runtime.elapsedMinutes - runtime.setupMinutes);
  const runMinutes = runtime.runningMinutes; // idle counts as a loss, same reasoning as the comment above
  // Running minutes are bounded by planned minutes in the normal case, but clamp defensively -
  // overlapping "running" windows from a data inconsistency elsewhere shouldn't surface as >100%.
  const availabilityPercent = plannedMinutes > 0 ? clampPercent(Math.round((runMinutes / plannedMinutes) * 1000) / 10) : 0;

  const idealRate = Number(machine.production_rate) || 0;
  const actualRate = runMinutes > 0 ? runtime.producedQty / (runMinutes / 60) : 0;
  const performancePercent = idealRate > 0 ? clampPercent(Math.round((actualRate / idealRate) * 1000) / 10) : 0;

  const { windowStart, windowEnd } = shiftWindow(scheduleDate, shift);
  const qualityTotals = await qualityInspectionRepository.sumQualityForMachineShift(machineId, windowStart, windowEnd);
  const acceptedQty = Number(qualityTotals.accepted_qty) || 0;
  const rejectedQty = Number(qualityTotals.rejected_qty) || 0;
  const inspectedQty = acceptedQty + rejectedQty;
  const qualityPercent = inspectedQty > 0 ? clampPercent(Math.round((acceptedQty / inspectedQty) * 1000) / 10) : 100;

  const oeePercent = clampPercent(Math.round(((availabilityPercent * performancePercent * qualityPercent) / 10000) * 10) / 10);

  return {
    availabilityPercent,
    performancePercent,
    qualityPercent,
    oeePercent,
    goodCount: Math.round(acceptedQty),
    rejectCount: Math.round(rejectedQty),
    productionRate: idealRate,
    capacityPerDay: Number(machine.capacity_per_day) || null,
  };
}

/** Today's calendar-day [00:00, next 00:00) window, in the same naive-local DATETIME string form
 * as shiftWindow - the basis for "today" totals that aren't scoped to one particular shift. */
function dayWindow(scheduleDate) {
  const [y, m, d] = scheduleDate.split('-').map(Number);
  const startOfDay = new Date(Date.UTC(y, m - 1, d));
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
  const dateStr = (date) => date.toISOString().slice(0, 10);
  return { windowStart: `${dateStr(startOfDay)} 00:00:00`, windowEnd: `${dateStr(nextDay)} 00:00:00` };
}

const RELIABILITY_WINDOW_DAYS = 14;

/** A JS Date -> the naive-local 'YYYY-MM-DD HH:MM:SS' string form every DATETIME column/window
 * comparison in this file already uses (the exact inverse of toDate). */
function toDatetimeStr(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Every downtime_logs row for a machine over the trailing N days (through "now"), plus the exact
 * window they were fetched for - used by computeReliability (MTBF/MTTR). */
async function fetchRecentDowntimeLogs(machineId, now, windowDays) {
  const windowEndDate = new Date(now);
  const windowStartDate = startOfDay(now);
  windowStartDate.setDate(windowStartDate.getDate() - (windowDays - 1));
  const logs = await downtimeLogRepository.findByMachineWindow(machineId, toDatetimeStr(windowStartDate), toDatetimeStr(windowEndDate));
  return { logs, windowStartDate, windowEndDate };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Today view: an hourly (00:00-current hour) downtime timeline, total minutes, event count, the
 * single longest event, a ranked top-reasons list, and today's Availability % (Running / Planned,
 * the same formula computeOee uses for one shift - just for the whole day instead). */
async function getTodayDowntimeTrends(machineId, now) {
  const scheduleDate = todayStr(now);
  const { windowStart, windowEnd } = dayWindow(scheduleDate);
  const windowStartDate = toDate(windowStart);
  const logs = await downtimeLogRepository.findByMachineWindow(machineId, windowStart, windowEnd);

  const hourlyMinutes = new Array(24).fill(0);
  let totalMinutes = 0;
  let longestEvent = null;
  const reasonTotals = new Map();

  for (const log of logs) {
    const start = toDate(log.started_at);
    const rawEnd = log.ended_at ? toDate(log.ended_at) : now;
    const clampedEnd = rawEnd > now ? now : rawEnd;
    if (clampedEnd <= start) continue;
    const duration = minutesBetween(start, clampedEnd);
    totalMinutes += duration;

    // Split the event's minutes across every hour bucket it actually spans, so an event starting
    // at 09:50 and ending at 10:10 counts 10 minutes in the 09:00 bucket and 10 in the 10:00
    // bucket, rather than all 20 dumped into whichever hour it started in.
    let cursor = start < windowStartDate ? windowStartDate : start;
    while (cursor < clampedEnd) {
      const hour = cursor.getHours();
      const hourEnd = new Date(cursor);
      hourEnd.setMinutes(0, 0, 0);
      hourEnd.setHours(hour + 1);
      const segmentEnd = clampedEnd < hourEnd ? clampedEnd : hourEnd;
      hourlyMinutes[hour] += minutesBetween(cursor, segmentEnd);
      cursor = segmentEnd;
    }

    if (!longestEvent || duration > longestEvent.minutes) {
      longestEvent = { reasonName: log.reason_name, minutes: duration, startedAt: log.started_at, ongoing: !log.ended_at };
    }

    const totals = reasonTotals.get(log.reason_name) || { minutes: 0, count: 0 };
    totals.minutes += duration;
    totals.count += 1;
    reasonTotals.set(log.reason_name, totals);
  }

  const currentHour = now.getHours();
  const chart = [];
  for (let h = 0; h <= currentHour; h += 1) {
    chart.push({ label: `${String(h).padStart(2, '0')}:00`, minutes: Math.round(hourlyMinutes[h]) });
  }

  const topReasons = [...reasonTotals.entries()]
    .map(([reasonName, t]) => ({ reasonName, minutes: Math.round(t.minutes), count: t.count }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  const dayRuntime = await computeDayRuntimeAnalytics(machineId, scheduleDate, now);
  const plannedMinutes = Math.max(0, dayRuntime.elapsedMinutes - dayRuntime.setupMinutes);
  const availabilityPercent = plannedMinutes > 0 ? clampPercent(Math.round((dayRuntime.runningMinutes / plannedMinutes) * 1000) / 10) : 0;

  return {
    period: 'today',
    chart,
    totalDowntimeMinutes: Math.round(totalMinutes),
    eventCount: logs.length,
    topReasons,
    longestEvent: longestEvent ? { ...longestEvent, minutes: Math.round(longestEvent.minutes) } : null,
    availabilityPercent,
  };
}

/** Weekly view: this calendar week so far (Monday-Sunday, Monday-start to match the rest of the
 * app's shift/schedule conventions), day-wise downtime totals, and a "recurring reasons" ranking -
 * sorted by how many distinct days a reason showed up on before total minutes, so a reason that
 * nags every day outranks one big one-off event even if the one-off cost more total minutes. */
async function getWeeklyDowntimeTrends(machineId, now) {
  const dayOfWeekMonday0 = (now.getDay() + 6) % 7; // getDay(): 0=Sun..6=Sat -> 0=Mon..6=Sun
  const weekStart = startOfDay(now);
  weekStart.setDate(weekStart.getDate() - dayOfWeekMonday0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const logs = await downtimeLogRepository.findByMachineWindow(machineId, toDatetimeStr(weekStart), toDatetimeStr(weekEnd));

  const dailyMinutes = new Array(7).fill(0);
  const reasonTotals = new Map();
  const reasonDaysAffected = new Map(); // reason -> Set<dayIdx>
  let totalMinutes = 0;

  for (const log of logs) {
    const start = toDate(log.started_at);
    const rawEnd = log.ended_at ? toDate(log.ended_at) : now;
    const clampedEnd = rawEnd > now ? now : rawEnd;
    if (clampedEnd <= start) continue;
    const duration = minutesBetween(start, clampedEnd);
    totalMinutes += duration;

    const dayIdx = Math.round((startOfDay(start).getTime() - weekStart.getTime()) / DAY_MS);
    if (dayIdx >= 0 && dayIdx < 7) {
      dailyMinutes[dayIdx] += duration;
      if (!reasonDaysAffected.has(log.reason_name)) reasonDaysAffected.set(log.reason_name, new Set());
      reasonDaysAffected.get(log.reason_name).add(dayIdx);
    }

    const totals = reasonTotals.get(log.reason_name) || { minutes: 0, count: 0 };
    totals.minutes += duration;
    totals.count += 1;
    reasonTotals.set(log.reason_name, totals);
  }

  const chart = WEEKDAY_LABELS.map((label, i) => ({ label, minutes: Math.round(dailyMinutes[i]) }));
  const daysElapsed = Math.min(7, dayOfWeekMonday0 + 1);

  const topReasons = [...reasonTotals.entries()]
    .map(([reasonName, t]) => ({
      reasonName,
      minutes: Math.round(t.minutes),
      count: t.count,
      daysAffected: reasonDaysAffected.get(reasonName)?.size || 0,
    }))
    .sort((a, b) => b.daysAffected - a.daysAffected || b.minutes - a.minutes)
    .slice(0, 5);

  return {
    period: 'weekly',
    chart,
    totalDowntimeMinutes: Math.round(totalMinutes),
    avgDailyDowntimeMinutes: daysElapsed > 0 ? Math.round((totalMinutes / daysElapsed) * 10) / 10 : 0,
    daysElapsed,
    topReasons,
  };
}

/** Monthly view: week-of-month downtime totals, total/average-per-day so far, a downtime-by-reason
 * distribution, and a like-for-like comparison against the previous month - "like-for-like"
 * because comparing a partial current month (e.g. 8 days in) against a *full* previous month would
 * always look like a huge improvement, so the previous month is clipped to the same number of
 * elapsed days (clipped again to that month's own length, if it's shorter - e.g. comparing March
 * 1-30 against the whole of February rather than overshooting into March). */
async function getMonthlyDowntimeTrends(machineId, now) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const daysElapsed = now.getDate();
  const daysInMonth = Math.round((nextMonthStart.getTime() - monthStart.getTime()) / DAY_MS);

  let prevMonthPartialEnd = new Date(prevMonthStart);
  prevMonthPartialEnd.setDate(prevMonthPartialEnd.getDate() + daysElapsed);
  if (prevMonthPartialEnd > monthStart) prevMonthPartialEnd = monthStart;

  const [currentLogs, prevLogs] = await Promise.all([
    downtimeLogRepository.findByMachineWindow(machineId, toDatetimeStr(monthStart), toDatetimeStr(now)),
    downtimeLogRepository.findByMachineWindow(machineId, toDatetimeStr(prevMonthStart), toDatetimeStr(prevMonthPartialEnd)),
  ]);

  const weekCount = Math.ceil(daysInMonth / 7);
  const weeklyMinutes = new Array(weekCount).fill(0);
  const reasonTotals = new Map();
  let totalMinutes = 0;

  for (const log of currentLogs) {
    const start = toDate(log.started_at);
    const rawEnd = log.ended_at ? toDate(log.ended_at) : now;
    const clampedEnd = rawEnd > now ? now : rawEnd;
    if (clampedEnd <= start) continue;
    const duration = minutesBetween(start, clampedEnd);
    totalMinutes += duration;

    const weekIdx = Math.floor((start.getDate() - 1) / 7);
    weeklyMinutes[weekIdx] += duration;

    const totals = reasonTotals.get(log.reason_name) || { minutes: 0, count: 0 };
    totals.minutes += duration;
    totals.count += 1;
    reasonTotals.set(log.reason_name, totals);
  }

  let prevPartialMinutes = 0;
  for (const log of prevLogs) {
    const start = toDate(log.started_at);
    const end = log.ended_at ? toDate(log.ended_at) : prevMonthPartialEnd;
    const clampedEnd = end > prevMonthPartialEnd ? prevMonthPartialEnd : end;
    if (clampedEnd <= start) continue;
    prevPartialMinutes += minutesBetween(start, clampedEnd);
  }

  const chart = weeklyMinutes.map((minutes, i) => ({ label: `Week ${i + 1}`, minutes: Math.round(minutes) }));

  const topReasons = [...reasonTotals.entries()]
    .map(([reasonName, t]) => ({ reasonName, minutes: Math.round(t.minutes), count: t.count }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6);

  const changePercent = prevPartialMinutes > 0 ? Math.round(((totalMinutes - prevPartialMinutes) / prevPartialMinutes) * 1000) / 10 : null;

  return {
    period: 'monthly',
    chart,
    totalDowntimeMinutes: Math.round(totalMinutes),
    avgDowntimePerDay: daysElapsed > 0 ? Math.round((totalMinutes / daysElapsed) * 10) / 10 : 0,
    topReasons,
    comparisonWithPreviousMonth: {
      previousPartialMinutes: Math.round(prevPartialMinutes),
      changePercent,
      daysCompared: daysElapsed,
    },
  };
}

/** Downtime Trends card's data, for whichever of the three periods the user has selected - each
 * period has its own shape (see the three functions above), fetched on demand (not part of the
 * main getMachineInsights payload) so switching Today/Weekly/Monthly doesn't need to refetch or
 * recompute everything else on the page. */
async function getDowntimeTrends(machineId, period, now = new Date()) {
  if (period === 'weekly') return getWeeklyDowntimeTrends(machineId, now);
  if (period === 'monthly') return getMonthlyDowntimeTrends(machineId, now);
  return getTodayDowntimeTrends(machineId, now);
}

/** Today view: reuses computeProductionTrend's hourly-produced reconstruction (from the audit
 * trail, see that function's own comment) and repeats the shift's flat targetRatePerHour as each
 * hour's target - the same reference-line convention the old chart already used, just carried
 * per-bar now so a tooltip can show an Achievement % per hour. `isCurrent` marks the current hour
 * so the frontend can highlight that one bar. */
async function getTodayProductionTrend(machineId, now, machine) {
  const scheduleDate = todayStr(now);
  const { windowStart: dayStart, windowEnd: dayEnd } = dayWindow(scheduleDate);
  const trend = await computeProductionTrend(machineId, dayStart, dayEnd, scheduleDate, now, machine);
  const currentHour = now.getHours();

  const chart = trend.hourly.map((h) => ({
    label: h.hour,
    produced: h.produced,
    target: trend.targetRatePerHour,
    isCurrent: Number(h.hour.slice(0, 2)) === currentHour,
  }));
  const totalProduced = chart.reduce((sum, c) => sum + c.produced, 0);
  const totalTarget = chart.reduce((sum, c) => sum + c.target, 0);

  return {
    period: 'today',
    chart,
    totalProduced,
    totalTarget: Math.round(totalTarget),
    achievementPercent: totalTarget > 0 ? clampPercent(Math.round((totalProduced / totalTarget) * 1000) / 10) : 0,
  };
}

/** Weekly view: day-wise produced vs. target for this calendar week so far (Monday-start, same
 * convention as Downtime Trends), attributing each plan row to the day it actually started
 * running - a row that started before this week (still running into it) is clipped to Monday so
 * it doesn't fall outside the 7-day bucket array. `isCurrent` marks today's bar. */
async function getWeeklyProductionTrend(machineId, now) {
  const dayOfWeekMonday0 = (now.getDay() + 6) % 7;
  const weekStart = startOfDay(now);
  weekStart.setDate(weekStart.getDate() - dayOfWeekMonday0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const rows = await poDetailRepository.findByMachineActualWindow(machineId, toDatetimeStr(weekStart), toDatetimeStr(weekEnd));
  const producedByDay = new Array(7).fill(0);
  const targetByDay = new Array(7).fill(0);
  for (const row of rows) {
    const start = toDate(row.production_start_at);
    const bucketDate = start < weekStart ? weekStart : start;
    const dayIdx = Math.round((startOfDay(bucketDate).getTime() - weekStart.getTime()) / DAY_MS);
    if (dayIdx >= 0 && dayIdx < 7) {
      producedByDay[dayIdx] += Number(row.produced_qty) || 0;
      targetByDay[dayIdx] += Number(row.quantity) || 0;
    }
  }

  const chart = WEEKDAY_LABELS.map((label, i) => ({
    label,
    produced: Math.round(producedByDay[i]),
    target: Math.round(targetByDay[i]),
    isCurrent: i === dayOfWeekMonday0,
  }));
  const totalProduced = Math.round(producedByDay.reduce((a, b) => a + b, 0));
  const totalTarget = Math.round(targetByDay.reduce((a, b) => a + b, 0));

  return {
    period: 'weekly',
    chart,
    totalProduced,
    totalTarget,
    achievementPercent: totalTarget > 0 ? clampPercent(Math.round((totalProduced / totalTarget) * 1000) / 10) : 0,
  };
}

/** Monthly view: week-of-month produced vs. target so far, same week-bucketing as Downtime Trends'
 * monthly view (Week 1 = days 1-7, etc.) so the two cards read consistently. A row that started
 * before this month (still running into it) is clipped to the 1st so it doesn't fall outside the
 * bucket array. `isCurrent` marks the current week's bar. */
async function getMonthlyProductionTrend(machineId, now) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysInMonth = Math.round((nextMonthStart.getTime() - monthStart.getTime()) / DAY_MS);
  const weekCount = Math.ceil(daysInMonth / 7);

  const rows = await poDetailRepository.findByMachineActualWindow(machineId, toDatetimeStr(monthStart), toDatetimeStr(now));
  const producedByWeek = new Array(weekCount).fill(0);
  const targetByWeek = new Array(weekCount).fill(0);
  for (const row of rows) {
    const start = toDate(row.production_start_at);
    const bucketDate = start < monthStart ? monthStart : start;
    const weekIdx = Math.floor((bucketDate.getDate() - 1) / 7);
    producedByWeek[weekIdx] += Number(row.produced_qty) || 0;
    targetByWeek[weekIdx] += Number(row.quantity) || 0;
  }

  const currentWeekIdx = Math.floor((now.getDate() - 1) / 7);
  const chart = producedByWeek.map((produced, i) => ({
    label: `Week ${i + 1}`,
    produced: Math.round(produced),
    target: Math.round(targetByWeek[i]),
    isCurrent: i === currentWeekIdx,
  }));
  const totalProduced = Math.round(producedByWeek.reduce((a, b) => a + b, 0));
  const totalTarget = Math.round(targetByWeek.reduce((a, b) => a + b, 0));

  return {
    period: 'monthly',
    chart,
    totalProduced,
    totalTarget,
    achievementPercent: totalTarget > 0 ? clampPercent(Math.round((totalProduced / totalTarget) * 1000) / 10) : 0,
  };
}

/** Production Trend card's data, for whichever of the three periods the user has selected -
 * fetched on demand (not part of the main getMachineInsights payload), same reasoning as
 * getDowntimeTrends: switching periods shouldn't refetch or block on the rest of the page. */
async function getProductionTrendForPeriod(machineId, period, now = new Date()) {
  const machine = await machineRepository.findById(machineId);
  if (!machine) throw ApiError.notFound('Machine not found');
  if (period === 'weekly') return getWeeklyProductionTrend(machineId, now);
  if (period === 'monthly') return getMonthlyProductionTrend(machineId, now);
  return getTodayProductionTrend(machineId, now, machine);
}

/** MTBF (Mean Time Between Failures) and MTTR (Mean Time To Repair) over the trailing N days.
 * "Failure" here means an unplanned downtime event - every downtime_logs entry except the one
 * planned-changeover reason (SETUP_REASON_NAME), the same carve-out RuntimeAnalyticsSection's
 * Setup-vs-Downtime split already uses elsewhere in this file.
 *   MTBF = total operating time in the window / number of failures (operating time = the window's
 *          elapsed time minus failure downtime - Idle still counts as "operating"/available time,
 *          the standard simplification when there's no separate "not scheduled to run" concept).
 *   MTTR = total failure-repair time in the window / number of failures.
 * Both are null (not zero) when there were no failures in the window - "no data", not "instant". */
async function computeReliability(machineId, now, windowDays = RELIABILITY_WINDOW_DAYS) {
  const { logs, windowStartDate, windowEndDate } = await fetchRecentDowntimeLogs(machineId, now, windowDays);

  let failureMinutes = 0;
  let failureCount = 0;
  for (const log of logs) {
    if (log.reason_name === SETUP_REASON_NAME) continue;
    const start = toDate(log.started_at);
    const end = log.ended_at ? toDate(log.ended_at) : now;
    failureMinutes += minutesBetween(start, end);
    failureCount += 1;
  }

  const windowElapsedMinutes = minutesBetween(windowStartDate, windowEndDate);
  const operatingMinutes = Math.max(0, windowElapsedMinutes - failureMinutes);

  return {
    windowDays,
    failureCount,
    mtbfMinutes: failureCount > 0 ? Math.round(operatingMinutes / failureCount) : null,
    mttrMinutes: failureCount > 0 ? Math.round(failureMinutes / failureCount) : null,
  };
}

/**
 * Everything the Machine Insights panel needs for one machine: live production numbers for
 * whichever shift is happening right now, a running/idle/downtime/setup breakdown for that same
 * shift, an hourly production trend reconstructed from the audit trail, and a produced-vs-target
 * comparison across every shift today. Computed fresh on every call, not cached.
 *
 * "This shift"/"today" throughout this function means *actually worked* in that window
 * (production_start_at falling in it) - not the row's own schedule_date/shift_id, which is just
 * what was originally planned and can lag behind when the operator genuinely ran it. Live
 * Production and OEE are both scoped to the current shift specifically (zero/null during a gap
 * between shifts, never the whole day) - only Machine Utilization (todayTotals) stays day-scoped,
 * since that figure is explicitly meant to answer "today", not "this shift".
 */
async function getMachineInsights(machineId) {
  const machine = await machineRepository.findById(machineId);
  if (!machine) throw ApiError.notFound('Machine not found');
  const hasActiveProduction = await poDetailRepository.hasActiveProduction(machineId);

  const now = new Date();
  const scheduleDate = todayStr(now);
  const shifts = await shiftRepository.findAll({ activeOnly: true });
  const currentShift = resolveCurrentShift(shifts, now);

  const currentShiftRuntime = currentShift ? await computeRuntimeAnalytics(machineId, scheduleDate, currentShift, now) : null;

  // Live Production is scoped to whichever shift is happening right now (currentShiftRuntime),
  // not the whole day - "Live" means "what this shift has done so far", the same figures
  // shiftPerformance already computes per shift, just surfaced as this page's headline numbers.
  // Zero/blank (not an error) during a gap between shifts, same as OEE below.
  const targetQty = currentShiftRuntime?.targetQty ?? 0;
  const producedQty = currentShiftRuntime?.producedQty ?? 0;
  const remainingQty = Math.max(0, targetQty - producedQty);
  // Capped at 100% - overproduction (producedQty > targetQty) is valid data, but Efficiency is a
  // bounded 0-100% completion metric, not an unbounded surplus indicator (that's what the
  // dashboard's separate "+X% vs target" delta is for).
  const efficiencyPercent = targetQty > 0 ? clampPercent(Math.round((producedQty / targetQty) * 1000) / 10) : 0;

  // Prefer the actual observed rate for the shift in progress; fall back to the machine's
  // configured rate when there isn't yet enough running time this shift to divide by (avoids a
  // wild divide-by-near-zero spike right after a shift starts).
  let currentRatePerHour = Number(machine.production_rate) || 0;
  if (currentShift && currentShiftRuntime.runningMinutes >= 5) {
    currentRatePerHour = Math.round((currentShiftRuntime.producedQty / (currentShiftRuntime.runningMinutes / 60)) * 10) / 10;
  }

  const oee = currentShift ? await computeOee(machineId, scheduleDate, currentShift, currentShiftRuntime, machine) : null;

  let estimatedCompletion = null;
  if (remainingQty > 0 && currentRatePerHour > 0) {
    estimatedCompletion = new Date(now.getTime() + (remainingQty / currentRatePerHour) * 3600000).toISOString();
  }

  // "Today" totals (not shift-scoped) - just Machine Utilization % so far: how much of today's
  // elapsed time the machine actually spent running vs. everything else (idle/down/setup).
  const dayRuntime = await computeDayRuntimeAnalytics(machineId, scheduleDate, now);
  const todayTotals = {
    ...dayRuntime,
    utilizationPercent: dayRuntime.elapsedMinutes > 0 ? clampPercent(Math.round((dayRuntime.runningMinutes / dayRuntime.elapsedMinutes) * 1000) / 10) : 0,
  };

  const reliability = await computeReliability(machineId, now);

  const shiftPerformance = await Promise.all(
    shifts.map(async (shift) => {
      const runtime = shift.id === currentShift?.id ? currentShiftRuntime : await computeRuntimeAnalytics(machineId, scheduleDate, shift, now);
      return {
        shiftId: shift.id,
        shiftCode: shift.shift_code,
        shiftName: shift.shift_name,
        isCurrent: shift.id === currentShift?.id,
        targetQty: runtime.targetQty,
        producedQty: runtime.producedQty,
        efficiencyPercent: runtime.targetQty > 0 ? clampPercent(Math.round((runtime.producedQty / runtime.targetQty) * 1000) / 10) : 0,
        // Runtime = actually running only (Idle - machine on, no work assigned/running - is a
        // separate loss bucket, same treatment computeOee's Availability already gives it above;
        // folding Idle into Runtime here made this card overstate how much a shift really ran).
        runtimeMinutes: runtime.runningMinutes,
        downtimeMinutes: runtime.downtimeMinutes + runtime.setupMinutes,
      };
    })
  );

  return {
    machine: {
      id: machine.id,
      machineCode: machine.machine_code,
      machineName: machine.machine_name,
      machineType: machine.machine_type,
      status: deriveLiveStatus(machine.status, hasActiveProduction),
    },
    liveProduction: { producedQty, targetQty, remainingQty, efficiencyPercent, currentRatePerHour, estimatedCompletion },
    runtimeAnalytics: {
      shift: currentShift ? { id: currentShift.id, code: currentShift.shift_code, name: currentShift.shift_name } : null,
      ...(currentShiftRuntime || { elapsedMinutes: 0, runningMinutes: 0, idleMinutes: 0, downtimeMinutes: 0, setupMinutes: 0 }),
    },
    shiftPerformance,
    oee,
    todayTotals,
    reliability,
  };
}

/** Real per-machine OEE (Availability x Performance x Quality) AND current-shift Produced/Target,
 * for whichever shift is happening right now, for every machine on the floor grid at once - the
 * same computeOee/computeRuntimeAnalytics used by the on-demand Machine Insights panel, just run
 * for every active machine in parallel instead of one machine at a time. Returns a
 * Map<machineId, {oeePercent, availabilityPercent, performancePercent, producedQty, targetQty}|null>
 * - null when there's no shift covering the current time (a gap between shifts), matching
 * getMachineInsights's own `oee: null` in that case.
 *
 * This is the heavier query path (each machine costs a downtime-log scan + a plan-window scan + a
 * quality-window sum), now run on every floor-grid poll (10s) for every active machine rather than
 * only when a supervisor opens one machine's Insights dialog - fine at this fleet's current size,
 * but scales linearly with active machine count, so a much larger fleet would eventually want this
 * batched/cached rather than recomputed from scratch on every poll. */
async function getLiveOeeForMachines(machines) {
  const now = new Date();
  const scheduleDate = todayStr(now);
  const shifts = await shiftRepository.findAll({ activeOnly: true });
  const currentShift = resolveCurrentShift(shifts, now);

  if (!currentShift) return new Map(machines.map((m) => [m.id, null]));

  const entries = await Promise.all(
    machines.map(async (machine) => {
      const runtime = await computeRuntimeAnalytics(machine.id, scheduleDate, currentShift, now);
      const oee = await computeOee(machine.id, scheduleDate, currentShift, runtime, machine);
      return [
        machine.id,
        {
          oeePercent: oee.oeePercent,
          availabilityPercent: oee.availabilityPercent,
          performancePercent: oee.performancePercent,
          // Same current-shift runtime this function already computed for OEE - reused rather than
          // a second batched pass, so the floor dashboard's Produced/Target reads "this shift" too
          // (was previously a whole-day total sourced separately in dashboard.repository.js, which
          // kept showing a finished earlier shift's numbers after the machine sat idle all shift).
          producedQty: runtime.producedQty,
          targetQty: runtime.targetQty,
        },
      ];
    })
  );
  return new Map(entries);
}

/** Batched real Running/Idle/Downtime/Setup minutes for today, for every machine on the floor
 * dashboard - the same underlying computeDayRuntimeAnalytics a single machine's own Machine
 * Insights panel uses, just run for every machine in parallel (mirrors getLiveOeeForMachines'
 * batching), so the floor dashboard's "Runtime" figure means the same thing everywhere in the
 * app: actual Start/Stop/Resume timer time, not "elapsed time since midnight minus downtime" -
 * which wrongly counted Idle (machine on, no work assigned/running) as if it were running. */
async function getDayRuntimeForMachines(machineIds) {
  const now = new Date();
  const scheduleDate = todayStr(now);
  const entries = await Promise.all(machineIds.map(async (id) => [id, await computeDayRuntimeAnalytics(id, scheduleDate, now)]));
  return new Map(entries);
}

module.exports = {
  getMachineInsights,
  getLiveOeeForMachines,
  getDayRuntimeForMachines,
  getDowntimeTrends,
  getProductionTrendForPeriod,
  clampPercent,
  deriveLiveStatus,
};
