const router = require("express").Router();
const controller = require('../controllers/searchController');

router.post('/showdata', controller.searchCategoryEnergy);
router.post('/showdaywise', controller.categoryEnergyByDate);
router.post('/showhourwise', controller.categoryHourlyEnergy);
router.post('/categoryEnergyByMonth', controller.categoryEnergyByMonth);
router.post('/getCategoryData', controller.getCategoryData);
router.post('/saveChartSettings', controller.saveChartSettings);


module.exports = router;
