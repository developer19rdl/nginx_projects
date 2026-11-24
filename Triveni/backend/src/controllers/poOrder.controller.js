const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const poOrderService = require('../services/poOrder.service');
const poExcelImportService = require('../services/poExcelImport.service');

const uploadAndValidate = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('An Excel file is required');
  const result = await poExcelImportService.validateExcel(req.file.path, req.file.originalname);
  success(res, { message: 'File validated', data: result });
});

const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = await poExcelImportService.buildTemplateWorkbookBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="production-order-template.xlsx"');
  res.send(Buffer.from(buffer));
});

const confirmImport = asyncHandler(async (req, res) => {
  const order = await poExcelImportService.confirmImport(req.params.importId, req.body, req.user.id, req);
  success(res, { message: 'Production order created successfully', data: order, statusCode: 201 });
});

const getImportErrors = asyncHandler(async (req, res) => {
  const errors = await poExcelImportService.getImportErrors(req.params.importId);
  success(res, { message: 'OK', data: errors });
});

const downloadImportErrors = asyncHandler(async (req, res) => {
  const buffer = await poExcelImportService.buildErrorWorkbookBuffer(req.params.importId);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="import-${req.params.importId}-errors.xlsx"`);
  res.send(Buffer.from(buffer));
});

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await poOrderService.list(req.query);
  success(res, { message: 'OK', data: rows, meta });
});

const getById = asyncHandler(async (req, res) => {
  const order = await poOrderService.getById(Number(req.params.id));
  success(res, { message: 'OK', data: order });
});

const remove = asyncHandler(async (req, res) => {
  await poOrderService.remove(Number(req.params.id), req);
  success(res, { message: 'Production order deleted', data: {} });
});

module.exports = {
  uploadAndValidate,
  downloadTemplate,
  confirmImport,
  getImportErrors,
  downloadImportErrors,
  list,
  getById,
  remove,
};
