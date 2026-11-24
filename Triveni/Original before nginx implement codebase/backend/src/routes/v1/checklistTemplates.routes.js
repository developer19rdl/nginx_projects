const router = require('express').Router();
const controller = require('../../controllers/checklistTemplate.controller');
const assignmentController = require('../../controllers/checklistAssignment.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { checklistTemplateSchema, assignMachinesSchema } = require('../../validators/checklistTemplate.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.CHECKLIST_VIEW), controller.list);
router.get('/:id', requirePermission(PERMISSIONS.CHECKLIST_VIEW), controller.getById);
router.post('/', requirePermission(PERMISSIONS.CHECKLIST_MANAGE), validate(checklistTemplateSchema), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.CHECKLIST_MANAGE), validate(checklistTemplateSchema), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.CHECKLIST_MANAGE), controller.remove);

router.get('/:id/assignments', requirePermission(PERMISSIONS.CHECKLIST_VIEW), assignmentController.list);
router.put(
  '/:id/assignments',
  requirePermission(PERMISSIONS.CHECKLIST_MANAGE),
  validate(assignMachinesSchema),
  assignmentController.replace
);

module.exports = router;
