const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const downtimeReasonService = require('../services/downtimeReason.service');

const list = asyncHandler(async (req, res) => {
  const rows = await downtimeReasonService.list({ activeOnly: req.query.activeOnly !== 'false' });
  success(res, { message: 'OK', data: rows });
});

const create = asyncHandler(async (req, res) => {
  const reason = await downtimeReasonService.create(req.body, req);
  success(res, { message: 'Downtime reason created', data: reason, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const reason = await downtimeReasonService.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Downtime reason updated', data: reason });
});

const remove = asyncHandler(async (req, res) => {
  await downtimeReasonService.remove(Number(req.params.id), req);
  success(res, { message: 'Downtime reason deleted', data: {} });
});

module.exports = { list, create, update, remove };
