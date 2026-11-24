

const EdgeDevice = require('../controllers/AmcModulesMachineParaAllocationTabEdgeDevice');
const router = require('express').Router();


router.get('/', EdgeDevice.show);
router.get('/devicename', EdgeDevice.showdevicename);

router.post('/', EdgeDevice.store);
router.post('/deviceList', EdgeDevice.deviceList);
router.post('/:id', EdgeDevice.showdeviceId);

router.put('/:id', EdgeDevice.update);

router.delete('/:id', EdgeDevice.delete);


module.exports = router;