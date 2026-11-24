const { pool } = require('../config/database');

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM quality_defect_catalog WHERE id = :id`, { id });
  return rows[0] || null;
}

async function findByCode(defectCode, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM quality_defect_catalog WHERE defect_code = :defectCode`, { defectCode });
  return rows[0] || null;
}

async function findAll({ activeOnly = true, category } = {}) {
  const conditions = [];
  const params = {};
  if (activeOnly) conditions.push('is_active = 1');
  if (category) {
    conditions.push('category = :category');
    params.category = category;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM quality_defect_catalog ${where} ORDER BY defect_code`, params);
  return rows;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO quality_defect_catalog (defect_code, defect_name, category, description, created_by)
     VALUES (:defectCode, :defectName, :category, :description, :createdBy)`,
    {
      defectCode: data.defectCode,
      defectName: data.defectName,
      category: data.category,
      description: data.description || null,
      createdBy: data.createdBy ?? null,
    }
  );
  return findById(result.insertId);
}

async function update(id, data, updatedBy) {
  await pool.query(
    `UPDATE quality_defect_catalog SET defect_name = :defectName, category = :category, description = :description,
       is_active = :isActive, updated_by = :updatedBy WHERE id = :id`,
    {
      id,
      defectName: data.defectName,
      category: data.category,
      description: data.description || null,
      isActive: data.isActive ?? 1,
      updatedBy: updatedBy ?? null,
    }
  );
  return findById(id);
}

/** Soft-delete: flips is_active off - quality_inspection_defects references catalog rows by id
 * and must stay valid forever for historical inspections. */
async function deactivate(id, updatedBy) {
  await pool.query(`UPDATE quality_defect_catalog SET is_active = 0, updated_by = :updatedBy WHERE id = :id`, {
    id,
    updatedBy: updatedBy ?? null,
  });
}

module.exports = { findById, findByCode, findAll, create, update, deactivate };
