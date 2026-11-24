const router = require('express').Router();
const controller = require('../../controllers/machine.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { machineSchema, machineStatusSchema } = require('../../validators/machine.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.MACHINE_VIEW), controller.list);
router.get('/:id', requirePermission(PERMISSIONS.MACHINE_VIEW), controller.getById);
router.get('/:id/insights', requirePermission(PERMISSIONS.MACHINE_VIEW), controller.getInsights);
router.post('/', requirePermission(PERMISSIONS.MACHINE_MANAGE), validate(machineSchema), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.MACHINE_MANAGE), validate(machineSchema), controller.update);
router.patch('/:id/status', requirePermission(PERMISSIONS.MACHINE_MANAGE), validate(machineStatusSchema), controller.setStatus);
router.delete('/:id', requirePermission(PERMISSIONS.MACHINE_MANAGE), controller.remove);

module.exports = router;
