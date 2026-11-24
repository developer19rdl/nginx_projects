const { withTransaction } = require('../config/database');
const checklistTemplateRepository = require('../repositories/checklistTemplate.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function list({ activeOnly } = {}) {
  return checklistTemplateRepository.findAll({ activeOnly: activeOnly !== false });
}

async function getById(id) {
  const template = await checklistTemplateRepository.findById(id);
  if (!template) throw ApiError.notFound('Checklist template not found');
  const questions = await checklistTemplateRepository.findQuestions(id, { activeOnly: true });
  return { ...template, questions };
}

async function create(data, req) {
  const existing = await checklistTemplateRepository.findByTitle(data.title);
  if (existing) throw ApiError.conflict(`Checklist template "${data.title}" already exists`);

  const templateId = await withTransaction(async (connection) => {
    const id = await checklistTemplateRepository.create({ ...data, createdBy: req.user.id }, connection);
    await checklistTemplateRepository.replaceQuestions(id, data.questions, connection);
    return id;
  });

  const template = await getById(templateId);
  await auditService.fromRequest(req, { action: 'CREATE', module: 'checklist_template', recordId: templateId, newValue: template });
  return template;
}

async function update(id, data, req) {
  const existing = await getById(id);

  await withTransaction(async (connection) => {
    await checklistTemplateRepository.update(id, data, req.user.id, connection);
    await checklistTemplateRepository.replaceQuestions(id, data.questions, connection);
  });

  const updated = await getById(id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'checklist_template',
    recordId: id,
    oldValue: existing,
    newValue: updated,
  });
  return updated;
}

async function remove(id, req) {
  const existing = await checklistTemplateRepository.findById(id);
  if (!existing) throw ApiError.notFound('Checklist template not found');
  await checklistTemplateRepository.deactivate(id, req.user.id);
  await auditService.fromRequest(req, { action: 'DELETE', module: 'checklist_template', recordId: id, oldValue: existing });
}

module.exports = { list, getById, create, update, remove };
