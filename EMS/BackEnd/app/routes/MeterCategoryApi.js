const router = require('express').Router();
const MeterCategory = require('../controllers/MeterCategoryController');

router.get('/', MeterCategory.show);
router.post('/', MeterCategory.store);
router.put('/:id', MeterCategory.update);
router.delete('/:id', MeterCategory.destroy);

module.exports = router;
