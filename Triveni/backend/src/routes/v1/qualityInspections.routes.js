const router = require('express').Router();
const controller = require('../../controllers/qualityInspection.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const {
  startInspectionSchema,
  saveParameterResultsSchema,
  defectEntrySchema,
  decisionSchema,
} = require('../../validators/qualityInspection.validator');

router.use(authenticate);

router.get('/pending', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.listPending);
router.get('/', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.list);
router.get('/:id', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.getById);
router.get('/:id/pdf', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.downloadPdf);
router.get('/:id/excel', requirePermission(PERMISSIONS.QUALITY_VIEW), controller.downloadExcel);

router.post(
  '/from-lot/:machinePlanningId',
  requirePermission(PERMISSIONS.QUALITY_INSPECT),
  validate(startInspectionSchema),
  controller.start
);
router.post(
  '/:id/parameter-results',
  requirePermission(PERMISSIONS.QUALITY_INSPECT),
  validate(saveParameterResultsSchema),
  controller.saveParameterResults
);
router.post('/:id/defects', requirePermission(PERMISSIONS.QUALITY_INSPECT), validate(defectEntrySchema), controller.addDefect);
router.delete('/:id/defects/:defectId', requirePermission(PERMISSIONS.QUALITY_INSPECT), controller.removeDefect);
router.post('/:id/decision', requirePermission(PERMISSIONS.QUALITY_INSPECT), validate(decisionSchema), controller.recordDecision);
router.post('/:id/reopen', requirePermission(PERMISSIONS.QUALITY_INSPECT), controller.reopen);
router.post('/:id/release', requirePermission(PERMISSIONS.QUALITY_INSPECT), controller.release);

module.exports = router;
