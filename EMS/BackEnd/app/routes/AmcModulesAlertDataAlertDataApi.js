const AlertData = require('../controllers/AmcModulesAlertDataAlertData');
const router = require("express").Router();


router.get("/showalert", AlertData.show);


module.exports = router;
