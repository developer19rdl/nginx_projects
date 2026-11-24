const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const roleService = require('../services/role.service');

const listActive = asyncHandler(async (req, res) => {
  const roles = await roleService.listActive();
  success(res, { message: 'OK', data: roles });
});

const list = asyncHandler(async (req, res) => {
  const roles = await roleService.list();
  success(res, { message: 'OK', data: roles });
});

const listPermissionCatalog = asyncHandler(async (req, res) => {
  const permissions = await roleService.listPermissionCatalog();
  success(res, { message: 'OK', data: permissions });
});

const get = asyncHandler(async (req, res) => {
  const role = await roleService.get(Number(req.params.id));
  success(res, { message: 'OK', data: role });
});

const create = asyncHandler(async (req, res) => {
  const role = await roleService.create(req.body, req);
  success(res, { message: 'Role created', data: role, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const role = await roleService.update(Number(req.params.id), req.body, req);
  success(res, { message: 'Role updated', data: role });
});

const setActive = asyncHandler(async (req, res) => {
  const role = await roleService.setActive(Number(req.params.id), req.body.isActive, req);
  success(res, { message: 'Role status updated', data: role });
});

const setPermissions = asyncHandler(async (req, res) => {
  const role = await roleService.setPermissions(Number(req.params.id), req.body.permissionCodes, req);
  success(res, { message: 'Role permissions updated', data: role });
});

module.exports = { listActive, list, listPermissionCatalog, get, create, update, setActive, setPermissions };
