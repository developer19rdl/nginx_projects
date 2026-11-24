
const Warranty = require('../controllers/AmcModulesWarrantyWarranty');
const router = require('express').Router();


// Items

router.post('/', Warranty.showDatabydate);


module.exports = router;