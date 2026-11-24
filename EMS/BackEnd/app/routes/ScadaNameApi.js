const router = require('express').Router();
const Scada = require('../controllers/ScadaController');
const validateToken = require('../config/validateToken');

// SCADA Tab Names
router.post('/add',         validateToken, Scada.createScadaName);
router.post('/showData',     validateToken, Scada.showScadaNames);
router.post('/:id/update',  Scada.updateScadaName);
router.post('/:tabIndex/deleteTab', validateToken, Scada.deleteTab);

module.exports = router;
