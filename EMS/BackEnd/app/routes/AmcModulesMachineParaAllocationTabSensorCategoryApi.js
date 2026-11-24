
const SensorCategory = require('../controllers/AmcModulesMachineParaAllocationTabSensorCategory');
const router = require('express').Router();

router.post('/', SensorCategory.store);
router.get('/', SensorCategory.show);
router.delete('/:id', SensorCategory.delete);
router.put('/:id', SensorCategory.update);
router.get('/name', SensorCategory.showname);




module.exports = router;