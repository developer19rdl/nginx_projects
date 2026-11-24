const ctrl = require('../controllers/ReportsSensorReport.js');
const router = require('express').Router();

router.get('/deviceDropdown', ctrl.getDeviceDropdown);
router.get('/meterDropdown', ctrl.getMeterDropdown);
router.get('/slaveDropdown', ctrl.getSlaveDropdown);
router.get('/tagDropdown', ctrl.getTagDropdown);
router.post('/data', ctrl.getSensorReport);
router.post('/export', ctrl.exportSensorReport);

module.exports = router;
