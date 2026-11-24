
const MainteSchd = require('../controllers/AmcModulesMaintenanceScheduleMainteSchd');
const router = require('express').Router();
// Items
router.get('/showmachine', MainteSchd.show);
router.get('/showUser', MainteSchd.showUser);
router.get('/showAssetName', MainteSchd.showAssetName);

router.get('/showDataType', MainteSchd.showDataType);

router.get('/showDataType/:id', MainteSchd.showDataTypebyId);

router.get('/showcalendar/:id', MainteSchd.showMaintCalendarData);


// router.get('/section/:id', MainteSchd.showsection);
// router.get('/AssetType/:id', MainteSchd.showAssetType);
// router.get('/AssetName/:id', MainteSchd.showAssetName);
router.post('/storeData/', MainteSchd.storeData);
// router.post('/storeDataType/', MainteSchd.storeDataType);


router.post('/showWarrenty/:id', MainteSchd.showWarrenty);



module.exports = router;