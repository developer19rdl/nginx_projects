
const Vendor = require('../controllers/AmcModulesAssetVendor');
const router = require('express').Router();

router.post('/', Vendor.store);
router.get('/', Vendor.showAllVendors);
router.delete('/:id', Vendor.deleteVendorById);
router.put('/:id', Vendor.updateVendorById);
router.get('/search', Vendor.searchVendorsByName);

module.exports = router;