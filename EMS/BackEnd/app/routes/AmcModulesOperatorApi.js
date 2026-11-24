const Operator = require('./controllers/Operator/Operator.js');
const router = require("express").Router();

router.post("/", Operator.store);
router.put("/:id", Operator.update);
router.delete("/:id", Operator.delete);
router.get("/", Operator.show);

// router.post("/store2", Users.store2);

module.exports = router;
