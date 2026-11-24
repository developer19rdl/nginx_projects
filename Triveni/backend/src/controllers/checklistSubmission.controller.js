const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const checklistSubmissionService = require('../services/checklistSubmission.service');

const listForMachine = asyncHandler(async (req, res) => {
  const rows = await checklistSubmissionService.listForMachine({
    machineId: req.query.machineId ? Number(req.query.machineId) : undefined,
    scheduleDate: req.query.scheduleDate,
  });
  success(res, { message: 'OK', data: rows });
});

const getOne = asyncHandler(async (req, res) => {
  const submission = await checklistSubmissionService.getOne({
    templateId: req.query.templateId ? Number(req.query.templateId) : undefined,
    machineId: req.query.machineId ? Number(req.query.machineId) : undefined,
    scheduleDate: req.query.scheduleDate,
  });
  success(res, { message: 'OK', data: submission });
});

const submit = asyncHandler(async (req, res) => {
  const submission = await checklistSubmissionService.submit(req.body, req);
  success(res, { message: 'Checklist submitted', data: submission, statusCode: 201 });
});

module.exports = { listForMachine, getOne, submit };
