
const Department = require('./controllers/Asset/Department');
const router = require('express').Router();
// Items

router.post('/', Department.store);
router.get('/', Department.show);
router.delete('/:id', Department.delete);
router.put('/:id', Department.update);
router.get('/search', Department.searchByDepartment);

module.exports = router;