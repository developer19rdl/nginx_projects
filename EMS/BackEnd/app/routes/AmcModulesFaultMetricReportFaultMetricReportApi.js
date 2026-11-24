const machineController = require('../controllers/AmcModulesFaultMetricReportFaultMetricReport');
const router = require("express").Router();


router.post('/machine_metric_datewise', machineController.getMachineMetrics);
router.post('/machine-data', machineController.getMachineData);
router.post('/machine-graph', machineController.getMachinesgraph);
router.post('/singlemachine-graph', machineController.getsinglemachinegraph);
 router.post('/singlemachine-graphcalc', machineController.getMachinesGraphCalc);
router.get('/showmachinename', machineController.showmachinename);


module.exports = router;
