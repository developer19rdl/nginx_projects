
const AssetType = require('../controllers/AmcModulesAssetAssetType');
const router = require('express').Router();


// Items

router.post('/', AssetType.store);
router.get('/', AssetType.show);
router.delete('/:id', AssetType.delete);
router.put('/:id', AssetType.update);
router.get('/search', AssetType.search);
router.get('/showsection/:id', AssetType.showsection);

module.exports = router;