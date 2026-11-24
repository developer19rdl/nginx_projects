
const AddEvent = require('../controllers/AmcModulesConfigarationAddEvent');
const router = require('express').Router();

router.post('/', AddEvent.store);
router.get('/', AddEvent.show);
router.delete('/:id', AddEvent.delete);
router.put('/:id', AddEvent.update);


module.exports = router;