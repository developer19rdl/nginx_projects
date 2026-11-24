const router = require("express").Router();
const controller = require('../controllers/subCategoryController')


router.get('/', controller.getSubCategory);
router.post('/add', controller.addSubCategory);

router.put('/update/:id', controller.updateSubCategory);
router.delete('/delete/:id', controller.deleteSubCategory);

// Report dropdown
router.post('/dropDown', controller.subCategoryDropDown);


module.exports = router;
