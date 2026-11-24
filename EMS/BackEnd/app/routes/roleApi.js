const role = require('../controllers/RoleController.js');
const router = require('express').Router();

router.get('/', role.show);
router.post('/', role.store);
router.put('/:id', role.update);
router.delete('/:id', role.delete);

module.exports = router;
