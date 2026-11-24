
const PrevMaint = require('../controllers/AmcModulesPreventiveMaintainancePrevMaint');
const router = require('express').Router();
// Items
router.post('/showApprove', PrevMaint.showApprove);

router.get('/showshopflore', PrevMaint.showshopflordata);


// router.get('/section/:id', PrevMaint.showsection);
// router.get('/AssetType/:id', PrevMaint.showAssetType);
// router.get('/AssetName/:id', PrevMaint.showAssetName);
// router.get('/deviceAlertCounts/', PrevMaint.deviceAlertCounts);

// router.post('/store/', PrevMaint.store);
// router.get('/show', PrevMaint.showname);
// // router.post('/storeDataType/', PrevMaint.storeDataType);
// router.get('/showDataType', PrevMaint.showDataType);


module.exports = router;