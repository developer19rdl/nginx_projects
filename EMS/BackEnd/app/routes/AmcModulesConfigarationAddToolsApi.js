
const AddTools = require('../controllers/AmcModulesConfigarationAddTools');
const router = require('express').Router();

router.post('/', AddTools.store);
router.get('/', AddTools.show);
router.delete('/:id', AddTools.delete);
router.put('/:id', AddTools.update);


module.exports = router;