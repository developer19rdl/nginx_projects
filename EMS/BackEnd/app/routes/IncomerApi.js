const incomerData = require('../controllers/IncomerController.js');
const router = require("express").Router();


router.post("/", incomerData.store);
router.put("/:id", incomerData.update);
router.delete("/:id", incomerData.delete);
router.get("/", incomerData.show);
router.get("/:plantId", incomerData.showIncomerByplant);
router.get("/dropDown/:plantId", incomerData.dropDown);


module.exports = router;