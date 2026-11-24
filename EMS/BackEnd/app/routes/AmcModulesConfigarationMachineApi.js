
const Machine = require('../controllers/AmcModulesConfigarationMachine');
const router = require('express').Router();

router.post('/', Machine.store);
router.get('/', Machine.show);

router.post('/machine/:id', Machine.showmachine);
router.get('/showmachinename', Machine.showmachinename);

router.delete('/:id', Machine.delete);
router.put('/:id', Machine.update);


module.exports = router;