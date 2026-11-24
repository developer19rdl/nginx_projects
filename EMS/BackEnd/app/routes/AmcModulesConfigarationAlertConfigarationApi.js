
const AlertConfigaration = require('../controllers/AmcModulesConfigarationAlertConfigaration');
const router = require('express').Router();

router.post('/', AlertConfigaration.store);
router.get('/', AlertConfigaration.show);
router.delete('/:id', AlertConfigaration.delete);
router.put('/:id', AlertConfigaration.update);


module.exports = router;