const router = require('express').Router();
const controller = require('../../controllers/downtimeLog.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { startDowntimeSchema } = require('../../validators/downtimeLog.validator');

router.use(authenticate);

router.get('/active', requirePermission(PERMISSIONS.DOWNTIME_VIEW), controller.getActive);
router.get('/by-machine', requirePermission(PERMISSIONS.DOWNTIME_VIEW), controller.listByMachine);
router.post('/start', requirePermission(PERMISSIONS.DOWNTIME_LOG), validate(startDowntimeSchema), controller.start);
router.patch('/:id/end', requirePermission(PERMISSIONS.DOWNTIME_LOG), controller.end);

module.exports = router;
