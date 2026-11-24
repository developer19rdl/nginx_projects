const user = require('../controllers/useruserController.js');
const router = require("express").Router();

router.get("/", user.show);
router.post("/", user.store);
router.put("/:id", user.update);
router.delete("/:id", user.delete);

// router.get("/getId", user.generateUniqueEmpId);

// router.post("/store2", Users.store2);

module.exports = router;