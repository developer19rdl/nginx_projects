const router = require("express").Router();
const controller = require('../controllers/buildingController');

router.get('/', controller.getBuildings);
router.post('/add', controller.addBuilding);
router.post('/getAllBuildingsWithDetails', controller.getAllBuildingsWithDetails);

router.put('/update/:id', controller.updateBuilding);
router.delete('/delete/:id', controller.deleteBuilding);

module.exports = router;





