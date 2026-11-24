const dashboardRepository = require('../repositories/dashboard.repository');
const shiftRepository = require('../repositories/shift.repository');
const machineInsightsService = require('./machineInsights.service');
const { clampPercent, deriveLiveStatus } = machineInsightsService;

async function getSummary() {
  const { orderCounts, rowCounts, todaysProduction, machineCounts, machinesInUse } = await dashboardRepository.getSummary();

  const activeMachines = Number(machineCounts.activeMachines) || 0;
  const totalRows = Number(rowCounts.totalRows) || 0;
  const assignedRows = Number(rowCounts.assignedRows) || 0;

  return {
    totalOrderPlans: Number(orderCounts.totalOrderPlans) || 0,
    pendingPlanning: Number(orderCounts.pendingPlanning) || 0,
    partiallyPlanned: Number(orderCounts.partiallyPlanned) || 0,
    assignedRows,
    unplannedQuantity: Number(rowCounts.unplannedQuantity) || 0,
    todaysProduction: Number(todaysProduction.todaysProduction) || 0,
    activeMachines,
    machinesUnderMaintenance: Number(machineCounts.machinesUnderMaintenance) || 0,
    // Both bounded 0-100% completion metrics by definition (assigned <= total rows, machines-in-use
    // <= active machines) - clamped defensively anyway, consistent with every other "...Percent"
    // this app computes (see machineInsights.service.js#clampPercent).
    assignmentCompletionPercent: totalRows ? clampPercent(Math.round((assignedRows / totalRows) * 10000) / 100) : 0,
    machineUtilizationPercent: activeMachines
      ? clampPercent(Math.round((Number(machinesInUse.machinesInUse) / activeMachines) * 10000) / 100)
      : 0,
  };
}

async function getCharts() {
  const [plannedVsRemaining, productionByMachine, productionByItem] = await Promise.all([
    dashboardRepository.plannedVsRemainingByOrder(10),
    dashboardRepository.productionByMachine(10),
    dashboardRepository.productionByItem(10),
  ]);
  return { plannedVsRemaining, productionByMachine, productionByItem };
}

/** Which of the active shifts is happening right now, by comparing HH:mm:ss strings (which sort
 * correctly as plain strings) against each shift's start/end - mirrors the operator app's
 * client-side getCurrentShift (operator/src/pages/Home.jsx), just evaluated server-side against
 * the server clock instead of the browser's. Returns null if nothing matches (a gap between
 * shifts, or no shifts configured). */
function resolveCurrentShift(shifts, now) {
  if (!shifts?.length) return null;
  const nowStr = now.toTimeString().slice(0, 8);
  return (
    shifts.find((s) =>
      s.end_time > s.start_time ? nowStr >= s.start_time && nowStr < s.end_time : nowStr >= s.start_time || nowStr < s.end_time
    ) || null
  );
}

/** Live per-machine status for the floor dashboard: current-shift produced/target quantity and
 * efficiency, real running vs. downtime minutes (from actual Start/Stop/Resume timestamps,
 * excluding Idle), current shift, and machine status - everything one machine card needs,
 * computed fresh on every call rather than cached. */
async function getMachineLiveStatus() {
  const [rows, shifts] = await Promise.all([
    dashboardRepository.machineLiveStatus(),
    shiftRepository.findAll({ activeOnly: true }),
  ]);

  const now = new Date();
  const currentShift = resolveCurrentShift(shifts, now);

  // Real OEE (Availability x Performance x Quality) AND current-shift Produced/Target for
  // whichever shift is happening right now - "Produced/Target" on this card means "this shift",
  // same as the Machine Insights panel's Live Production card, not a whole-day total (which kept
  // showing a finished earlier shift's numbers after the machine sat idle all through this one).
  const oeeByMachine = await machineInsightsService.getLiveOeeForMachines(
    rows.map((r) => ({ id: r.id, production_rate: r.production_rate }))
  );
  // Real Running minutes for today, from actual Start/Stop/Resume (production_start_at/
  // production_end_at) timestamps - NOT "elapsed since midnight minus downtime", which wrongly
  // counted Idle (machine on, no work assigned/running) as if it were running.
  const dayRuntimeByMachine = await machineInsightsService.getDayRuntimeForMachines(rows.map((r) => r.id));

  return rows.map((r) => {
    const oee = oeeByMachine.get(r.id);
    const targetQty = oee?.targetQty ?? 0;
    const producedQty = oee?.producedQty ?? 0;
    const downtimeMinutes = Math.max(0, Math.round(Number(r.downtime_minutes) || 0));
    const runtimeMinutes = dayRuntimeByMachine.get(r.id)?.runningMinutes ?? 0;
    // Capped at 100% - overproduction is valid data, but this is a bounded completion metric.
    const efficiencyPercent = targetQty > 0 ? clampPercent(Math.round((producedQty / targetQty) * 1000) / 10) : 0;
    // DATETIME columns come back as 'YYYY-MM-DD HH:MM:SS' strings (dateStrings:true), which sort
    // correctly lexically - no need to parse them into Dates just to find the latest one.
    const lastUpdate =
      [r.machine_updated_at, r.last_production_update, r.last_downtime_update].filter(Boolean).sort().pop() || null;

    // Live status: Running only when a machine_planning row is actually production_status =
    // 'RUNNING' right now (the Start/Resume timer, not an assumption); otherwise Idle. Down (an
    // open downtime_logs entry) takes priority over both and is applied as a display-time override
    // in MachineCard.jsx, same as before - this only decides what "not down" resolves to.
    // deriveLiveStatus is shared with getMachineInsights (the Machine Details page) so the two
    // screens can never drift out of sync on what "live status" means again.
    const status = deriveLiveStatus(r.status, r.has_active_production);

    return {
      id: r.id,
      machineCode: r.machine_code,
      machineName: r.machine_name,
      machineType: r.machine_type,
      status,
      isDown: !!r.active_downtime_started_at,
      activeDowntimeReason: r.active_downtime_reason,
      activeDowntimeStartedAt: r.active_downtime_started_at,
      targetQty,
      producedQty,
      efficiencyPercent,
      // null when there's no shift covering right now (a gap between shifts) - otherwise the
      // machine's real Availability x Performance x Quality OEE for the shift in progress.
      oeePercent: oee?.oeePercent ?? null,
      availabilityPercent: oee?.availabilityPercent ?? null,
      performancePercent: oee?.performancePercent ?? null,
      runtimeMinutes,
      downtimeMinutes,
      currentShift: currentShift ? { id: currentShift.id, code: currentShift.shift_code, name: currentShift.shift_name } : null,
      lastUpdate,
    };
  });
}

module.exports = { getSummary, getCharts, getMachineLiveStatus };
