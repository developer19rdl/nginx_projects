
const MaintenanceAppr = require('../controllers/AmcModulesMaintenanceScheduleMaintenanceAppr');
const router = require('express').Router();
// Items
router.put('/approve/:id', MaintenanceAppr.update);
router.get('/show', MaintenanceAppr.show);
router.get('/showbyid/:id', MaintenanceAppr.showbyid);
router.get('/showpending', MaintenanceAppr.showpending);
router.post('/storeandupdate', MaintenanceAppr.storeandupdate);
// router.post('/storeData/', MaintenanceAppr.storeData);
// router.post('/storeDataType/', MaintenanceAppr.storeDataType);
router.get('/showreject', MaintenanceAppr.showreject);
router.get('/showcomp', MaintenanceAppr.showcomp);
// router.post('/update/:id', MaintenanceAppr.updateaprove);
module.exports = router;