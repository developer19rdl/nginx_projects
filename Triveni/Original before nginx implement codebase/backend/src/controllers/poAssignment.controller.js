const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const poAssignmentService = require('../services/poAssignment.service');

const listUnassigned = asyncHandler(async (req, res) => {
  const rows = await poAssignmentService.listUnassigned({
    orderId: req.query.orderId ? Number(req.query.orderId) : undefined,
    orderDate: req.query.orderDate || undefined,
    search: req.query.search,
  });
  success(res, { message: 'OK', data: rows });
});

const listByMachine = asyncHandler(async (req, res) => {
  const rows = await poAssignmentService.listByMachine({
    machineId: req.query.machineId ? Number(req.query.machineId) : undefined,
    shiftId: req.query.shiftId ? Number(req.query.shiftId) : undefined,
    scheduleDate: req.query.scheduleDate || undefined,
  });
  success(res, { message: 'OK', data: rows });
});

const shiftSummary = asyncHandler(async (req, res) => {
  const summary = await poAssignmentService.getShiftSummary();
  success(res, { message: 'OK', data: summary });
});

const assign = asyncHandler(async (req, res) => {
  const rows = await poAssignmentService.assignToMachine(req.body, req);
  success(res, { message: 'Rows assigned to machine', data: rows, statusCode: 201 });
});

const unassign = asyncHandler(async (req, res) => {
  await poAssignmentService.unassignRow(Number(req.params.id), req);
  success(res, { message: 'Row unassigned', data: {} });
});

const startProduction = asyncHandler(async (req, res) => {
  const row = await poAssignmentService.startProduction(Number(req.params.id), req);
  success(res, { message: 'Production started', data: row });
});

const stopProduction = asyncHandler(async (req, res) => {
  const row = await poAssignmentService.stopProduction(Number(req.params.id), req);
  success(res, { message: 'Production stopped', data: row });
});

const resumeProduction = asyncHandler(async (req, res) => {
  const row = await poAssignmentService.resumeProduction(Number(req.params.id), req);
  success(res, { message: 'Production resumed', data: row });
});

const resetProduction = asyncHandler(async (req, res) => {
  const row = await poAssignmentService.resetProduction(Number(req.params.id), req);
  success(res, { message: 'Production timer reset', data: row });
});

const updateProducedQty = asyncHandler(async (req, res) => {
  const row = await poAssignmentService.updateProducedQty(Number(req.params.id), req.body.producedQty, req);
  success(res, { message: 'Produced quantity updated', data: row });
});

const updateCoilInfo = asyncHandler(async (req, res) => {
  const row = await poAssignmentService.updateCoilInfo(Number(req.params.id), req.body, req);
  success(res, { message: 'Coil info updated', data: row });
});

module.exports = {
  listUnassigned,
  listByMachine,
  shiftSummary,
  assign,
  unassign,
  startProduction,
  stopProduction,
  resumeProduction,
  resetProduction,
  updateProducedQty,
  updateCoilInfo,
};
