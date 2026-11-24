
const MstAssetList = require('../controllers/AmcModulesAssetMstAssetList');
const router = require('express').Router();
// Items
router.get('/', MstAssetList.show);
router.get('/section/:id', MstAssetList.showsection);
router.get('/AssetType/:id', MstAssetList.showAssetType);

router.post('/Assetdata', MstAssetList.showData);


module.exports = router;