const { withTransaction } = require('../config/database');
const poDetailRepository = require('../repositories/poDetail.repository');
const poOrderRepository = require('../repositories/poOrder.repository');
const machineRepository = require('../repositories/machine.repository');
const shiftRepository = require('../repositories/shift.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const websocketService = require('./websocket.service');

// Every row is scheduled directly onto a Date + Shift at import time (picked once on the
// Production Order upload screen and stamped onto every row it creates) - a machine's plan for a
// given date+shift is just a direct filter on machine_id/schedule_date/shift_id, no more slicing
// a machine's whole queue into computed 440-minute windows.

async function listUnassigned(filters) {
  return poDetailRepository.findUnassigned(filters);
}

async function listByMachine({ machineId, shiftId, scheduleDate }) {
  if (!scheduleDate) throw ApiError.badRequest('scheduleDate is required');
  return poDetailRepository.findByMachine({ machineId, scheduleDate, shiftId });
}

/** Every active shift, in start_time order - used for the Shift dropdown on both the Production
 * Order upload screen and the Machine Planning screen. */
async function getShiftSummary() {
  const shifts = await shiftRepository.findAll({ activeOnly: true });
  return shifts.map((s) => ({
    shiftId: s.id,
    shiftName: s.shift_name,
    startTime: s.start_time,
    endTime: s.end_time,
  }));
}

/**
 * Assigns the given (currently unscheduled) Machine_Planning rows to a machine, date and shift -
 * the same triplet the Excel import stamps onto every row, just entered manually here instead.
 * Rows are locked for update first so two concurrent requests can never both grab the same row.
 */
async function assignToMachine({ detailIds, machineId, scheduleDate, shiftId }, req) {
  if (!Array.isArray(detailIds) || !detailIds.length) throw ApiError.badRequest('Select at least one row to assign');
  if (!scheduleDate) throw ApiError.badRequest('Schedule Date is required');
  if (!shiftId) throw ApiError.badRequest('Shift is required');

  const machine = await machineRepository.findById(machineId);
  if (!machine) throw ApiError.badRequest('Invalid machine');
  if (!machine.is_active) throw ApiError.badRequest(`Machine ${machine.machine_code} is inactive`);

  const shift = await shiftRepository.findById(shiftId);
  if (!shift) throw ApiError.badRequest('Invalid shift');

  const result = await withTransaction(async (connection) => {
    const rows = await poDetailRepository.lockRows(detailIds, connection);
    if (rows.length !== detailIds.length) throw ApiError.badRequest('One or more selected rows were not found');
    const alreadyScheduled = rows.filter((r) => r.schedule_date != null);
    if (alreadyScheduled.length) throw ApiError.conflict('One or more selected rows are already scheduled');

    for (const row of rows) {
      await poDetailRepository.assignToMachine(row.id, { machineId, scheduleDate, shiftId }, connection);
    }

    const orderIds = [...new Set(rows.map((r) => r.order_id))];
    for (const orderId of orderIds) {
      await poOrderRepository.recomputeStatus(orderId, connection);
    }

    return poDetailRepository.findByMachine({ machineId, scheduleDate, shiftId }, connection);
  });

  await auditService.fromRequest(req, {
    action: 'ASSIGN',
    module: 'machine_planning',
    recordId: machineId,
    newValue: { detailIds, machineCode: machine.machine_code, scheduleDate, shiftId },
  });

  return result;
}

async function unassignRow(id, req) {
  const row = await poDetailRepository.findById(id);
  if (!row) throw ApiError.notFound('Machine planning row not found');
  if (row.schedule_date == null) throw ApiError.badRequest('This row is not currently scheduled');

  await withTransaction(async (connection) => {
    await poDetailRepository.unassign(id, connection);
    await poOrderRepository.recomputeStatus(row.order_id, connection);
  });

  await auditService.fromRequest(req, { action: 'UNASSIGN', module: 'machine_planning', recordId: id, oldValue: row });
}

/** Starts the production timer for a row - stamps production_start_at and flips it to RUNNING.
 * Only one row per machine may be RUNNING at a time (a machine physically runs one order at
 * once), so the target row and the machine's current running row (if any) are both locked inside
 * one transaction before deciding - two operators hitting Start on the same machine at the same
 * instant can't both win. */
const START_CONFLICT_MESSAGES = {
  RUNNING: 'This order is already running',
  STOPPED: 'This order was stopped - use Resume to continue it instead of Start',
  COMPLETED: 'This order has already been completed',
};

async function startProduction(id, req) {
  return withTransaction(async (connection) => {
    const { row, runningRow } = await poDetailRepository.lockRowAndMachineRunning(id, connection);
    if (!row) throw ApiError.notFound('Machine planning row not found');
    if (row.production_status !== 'NOT_STARTED') {
      throw ApiError.badRequest(START_CONFLICT_MESSAGES[row.production_status] || 'This order cannot be started');
    }
    if (runningRow) {
      throw ApiError.badRequest(`Order ${runningRow.order_id} is already running on this machine - complete it before starting another`);
    }
    // Mirrors the operator app's own Start-button gate (ShiftPlan.jsx#hasCoilInfo) server-side -
    // a coil has to actually be identified/loaded before production can begin, and this shouldn't
    // be enforceable only by a client happening to disable a button.
    if (!row.coil_no && !row.grade && !row.coil_size && !row.coil_wt) {
      throw ApiError.badRequest('Add Coil Info before starting production');
    }

    await poDetailRepository.startProduction(id, connection);
    await auditService.fromRequest(req, {
      action: 'UPDATE',
      module: 'machine_planning',
      recordId: id,
      oldValue: { production_status: row.production_status },
      newValue: { production_status: 'RUNNING' },
    });

    const updated = await poDetailRepository.findById(id, connection);
    websocketService.emitProductionUpdate(updated);
    return updated;
  });
}

/** Un-halts a STOPPED row and continues its timer from where it left off (see
 * poDetailRepository.resumeProduction) - same single-running-per-machine guard as Start, since
 * resuming makes this row RUNNING again and a machine can only run one order at a time. */
async function resumeProduction(id, req) {
  return withTransaction(async (connection) => {
    const { row, runningRow } = await poDetailRepository.lockRowAndMachineRunning(id, connection);
    if (!row) throw ApiError.notFound('Machine planning row not found');
    if (row.production_status !== 'STOPPED') {
      throw ApiError.badRequest('Only a stopped order can be resumed');
    }
    if (runningRow) {
      throw ApiError.badRequest(`Order ${runningRow.order_id} is already running on this machine - complete or stop it before resuming another`);
    }

    await poDetailRepository.resumeProduction(id, connection);
    await auditService.fromRequest(req, {
      action: 'UPDATE',
      module: 'machine_planning',
      recordId: id,
      oldValue: { production_status: 'STOPPED', production_end_at: row.production_end_at },
      newValue: { production_status: 'RUNNING', production_end_at: null },
    });

    const updated = await poDetailRepository.findById(id, connection);
    websocketService.emitProductionUpdate(updated);
    return updated;
  });
}

/** Manually halts a running row's timer - this is explicitly NOT completion (STOPPED is its own
 * status): the timer freezes at its current elapsed time and Produced Qty is left exactly as it
 * was. Only actually reaching the planned quantity marks a row COMPLETED - see
 * updateProducedQty/applyMqttProducedQty. */
async function stopProduction(id, req) {
  const row = await poDetailRepository.findById(id);
  if (!row) throw ApiError.notFound('Machine planning row not found');
  if (row.production_status !== 'RUNNING') throw ApiError.badRequest('This order is not currently running');

  await poDetailRepository.stopProduction(id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'machine_planning',
    recordId: id,
    oldValue: { production_status: row.production_status },
    newValue: { production_status: 'STOPPED' },
  });

  const updated = await poDetailRepository.findById(id);
  websocketService.emitProductionUpdate(updated);
  return updated;
}

/** Discards the current run and puts the row back to NOT_STARTED - Produced Qty and the timer are
 * both zeroed, as if Start had never been clicked, so the order can be started fresh. Available
 * for RUNNING and STOPPED (an operator recovering from a mistaken Start, or abandoning a stopped
 * run entirely); refused once a row is COMPLETED - that's a final state, not something to be
 * casually cleared from this button (a correction from there goes through Stock Adjustment-style
 * auditing elsewhere in this app, not a silent reset). */
async function resetProduction(id, req) {
  const row = await poDetailRepository.findById(id);
  if (!row) throw ApiError.notFound('Machine planning row not found');
  if (row.production_status === 'NOT_STARTED') throw ApiError.badRequest('This order has not been started yet');
  if (row.production_status === 'COMPLETED') throw ApiError.badRequest('This order has already been completed and cannot be reset');

  await poDetailRepository.resetProduction(id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'machine_planning',
    recordId: id,
    oldValue: {
      production_status: row.production_status,
      production_start_at: row.production_start_at,
      production_end_at: row.production_end_at,
      produced_qty: row.produced_qty,
    },
    newValue: { production_status: 'NOT_STARTED', production_start_at: null, production_end_at: null, produced_qty: 0 },
  });

  const updated = await poDetailRepository.findById(id);
  websocketService.emitProductionUpdate(updated);
  return updated;
}

/** Operators log actual production against a row here - independent of scheduling/assignment,
 * so it works whether the row is currently scheduled or not. This only completes a RUNNING or
 * STOPPED row if the saved quantity actually reaches the planned quantity (see
 * poDetailRepository.updateProducedQty) - entering a smaller interim tally just records it. */
async function updateProducedQty(id, producedQty, req) {
  const row = await poDetailRepository.findById(id);
  if (!row) throw ApiError.notFound('Machine planning row not found');

  await poDetailRepository.updateProducedQty(id, producedQty);
  const updated = await poDetailRepository.findById(id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'machine_planning',
    recordId: id,
    oldValue: { produced_qty: row.produced_qty, production_status: row.production_status },
    newValue: { produced_qty: producedQty, production_status: updated.production_status },
  });

  websocketService.emitProductionUpdate(updated);
  return updated;
}

/** Operator-entered coil details for a row (coil number, grade, size, weight) - independent of
 * scheduling/production entry, just descriptive info mapped 1:1 onto the row. */
async function updateCoilInfo(id, coilInfo, req) {
  const row = await poDetailRepository.findById(id);
  if (!row) throw ApiError.notFound('Machine planning row not found');

  await poDetailRepository.updateCoilInfo(id, coilInfo);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'machine_planning',
    recordId: id,
    oldValue: { coil_no: row.coil_no, grade: row.grade, coil_size: row.coil_size, coil_wt: row.coil_wt },
    newValue: coilInfo,
  });

  return poDetailRepository.findById(id);
}

module.exports = {
  listUnassigned,
  listByMachine,
  getShiftSummary,
  assignToMachine,
  unassignRow,
  startProduction,
  stopProduction,
  resumeProduction,
  resetProduction,
  updateProducedQty,
  updateCoilInfo,
};
