

const MachineAllocation = require('../controllers/AmcModulesMachineParaAllocationTabMachineAllocation');
const router = require('express').Router();

router.post('/', MachineAllocation.store);
router.get('/', MachineAllocation.show);
router.delete('/:id', MachineAllocation.delete);
router.put('/:id', MachineAllocation.update);
router.get('/name', MachineAllocation.showName);
router.post('/name/:id', MachineAllocation.showdeviceNameby);
router.post('/showslaveId/:id', MachineAllocation.showslaveId);
router.post('/tagName/:id', MachineAllocation.showTagNameby);
router.post('/excel', MachineAllocation.storeexceldata);






module.exports = router;