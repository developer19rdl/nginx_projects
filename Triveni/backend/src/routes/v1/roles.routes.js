const router = require('express').Router();
const controller = require('../../controllers/role.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { createRoleSchema, updateRoleSchema, roleActiveSchema, setRolePermissionsSchema } = require('../../validators/role.validator');

router.use(authenticate);

// The plain active-role list backs the "Role" dropdown on User creation/edit - anyone who can
// manage users needs this even if they can't manage roles/permissions themselves, so it accepts
// either permission rather than requiring ROLE_MANAGE like everything else below.
router.get('/', requirePermission(PERMISSIONS.USER_MANAGE, PERMISSIONS.ROLE_MANAGE), controller.listActive);

router.use(requirePermission(PERMISSIONS.ROLE_MANAGE));

// Registered before '/:id' - Express matches routes in order, and '/:id' would otherwise swallow
// these literal paths as if "permissions-catalog"/"manage" were an id.
router.get('/permissions-catalog', controller.listPermissionCatalog);
router.get('/manage', controller.list);

router.get('/:id', controller.get);
router.post('/', validate(createRoleSchema), controller.create);
router.put('/:id', validate(updateRoleSchema), controller.update);
router.patch('/:id/active', validate(roleActiveSchema), controller.setActive);
router.put('/:id/permissions', validate(setRolePermissionsSchema), controller.setPermissions);

module.exports = router;
