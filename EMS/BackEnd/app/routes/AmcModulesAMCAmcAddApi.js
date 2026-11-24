
const AmcAdd = require('../controllers/AmcModulesAMCAmcAdd');
const router = require('express').Router();

router.post('/', AmcAdd.store);
router.get('/', AmcAdd.show);
router.delete('/:id', AmcAdd.delete);
router.put('/:id', AmcAdd.update);
router.get('/search', AmcAdd.search);
router.get('/showvendor', AmcAdd.showAllVendors);
router.get('/showdep', AmcAdd.showdep);
router.get('/showSection', AmcAdd.showSection);
router.get('/showAssetType', AmcAdd.showAssetType);
router.get('/showAssetName', AmcAdd.showAssetName);


module.exports = router;