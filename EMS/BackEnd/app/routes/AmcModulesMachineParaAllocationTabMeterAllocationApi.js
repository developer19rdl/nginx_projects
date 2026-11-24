

const MeterAllocation = require('../controllers/AmcModulesMachineParaAllocationTabMeterAllocation');
const router = require('express').Router();

router.get('/', MeterAllocation.show);
router.get('/livedata', MeterAllocation.getIncomerMeterLiveData);
router.get('/getMeters', MeterAllocation.getMeters);
router.get('/devicename', MeterAllocation.showdeviceNameby);
router.get('/getSubCategoryEnergy', MeterAllocation.getSubCategoryEnergy);
router.get('/dashboardSummary', MeterAllocation.getDashboardSummary);
router.get('/getEBMonthlyEnergy', MeterAllocation.getEBMonthlyEnergy);
router.get('/getSolarMonthlyEnergy', MeterAllocation.getSolarMonthlyEnergy);

router.post('/slaveIdList', MeterAllocation.slaveIdList);
router.post('/groupMeters', MeterAllocation.groupMeters);
router.post('/ungroupMeters', MeterAllocation.ungroupMeters);
router.post('/', MeterAllocation.store);
router.post('/getMetersByCategory', MeterAllocation.getMetersByCategory);
router.post('/subCategoryEnergyByMonth', MeterAllocation.subCategoryEnergyByMonth);
router.post('/subcategoryHourlyEnergy', MeterAllocation.subcategoryHourlyEnergy);
router.post('/addGaugeChart', MeterAllocation.addGaugeChart);
router.post('/getEBDailyEnergy', MeterAllocation.getEBDailyEnergy);
router.post('/getSolarDailyEnergy', MeterAllocation.getSolarDailyEnergy);
router.post('/getEBHourlyEnergy', MeterAllocation.getEBHourlyEnergy);
router.post('/getSolarHourlyEnergy', MeterAllocation.getSolarHourlyEnergy);
router.post('/getBuildingOtherEnergy', MeterAllocation.getBuildingOtherEnergy);
router.post('/getBuildingHourlyEnergy', MeterAllocation.getBuildingHourlyEnergy);

router.delete('/:id', MeterAllocation.delete);
router.put('/:id', MeterAllocation.update);
router.post('/slavename/:id', MeterAllocation.showslaveName);
router.post('/excel', MeterAllocation.storeexceldata);

module.exports = router;