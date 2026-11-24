const downtimeReasonRepository = require('../repositories/downtimeReason.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function list({ activeOnly } = {}) {
  return downtimeReasonRepository.findAll({ activeOnly: activeOnly !== false });
}

async function create(data, req) {
  const existing = await downtimeReasonRepository.findByName(data.reasonName);
  if (existing) throw ApiError.conflict(`Downtime reason "${data.reasonName}" already exists`);
  const reason = await downtimeReasonRepository.create({ ...data, createdBy: req.user.id });
  await auditService.fromRequest(req, { action: 'CREATE', module: 'downtime_reason', recordId: reason.id, newValue: reason });
  return reason;
}

async function update(id, data, req) {
  const existing = await downtimeReasonRepository.findById(id);
  if (!existing) throw ApiError.notFound('Downtime reason not found');
  const updated = await downtimeReasonRepository.update(id, data, req.user.id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'downtime_reason',
    recordId: id,
    oldValue: existing,
    newValue: updated,
  });
  return updated;
}

async function remove(id, req) {
  const existing = await downtimeReasonRepository.findById(id);
  if (!existing) throw ApiError.notFound('Downtime reason not found');
  await downtimeReasonRepository.deactivate(id, req.user.id);
  await auditService.fromRequest(req, { action: 'DELETE', module: 'downtime_reason', recordId: id, oldValue: existing });
}

module.exports = { list, create, update, remove };
