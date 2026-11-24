const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const service = require('../services/qualityDefectCatalog.service');

const list = asyncHandler(async (req, res) => {
  const defects = await service.list({ activeOnly: req.query.activeOnly !== 'false', category: req.query.category });
  success(res, { message: 'OK', data: defects });
});

const create = asyncHandler(async (req, res) => {
  const defect = await service.create(req.body, req);
  success(res, { message: 'Defect catalog entry created', data: defect, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const defect = await service.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Defect catalog entry updated', data: defect });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id), req);
  success(res, { message: 'Defect catalog entry deactivated', data: null });
});

module.exports = { list, create, update, remove };
