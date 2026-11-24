const { z } = require('zod');

// Uppercase letters/digits/underscores, matching the existing seeded codes (ADMIN, PLANNER, ...) -
// this is what shows up in req.user.roleCode and any future `requireRole(...)` checks, so keeping
// it a predictable machine-readable shape (not free text) matters more here than for role_name.
const ROLE_CODE_RE = /^[A-Z][A-Z0-9_]{1,49}$/;

const createRoleSchema = z.object({
  roleCode: z.string().regex(ROLE_CODE_RE, 'Role code must be uppercase letters, numbers and underscores only (e.g. QUALITY_LEAD)'),
  roleName: z.string().min(2, 'Role name is required'),
  description: z.string().max(255).optional(),
});

// role_code is immutable after creation (same convention as machine_code/employee_code elsewhere)
// - it's referenced by req.user.roleCode and any requireRole() checks, so renaming it out from
// under those would be a silent behavior change rather than a cosmetic one.
const updateRoleSchema = z.object({
  roleName: z.string().min(2, 'Role name is required'),
  description: z.string().max(255).optional(),
});

const roleActiveSchema = z.object({
  isActive: z.boolean(),
});

// Empty array is valid (strips every permission from the role) - a role with zero permissions is
// a legitimate, if not very useful, state; that's the admin's call to make, not this schema's.
const setRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string()),
});

module.exports = { createRoleSchema, updateRoleSchema, roleActiveSchema, setRolePermissionsSchema };
