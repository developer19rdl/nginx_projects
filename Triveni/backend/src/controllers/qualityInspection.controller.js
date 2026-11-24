const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const service = require('../services/qualityInspection.service');
const pdfService = require('../services/qualityInspectionPdf.service');
const excelService = require('../services/qualityInspectionExcel.service');

const listPending = asyncHandler(async (req, res) => {
  const rows = await service.listPendingLots();
  success(res, { message: 'OK', data: rows });
});

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.list(req.query);
  success(res, { message: 'OK', data: rows, meta });
});

const getById = asyncHandler(async (req, res) => {
  const inspection = await service.getById(Number(req.params.id));
  success(res, { message: 'OK', data: inspection });
});

const start = asyncHandler(async (req, res) => {
  const inspection = await service.startInspection(Number(req.params.machinePlanningId), req.body, req);
  success(res, { message: 'Inspection started', data: inspection, statusCode: 201 });
});

const saveParameterResults = asyncHandler(async (req, res) => {
  const results = await service.saveParameterResults(Number(req.params.id), req.body.results, req);
  success(res, { message: 'Parameter results saved', data: results });
});

const addDefect = asyncHandler(async (req, res) => {
  const defects = await service.addDefect(Number(req.params.id), req.body, req);
  success(res, { message: 'Defect added', data: defects, statusCode: 201 });
});

const removeDefect = asyncHandler(async (req, res) => {
  const defects = await service.removeDefect(Number(req.params.defectId), req);
  success(res, { message: 'Defect removed', data: defects });
});

const recordDecision = asyncHandler(async (req, res) => {
  const inspection = await service.recordDecision(Number(req.params.id), req.body, req);
  success(res, { message: 'Decision recorded', data: inspection });
});

const reopen = asyncHandler(async (req, res) => {
  const inspection = await service.reopenForRework(Number(req.params.id), req);
  success(res, { message: 'Inspection reopened', data: inspection });
});

const release = asyncHandler(async (req, res) => {
  const inspection = await service.releaseToInventory(Number(req.params.id), req);
  success(res, { message: 'Released to inventory', data: inspection });
});

const downloadPdf = asyncHandler(async (req, res) => {
  await pdfService.generateInspectionPdf(Number(req.params.id), res);
});

const downloadExcel = asyncHandler(async (req, res) => {
  await excelService.generateInspectionExcel(Number(req.params.id), res);
});

module.exports = {
  listPending,
  list,
  getById,
  start,
  saveParameterResults,
  addDefect,
  removeDefect,
  recordDecision,
  reopen,
  release,
  downloadPdf,
  downloadExcel,
};
