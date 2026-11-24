const Category = require('../controllers/AmcModulesProblemCategoryProblemCategory');
const router = require("express").Router();
router.post("/", Category.store);
router.put("/:id", Category.update);
router.delete("/:id", Category.delete);
router.get("/", Category.show);

module.exports = router;