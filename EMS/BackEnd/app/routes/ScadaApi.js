const router = require('express').Router();
const Scada  = require('../controllers/ScadaController');

// Background image upload (multipart/form-data, field: "image")
router.post('/uploadImage', Scada.upload.single('image'), Scada.uploadImage);

// Marker CRUD (JSON body)
router.post('/showData',   Scada.showData);
router.post('/liveValues', Scada.getLiveValues);
router.post('/chartData',  Scada.getChartData);
router.post('/tagsByDevices',    Scada.getTagsByDevices);
router.post('/combinedChartData', Scada.getCombinedChartData);
router.post('/add',        Scada.add);
router.post('/:id/delete', Scada.deleteMarker);

// Called by cronjob to broadcast live tag data to all connected SCADA browsers
router.post('/liveEmit', Scada.liveEmit);

module.exports = router;
