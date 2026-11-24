const router = require("express").Router();
const controller = require('../controllers/categoryController')


router.get('/getMainCategory', controller.getMainCategory);
router.post('/add', controller.postMainCategory);

router.put('/update/:id', controller.updateMainCategory);
router.delete('/delete/:id', controller.deleteMainCategory);

// Report hierarchy dropdowns
router.get('/buildingDropDown',      controller.buildingDropDown);
router.post('/floorDropDown',        controller.floorDropDown);
router.post('/categoryDropDown',     controller.categoryDropDown);
router.post('/categoryMeterDropDown',controller.categoryMeterDropDown);


module.exports = router;
