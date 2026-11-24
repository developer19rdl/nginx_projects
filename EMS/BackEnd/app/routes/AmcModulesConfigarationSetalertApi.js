
const Setalert = require('../controllers/AmcModulesConfigarationSetalert');
const router = require('express').Router();

router.post('/', Setalert.store);
router.get('/', Setalert.show);
router.get('/sensorname', Setalert.showsensor);

router.delete('/:id', Setalert.delete);
router.put('/:id', Setalert.update);


module.exports = router;