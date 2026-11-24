
const AddSensor = require('../controllers/AmcModulesConfigarationAddSensor');
const router = require('express').Router();

router.post('/', AddSensor.store);
router.get('/', AddSensor.show);
router.delete('/:id', AddSensor.delete);
router.put('/:id', AddSensor.update);


module.exports = router;