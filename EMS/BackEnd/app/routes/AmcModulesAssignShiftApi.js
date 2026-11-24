const shift = require('./controllers/AssignShiftController.js');

const router = require("express").Router();


router.get("/template", shift.AssignShiftTemplate);
router.post("/importAssignShift", shift.importAssignShift);



module.exports = router;
