
const FailuremetricTarget = require('../controllers/AmcModulesConfigarationFailuremetricTarget');
const router = require('express').Router();

router.post('/', FailuremetricTarget.store);
router.get('/', FailuremetricTarget.show);
router.delete('/:id', FailuremetricTarget.delete);
router.put('/:id', FailuremetricTarget.update);


module.exports = router;