const alertCronJobTest = require('../controllers/CronsAlertCronJob.js');
// const production = require('../controllers/CronsProductionSegregationCron.js');
const EnergyCronJobTest = require('../controllers/CronsEnergyMeterSegregationCron.js');
const sensor = require('../controllers/CronsSensorSegregationCron.js');
// const oeeShift = require('../controllers/CronsOeeMachineAllocationCron.js');

const DeviceDisconectedStatusCron = require('../controllers/CronsDeviceDisconectedStatusCron.js');
// const EnergySummaryBackup = require('../controllers/CronsManageDataCronEnergySummaryBackupDataCron.js')
// const SensorSummaryBackup = require('../controllers/CronsManageDataCronSenorDataSummaryData.js')
// const MaintainRawTable = require('../controllers/CronsMaintainRawTableCron.js')

// const SensorAggregateCron = require('../controllers/CronsSensorAggregateCron.js');

const router = require("express").Router();

const generator = require('../controllers/CronsGenratorDataExtractCron.js');
// const SensorAggregate = require('../controllers/CronsSenorAggregate.js');


router.get("/generatorDataExtractCron", generator.generatorDataExtractCron);

router.get("/DeviceDisconectedStatusCron", DeviceDisconectedStatusCron.DeviceDisconectedStatusCron);

// router.get("/SensorAggregateCron", SensorAggregateCron.SensorAggregateCron);

// router.get("/MaintainRawTableCron", MaintainRawTable.MaintainRawTableCron);
// router.get("/EnergySummaryBackupDataCron", EnergySummaryBackup.EnergySummaryBackupDataCron);
// router.get("/SenorDataSummaryData", SensorSummaryBackup.SenorDataSummaryData);

module.exports = router;