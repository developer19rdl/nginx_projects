const qualityCapaRepository = require('../repositories/qualityCapa.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function list({ activeOnly } = {}) {
  return qualityCapaRepository.findAll({ activeOnly: activeOnly !== false });
}

async function update(id, data, req) {
  const existing = await qualityCapaRepository.findById(id);
  if (!existing) throw ApiError.notFound('CAPA not found');
  if (existing.status === 'CLOSED') throw ApiError.badRequest('This CAPA is already closed');

  await qualityCapaRepository.update(id, data, req.user.id);
  const updated = await qualityCapaRepository.findById(id);
  await auditService.fromRequest(req, { action: 'UPDATE', module: 'quality_capa', recordId: id, oldValue: existing, newValue: updated });
  return updated;
}

async function close(id, req) {
  const existing = await qualityCapaRepository.findById(id);
  if (!existing) throw ApiError.notFound('CAPA not found');
  if (existing.status === 'CLOSED') throw ApiError.conflict('This CAPA is already closed');

  await qualityCapaRepository.close(id, req.user.id);
  const updated = await qualityCapaRepository.findById(id);
  await auditService.fromRequest(req, {
    action: 'CLOSE',
    module: 'quality_capa',
    recordId: id,
    oldValue: { status: existing.status },
    newValue: { status: 'CLOSED' },
  });
  return updated;
}

module.exports = { list, update, close };
