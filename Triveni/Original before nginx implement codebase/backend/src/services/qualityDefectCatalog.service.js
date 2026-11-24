const qualityDefectCatalogRepository = require('../repositories/qualityDefectCatalog.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function list({ activeOnly, category } = {}) {
  return qualityDefectCatalogRepository.findAll({ activeOnly: activeOnly !== false, category });
}

async function create(data, req) {
  const existing = await qualityDefectCatalogRepository.findByCode(data.defectCode);
  if (existing) throw ApiError.conflict(`Defect code "${data.defectCode}" already exists`);
  const defect = await qualityDefectCatalogRepository.create({ ...data, createdBy: req.user.id });
  await auditService.fromRequest(req, { action: 'CREATE', module: 'quality_defect_catalog', recordId: defect.id, newValue: defect });
  return defect;
}

async function update(id, data, req) {
  const existing = await qualityDefectCatalogRepository.findById(id);
  if (!existing) throw ApiError.notFound('Defect catalog entry not found');
  const updated = await qualityDefectCatalogRepository.update(id, data, req.user.id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'quality_defect_catalog',
    recordId: id,
    oldValue: existing,
    newValue: updated,
  });
  return updated;
}

async function remove(id, req) {
  const existing = await qualityDefectCatalogRepository.findById(id);
  if (!existing) throw ApiError.notFound('Defect catalog entry not found');
  await qualityDefectCatalogRepository.deactivate(id, req.user.id);
  await auditService.fromRequest(req, { action: 'DELETE', module: 'quality_defect_catalog', recordId: id, oldValue: existing });
}

module.exports = { list, create, update, remove };
