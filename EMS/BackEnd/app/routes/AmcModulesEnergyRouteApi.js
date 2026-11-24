const energYData = require('./controllers/EnergyDashBoard/EnergyTrendController.js');

const KebData = require('./controllers/EnergyDashBoard/KebDataController.js');

const router = require("express").Router();


router.get("/", energYData.Last30DaysEnergyConsumptionTrend);

router.get("/24HourEnergyTrend", energYData.Last24HourEnergyConsumptionTrend);

router.get("/energyMeterDataList", energYData.EnergyMeterDataList);
router.get("/meterDropDownList", energYData.meterDropDownList);

router.get("/kebData", KebData.KebData);

router.get("/genratorData", KebData.GeneratorData);


module.exports = router;