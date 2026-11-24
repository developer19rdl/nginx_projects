const roleRepository = require('../repositories/role.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');
const { ROLES } = require('../config/constants');

async function list() {
  return roleRepository.findAll();
}

async function listActive() {
  return roleRepository.findActive();
}

async function listPermissionCatalog() {
  return roleRepository.listPermissionCatalog();
}

async function get(id) {
  const role = await roleRepository.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  const permissionCodes = await roleRepository.getPermissionCodesForRole(id);
  return { ...role, permissionCodes };
}

async function create(data, req) {
  const existing = await roleRepository.findByCode(data.roleCode);
  if (existing) throw ApiError.conflict(`A role with code "${data.roleCode}" already exists`);
  const role = await roleRepository.create(data);
  await auditService.fromRequest(req, {
    action: 'CREATE',
    module: 'role',
    recordId: role.id,
    newValue: { roleCode: role.role_code, roleName: role.role_name },
  });
  return role;
}

async function update(id, data, req) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw ApiError.notFound('Role not found');
  const updated = await roleRepository.update(id, data);
  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'role',
    recordId: id,
    oldValue: { roleName: existing.role_name, description: existing.description },
    newValue: { roleName: updated.role_name, description: updated.description },
  });
  return updated;
}

async function setActive(id, isActive, req) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw ApiError.notFound('Role not found');
  // The Administrator role is this app's bootstrap role - deactivating it could lock every admin
  // out of user/role management with no UI path back in (only direct DB access would recover it).
  // Same class of guard as "you cannot deactivate your own account" in user.service.js, just for
  // the role that everyone's own-account guard ultimately depends on.
  if (!isActive && existing.role_code === ROLES.ADMIN) {
    throw ApiError.badRequest('The Administrator role cannot be deactivated.');
  }
  const updated = await roleRepository.setActive(id, isActive);
  await auditService.fromRequest(req, {
    action: 'STATUS_CHANGE',
    module: 'role',
    recordId: id,
    oldValue: { isActive: !!existing.is_active },
    newValue: { isActive },
  });
  return updated;
}

async function setPermissions(id, permissionCodes, req) {
  const existing = await roleRepository.findById(id);
  if (!existing) throw ApiError.notFound('Role not found');
  // Same reasoning as the deactivation guard above - the Administrator role always has every
  // permission in the catalog (see seed.js), and editing that set here is how someone would
  // accidentally strip role.manage/user.manage from every admin account at once with no way back.
  if (existing.role_code === ROLES.ADMIN) {
    throw ApiError.badRequest("The Administrator role's permissions cannot be changed - it always has full access.");
  }

  const catalog = await roleRepository.listPermissionCatalog();
  const codeToId = new Map(catalog.map((p) => [p.permission_code, p.id]));
  const unknown = permissionCodes.filter((code) => !codeToId.has(code));
  if (unknown.length) throw ApiError.badRequest(`Unknown permission code(s): ${unknown.join(', ')}`);

  const permissionIds = [...new Set(permissionCodes)].map((code) => codeToId.get(code));
  const before = await roleRepository.getPermissionCodesForRole(id);
  const after = await roleRepository.replacePermissions(id, permissionIds);
  await auditService.fromRequest(req, {
    action: 'PERMISSIONS_CHANGE',
    module: 'role',
    recordId: id,
    oldValue: { permissions: before },
    newValue: { permissions: after },
  });
  return { ...existing, permissionCodes: after };
}

module.exports = { list, listActive, listPermissionCatalog, get, create, update, setActive, setPermissions };
