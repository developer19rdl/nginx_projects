const Device = require('../controllers/AmcModulesDeviceDevice');
const Scada  = require('../controllers/ScadaController');
const router = require('express').Router();

router.post('/add', Device.store);
router.post('/:id/update', Device.update);

router.post('/:id/delete', Device.delete);
router.post('/', Device.showData);
router.post('/searchDevices', Device.searchDevices);

// SCADA: returns edge_devices list for the logged-in user
router.post('/showByUser', Scada.showByUser);


module.exports = router;