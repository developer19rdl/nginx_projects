const router = require('express').Router();
const Ctrl   = require('../controllers/ScadaTableController');

router.post('/save',       Ctrl.saveTable);
router.post('/showData',   Ctrl.showTables);
router.post('/:id/delete', Ctrl.deleteTable);

module.exports = router;
