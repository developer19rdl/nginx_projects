const { withTransaction } = require('../config/database');
const qualityInspectionPlanRepository = require('../repositories/qualityInspectionPlan.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function list({ activeOnly } = {}) {
  return qualityInspectionPlanRepository.findAll({ activeOnly: activeOnly !== false });
}

async function getById(id) {
  const plan = await qualityInspectionPlanRepository.findById(id);
  if (!plan) throw ApiError.notFound('Inspection plan not found');
  const parameters = await qualityInspectionPlanRepository.findParameters(id, { activeOnly: true });
  return { ...plan, parameters };
}

async function create(data, req) {
  const planId = await withTransaction(async (connection) => {
    const id = await qualityInspectionPlanRepository.create({ ...data, createdBy: req.user.id }, connection);
    await qualityInspectionPlanRepository.replaceParameters(id, data.parameters, connection);
    return id;
  });

  const plan = await getById(planId);
  await auditService.fromRequest(req, { action: 'CREATE', module: 'quality_inspection_plan', recordId: planId, newValue: plan });
  return plan;
}

async function update(id, data, req) {
  const existing = await getById(id);

  await withTransaction(async (connection) => {
    await qualityInspectionPlanRepository.update(id, data, req.user.id, connection);
    await qualityInspectionPlanRepository.replaceParameters(id, data.parameters, connection);
  });

  const updated = await getById(id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'quality_inspection_plan',
    recordId: id,
    oldValue: existing,
    newValue: updated,
  });
  return updated;
}

async function remove(id, req) {
  const existing = await qualityInspectionPlanRepository.findById(id);
  if (!existing) throw ApiError.notFound('Inspection plan not found');
  await qualityInspectionPlanRepository.deactivate(id, req.user.id);
  await auditService.fromRequest(req, { action: 'DELETE', module: 'quality_inspection_plan', recordId: id, oldValue: existing });
}

module.exports = { list, getById, create, update, remove };
