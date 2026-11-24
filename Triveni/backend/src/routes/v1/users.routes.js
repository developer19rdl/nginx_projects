const router = require('express').Router();
const controller = require('../../controllers/user.controller');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { createUserSchema, updateUserSchema, userStatusSchema } = require('../../validators/auth.validator');

router.use(authenticate, requirePermission(PERMISSIONS.USER_MANAGE));

router.get('/', controller.list);
router.post('/', validate(createUserSchema), controller.create);
router.put('/:id', validate(updateUserSchema), controller.update);
router.patch('/:id/status', validate(userStatusSchema), controller.setStatus);
router.post('/:id/reset-password', controller.resetPassword);

module.exports = router;
