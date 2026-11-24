const { pool } = require('../config/database');

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM checklist_templates WHERE id = :id`, { id });
  return rows[0] || null;
}

async function findByTitle(title, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM checklist_templates WHERE title = :title`, { title });
  return rows[0] || null;
}

/** List view - includes active question count and active assignment count so the web master
 * screen can show them without a separate round trip per row. */
async function findAll({ activeOnly = true } = {}) {
  const where = activeOnly ? 'WHERE ct.is_active = 1' : '';
  const [rows] = await pool.query(
    `SELECT ct.*,
       (SELECT COUNT(*) FROM checklist_template_questions q WHERE q.template_id = ct.id AND q.is_active = 1) AS question_count,
       (SELECT COUNT(*) FROM checklist_machine_assignments a WHERE a.template_id = ct.id AND a.is_active = 1) AS machine_count
     FROM checklist_templates ct ${where} ORDER BY ct.title`
  );
  return rows;
}

async function findQuestions(templateId, { activeOnly = true } = {}, connection = pool) {
  const where = activeOnly ? 'AND is_active = 1' : '';
  const [rows] = await connection.query(
    `SELECT * FROM checklist_template_questions WHERE template_id = :templateId ${where} ORDER BY display_order, id`,
    { templateId }
  );
  return rows.map((r) => ({ ...r, dropdown_options: r.dropdown_options ? JSON.parse(r.dropdown_options) : null }));
}

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO checklist_templates (title, department, frequency, created_by) VALUES (:title, :department, :frequency, :createdBy)`,
    { title: data.title, department: data.department ?? null, frequency: data.frequency, createdBy: data.createdBy ?? null }
  );
  return result.insertId;
}

async function update(id, data, updatedBy, connection) {
  await connection.query(
    `UPDATE checklist_templates SET title = :title, department = :department, frequency = :frequency,
       is_active = :isActive, updated_by = :updatedBy WHERE id = :id`,
    {
      id,
      title: data.title,
      department: data.department ?? null,
      frequency: data.frequency,
      isActive: data.isActive ?? 1,
      updatedBy: updatedBy ?? null,
    }
  );
}

/** Soft-delete: flips is_active off - assignments/submissions/history all stay intact. */
async function deactivate(id, updatedBy, connection = pool) {
  await connection.query(`UPDATE checklist_templates SET is_active = 0, updated_by = :updatedBy WHERE id = :id`, {
    id,
    updatedBy: updatedBy ?? null,
  });
}

/**
 * Replace-whole-set + soft-delete: questions in `questions` with an `id` are updated in place,
 * questions without an `id` are inserted, and any existing active question not present in
 * `questions` is soft-deactivated. This keeps checklist_submission_responses.question_id valid
 * forever - a question is never hard-deleted once it might have historical responses.
 */
async function replaceQuestions(templateId, questions, connection) {
  const [existingRows] = await connection.query(
    `SELECT id FROM checklist_template_questions WHERE template_id = :templateId AND is_active = 1`,
    { templateId }
  );
  const existingIds = new Set(existingRows.map((r) => r.id));
  const keptIds = new Set();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const dropdownOptions = q.responseType === 'DROPDOWN' && q.dropdownOptions ? JSON.stringify(q.dropdownOptions) : null;

    if (q.id && existingIds.has(q.id)) {
      await connection.query(
        `UPDATE checklist_template_questions SET question_text = :questionText, response_type = :responseType,
           dropdown_options = :dropdownOptions, is_mandatory = :isMandatory, display_order = :displayOrder
         WHERE id = :id`,
        {
          id: q.id,
          questionText: q.questionText,
          responseType: q.responseType,
          dropdownOptions,
          isMandatory: q.isMandatory ?? 1,
          displayOrder: i,
        }
      );
      keptIds.add(q.id);
    } else {
      await connection.query(
        `INSERT INTO checklist_template_questions (template_id, display_order, question_text, response_type, dropdown_options, is_mandatory)
         VALUES (:templateId, :displayOrder, :questionText, :responseType, :dropdownOptions, :isMandatory)`,
        {
          templateId,
          displayOrder: i,
          questionText: q.questionText,
          responseType: q.responseType,
          dropdownOptions,
          isMandatory: q.isMandatory ?? 1,
        }
      );
    }
  }

  const toDeactivate = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDeactivate.length) {
    await connection.query(`UPDATE checklist_template_questions SET is_active = 0 WHERE id IN (:ids)`, { ids: toDeactivate });
  }
}

module.exports = { findById, findByTitle, findAll, findQuestions, create, update, deactivate, replaceQuestions };
