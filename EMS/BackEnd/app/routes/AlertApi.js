const alert = require('../controllers/AlertController.js');
const router = require("express").Router();

router.get("/", alert.alertSettingApiShow);
router.post("/showAlertReport", alert.AlertReport);
router.get("/deviceDropdown", alert.alertDeviceDropdown);
router.get("/slaveDropdown", alert.alertSlaveDropdown);
router.get("/tagDropdown", alert.alertTagDropdown);
router.get("/dashboardAlerts", alert.dashboardAlerts);
router.post("/alertSettingAdd", alert.alertSettingApi);
router.put("/:id", alert.alertSettingApiUpdate);
router.delete("/:id", alert.delete);

module.exports = router;
