const machineData = require('./controllers/DashBoardData/MachineStatusController.js');
const router = require("express").Router();


router.get("/", machineData.MachineActiveStatusCount);



module.exports = router;