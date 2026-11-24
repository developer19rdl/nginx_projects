const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT dtl.*, dtr.reason_name, m.machine_code, m.machine_name,
         su.full_name AS started_by_name, eu.full_name AS ended_by_name
  FROM downtime_logs dtl
  JOIN downtime_reasons dtr ON dtr.id = dtl.reason_id
  JOIN machines m ON m.id = dtl.machine_id
  LEFT JOIN users su ON su.id = dtl.started_by
  LEFT JOIN users eu ON eu.id = dtl.ended_by
`;

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE dtl.id = :id`, { id });
  return rows[0] || null;
}

/** The currently-running downtime for a machine (ended_at IS NULL), or null if the machine isn't
 * currently down. */
async function findActiveByMachine(machineId, connection = pool) {
  const [rows] = await connection.query(
    `${BASE_SELECT} WHERE dtl.machine_id = :machineId AND dtl.ended_at IS NULL ORDER BY dtl.id DESC LIMIT 1`,
    { machineId }
  );
  return rows[0] || null;
}

async function create({ machineId, reasonId, startedAt, startedBy }, connection = pool) {
  const [result] = await connection.query(
    `INSERT INTO downtime_logs (machine_id, reason_id, started_at, started_by) VALUES (:machineId, :reasonId, :startedAt, :startedBy)`,
    { machineId, reasonId, startedAt, startedBy: startedBy ?? null }
  );
  return findById(result.insertId, connection);
}

async function end(id, { endedAt, endedBy }, connection = pool) {
  await connection.query(`UPDATE downtime_logs SET ended_at = :endedAt, ended_by = :endedBy WHERE id = :id`, {
    id,
    endedAt,
    endedBy: endedBy ?? null,
  });
  return findById(id, connection);
}

/** Downtime events that started within [windowStart, windowEnd) for a machine - used by the
 * Operator Log's Shift Activity Summary, where the caller has already turned a Date + Shift into
 * a concrete datetime window (shifts don't get their own machine_planning-style shift_id/
 * schedule_date columns on downtime_logs, so this is a time-range filter instead of a direct one). */
async function findByMachineWindow(machineId, windowStart, windowEnd) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE dtl.machine_id = :machineId AND dtl.started_at >= :windowStart AND dtl.started_at < :windowEnd
     ORDER BY dtl.started_at`,
    { machineId, windowStart, windowEnd }
  );
  return rows;
}

module.exports = { findById, findActiveByMachine, create, end, findByMachineWindow };
