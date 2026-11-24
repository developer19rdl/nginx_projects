
const Sevices = require('../controllers/AmcModulesAMCServiceDue');
const router = require('express').Router();

router.get('/showdep', Sevices.showdep);
router.get('/showSection', Sevices.showSection);
router.get('/showAssetType', Sevices.showAssetType);
router.get('/showAssetName', Sevices.showAssetName);
// router.get('/showData', Sevices.showData);

module.exports = router;