const router = require('express').Router();
const Ctrl   = require('../controllers/ScadaHyperlinkController');

router.post('/save',       Ctrl.saveHyperlink);
router.post('/showData',   Ctrl.showHyperlinks);
router.post('/:id/delete', Ctrl.deleteHyperlink);

module.exports = router;
