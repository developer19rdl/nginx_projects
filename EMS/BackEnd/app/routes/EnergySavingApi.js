const ctrl = require('../controllers/EnergySavingController');
const router = require('express').Router();

// Energy Waste Detection CRUD
router.get('/waste', ctrl.wasteShow);
router.post('/waste', ctrl.wasteStore);
router.put('/waste/:id', ctrl.wasteUpdate);
router.delete('/waste/:id', ctrl.wasteDelete);

// Corrective Action Recommendations CRUD
router.get('/corrective', ctrl.corrShow);
router.post('/corrective', ctrl.corrStore);
router.put('/corrective/:id', ctrl.corrUpdate);
router.delete('/corrective/:id', ctrl.corrDelete);

module.exports = router;
