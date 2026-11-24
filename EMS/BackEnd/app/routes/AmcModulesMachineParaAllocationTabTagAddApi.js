

const TagAdd = require('../controllers/AmcModulesMachineParaAllocationTabTagAdd');
const router = require('express').Router();

router.post('/', TagAdd.store);
router.get('/', TagAdd.show);

router.post('/Tagname', TagAdd.showTagName);
router.delete('/:id', TagAdd.delete);
router.put('/:id', TagAdd.update);

router.post('/excel', TagAdd.storeexceldata);



module.exports = router;