const router = require('express').Router();
const authController = require('../../controllers/auth.controller');
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../validators/auth.validator');

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.me);

module.exports = router;
