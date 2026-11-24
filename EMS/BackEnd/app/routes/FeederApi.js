const feederData = require('../controllers/FeederController.js');
const router = require("express").Router();

router.get("/", feederData.show);
router.get("/dropDown", feederData.dropDown);
router.get("/showFeeder", feederData.fetchFeeder);
router.get("/showDropdown", feederData.showDropdown);

router.post("/", feederData.store);
router.put("/:id", feederData.update);
router.delete("/:id", feederData.delete);



module.exports = router;