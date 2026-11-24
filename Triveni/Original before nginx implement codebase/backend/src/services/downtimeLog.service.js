const downtimeLogRepository = require('../repositories/downtimeLog.repository');
const downtimeReasonRepository = require('../repositories/downtimeReason.repository');
const machineRepository = require('../repositories/machine.repository');
const shiftRepository = require('../repositories/shift.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/** Turns a Date + Shift into a concrete [start, end) datetime window, the same way the shift
 * itself is defined (start_time/end_time, crossing midnight into the next calendar day when
 * crosses_midnight is set) - mirrors the operator app's client-side getCurrentShift logic, just
 * anchored to a specific date instead of "right now". */
function shiftWindow(scheduleDate, shift) {
  const [y, m, d] = scheduleDate.split('-').map(Number);
  const startOfDay = new Date(Date.UTC(y, m - 1, d));
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1));
  const dateStr = (date) => date.toISOString().slice(0, 10);

  const windowStart = `${dateStr(startOfDay)} ${shift.start_time}`;
  const windowEnd = shift.crosses_midnight ? `${dateStr(nextDay)} ${shift.end_time}` : `${dateStr(startOfDay)} ${shift.end_time}`;
  return { windowStart, windowEnd };
}

/** The currently-running downtime for a machine, or null - this is what the operator app's
 * Downtime modal reads on open to decide whether to show "Start" (reason picker) or the running
 * timer + "End" for whatever's already in progress. */
async function getActive(machineId) {
  if (!machineId) throw ApiError.badRequest('machineId is required');
  return downtimeLogRepository.findActiveByMachine(machineId);
}

async function start({ machineId, reasonId }, req) {
  const machine = await machineRepository.findById(machineId);
  if (!machine) throw ApiError.notFound('Machine not found');

  const reason = await downtimeReasonRepository.findById(reasonId);
  if (!reason || !reason.is_active) throw ApiError.badRequest('Invalid or inactive downtime reason');

  const active = await downtimeLogRepository.findActiveByMachine(machineId);
  if (active) throw ApiError.conflict('This machine already has an active downtime - end it before starting another.');

  const log = await downtimeLogRepository.create({
    machineId,
    reasonId,
    startedAt: new Date(),
    startedBy: req.user?.id,
  });

  await auditService.fromRequest(req, { action: 'START', module: 'downtime_log', recordId: log.id, newValue: log });
  return log;
}

async function end(id, req) {
  const existing = await downtimeLogRepository.findById(id);
  if (!existing) throw ApiError.notFound('Downtime log not found');
  if (existing.ended_at) throw ApiError.conflict('This downtime has already ended');

  const updated = await downtimeLogRepository.end(id, { endedAt: new Date(), endedBy: req.user?.id });
  await auditService.fromRequest(req, {
    action: 'END',
    module: 'downtime_log',
    recordId: id,
    oldValue: { started_at: existing.started_at },
    newValue: { ended_at: updated.ended_at },
  });
  return updated;
}

/** Downtime events that started during a specific Machine + Date + Shift - powers the Operator
 * Log's Shift Activity Summary. */
async function listByMachineShift({ machineId, scheduleDate, shiftId }) {
  if (!machineId) throw ApiError.badRequest('machineId is required');
  if (!scheduleDate) throw ApiError.badRequest('scheduleDate is required');
  if (!shiftId) throw ApiError.badRequest('shiftId is required');

  const shift = await shiftRepository.findById(shiftId);
  if (!shift) throw ApiError.badRequest('Invalid shift');

  const { windowStart, windowEnd } = shiftWindow(scheduleDate, shift);
  return downtimeLogRepository.findByMachineWindow(machineId, windowStart, windowEnd);
}

module.exports = { getActive, start, end, listByMachineShift };
