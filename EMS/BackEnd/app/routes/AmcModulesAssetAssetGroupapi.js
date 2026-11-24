
const AssetGroup = require('../controllers/AmcModulesAssetAssetGroup');
const router = require('express').Router();
// Items

router.post('/', AssetGroup.store);
router.get('/', AssetGroup.show);
router.delete('/:id', AssetGroup.delete);
router.put('/:id', AssetGroup.update);
router.get('/search', AssetGroup.searchByAssetGroup);

module.exports = router;