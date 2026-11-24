const { pool } = require('../config/database');

async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM shifts ${where} ORDER BY start_time`);
  return rows;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM shifts WHERE id = :id`, { id });
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO shifts (shift_code, shift_name, start_time, end_time, crosses_midnight, break_duration_minutes, total_working_hours)
     VALUES (:shiftCode, :shiftName, :startTime, :endTime, :crossesMidnight, :breakDurationMinutes, :totalWorkingHours)`,
    data
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE shifts SET shift_name = :shiftName, start_time = :startTime, end_time = :endTime,
      crosses_midnight = :crossesMidnight, break_duration_minutes = :breakDurationMinutes,
      total_working_hours = :totalWorkingHours, is_active = :isActive
     WHERE id = :id`,
    { id, ...data }
  );
  return findById(id);
}

module.exports = { findAll, findById, create, update };
