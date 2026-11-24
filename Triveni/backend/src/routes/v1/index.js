const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/production-plans', require('./productionPlans.routes'));
router.use('/machines', require('./machines.routes'));
router.use('/shifts', require('./shifts.routes'));
router.use('/machine-planning', require('./machinePlanning.routes'));
router.use('/items', require('./items.routes'));
router.use('/operators', require('./operators.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/users', require('./users.routes'));
router.use('/roles', require('./roles.routes'));
router.use('/audit-logs', require('./audit.routes'));
router.use('/coil-lookup', require('./coilLookup.routes'));
router.use('/downtime-reasons', require('./downtimeReasons.routes'));
router.use('/downtime', require('./downtime.routes'));
router.use('/checklist-templates', require('./checklistTemplates.routes'));
router.use('/checklist', require('./checklist.routes'));
router.use('/quality-inspection-plans', require('./qualityInspectionPlans.routes'));
router.use('/quality-defect-catalog', require('./qualityDefectCatalog.routes'));
router.use('/quality-inspections', require('./qualityInspections.routes'));
router.use('/quality-capa', require('./qualityCapa.routes'));
router.use('/quality-attachments', require('./qualityAttachments.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/warehouses', require('./warehouses.routes'));

module.exports = router;
