const router = require('express').Router();
const controller = require('../../controllers/qualityCapa.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { updateCapaSchema } = require('../../validators/qualityCapa.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.list);
router.put('/:id', requirePermission(PERMISSIONS.QUALITY_INSPECT), validate(updateCapaSchema), controller.update);
router.post('/:id/close', requirePermission(PERMISSIONS.QUALITY_INSPECT), controller.close);

module.exports = router;
