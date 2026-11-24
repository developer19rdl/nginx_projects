const router = require('express').Router();
const controller = require('../../controllers/inventory.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { dispatchSchema, transferSchema, adjustmentSchema, holdSchema, releaseHoldSchema } = require('../../validators/inventory.validator');

router.use(authenticate);

router.get('/summary', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.getSummary);
router.get('/batch-stock', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.getBatchStock);
router.get('/ledger', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.getLedger);
router.get('/ledger/export', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.exportLedger);
router.get('/transactions', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.listTransactions);
router.get(
  '/transactions/by-inspection/:inspectionId',
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  controller.getTransactionByInspectionId
);
router.get('/transactions/:id', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.getTransactionById);

router.post('/dispatches', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(dispatchSchema), controller.dispatch);
router.post('/transfers', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(transferSchema), controller.transfer);
router.post('/adjustments', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(adjustmentSchema), controller.adjust);
router.get('/holds', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.listHolds);
router.post('/holds', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(holdSchema), controller.hold);
router.post('/holds/:id/release', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(releaseHoldSchema), controller.releaseHold);

module.exports = router;
