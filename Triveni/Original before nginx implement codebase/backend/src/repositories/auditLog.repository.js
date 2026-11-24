const { pool } = require('../config/database');

async function create(entry, connection = pool) {
  await connection.query(
    `INSERT INTO audit_logs (user_id, action, module, record_id, old_value, new_value, remarks, ip_address)
     VALUES (:userId, :action, :module, :recordId, :oldValue, :newValue, :remarks, :ipAddress)`,
    {
      userId: entry.userId ?? null,
      action: entry.action,
      module: entry.module,
      recordId: entry.recordId != null ? String(entry.recordId) : null,
      oldValue: entry.oldValue !== undefined ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue !== undefined ? JSON.stringify(entry.newValue) : null,
      remarks: entry.remarks ?? null,
      ipAddress: entry.ipAddress ?? null,
    }
  );
}

async function findAll({ module, userId, from, to, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = {};
  if (module) {
    conditions.push('module = :module');
    params.module = module;
  }
  if (userId) {
    conditions.push('user_id = :userId');
    params.userId = userId;
  }
  if (from) {
    conditions.push('created_at >= :from');
    params.from = from;
  }
  if (to) {
    conditions.push('created_at <= :to');
    params.to = to;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT al.*, u.full_name AS user_name
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM audit_logs al ${where}`, params);
  return { rows, total };
}

/** Every produced_qty change recorded for a set of machine_planning rows within a datetime range,
 * oldest first - reconstructs an hourly production trend from real recorded events instead of a
 * dedicated (and nonexistent) production-history table. updateProducedQty() in
 * poAssignment.service.js writes one of these on every operator entry. */
async function findProducedQtyTrail(recordIds, from, to) {
  if (!recordIds.length) return [];
  const [rows] = await pool.query(
    `SELECT record_id, old_value, new_value, created_at
     FROM audit_logs
     WHERE module = 'machine_planning' AND action = 'UPDATE'
       AND record_id IN (:recordIds) AND created_at >= :from AND created_at < :to
     ORDER BY created_at ASC`,
    { recordIds: recordIds.map(String), from, to }
  );
  return rows;
}

module.exports = { create, findAll, findProducedQtyTrail };
