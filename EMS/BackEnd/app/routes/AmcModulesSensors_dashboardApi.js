const Sensors_settongs = require('./controllers/Sensors/Sensors_dashboard.js');
const router = require("express").Router();

router.post("/", Sensors_settongs.store);
router.post("/show", Sensors_settongs.getMachineData);// router.post("/store2", Users.store2);
router.post("/showgrid", Sensors_settongs.show);

router.put("/clearAlert/:id", Sensors_settongs.clear);
router.put("/updateDisplayName", Sensors_settongs.updateDisplayName);
router.put("/:machineId", Sensors_settongs.update);

router.delete("/:id", Sensors_settongs.delete);

module.exports = router;
