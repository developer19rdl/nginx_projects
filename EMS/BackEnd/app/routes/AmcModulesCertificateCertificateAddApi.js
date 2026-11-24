
const Certificate = require('../controllers/AmcModulesCertificateCertificateAdd');
const router = require('express').Router();

router.post('/store', Certificate.store);
router.get('/', Certificate.show);
router.delete('/:id', Certificate.delete);
router.put('/:id', Certificate.update);
// router.get('/search', Certificate.search);
router.get('/showvendor', Certificate.showAllVendors);
router.get('/showdep', Certificate.showdep);
router.get('/showSection/:id', Certificate.showSection);
router.get('/showAssetType/:id', Certificate.showAssetType);
router.get('/showAssetName/:id', Certificate.showAssetName);
router.post('/showData', Certificate.showData);

router.post('/showDatabydate', Certificate.showDatabydate);
router.get('/showrenewal', Certificate.showRenewalData);
module.exports = router;