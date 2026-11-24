const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { parsePagination, buildMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
// Required lazily inside resetPassword (not at module load) to avoid a require cycle -
// auth.service.js doesn't import user.service.js, but keeping the require local here makes that
// non-dependency explicit rather than relying on Node's module cache to paper over it.

async function list(query) {
  const { page, pageSize, limit, offset } = parsePagination(query);
  const { rows, total } = await userRepository.findAll({ search: query.search, status: query.status, limit, offset });
  return { rows, meta: buildMeta({ page, pageSize, total }) };
}

async function create(data, req) {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) throw ApiError.conflict(`A user with email "${data.email}" already exists`);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await userRepository.create({
    fullName: data.fullName,
    email: data.email,
    passwordHash,
    roleId: data.roleId,
    createdBy: req.user.id,
  });
  await auditService.fromRequest(req, { action: 'CREATE', module: 'user', recordId: user.id, newValue: { email: user.email } });
  return user;
}

async function update(id, data, req) {
  const existing = await userRepository.findById(id);
  if (!existing) throw ApiError.notFound('User not found');
  const updated = await userRepository.update(id, { fullName: data.fullName, roleId: data.roleId }, req.user.id);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'user',
    recordId: id,
    oldValue: { fullName: existing.full_name, roleId: existing.role_id },
    newValue: { fullName: updated.full_name, roleId: updated.role_id },
  });
  return updated;
}

async function setStatus(id, status, req) {
  const existing = await userRepository.findById(id);
  if (!existing) throw ApiError.notFound('User not found');
  if (id === req.user.id && status !== 'Active') {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }
  const updated = await userRepository.updateStatus(id, status, req.user.id);
  await auditService.fromRequest(req, {
    action: 'STATUS_CHANGE',
    module: 'user',
    recordId: id,
    oldValue: { status: existing.status },
    newValue: { status },
  });
  return updated;
}

/** Admin-triggered "send this user a password reset link" - reuses the exact same token/email
 * flow a user gets from Forgot Password on the login screen (30-min single-use link), rather than
 * inventing a second reset mechanism. Requires auth.service lazily to sidestep a require cycle. */
async function resetPassword(id, req) {
  const existing = await userRepository.findById(id);
  if (!existing) throw ApiError.notFound('User not found');
  const authService = require('./auth.service');
  return authService.forgotPassword(existing.email, req);
}

module.exports = { list, create, update, setStatus, resetPassword };
