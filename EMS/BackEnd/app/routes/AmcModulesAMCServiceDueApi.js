
const Sevices = require('../controllers/AmcModulesAMCServiceDue');
const router = require('express').Router();

router.get('/showdep', Sevices.showdep);
router.get('/showSection', Sevices.showSection);
router.get('/showAssetType', Sevices.showAssetType);
router.get('/showAssetName', Sevices.showAssetName);
router.post('/showDatabydate', Sevices.showDatabydate);
router.get('/showRenewalData', Sevices.showRenewalData);
router.get('/showRenewalDataById/:id', Sevices.showRenewalDataById);
router.put('/showRenewalDataById/:id', Sevices.updateRenewalDataById);
module.exports = router;