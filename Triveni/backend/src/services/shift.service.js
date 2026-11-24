const shiftRepository = require('../repositories/shift.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

function computeShiftDerivedFields({ startTime, endTime, breakDurationMinutes }) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const crossesMidnight = endMinutes <= startMinutes;
  const grossMinutes = crossesMidnight ? 24 * 60 - startMinutes + endMinutes : endMinutes - startMinutes;
  const totalWorkingHours = Math.max(0, (grossMinutes - (breakDurationMinutes || 0)) / 60);
  return { crossesMidnight: crossesMidnight ? 1 : 0, totalWorkingHours: Number(totalWorkingHours.toFixed(2)) };
}

async function list(activeOnly) {
  return shiftRepository.findAll({ activeOnly });
}

async function create(data, req) {
  const derived = computeShiftDerivedFields(data);
  const shift = await shiftRepository.create({
    shiftCode: data.shiftCode,
    shiftName: data.shiftName,
    startTime: data.startTime,
    endTime: data.endTime,
    breakDurationMinutes: data.breakDurationMinutes || 0,
    ...derived,
  });
  await auditService.fromRequest(req, { action: 'CREATE', module: 'shift', recordId: shift.id, newValue: shift });
  return shift;
}

async function update(id, data, req) {
  const existing = await shiftRepository.findById(id);
  if (!existing) throw ApiError.notFound('Shift not found');
  const derived = computeShiftDerivedFields(data);
  const updated = await shiftRepository.update(id, {
    shiftName: data.shiftName,
    startTime: data.startTime,
    endTime: data.endTime,
    breakDurationMinutes: data.breakDurationMinutes || 0,
    isActive: data.isActive ?? 1,
    ...derived,
  });
  await auditService.fromRequest(req, { action: 'UPDATE', module: 'shift', recordId: id, oldValue: existing, newValue: updated });
  return updated;
}

module.exports = { list, create, update, computeShiftDerivedFields };
