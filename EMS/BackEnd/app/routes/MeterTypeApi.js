const router = require('express').Router();
const MeterType = require('../controllers/MeterTypeController');

router.get('/', MeterType.show);
router.post('/', MeterType.store);
router.put('/:id', MeterType.update);
router.delete('/:id', MeterType.destroy);

module.exports = router;
