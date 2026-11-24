const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const userRepository = require('../repositories/user.repository');

/**
 * Verifies the Bearer JWT and attaches { id, email, roleId, roleCode, permissions } to req.user.
 *
 * Also re-checks the user's *current* status AND re-fetches their role's *current* permission set
 * from the database on every request, rather than trusting whatever was baked into the JWT at
 * login/refresh time. The JWT alone only proves "this person authenticated successfully at some
 * point in the last 8h" (env.jwt.expiresIn) with whatever permissions their role happened to carry
 * back then - not "this account is still active, still has this role, and that role still grants
 * these permissions right now". Without this:
 *  - Deactivating a user (User Management > Deactivate) wouldn't affect a session that was already
 *    logged in - their access token would keep working right up to its natural expiry.
 *  - Editing a role's permissions (Roles & Permissions) wouldn't take effect for anyone already
 *    logged in under that role until their token naturally expired and they re-authenticated.
 * Both would defeat the point of "automatically reflected" access control. login()/refresh() in
 * auth.service.js are the only other places that read status/permissions fresh, and neither runs
 * again until the access token expires - this closes that gap for every request in between. Two
 * extra indexed lookups per request is a fine trade at this app's scale for that guarantee.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or invalid Authorization header');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await userRepository.findById(payload.id);
  if (!user || user.status !== 'Active') {
    throw ApiError.unauthorized('This account is no longer active. Please contact your administrator.');
  }

  // Live permissions for whatever role this user currently holds - not the (possibly stale, if
  // the role was reassigned or its permission set edited since this token was issued) list baked
  // into the JWT payload itself.
  const permissions = await userRepository.getPermissionCodesForRole(user.role_id);
  req.user = { ...payload, roleId: user.role_id, roleCode: user.role_code, permissions };
  next();
});

module.exports = { authenticate };
