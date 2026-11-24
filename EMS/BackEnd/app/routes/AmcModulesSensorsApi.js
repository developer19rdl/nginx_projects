const sensors = require('./controllers/Sensors/Sensors.js');
const Graph = require('./controllers/Sensors/SensorGraph.js');
const router = require("express").Router();


router.post("/showdropdown", sensors.getDropdownValues);
router.post("/showupdatedropdown", sensors.updateDropdownValues);

router.post("/showSelectAllDropdownValues", sensors.getSelectAllDropdownValues);



// router.post("/ChartData", sensors.ChartData);
router.post("/ChartData", Graph.ChartData1);
router.post("/ChartData2", Graph.ChartData2);
router.post("/ChartData3", Graph.ChartData3);


router.post("/insertJson", sensors.insertData);





module.exports = router;