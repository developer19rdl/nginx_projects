const energyConsum = require('../controllers/ReportsEnergyConsumReport.js');
const energyExlReport = require('../controllers/ReportsEnergyExlReport.js');

const router = require("express").Router();

router.get("/machineList", energyConsum.reportMachineDropDown);
router.get("/allocMachineList", energyConsum.allocationMachineDropDown);
router.get("/KebGenerateOnOffState", energyConsum.KebGenerateOnOffState);

// Energy
router.get('/energyReportExcel', energyExlReport.EnergyConsumReportExcel);
router.post("/energyConsum", energyConsum.EnergyConsumReport);
router.post("/energyHourReport", energyConsum.EnergyHourReport);

router.post("/top5energyData", energyConsum.gettop5energyData);
router.post("/energydatagraph", energyConsum.gettenergyDataingraph);

// Building / category hierarchy energy report
router.post("/buildingEnergyConsum",    energyConsum.BuildingEnergyConsumReport);
router.post("/buildingEnergyHour",      energyConsum.BuildingEnergyHourReport);
router.post("/buildingTop5energyData",  energyConsum.getBuildingTop5energyData);
router.post("/buildingEnergydatagraph", energyConsum.getBuildingEnergydatagraph);


module.exports = router;