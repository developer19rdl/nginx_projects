const router = require('express').Router();
const controller = require('../../controllers/shift.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { shiftSchema } = require('../../validators/shift.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.SHIFT_VIEW), controller.list);
router.post('/', requirePermission(PERMISSIONS.SHIFT_MANAGE), validate(shiftSchema), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.SHIFT_MANAGE), validate(shiftSchema), controller.update);

module.exports = router;
