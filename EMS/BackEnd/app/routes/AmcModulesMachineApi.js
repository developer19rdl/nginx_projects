const machineDashData = require('./controllers/DashBoardData/MachineController.js');
const router = require("express").Router();


router.get("/", machineDashData.DashBoardMachineList);

router.get("/healthDashboard", machineDashData.MachineHealthList);

router.get("/AllMachineList", machineDashData.AllMachineList);

router.get("/MachineName", machineDashData.searchname);










module.exports = router;