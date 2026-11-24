
const Section = require('../controllers/AmcModulesAssetSection');
const router = require('express').Router();
// Items

router.post('/', Section.store);
router.get('/', Section.show);
router.delete('/:id', Section.delete);
router.put('/:id', Section.update);
router.get('/search', Section.searchBySection);
router.get('/showdep', Section.showdep);

module.exports = router;