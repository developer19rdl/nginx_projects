const router = require("express").Router();
const controller = require('../controllers/dashboardController');

router.get("/tree", controller.getTree);
router.get("/utilityGroupedMeters", controller.getUtilityGroupedMeters);
router.get("/liveData", controller.getLiveData);
router.get("/liveTags",  controller.getLiveTags);
router.get("/liveTagValue", controller.getTagLiveValue);
router.get("/meterOptions", controller.getMeterOptions);
router.get("/meterCurrentHourValue", controller.getMeterCurrentHourValue);
router.get("/meterDetail", controller.getMeterDetail);
router.get("/sensorParams",  controller.getSensorParams);
router.get("/sensorGraph",   controller.getSensorGraph);
router.get("/deviceParams",  controller.getDeviceParams);
router.get("/meterDashboard/:meterId",          controller.getMeterDashboard);
router.put("/meterDashboard/:meterId/settings", controller.updateMeterDefaultSettings);

module.exports = router;
