const ctrl = require('../controllers/ReportsEnvironmentalReport.js');
const router = require('express').Router();

router.get('/categoryDropdown', ctrl.getCategoryDropdown);
router.post('/data', ctrl.getHourlyReport);
router.post('/export', ctrl.exportHourlyReport);

module.exports = router;
