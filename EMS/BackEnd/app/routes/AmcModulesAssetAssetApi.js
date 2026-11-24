
const Asset = require('../controllers/AmcModulesAssetAsset');
const router = require('express').Router();


// Items

router.post('/', Asset.store);
router.get('/', Asset.show);
// router.get('/showcount', Asset.showcount);
router.get('/downloadTemplate',Asset.downloadTemplate);
router.post('/importAssetTable',Asset.importAssetTable);
router.delete('/:id', Asset.delete);
router.put('/:id', Asset.update);
router.get('/search', Asset.search);

module.exports = router;