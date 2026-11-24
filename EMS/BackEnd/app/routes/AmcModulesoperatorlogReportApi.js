const operatorlog = require('./controllers/Operator/operatorlogReport.js');
const router = require("express").Router();


router.post("/show", operatorlog.show);
router.post("/showdropdown", operatorlog.getDropdownValues);

module.exports = router;