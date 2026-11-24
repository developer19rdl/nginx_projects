const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await userService.list(req.query);
  success(res, { message: 'OK', data: rows, meta });
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body, req);
  success(res, { message: 'User created', data: user, statusCode: 201 });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.update(Number(req.params.id), req.body, req);
  success(res, { message: 'User updated', data: user });
});

const setStatus = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(Number(req.params.id), req.body.status, req);
  success(res, { message: 'User status updated', data: user });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await userService.resetPassword(Number(req.params.id), req);
  success(res, { message: 'Password reset link sent', data: result });
});

module.exports = { list, create, update, setStatus, resetPassword };
