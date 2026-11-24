const router = require("express").Router();
const controller = require('../controllers/locationController');

router.get('/plantMapData', controller.getPlantMapData);
router.post('/', controller.addLocations);
router.post('/getAllLocations', controller.getAllLocations);

router.put('/:id', controller.updateLocations);
router.delete('/delete/:id', controller.deleteLocations);

module.exports = router;