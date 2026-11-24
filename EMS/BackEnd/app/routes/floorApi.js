const router = require("express").Router();
const controller = require('../controllers/floorController');

router.get('/', controller.fetchFloorsByBuilding);
router.post('/add', controller.addFloor);
router.post('/getAllFloorsWithDetails', controller.getAllFloorsWithDetails);
router.put('/update/:id', controller.updateFloor);
router.delete('/delete/:id', controller.deleteFloor);

module.exports = router;
