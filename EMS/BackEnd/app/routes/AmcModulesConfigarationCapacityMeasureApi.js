
const CapacityMeasure = require('../controllers/AmcModulesConfigarationCapacityMeasure');
const router = require('express').Router();

router.post('/', CapacityMeasure.store);
router.get('/', CapacityMeasure.show);
router.delete('/:id', CapacityMeasure.delete);
router.put('/:id', CapacityMeasure.update);


module.exports = router;