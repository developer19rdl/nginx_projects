const router = require("express").Router();
const controller = require('../controllers/areaController');

router.post('/', controller.addArea);
router.post('/getAreasWithLocation', controller.getAreasWithLocation);

router.put('/update/:id', controller.updateArea);
router.delete('/delete/:id', controller.deleteArea);

module.exports = router;