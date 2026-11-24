
const DeviceCategory = require('../controllers/AmcModulesMachineParaAllocationTabDeviceCategory');

const router = require('express').Router();

router.post('/', DeviceCategory.store);
router.get('/', DeviceCategory.show);
router.delete('/:id', DeviceCategory.delete);
router.put('/:id', DeviceCategory.update);



module.exports = router;