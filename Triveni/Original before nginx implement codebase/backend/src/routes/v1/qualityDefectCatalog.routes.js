const router = require('express').Router();
const controller = require('../../controllers/qualityDefectCatalog.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { qualityDefectSchema } = require('../../validators/qualityDefectCatalog.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.list);
router.post('/', requirePermission(PERMISSIONS.QUALITY_MANAGE), validate(qualityDefectSchema), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.QUALITY_MANAGE), validate(qualityDefectSchema), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.QUALITY_MANAGE), controller.remove);

module.exports = router;
