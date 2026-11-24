const router = require('express').Router();
const controller = require('../../controllers/qualityInspectionPlan.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { qualityInspectionPlanSchema } = require('../../validators/qualityInspectionPlan.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.list);
router.get('/:id', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.getById);
router.post('/', requirePermission(PERMISSIONS.QUALITY_MANAGE), validate(qualityInspectionPlanSchema), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.QUALITY_MANAGE), validate(qualityInspectionPlanSchema), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.QUALITY_MANAGE), controller.remove);

module.exports = router;
