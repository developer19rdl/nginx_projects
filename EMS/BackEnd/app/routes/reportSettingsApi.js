const reportSettings = require("../controllers/ReportSettingsController.js");
const router = require("express").Router();

router.get("/", reportSettings.show);
router.put("/:id", reportSettings.update);

module.exports = router;
