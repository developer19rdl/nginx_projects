
const Device = require('../controllers/AmcModulesDeviceDeviceChatogory');
const router = require('express').Router();

router.post('/add', Device.store);
router.post('/:id/update', Device.update);

router.post('/:id/delete', Device.delete);
router.get('/showData', Device.showAll);


module.exports = router;