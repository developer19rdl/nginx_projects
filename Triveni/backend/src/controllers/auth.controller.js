const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req.ip);
  success(res, { message: 'Login successful', data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  success(res, { message: 'Token refreshed', data: result });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  success(res, { message: 'OK', data: user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email, req);
  success(res, { message: result.message, data: result });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.newPassword, req);
  success(res, { message: result.message, data: result });
});

module.exports = { login, refresh, me, forgotPassword, resetPassword };
