const plantData = require('../controllers/PlantController.js');
const router = require("express").Router();


router.post("/", plantData.store);
router.put("/:id", plantData.update);
router.delete("/:id", plantData.delete);
router.get("/", plantData.show);
router.get("/dropDown", plantData.dropDown);
router.get("/plantTabList", plantData.PlantTabList);

router.get("/feederList", plantData.feederList);

router.post("/search", plantData.searchPlantDropDown);

router.post("/reportPlantDropDown", plantData.reportPlantDropDown);
router.post("/incomerDropDown", plantData.incomerDropDown);







module.exports = router;