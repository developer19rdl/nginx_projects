
const AddMaxEnergy = require('../controllers/AmcModulesConfigarationAddMaxEnergy');
const router = require('express').Router();

router.post('/', AddMaxEnergy.store);
router.get('/', AddMaxEnergy.show);
router.delete('/:id', AddMaxEnergy.delete);
router.put('/:id', AddMaxEnergy.update);


module.exports = router;