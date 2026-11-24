const router = require('express').Router();
const Ctrl   = require('../controllers/PlantConsumptionConfigController');

router.post('/save',     Ctrl.save);
router.post('/showData', Ctrl.show);

module.exports = router;
