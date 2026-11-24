const router = require('express').Router();
const controller = require('../../controllers/poOrder.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { excelUpload } = require('../../middleware/fileUpload');
const { PERMISSIONS } = require('../../config/constants');
const { confirmImportSchema } = require('../../validators/poOrder.validator');

router.use(authenticate);

router.post(
  '/upload',
  requirePermission(PERMISSIONS.PRODUCTION_PLAN_IMPORT),
  excelUpload.single('file'),
  controller.uploadAndValidate
);
router.get('/template', requirePermission(PERMISSIONS.PRODUCTION_PLAN_IMPORT), controller.downloadTemplate);
router.post(
  '/imports/:importId/confirm',
  requirePermission(PERMISSIONS.PRODUCTION_PLAN_IMPORT),
  validate(confirmImportSchema),
  controller.confirmImport
);
router.get('/imports/:importId/errors', requirePermission(PERMISSIONS.PRODUCTION_PLAN_IMPORT), controller.getImportErrors);
router.get(
  '/imports/:importId/errors/download',
  requirePermission(PERMISSIONS.PRODUCTION_PLAN_IMPORT),
  controller.downloadImportErrors
);

router.get('/', requirePermission(PERMISSIONS.PRODUCTION_PLAN_VIEW), controller.list);
router.get('/:id', requirePermission(PERMISSIONS.PRODUCTION_PLAN_VIEW), controller.getById);
router.delete('/:id', requirePermission(PERMISSIONS.PRODUCTION_PLAN_MANAGE), controller.remove);

module.exports = router;
