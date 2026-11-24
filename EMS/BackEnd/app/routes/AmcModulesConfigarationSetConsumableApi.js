
const SetConsumable = require('../controllers/AmcModulesConfigarationSetConsumable');
const router = require('express').Router();

router.post('/', SetConsumable.store);
router.get('/', SetConsumable.show);
router.get('/showname', SetConsumable.showname);
router.delete('/:id', SetConsumable.delete);
router.put('/:id', SetConsumable.update);
router.post('/name/:id', SetConsumable.showConsubyid);




module.exports = router;