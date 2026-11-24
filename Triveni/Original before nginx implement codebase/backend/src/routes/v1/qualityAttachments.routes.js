const router = require('express').Router();
const controller = require('../../controllers/qualityAttachment.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { qualityUpload } = require('../../middleware/qualityUpload');
const { uploadAttachmentSchema } = require('../../validators/qualityAttachment.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.listForEntity);
router.post(
  '/',
  requirePermission(PERMISSIONS.QUALITY_INSPECT),
  qualityUpload.single('file'),
  validate(uploadAttachmentSchema),
  controller.upload
);
// Streams the file back - gated behind the same auth+permission chain as everything else, so an
// attachment can't be fetched by guessing a URL without a valid, permissioned session.
router.get('/:id/file', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.getFile);
router.delete('/:id', requirePermission(PERMISSIONS.QUALITY_INSPECT), controller.remove);

module.exports = router;
