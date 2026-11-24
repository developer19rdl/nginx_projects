const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT cs.*, ct.title AS template_title, ct.department, ct.frequency, m.machine_code, m.machine_name,
         u.full_name AS inspector_name
  FROM checklist_submissions cs
  JOIN checklist_templates ct ON ct.id = cs.template_id
  JOIN machines m ON m.id = cs.machine_id
  LEFT JOIN users u ON u.id = cs.inspector_id
`;

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE cs.id = :id`, { id });
  return rows[0] || null;
}

/** The submission for a specific Template + Machine + period, with its responses joined to the
 * question text/type - or null if nothing's been submitted for that period yet. */
async function findByTemplateMachinePeriod(templateId, machineId, periodKey, connection = pool) {
  const [rows] = await connection.query(
    `${BASE_SELECT} WHERE cs.template_id = :templateId AND cs.machine_id = :machineId AND cs.period_key = :periodKey`,
    { templateId, machineId, periodKey }
  );
  const submission = rows[0];
  if (!submission) return null;

  const [responseRows] = await connection.query(
    `SELECT csr.*, q.question_text, q.response_type, q.display_order, q.is_mandatory
     FROM checklist_submission_responses csr
     JOIN checklist_template_questions q ON q.id = csr.question_id
     WHERE csr.submission_id = :submissionId
     ORDER BY q.display_order, q.id`,
    { submissionId: submission.id }
  );

  return { ...submission, responses: responseRows };
}

/** Every submission for a machine across a given set of templates - the caller matches each
 * template's own computed period_key in JS. A simple IN query is enough since the number of
 * templates assigned to any one machine is always small; no need for a dynamic tuple-IN. */
async function findSubmissionsForMachine(machineId, templateIds) {
  if (!templateIds.length) return [];
  const [rows] = await pool.query(
    `SELECT id, template_id, period_key, overall_status, submitted_at FROM checklist_submissions
     WHERE machine_id = :machineId AND template_id IN (:templateIds)`,
    { machineId, templateIds }
  );
  return rows;
}

async function createHeader({ templateId, machineId, scheduleDate, periodKey, overallStatus, inspectorId, supervisorName, comments }, connection) {
  const [result] = await connection.query(
    `INSERT INTO checklist_submissions
       (template_id, machine_id, schedule_date, period_key, overall_status, inspector_id, supervisor_name, comments)
     VALUES (:templateId, :machineId, :scheduleDate, :periodKey, :overallStatus, :inspectorId, :supervisorName, :comments)`,
    {
      templateId,
      machineId,
      scheduleDate,
      periodKey,
      overallStatus,
      inspectorId: inspectorId ?? null,
      supervisorName: supervisorName ?? null,
      comments: comments ?? null,
    }
  );
  return result.insertId;
}

async function bulkInsertResponses(submissionId, responses, connection) {
  if (!responses.length) return;
  const values = responses.map((r) => [submissionId, r.questionId, r.responseValue ?? null, r.remarks ?? null]);
  await connection.query(
    `INSERT INTO checklist_submission_responses (submission_id, question_id, response_value, remarks) VALUES ?`,
    [values]
  );
}

module.exports = { findById, findByTemplateMachinePeriod, findSubmissionsForMachine, createHeader, bulkInsertResponses };
