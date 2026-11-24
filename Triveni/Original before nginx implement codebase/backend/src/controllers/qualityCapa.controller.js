const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const service = require('../services/qualityCapa.service');

const list = asyncHandler(async (req, res) => {
  const rows = await service.list({ activeOnly: req.query.activeOnly !== 'false' });
  success(res, { message: 'OK', data: rows });
});

const update = asyncHandler(async (req, res) => {
  const capa = await service.update(Number(req.params.id), req.body, req);
  success(res, { message: 'CAPA updated', data: capa });
});

const close = asyncHandler(async (req, res) => {
  const capa = await service.close(Number(req.params.id), req);
  success(res, { message: 'CAPA closed', data: capa });
});

module.exports = { list, update, close };
