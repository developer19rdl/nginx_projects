const router = require('express').Router();
const controller = require('../../controllers/dashboard.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { PERMISSIONS } = require('../../config/constants');

router.use(authenticate, requirePermission(PERMISSIONS.DASHBOARD_VIEW));

router.get('/summary', controller.getSummary);
router.get('/charts', controller.getCharts);
router.get('/machines-live', controller.getMachineLiveStatus);
router.get('/machines/:id/insights', controller.getMachineInsights);
router.get('/machines/:id/downtime-trends', controller.getDowntimeTrends);
router.get('/machines/:id/production-trend', controller.getProductionTrend);

module.exports = router;
