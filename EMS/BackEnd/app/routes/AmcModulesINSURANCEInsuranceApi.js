
const Insurance = require('../controllers/AmcModulesINSURANCEInsuranceAdd');
const router = require('express').Router();

router.post('/', Insurance.store);
router.get('/', Insurance.show);
router.delete('/:id', Insurance.delete);
router.put('/:id', Insurance.update);
// router.get('/search', Insurance.search);
// router.get('/showvendor', Insurance.showAllVendors);
router.get('/showdep', Insurance.showdep);
router.get('/showSection/:id', Insurance.showSection);
router.get('/showAssetType/:id', Insurance.showAssetType);
// router.get('/showAssetName/:id', Insurance.showAssetName);

router.post('/showDatabydate', Insurance.showDatabydate);

router.get('/showRenewalData', Insurance.showRenewalData);
router.get('/showinsurencebyid/:id', Insurance.showRenewalDataById);
router.put('/showinsurencebyid/:id', Insurance.updateRenewalDataById);
module.exports = router;