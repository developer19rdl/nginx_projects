const machineDashData = require('../controllers/DashBoardDataMachineController.js');
const router = require("express").Router();


router.get("/", machineDashData.DashBoardMachineList);
router.get("/healthDashboard", machineDashData.machineHealthList);
router.put("/clearAlert/:id", machineDashData.clear);
router.get("/AllMachineList", machineDashData.AllMachineList);


module.exports = router;