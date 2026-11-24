
const EnergyTariff = require('../controllers/AmcModulesConfigarationEnergyTariff');
const router = require('express').Router();

router.post('/', EnergyTariff.store);
router.get('/', EnergyTariff.show);
router.delete('/:id', EnergyTariff.delete);
router.put('/:id', EnergyTariff.update);


module.exports = router;
