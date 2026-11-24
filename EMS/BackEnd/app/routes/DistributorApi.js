const distributerData = require('../controllers/DistributorController.js');
const router = require("express").Router();

router.get("/", distributerData.show);
router.get("/dropDown", distributerData.dropDown);
router.get("/show", distributerData.fetchDistributor);

router.post("/", distributerData.store);
router.put("/:id", distributerData.update);
router.delete("/:id", distributerData.delete);



module.exports = router;