
const UtilityGroupMeter = require('../controllers/UtilityGroupMeterController');
const router = require('express').Router();

router.post('/group', UtilityGroupMeter.groupMeters);
router.post('/getGrouped', UtilityGroupMeter.getGroupedMeters);
router.post('/ungroup', UtilityGroupMeter.ungroupMeters);

module.exports = router;
