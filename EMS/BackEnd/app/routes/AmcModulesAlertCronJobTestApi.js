const alertCronJobTest = require('./controllers/Crons/AlertCronJob.js');
const production = require('./controllers/Crons/ProductionSegregationCron.js');
const EnergyCronJobTest = require('./controllers/Crons/EnergyMeterSegregationCron.js');
const sensor = require('./controllers/Crons/SensorSegregationCron.js');

const router = require("express").Router();

router.get("/ProductionCronJob", production.ProductionCronJob);

module.exports = router;