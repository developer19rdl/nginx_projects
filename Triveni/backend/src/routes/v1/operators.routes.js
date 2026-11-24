const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/ApiResponse');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { PERMISSIONS } = require('../../config/constants');
const operatorRepository = require('../../repositories/operator.repository');

router.use(authenticate);

router.get(
  '/',
  requirePermission(PERMISSIONS.MACHINE_VIEW),
  asyncHandler(async (req, res) => {
    const operators = await operatorRepository.findAll();
    success(res, { message: 'OK', data: operators });
  })
);

router.post(
  '/',
  requirePermission(PERMISSIONS.MACHINE_MANAGE),
  asyncHandler(async (req, res) => {
    const operator = await operatorRepository.create(req.body);
    success(res, { message: 'Operator created', data: operator, statusCode: 201 });
  })
);

module.exports = router;
