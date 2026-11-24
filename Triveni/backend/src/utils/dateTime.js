/**
 * Shift-aware date/time helpers. Shifts are stored as TIME-only start/end plus a
 * crosses_midnight flag (e.g. Shift C 22:00-06:00), so every planning calculation
 * that needs an absolute instant must resolve start/end against a specific plan_date.
 */

function toDateOnlyString(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

function combineDateAndTime(dateStr, timeStr) {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM:SS' -> local Date object
  const [h, m, s] = timeStr.split(':').map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m, s || 0, 0);
  return d;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateOnlyString(d);
}

/**
 * Resolve a shift's absolute start/end Date objects for a given plan_date.
 * If the shift crosses midnight, end_time is on the following calendar day.
 */
function resolveShiftWindow(planDate, shift) {
  const start = combineDateAndTime(planDate, shift.start_time);
  let end;
  if (shift.crosses_midnight) {
    end = combineDateAndTime(addDays(planDate, 1), shift.end_time);
  } else {
    end = combineDateAndTime(planDate, shift.end_time);
  }
  return { start, end };
}

/** Two [start,end) windows overlap if start1 < end2 && start2 < end1 */
function windowsOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

function hoursBetween(start, end) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function addHoursToDate(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Resolves the actual sub-interval a machine-plan entry occupies within its shift window,
 * given how many hours are already committed to that machine/shift/date ahead of it.
 * Without this, every order packed into the same shift would share the shift's full
 * start/end and falsely look like an overlapping double-booking of the machine.
 */
function resolveSlotWindow(shiftWindowStart, offsetHours, durationHours) {
  const start = addHoursToDate(shiftWindowStart, offsetHours);
  const end = addHoursToDate(start, durationHours);
  return { start, end };
}

module.exports = {
  toDateOnlyString,
  combineDateAndTime,
  addDays,
  resolveShiftWindow,
  windowsOverlap,
  hoursBetween,
  addHoursToDate,
  resolveSlotWindow,
};
