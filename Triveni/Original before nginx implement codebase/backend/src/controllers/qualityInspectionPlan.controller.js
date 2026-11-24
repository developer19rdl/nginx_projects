const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const service = require('../services/qualityInspectionPlan.service');

const list = asyncHandler(async (req, res) => {
  const plans = await service.list({ activeOnly: req.query.activeOnly !== 'false' });
  success(res, { message: 'OK', data: plans });
});

const getById = asyncHandler(async (req, res) => {
  const plan = await service.getById(Number(req.params.id));
  success(res, { message: 'OK', data: plan });
});

const create = asyncHandler(async (req, res) => {
  const plan = await service.create(req.body, req);
  success(res, { message: 'Inspection plan created', data: plan, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const plan = await service.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Inspection plan updated', data: plan });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id), req);
  success(res, { message: 'Inspection plan deactivated', data: null });
});

module.exports = { list, getById, create, update, remove };
