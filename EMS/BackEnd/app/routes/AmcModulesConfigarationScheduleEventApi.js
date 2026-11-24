
const ScheduleEvent = require('../controllers/AmcModulesConfigarationScheduleEvent');
const router = require('express').Router();

router.post('/', ScheduleEvent.store);
router.get('/', ScheduleEvent.show);
router.delete('/:id', ScheduleEvent.delete);
router.put('/:id', ScheduleEvent.update);


module.exports = router;