const router = require("express").Router();
const controller = require('../controllers/regionController');


router.get('/', controller.getAllRegions);
router.post('/', controller.addRegion);
router.put('/:id', controller.updateRegion);
router.delete('/delete/:id', controller.deleteRegion);

module.exports = router;