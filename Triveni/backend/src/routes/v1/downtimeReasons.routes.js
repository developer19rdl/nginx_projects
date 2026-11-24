const router = require('express').Router();
const controller = require('../../controllers/downtimeReason.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { downtimeReasonSchema } = require('../../validators/downtimeReason.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.DOWNTIME_VIEW), controller.list);
router.post('/', requirePermission(PERMISSIONS.DOWNTIME_MANAGE), validate(downtimeReasonSchema), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.DOWNTIME_MANAGE), validate(downtimeReasonSchema), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.DOWNTIME_MANAGE), controller.remove);

module.exports = router;
