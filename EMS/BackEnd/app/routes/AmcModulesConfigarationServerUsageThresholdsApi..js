
const ServerUsageThresholds = require('../controllers/AmcModulesConfigarationServerUsageThresholds');
const router = require('express').Router();

router.post('/', ServerUsageThresholds.store);
router.get('/', ServerUsageThresholds.show);
router.delete('/:id', ServerUsageThresholds.delete);
router.put('/:id', ServerUsageThresholds.update);


module.exports = router;