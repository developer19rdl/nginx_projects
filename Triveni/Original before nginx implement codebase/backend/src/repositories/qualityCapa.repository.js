const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT qc.*, o.full_name AS owner_name, cb.full_name AS closed_by_name,
         qi.inspection_no, qi.item_code, qi.customer_name
  FROM quality_capa qc
  JOIN quality_inspections qi ON qi.id = qc.inspection_id
  LEFT JOIN users o ON o.id = qc.owner_id
  LEFT JOIN users cb ON cb.id = qc.closed_by
`;

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE qc.id = :id`, { id });
  return rows[0] || null;
}

async function findByInspectionId(inspectionId, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE qc.inspection_id = :inspectionId ORDER BY qc.id DESC LIMIT 1`, {
    inspectionId,
  });
  return rows[0] || null;
}

/** Tracker list - defaults to open/in-progress only, matching the "open CAPAs" view; pass
 * activeOnly:false to include closed ones too. */
async function findAll({ activeOnly = true } = {}) {
  const where = activeOnly ? "WHERE qc.status != 'CLOSED'" : '';
  const [rows] = await pool.query(`${BASE_SELECT} ${where} ORDER BY qc.due_date IS NULL, qc.due_date, qc.id DESC`);
  return rows;
}

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO quality_capa (inspection_id, corrective_action, preventive_action, owner_id, due_date, created_by)
     VALUES (:inspectionId, :correctiveAction, :preventiveAction, :ownerId, :dueDate, :createdBy)`,
    {
      inspectionId: data.inspectionId,
      correctiveAction: data.correctiveAction,
      preventiveAction: data.preventiveAction ?? null,
      ownerId: data.ownerId ?? null,
      dueDate: data.dueDate ?? null,
      createdBy: data.createdBy ?? null,
    }
  );
  return result.insertId;
}

async function update(id, data, updatedBy, connection = pool) {
  await connection.query(
    `UPDATE quality_capa SET corrective_action = :correctiveAction, preventive_action = :preventiveAction,
       owner_id = :ownerId, due_date = :dueDate, updated_by = :updatedBy WHERE id = :id`,
    {
      id,
      correctiveAction: data.correctiveAction,
      preventiveAction: data.preventiveAction ?? null,
      ownerId: data.ownerId ?? null,
      dueDate: data.dueDate ?? null,
      updatedBy: updatedBy ?? null,
    }
  );
}

async function close(id, closedBy) {
  await pool.query(
    `UPDATE quality_capa SET status = 'CLOSED', closed_at = NOW(), closed_by = :closedBy WHERE id = :id`,
    { id, closedBy: closedBy ?? null }
  );
}

module.exports = { findById, findByInspectionId, findAll, create, update, close };
