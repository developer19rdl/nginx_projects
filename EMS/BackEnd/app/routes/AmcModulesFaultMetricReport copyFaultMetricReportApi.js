const machineController = require('./controllers/FaultMetricReport/FaultMetricReport');
const router = require("express").Router();


router.post('/machine_metric_datewise', machineController.getMachineMetrics);
router.post('/machine-data', machineController.getMachineData);
router.post('/machine-graph', machineController.getMachinesgraph);
router.post('/singlemachine-graph', machineController.getsinglemachinegraph);


module.exports = router;
