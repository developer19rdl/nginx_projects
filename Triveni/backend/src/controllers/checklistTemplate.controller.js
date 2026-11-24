const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const checklistTemplateService = require('../services/checklistTemplate.service');

const list = asyncHandler(async (req, res) => {
  const rows = await checklistTemplateService.list({ activeOnly: req.query.activeOnly !== 'false' });
  success(res, { message: 'OK', data: rows });
});

const getById = asyncHandler(async (req, res) => {
  const template = await checklistTemplateService.getById(Number(req.params.id));
  success(res, { message: 'OK', data: template });
});

const create = asyncHandler(async (req, res) => {
  const template = await checklistTemplateService.create(req.body, req);
  success(res, { message: 'Checklist template created', data: template, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const template = await checklistTemplateService.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Checklist template updated', data: template });
});

const remove = asyncHandler(async (req, res) => {
  await checklistTemplateService.remove(Number(req.params.id), req);
  success(res, { message: 'Checklist template deleted', data: {} });
});

module.exports = { list, getById, create, update, remove };
