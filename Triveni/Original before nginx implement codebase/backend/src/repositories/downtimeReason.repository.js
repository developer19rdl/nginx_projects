const { pool } = require('../config/database');

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM downtime_reasons WHERE id = :id`, { id });
  return rows[0] || null;
}

async function findByName(reasonName, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM downtime_reasons WHERE reason_name = :reasonName`, { reasonName });
  return rows[0] || null;
}

/** activeOnly defaults true - the operator app's Start Downtime dropdown should only ever offer
 * currently-active reasons; the master screen passes false to also show deactivated ones. */
async function findAll({ activeOnly = true } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM downtime_reasons ${where} ORDER BY reason_name`);
  return rows;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO downtime_reasons (reason_name, created_by) VALUES (:reasonName, :createdBy)`,
    { reasonName: data.reasonName, createdBy: data.createdBy ?? null }
  );
  return findById(result.insertId);
}

async function update(id, data, updatedBy) {
  await pool.query(
    `UPDATE downtime_reasons SET reason_name = :reasonName, is_active = :isActive, updated_by = :updatedBy WHERE id = :id`,
    { id, reasonName: data.reasonName, isActive: data.isActive ?? 1, updatedBy: updatedBy ?? null }
  );
  return findById(id);
}

/** Soft-delete: flips is_active off rather than a hard DELETE, since downtime_logs rows may
 * already reference this reason - it just disappears from the active dropdown going forward. */
async function deactivate(id, updatedBy) {
  await pool.query(`UPDATE downtime_reasons SET is_active = 0, updated_by = :updatedBy WHERE id = :id`, {
    id,
    updatedBy: updatedBy ?? null,
  });
}

module.exports = { findById, findByName, findAll, create, update, deactivate };
