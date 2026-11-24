
const UtilityMeter = require('../controllers/UtilityMeterController');
const router = require('express').Router();

router.get('/sensorStats', UtilityMeter.sensorStats);
router.get('/dashboard',   UtilityMeter.dashboard);
router.get('/dropdown',    UtilityMeter.dropdown);
router.get('/', UtilityMeter.show);
router.post('/', UtilityMeter.store);
router.put('/:id', UtilityMeter.update);
router.delete('/:id', UtilityMeter.delete);

module.exports = router;
