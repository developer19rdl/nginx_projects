const smsSettings = require('../controllers/SmsSettingsController.js');
const router = require("express").Router();

router.get("/", smsSettings.smsSettingApiShow);
router.post("/smsSettingAdd", smsSettings.smsSettingApi);
router.put("/:id", smsSettings.smsSettingApiUpdate);
router.delete("/:id", smsSettings.delete);

module.exports = router;
