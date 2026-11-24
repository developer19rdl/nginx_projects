const { withTransaction } = require('../config/database');
const checklistAssignmentRepository = require('../repositories/checklistAssignment.repository');
const checklistTemplateRepository = require('../repositories/checklistTemplate.repository');
const machineRepository = require('../repositories/machine.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function listForTemplate(templateId) {
  const template = await checklistTemplateRepository.findById(templateId);
  if (!template) throw ApiError.notFound('Checklist template not found');
  return checklistAssignmentRepository.findMachinesForTemplate(templateId, { activeOnly: false });
}

/** Replace-whole-set: the given machineIds become exactly the active assignment set for this
 * template - anything else previously assigned gets deactivated (never deleted). */
async function replaceAssignments(templateId, machineIds, req) {
  const template = await checklistTemplateRepository.findById(templateId);
  if (!template) throw ApiError.notFound('Checklist template not found');

  const invalidIds = [];
  for (const machineId of machineIds) {
    const machine = await machineRepository.findById(machineId);
    if (!machine) invalidIds.push(machineId);
  }
  if (invalidIds.length) throw ApiError.badRequest(`Unknown machine id(s): ${invalidIds.join(', ')}`);

  await withTransaction(async (connection) => {
    await checklistAssignmentRepository.replaceAssignments(templateId, machineIds, req.user.id, connection);
  });

  const machines = await checklistAssignmentRepository.findMachinesForTemplate(templateId, { activeOnly: true });
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'checklist_assignment',
    recordId: templateId,
    newValue: { machineIds },
  });
  return machines;
}

module.exports = { listForTemplate, replaceAssignments };
