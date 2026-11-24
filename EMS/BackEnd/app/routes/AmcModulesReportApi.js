const energyConsum = require('./controllers/Reports/EnergyConsumReport.js');
const router = require("express").Router();

router.post("/energyConsum", energyConsum.EnergyConsumReport);
router.post("/test", energyConsum.report);
// router.post("/allMachineEnergyConsum", energyConsum.AllMachineEnergyConsumReport);
router.get("/machineList", energyConsum.reportMachineDropDown);
router.get("/allocMachineList", energyConsum.allocationMachineDropDown);
router.get("/KebGenerateOnOffState", energyConsum.KebGenerateOnOffState);

module.exports = router;