const ApiError = require('../utils/ApiError');

/**
 * Usage: router.post('/machines', authenticate, requirePermission(PERMISSIONS.MACHINE_MANAGE), handler)
 * req.user.permissions is an array of permission codes, re-fetched fresh from the role's current
 * permission set on every request by the `authenticate` middleware (see middleware/auth.js) - not
 * a stale snapshot from whenever the JWT was issued.
 */
function requirePermission(...permissionCodes) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    const userPermissions = req.user.permissions || [];
    const hasAny = permissionCodes.some((code) => userPermissions.includes(code));
    if (!hasAny) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

function requireRole(...roleCodes) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roleCodes.includes(req.user.roleCode)) {
      return next(ApiError.forbidden('Your role does not allow this action'));
    }
    next();
  };
}

module.exports = { requirePermission, requireRole };
