const energYData = require('../controllers/EnergyDashBoardEnergyTrendController.js');

const KebData = require('../controllers/EnergyDashBoardKebDataController.js');

const distributerData = require('../controllers/EnergyDashBoardPlantEnergyController.js');


const router = require("express").Router();

router.get("/", energYData.Last30DaysEnergyConsumptionTrend);
router.get("/24HourEnergyTrend", energYData.Last24HourEnergyConsumptionTrend);
router.post("/energyMeterDataList", energYData.EnergyMeterDataList);
router.get("/mainIncomer", energYData.MainIncomer);
router.get("/meterDropDownList", energYData.meterDropDownList);
router.get("/kebData", KebData.KebData);
router.get("/genratorData", KebData.GeneratorData);
router.post("/plantDistributerData", distributerData.PlantDistributerData);
router.post("/lastMonthDistributerTrend", distributerData.LastMonthDistributerTrend);
router.post("/24HourDistributerTrend", distributerData.Last24HourDistributerTrend);
router.get("/solarData", energYData.solarData);
router.get("/WindmillData", energYData.WindmillData);

router.get("/meterDataOnOffStatus", energYData.meterDataOnOffStatus);
router.get("/meterOfflineThreshold", energYData.getMeterOfflineThresholdSetting);
router.put("/meterOfflineThreshold", energYData.updateMeterOfflineThresholdSetting);

router.get("/kebCurrentData",        KebData.KEBCurrentData);
router.get("/topFiveDevices",        KebData.TopFiveDevices);
router.get("/hourlyPowerByDevice",   KebData.HourlyPowerByDevice);
router.get("/energyConsumptionMonth", energYData.EnergyConsumptionMonth);

module.exports = router;