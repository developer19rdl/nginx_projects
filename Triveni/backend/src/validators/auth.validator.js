const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.number().int().positive(),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2),
  roleId: z.number().int().positive(),
});

const userStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive'], { errorMap: () => ({ message: 'Status must be Active or Inactive' }) }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  userStatusSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
