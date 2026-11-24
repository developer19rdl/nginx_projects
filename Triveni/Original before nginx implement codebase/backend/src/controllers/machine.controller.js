const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const machineService = require('../services/machine.service');
const machineInsightsService = require('../services/machineInsights.service');

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await machineService.list(req.query);
  success(res, { message: 'OK', data: rows, meta });
});

const getById = asyncHandler(async (req, res) => {
  const machine = await machineService.getById(Number(req.params.id));
  success(res, { message: 'OK', data: machine });
});

const create = asyncHandler(async (req, res) => {
  const machine = await machineService.create(req.body, req);
  success(res, { message: 'Machine created', data: machine, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const machine = await machineService.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Machine updated', data: machine });
});

const setStatus = asyncHandler(async (req, res) => {
  const machine = await machineService.setStatus(Number(req.params.id), req.body.status, req);
  success(res, { message: 'Machine status updated', data: machine });
});

const remove = asyncHandler(async (req, res) => {
  await machineService.remove(Number(req.params.id), req);
  success(res, { message: 'Machine deleted', data: {} });
});

// Same underlying data as the admin dashboard's Machine Insights panel
// (dashboard.controller.js#getMachineInsights) - exposed here too, gated by MACHINE_VIEW instead
// of DASHBOARD_VIEW, so the operator app (which has MACHINE_VIEW but not the admin dashboard
// permission) can show a machine's own live OEE/runtime numbers on its Home screen.
const getInsights = asyncHandler(async (req, res) => {
  const insights = await machineInsightsService.getMachineInsights(Number(req.params.id));
  success(res, { message: 'OK', data: insights });
});

module.exports = { list, getById, create, update, setStatus, remove, getInsights };
