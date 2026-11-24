const Department = require('./controllers/Departments/Department.js');
const router = require("express").Router();

router.post("/", Department.store);
router.put("/:id", Department.update);
router.delete("/:id", Department.delete);
router.get("/", Department.show);

// router.post("/store2", Users.store2);

module.exports = router;
