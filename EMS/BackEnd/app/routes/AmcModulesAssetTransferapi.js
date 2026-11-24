
const Transfer = require('../controllers/AmcModulesAssetTransfer');
const router = require('express').Router();
// Items
router.get('/', Transfer.show);
router.get('/section/:id', Transfer.showsection);
router.get('/AssetType/:id', Transfer.showAssetType);
router.get('/AssetName/:id', Transfer.showAssetName);
router.post('/moveAsset/', Transfer.moveAsset);


module.exports = router;