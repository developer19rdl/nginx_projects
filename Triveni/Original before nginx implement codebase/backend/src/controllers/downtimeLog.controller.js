const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const downtimeLogService = require('../services/downtimeLog.service');

const getActive = asyncHandler(async (req, res) => {
  const log = await downtimeLogService.getActive(req.query.machineId ? Number(req.query.machineId) : undefined);
  success(res, { message: 'OK', data: log });
});

const start = asyncHandler(async (req, res) => {
  const log = await downtimeLogService.start(req.body, req);
  success(res, { message: 'Downtime started', data: log, statusCode: 201 });
});

const end = asyncHandler(async (req, res) => {
  const log = await downtimeLogService.end(Number(req.params.id), req);
  success(res, { message: 'Downtime ended', data: log });
});

const listByMachine = asyncHandler(async (req, res) => {
  const logs = await downtimeLogService.listByMachineShift({
    machineId: req.query.machineId ? Number(req.query.machineId) : undefined,
    scheduleDate: req.query.scheduleDate,
    shiftId: req.query.shiftId ? Number(req.query.shiftId) : undefined,
  });
  success(res, { message: 'OK', data: logs });
});

module.exports = { getActive, start, end, listByMachine };
