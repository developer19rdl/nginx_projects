const user = require('./controllers/user/userController.js');
const router = require("express").Router();

router.post("/", user.store);
router.put("/:id", user.update);
router.delete("/:id", user.delete);
router.get("/", user.show);
// router.get("/getId", user.generateUniqueEmpId);

// router.post("/store2", Users.store2);

module.exports = router;