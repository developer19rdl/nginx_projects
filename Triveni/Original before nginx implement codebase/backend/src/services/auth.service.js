const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { withTransaction } = require('../config/database');
const userRepository = require('../repositories/user.repository');
const auditService = require('./audit.service');
const mailerService = require('./mailer.service');
const logger = require('../utils/logger');

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function signAccessToken(user, permissions) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleCode: user.role_code,
      permissions,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id, type: 'refresh' }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

async function login({ email, password }, ip) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (user.status !== 'Active') throw ApiError.forbidden('This account is not active');

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw ApiError.unauthorized('Invalid email or password');

  const permissions = await userRepository.getPermissionCodesForRole(user.role_id);
  const accessToken = signAccessToken(user, permissions);
  const refreshToken = signRefreshToken(user);

  await userRepository.updateLastLogin(user.id);
  await auditService.record({ userId: user.id, action: 'LOGIN', module: 'auth', recordId: user.id, ipAddress: ip });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      roleCode: user.role_code,
      roleName: user.role_name,
      permissions,
    },
  };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
  const user = await userRepository.findByEmail((await userRepository.findById(payload.id))?.email);
  if (!user || user.status !== 'Active') throw ApiError.unauthorized('Account not available');
  // A password reset (or any future password change) must retroactively invalidate every
  // refresh token issued before it - otherwise a session started before the reset could just
  // keep minting fresh access tokens forever, defeating the point of resetting the password.
  // `<=` (not `<`): a JWT's `iat` only has 1-second resolution, so a token issued in the very
  // same wall-clock second as the change is treated as stale too - the safe side of that tie.
  if (user.password_changed_at && payload.iat * 1000 <= new Date(user.password_changed_at).getTime()) {
    throw ApiError.unauthorized('Your password was changed - please sign in again');
  }
  const permissions = await userRepository.getPermissionCodesForRole(user.role_id);
  const accessToken = signAccessToken(user, permissions);
  // Returning the refreshed user alongside the token - not just the token - lets the frontend
  // update its own cached permissions/role on every silent refresh (see axiosClient.js), instead
  // of only the backend's per-request check (middleware/auth.js) knowing a role/permission change
  // happened until the next full login. Same fields login() returns, so both call sites can share
  // one "apply this user to the session" path client-side.
  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      roleCode: user.role_code,
      roleName: user.role_name,
      permissions,
    },
  };
}

async function me(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const permissions = await userRepository.getPermissionCodesForRole(user.role_id);
  return { ...user, permissions };
}

/**
 * Always resolves with the same generic message regardless of whether the email matched a real,
 * active account - so this endpoint can't be used to enumerate registered emails. The real work
 * (token issuance + email) only happens when it does match.
 *
 * In non-production, the raw reset link is also returned in the response - there's no guarantee
 * SMTP is configured in a dev environment, and a console-logged link (see mailer.service.js) is
 * still awkward to click from a browser, so handing it back directly is the practical dev-mode
 * equivalent of "check your inbox." Production never leaks it outside the actual email.
 */
async function forgotPassword(email, req) {
  const genericResult = { message: 'If an account exists for that email, a password reset link has been sent.' };

  const user = await userRepository.findByEmail(email);
  if (!user || user.status !== 'Active') return genericResult;

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await userRepository.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt });
  await auditService.fromRequest(req, { action: 'FORGOT_PASSWORD_REQUEST', module: 'auth', recordId: user.id });

  const resetLink = `${env.frontendUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
  const { sent } = await mailerService.sendMail({
    to: user.email,
    subject: 'Reset your Triveni Steel ERP password',
    text: `A password reset was requested for your account. This link expires in 30 minutes and can only be used once:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
  });
  if (!sent) logger.info('Password reset link (not emailed - see mailer.service.js)', { email: user.email, resetLink });

  return env.nodeEnv === 'production' ? genericResult : { ...genericResult, resetLink };
}

async function resetPassword(token, newPassword, req) {
  const tokenHash = hashToken(token);
  const tokenRow = await userRepository.findValidResetToken(tokenHash);
  if (!tokenRow || tokenRow.status !== 'Active') {
    throw ApiError.badRequest('This reset link is invalid or has expired. Please request a new one.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await withTransaction(async (connection) => {
    await userRepository.updatePassword(tokenRow.user_id, passwordHash, connection);
    await userRepository.markResetTokenUsed(tokenRow.id, connection);
    await userRepository.invalidateOtherResetTokens(tokenRow.user_id, tokenRow.id, connection);
  });

  await auditService.fromRequest(req, { action: 'PASSWORD_RESET', module: 'auth', recordId: tokenRow.user_id });
  return { message: 'Your password has been reset. Please sign in with your new password.' };
}

module.exports = { login, refresh, me, forgotPassword, resetPassword };
