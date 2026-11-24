const router = require('express').Router();
const controller = require('../../controllers/poAssignment.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { assignSchema, producedQtySchema, coilInfoSchema } = require('../../validators/poAssignment.validator');

router.use(authenticate);

router.get('/unassigned', requirePermission(PERMISSIONS.PLANNING_VIEW), controller.listUnassigned);
router.get('/by-machine', requirePermission(PERMISSIONS.PLANNING_VIEW), controller.listByMachine);
router.get('/shift-summary', requirePermission(PERMISSIONS.PLANNING_VIEW), controller.shiftSummary);
router.post('/assign', requirePermission(PERMISSIONS.PLANNING_MANUAL), validate(assignSchema), controller.assign);
router.delete('/:id/assignment', requirePermission(PERMISSIONS.PLANNING_MANUAL), controller.unassign);
router.post('/:id/start', requirePermission(PERMISSIONS.PLANNING_PRODUCE), controller.startProduction);
router.post('/:id/stop', requirePermission(PERMISSIONS.PLANNING_PRODUCE), controller.stopProduction);
router.post('/:id/resume', requirePermission(PERMISSIONS.PLANNING_PRODUCE), controller.resumeProduction);
router.post('/:id/reset', requirePermission(PERMISSIONS.PLANNING_PRODUCE), controller.resetProduction);
router.patch(
  '/:id/produced-qty',
  requirePermission(PERMISSIONS.PLANNING_PRODUCE),
  validate(producedQtySchema),
  controller.updateProducedQty
);
router.patch(
  '/:id/coil-info',
  requirePermission(PERMISSIONS.PLANNING_PRODUCE),
  validate(coilInfoSchema),
  controller.updateCoilInfo
);

module.exports = router;
