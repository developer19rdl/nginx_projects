const machineData = require('../controllers/DashBoardDataMachineStatusController.js');
const router = require("express").Router();


router.get("/", machineData.MachineActiveStatusCount);

router.get("/DisconnectedDeviceCount", machineData.DisconnectedDeviceCount);




module.exports = router;