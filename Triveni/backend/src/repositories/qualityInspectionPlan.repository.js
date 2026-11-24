const { pool } = require('../config/database');

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM quality_inspection_plans WHERE id = :id`, { id });
  return rows[0] || null;
}

/** Plan lookup for starting an inspection: the most specific match for an item_code, else the
 * generic (item_code IS NULL) plan for that inspection type, else null (ad-hoc inspection, no
 * plan-backed parameters). */
async function findMatchingPlan(itemCode, inspectionType, connection = pool) {
  const [specific] = await connection.query(
    `SELECT * FROM quality_inspection_plans
     WHERE item_code = :itemCode AND inspection_type = :inspectionType AND is_active = 1
     ORDER BY id DESC LIMIT 1`,
    { itemCode, inspectionType }
  );
  if (specific[0]) return specific[0];

  const [generic] = await connection.query(
    `SELECT * FROM quality_inspection_plans
     WHERE item_code IS NULL AND inspection_type = :inspectionType AND is_active = 1
     ORDER BY id DESC LIMIT 1`,
    { inspectionType }
  );
  return generic[0] || null;
}

/** List view - includes active parameter count so the master screen can show it without a
 * separate round trip per row (mirrors checklistTemplate.repository.js's findAll). */
async function findAll({ activeOnly = true } = {}) {
  const where = activeOnly ? 'WHERE qip.is_active = 1' : '';
  const [rows] = await pool.query(
    `SELECT qip.*,
       (SELECT COUNT(*) FROM quality_inspection_plan_parameters p WHERE p.plan_id = qip.id AND p.is_active = 1) AS parameter_count
     FROM quality_inspection_plans qip ${where} ORDER BY qip.plan_name`
  );
  return rows;
}

async function findParameters(planId, { activeOnly = true } = {}, connection = pool) {
  const where = activeOnly ? 'AND is_active = 1' : '';
  const [rows] = await connection.query(
    `SELECT * FROM quality_inspection_plan_parameters WHERE plan_id = :planId ${where} ORDER BY display_order, id`,
    { planId }
  );
  return rows;
}

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO quality_inspection_plans (item_code, plan_name, inspection_type, sample_size, created_by)
     VALUES (:itemCode, :planName, :inspectionType, :sampleSize, :createdBy)`,
    {
      itemCode: data.itemCode || null,
      planName: data.planName,
      inspectionType: data.inspectionType,
      sampleSize: data.sampleSize ?? 1,
      createdBy: data.createdBy ?? null,
    }
  );
  return result.insertId;
}

async function update(id, data, updatedBy, connection) {
  await connection.query(
    `UPDATE quality_inspection_plans SET item_code = :itemCode, plan_name = :planName, inspection_type = :inspectionType,
       sample_size = :sampleSize, is_active = :isActive, updated_by = :updatedBy WHERE id = :id`,
    {
      id,
      itemCode: data.itemCode || null,
      planName: data.planName,
      inspectionType: data.inspectionType,
      sampleSize: data.sampleSize ?? 1,
      isActive: data.isActive ?? 1,
      updatedBy: updatedBy ?? null,
    }
  );
}

/** Soft-delete: flips is_active off - inspections that already matched this plan keep their own
 * denormalized snapshot, so nothing downstream breaks. */
async function deactivate(id, updatedBy, connection = pool) {
  await connection.query(`UPDATE quality_inspection_plans SET is_active = 0, updated_by = :updatedBy WHERE id = :id`, {
    id,
    updatedBy: updatedBy ?? null,
  });
}

/**
 * Replace-whole-set + soft-delete, identical pattern to checklistTemplate.repository.js's
 * replaceQuestions: parameters with an id are updated in place, new ones inserted, and any
 * existing active parameter missing from the payload is soft-deactivated (never hard-deleted -
 * quality_inspection_parameter_results references these by id).
 */
async function replaceParameters(planId, parameters, connection) {
  const [existingRows] = await connection.query(
    `SELECT id FROM quality_inspection_plan_parameters WHERE plan_id = :planId AND is_active = 1`,
    { planId }
  );
  const existingIds = new Set(existingRows.map((r) => r.id));
  const keptIds = new Set();

  for (let i = 0; i < parameters.length; i++) {
    const p = parameters[i];
    if (p.id && existingIds.has(p.id)) {
      await connection.query(
        `UPDATE quality_inspection_plan_parameters SET parameter_name = :parameterName, parameter_category = :parameterCategory,
           specification = :specification, tolerance = :tolerance, unit_of_measure = :unitOfMeasure,
           is_mandatory = :isMandatory, display_order = :displayOrder
         WHERE id = :id`,
        {
          id: p.id,
          parameterName: p.parameterName,
          parameterCategory: p.parameterCategory,
          specification: p.specification || null,
          tolerance: p.tolerance || null,
          unitOfMeasure: p.unitOfMeasure || null,
          isMandatory: p.isMandatory ?? 1,
          displayOrder: i,
        }
      );
      keptIds.add(p.id);
    } else {
      await connection.query(
        `INSERT INTO quality_inspection_plan_parameters
           (plan_id, display_order, parameter_name, parameter_category, specification, tolerance, unit_of_measure, is_mandatory)
         VALUES (:planId, :displayOrder, :parameterName, :parameterCategory, :specification, :tolerance, :unitOfMeasure, :isMandatory)`,
        {
          planId,
          displayOrder: i,
          parameterName: p.parameterName,
          parameterCategory: p.parameterCategory,
          specification: p.specification || null,
          tolerance: p.tolerance || null,
          unitOfMeasure: p.unitOfMeasure || null,
          isMandatory: p.isMandatory ?? 1,
        }
      );
    }
  }

  const toDeactivate = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDeactivate.length) {
    await connection.query(`UPDATE quality_inspection_plan_parameters SET is_active = 0 WHERE id IN (:ids)`, { ids: toDeactivate });
  }
}

module.exports = {
  findById,
  findMatchingPlan,
  findAll,
  findParameters,
  create,
  update,
  deactivate,
  replaceParameters,
};
