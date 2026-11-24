const router = require('express').Router();
const controller = require('../../controllers/coilLookup.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { PERMISSIONS } = require('../../config/constants');

router.use(authenticate);

router.get('/:coilNo', requirePermission(PERMISSIONS.PLANNING_PRODUCE), controller.lookup);

module.exports = router;
