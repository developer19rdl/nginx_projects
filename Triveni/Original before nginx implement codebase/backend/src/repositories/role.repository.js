const { pool, withTransaction } = require('../config/database');

/** Full admin-management list: every role (active and inactive), with how many permissions and
 * users are attached to each - so the Roles & Permissions screen can show that context without a
 * second round trip per row. */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT r.id, r.role_code, r.role_name, r.description, r.is_active, r.created_at, r.updated_at,
            (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
     FROM roles r
     ORDER BY r.role_name`
  );
  return rows;
}

/** The lightweight list the "Role" dropdown on User creation/edit has always used - active roles
 * only, no extra fields. Kept separate from findAll() so that view doesn't change shape/behavior
 * just because the admin-only management screen needs richer data. */
async function findActive() {
  const [rows] = await pool.query(`SELECT id, role_code, role_name FROM roles WHERE is_active = 1 ORDER BY role_name`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.id, r.role_code, r.role_name, r.description, r.is_active, r.created_at, r.updated_at,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
     FROM roles r
     WHERE r.id = :id`,
    { id }
  );
  return rows[0] || null;
}

async function findByCode(roleCode) {
  const [rows] = await pool.query(`SELECT id FROM roles WHERE role_code = :roleCode`, { roleCode });
  return rows[0] || null;
}

async function getPermissionCodesForRole(roleId) {
  const [rows] = await pool.query(
    `SELECT p.permission_code
     FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = :roleId
     ORDER BY p.permission_code`,
    { roleId }
  );
  return rows.map((r) => r.permission_code);
}

/** The full, fixed permission catalog (every permission code an actual `requirePermission(...)`
 * check somewhere in the codebase can grant) - grouped by module for the checkbox grid. This is
 * NOT user-extensible: a permission_code with no matching `requirePermission()` call anywhere
 * would just be inert, so roles only ever pick from this existing set rather than inventing new
 * codes through the UI. */
async function listPermissionCatalog() {
  const [rows] = await pool.query(`SELECT id, permission_code, module, description FROM permissions ORDER BY module, permission_code`);
  return rows;
}

async function create({ roleCode, roleName, description }) {
  const [result] = await pool.query(
    `INSERT INTO roles (role_code, role_name, description) VALUES (:roleCode, :roleName, :description)`,
    { roleCode, roleName, description: description || null }
  );
  return findById(result.insertId);
}

async function update(id, { roleName, description }) {
  await pool.query(`UPDATE roles SET role_name = :roleName, description = :description WHERE id = :id`, {
    id,
    roleName,
    description: description || null,
  });
  return findById(id);
}

async function setActive(id, isActive) {
  await pool.query(`UPDATE roles SET is_active = :isActive WHERE id = :id`, { id, isActive: isActive ? 1 : 0 });
  return findById(id);
}

/** Replaces a role's entire permission set in one transaction - the correct semantics for a
 * checkbox-grid "here's exactly what should be checked now" UI (diffing individual add/remove
 * calls would just be reimplementing this, less atomically). Looped single-row inserts rather than
 * one bulk-VALUES statement, matching the rest of this codebase's query style (see seed.js) rather
 * than mixing in mysql2's separate positional-placeholder bulk-insert syntax alongside the named-
 * placeholder style (`namedPlaceholders: true`) every other query here uses. Permission sets per
 * role are small (well under 100 rows), so the loop's cost is negligible. */
async function replacePermissions(roleId, permissionIds) {
  await withTransaction(async (connection) => {
    await connection.query(`DELETE FROM role_permissions WHERE role_id = :roleId`, { roleId });
    for (const permissionId of permissionIds) {
      await connection.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES (:roleId, :permissionId)`, {
        roleId,
        permissionId,
      });
    }
  });
  return getPermissionCodesForRole(roleId);
}

module.exports = {
  findAll,
  findActive,
  findById,
  findByCode,
  getPermissionCodesForRole,
  listPermissionCatalog,
  create,
  update,
  setActive,
  replacePermissions,
};
