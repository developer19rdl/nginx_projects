
const Department = require('../controllers/AmcModulesDepartmentsDepartment');
const router = require('express').Router();

router.post('/', Department.store);
router.get('/', Department.show);
router.delete('/:id', Department.delete);
router.put('/:id', Department.update);


module.exports = router;