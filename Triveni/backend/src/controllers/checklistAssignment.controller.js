const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const checklistAssignmentService = require('../services/checklistAssignment.service');

const list = asyncHandler(async (req, res) => {
  const machines = await checklistAssignmentService.listForTemplate(Number(req.params.id));
  success(res, { message: 'OK', data: machines });
});

const replace = asyncHandler(async (req, res) => {
  const machines = await checklistAssignmentService.replaceAssignments(Number(req.params.id), req.body.machineIds, req);
  success(res, { message: 'Checklist assignments updated', data: machines });
});

module.exports = { list, replace };
