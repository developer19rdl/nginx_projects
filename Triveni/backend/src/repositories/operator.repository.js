const { pool } = require('../config/database');

async function findAll() {
  const [rows] = await pool.query(`SELECT * FROM operators WHERE is_active = 1 ORDER BY full_name`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT * FROM operators WHERE id = :id`, { id });
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO operators (operator_code, full_name, skill_group) VALUES (:operatorCode, :fullName, :skillGroup)`,
    { operatorCode: data.operatorCode, fullName: data.fullName, skillGroup: data.skillGroup ?? null }
  );
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };
