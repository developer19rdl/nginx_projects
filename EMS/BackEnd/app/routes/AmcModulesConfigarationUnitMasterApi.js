
const UnitMaster = require('../controllers/AmcModulesConfigarationUnitMaster');
const router = require('express').Router();

router.post('/', UnitMaster.store);
router.get('/', UnitMaster.show);
router.delete('/:id', UnitMaster.delete);
router.put('/:id', UnitMaster.update);


module.exports = router;