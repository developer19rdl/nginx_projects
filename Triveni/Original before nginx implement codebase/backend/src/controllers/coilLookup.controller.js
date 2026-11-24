const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const coilLookupService = require('../services/coilLookup.service');

const lookup = asyncHandler(async (req, res) => {
  const coilNo = (req.params.coilNo || '').trim();
  if (!coilNo) {
    throw ApiError.badRequest('coilNo is required');
  }
  const info = await coilLookupService.lookupCoil(coilNo);
  success(res, { message: 'OK', data: info });
});

module.exports = { lookup };
