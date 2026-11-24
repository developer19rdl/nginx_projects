const router = require('express').Router();
const controller = require('../../controllers/checklistSubmission.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { submitChecklistSchema } = require('../../validators/checklistSubmission.validator');

router.use(authenticate);

router.get('/for-machine', requirePermission(PERMISSIONS.CHECKLIST_VIEW), controller.listForMachine);
router.get('/submission', requirePermission(PERMISSIONS.CHECKLIST_VIEW), controller.getOne);
router.post('/submit', requirePermission(PERMISSIONS.CHECKLIST_LOG), validate(submitChecklistSchema), controller.submit);

module.exports = router;
