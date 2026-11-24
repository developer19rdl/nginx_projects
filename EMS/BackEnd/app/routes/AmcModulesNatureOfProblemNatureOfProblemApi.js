const Natureprob = require('../controllers/AmcModulesNatureOfProblemNatureOfProblem');
const router = require("express").Router();
router.post("/", Natureprob.store);
router.put("/:id", Natureprob.update);
router.delete("/:id", Natureprob.delete);
router.get("/", Natureprob.show);
router.post("/:id", Natureprob.showbyId);





module.exports = router;