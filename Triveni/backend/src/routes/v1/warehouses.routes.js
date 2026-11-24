const router = require('express').Router();
const controller = require('../../controllers/warehouse.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { warehouseSchema, locationSchema, activeSchema } = require('../../validators/warehouse.validator');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.list);
router.post('/', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(warehouseSchema), controller.create);
router.patch('/:id/active', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(activeSchema), controller.setActive);

router.get('/locations', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.listAllLocations);
router.get('/:id/locations', requirePermission(PERMISSIONS.INVENTORY_VIEW), controller.listLocations);
router.post('/:id/locations', requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(locationSchema), controller.createLocation);
router.patch(
  '/locations/:locationId/active',
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  validate(activeSchema),
  controller.setLocationActive
);

module.exports = router;
