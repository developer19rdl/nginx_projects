const { pool } = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.*, r.role_code, r.role_name
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email = :email`,
    { email }
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT u.id, u.employee_code, u.full_name, u.email, u.status, u.last_login_at,
            u.role_id, r.role_code, r.role_name, u.created_at
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = :id`,
    { id }
  );
  return rows[0] || null;
}

async function getPermissionCodesForRole(roleId) {
  const [rows] = await pool.query(
    `SELECT p.permission_code
     FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = :roleId`,
    { roleId }
  );
  return rows.map((r) => r.permission_code);
}

async function updateLastLogin(id) {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = :id`, { id });
}

async function findAll({ search, status, limit, offset }) {
  const conditions = [];
  const params = { limit, offset };
  if (search) {
    conditions.push('(u.full_name LIKE :search OR u.email LIKE :search)');
    params.search = `%${search}%`;
  }
  if (status) {
    conditions.push('u.status = :status');
    params.status = status;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.status, u.role_id, r.role_code, r.role_name,
            u.last_login_at, u.created_at
     FROM users u JOIN roles r ON r.id = u.role_id
     ${where}
     ORDER BY u.created_at DESC
     LIMIT :limit OFFSET :offset`,
    params
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
  return { rows, total };
}

async function update(id, { fullName, roleId }, updatedBy) {
  await pool.query(
    `UPDATE users SET full_name = :fullName, role_id = :roleId, updated_by = :updatedBy WHERE id = :id`,
    { id, fullName, roleId, updatedBy: updatedBy ?? null }
  );
  return findById(id);
}

async function updateStatus(id, status, updatedBy) {
  await pool.query(`UPDATE users SET status = :status, updated_by = :updatedBy WHERE id = :id`, {
    id,
    status,
    updatedBy: updatedBy ?? null,
  });
  return findById(id);
}

async function create({ fullName, email, passwordHash, roleId, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role_id, created_by, password_changed_at)
     VALUES (:fullName, :email, :passwordHash, :roleId, :createdBy, NOW())`,
    { fullName, email, passwordHash, roleId, createdBy: createdBy ?? null }
  );
  return findById(result.insertId);
}

async function createPasswordResetToken({ userId, tokenHash, expiresAt }, connection = pool) {
  await connection.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (:userId, :tokenHash, :expiresAt)`,
    { userId, tokenHash, expiresAt }
  );
}

/** The still-valid (unused, unexpired) token row matching this hash, joined to its user - null if
 * the hash doesn't match any row, or matches one that's already used/expired. */
async function findValidResetToken(tokenHash, connection = pool) {
  const [rows] = await connection.query(
    `SELECT t.id, t.user_id, t.expires_at, u.email, u.status
     FROM password_reset_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = :tokenHash AND t.used_at IS NULL AND t.expires_at > NOW()`,
    { tokenHash }
  );
  return rows[0] || null;
}

async function markResetTokenUsed(id, connection) {
  await connection.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = :id`, { id });
}

/** Invalidates every other outstanding reset token for this user (defense in depth - a user
 * resetting via one emailed link shouldn't leave a second, earlier link still redeemable). */
async function invalidateOtherResetTokens(userId, keepId, connection) {
  await connection.query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = :userId AND id != :keepId AND used_at IS NULL`,
    { userId, keepId }
  );
}

async function updatePassword(userId, passwordHash, connection) {
  await connection.query(
    `UPDATE users SET password_hash = :passwordHash, password_changed_at = NOW() WHERE id = :userId`,
    { userId, passwordHash }
  );
}

module.exports = {
  findByEmail,
  findById,
  getPermissionCodesForRole,
  updateLastLogin,
  findAll,
  create,
  update,
  updateStatus,
  createPasswordResetToken,
  findValidResetToken,
  markResetTokenUsed,
  invalidateOtherResetTokens,
  updatePassword,
};
