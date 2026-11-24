const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const service = require('../services/inventory.service');
const ledgerExcelService = require('../services/inventoryLedgerExcel.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await service.getInventorySummary(req.query.itemCode);
  success(res, { message: 'OK', data: summary });
});

const getBatchStock = asyncHandler(async (req, res) => {
  const rows = await service.getBatchStock({ itemCode: req.query.itemCode, size: req.query.size, lotNo: req.query.lotNo });
  success(res, { message: 'OK', data: rows });
});

const getLedger = asyncHandler(async (req, res) => {
  const entries = await service.getLedger({
    itemCode: req.query.itemCode,
    size: req.query.size,
    lotNo: req.query.lotNo,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  });
  success(res, { message: 'OK', data: entries });
});

const exportLedger = asyncHandler(async (req, res) => {
  await ledgerExcelService.generateLedgerExcel(
    {
      itemCode: req.query.itemCode,
      size: req.query.size,
      lotNo: req.query.lotNo,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    },
    res
  );
});

const listTransactions = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.listTransactions(req.query);
  success(res, { message: 'OK', data: rows, meta });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await service.getTransactionById(Number(req.params.id));
  success(res, { message: 'OK', data: transaction });
});

const getTransactionByInspectionId = asyncHandler(async (req, res) => {
  const transaction = await service.getTransactionByInspectionId(Number(req.params.inspectionId));
  success(res, { message: 'OK', data: transaction });
});

const dispatch = asyncHandler(async (req, res) => {
  const result = await service.dispatch(req.body, req);
  success(res, { message: 'Stock dispatched', data: result, statusCode: 201 });
});

const transfer = asyncHandler(async (req, res) => {
  const result = await service.transfer(req.body, req);
  success(res, { message: 'Stock transferred', data: result, statusCode: 201 });
});

const adjust = asyncHandler(async (req, res) => {
  const result = await service.adjust(req.body, req);
  success(res, { message: 'Stock adjustment recorded', data: result, statusCode: 201 });
});

const hold = asyncHandler(async (req, res) => {
  const result = await service.hold(req.body, req);
  success(res, { message: 'Stock placed on hold', data: result, statusCode: 201 });
});

const releaseHold = asyncHandler(async (req, res) => {
  const result = await service.releaseHold(Number(req.params.id), req.body, req);
  success(res, { message: 'Stock released from hold', data: result });
});

const listHolds = asyncHandler(async (req, res) => {
  const holds = await service.listHolds(req.query.status);
  success(res, { message: 'OK', data: holds });
});

module.exports = {
  getSummary,
  getBatchStock,
  getLedger,
  exportLedger,
  listTransactions,
  getTransactionById,
  getTransactionByInspectionId,
  dispatch,
  transfer,
  adjust,
  hold,
  releaseHold,
  listHolds,
};
