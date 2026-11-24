const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const shiftService = require('../services/shift.service');

const list = asyncHandler(async (req, res) => {
  const shifts = await shiftService.list(req.query.activeOnly === 'true');
  success(res, { message: 'OK', data: shifts });
});

const create = asyncHandler(async (req, res) => {
  const shift = await shiftService.create(req.body, req);
  success(res, { message: 'Shift created', data: shift, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const shift = await shiftService.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Shift updated', data: shift });
});

module.exports = { list, create, update };
