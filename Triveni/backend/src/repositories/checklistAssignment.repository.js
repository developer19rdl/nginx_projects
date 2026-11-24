const { pool } = require('../config/database');

/** Templates currently actively assigned to a machine - what the operator app's checklist list
 * reads to know which checklists to show for its configured machine. */
async function findActiveTemplatesForMachine(machineId) {
  const [rows] = await pool.query(
    `SELECT ct.* FROM checklist_templates ct
     JOIN checklist_machine_assignments a ON a.template_id = ct.id
     WHERE a.machine_id = :machineId AND a.is_active = 1 AND ct.is_active = 1
     ORDER BY ct.title`,
    { machineId }
  );
  return rows;
}

/** Machines currently assigned to a template (activeOnly=false also returns deactivated
 * assignments, e.g. for prefilling the Assign Machines dialog with everything ever assigned). */
async function findMachinesForTemplate(templateId, { activeOnly = true } = {}) {
  const where = activeOnly ? 'AND a.is_active = 1' : '';
  const [rows] = await pool.query(
    `SELECT m.id, m.machine_code, m.machine_name, a.is_active AS assignment_active
     FROM checklist_machine_assignments a
     JOIN machines m ON m.id = a.machine_id
     WHERE a.template_id = :templateId ${where}
     ORDER BY m.machine_code`,
    { templateId }
  );
  return rows;
}

/**
 * Replace-whole-set: every machineId in `machineIds` gets an active assignment row (inserted or
 * reactivated via upsert), and any existing assignment for this template not in `machineIds` is
 * deactivated. Assignment rows are never deleted, only toggled, so re-assigning later doesn't
 * create duplicates and history (created_by/updated_by/timestamps) is preserved.
 */
async function replaceAssignments(templateId, machineIds, updatedBy, connection) {
  if (machineIds.length) {
    const values = machineIds.map((machineId) => [templateId, machineId, updatedBy ?? null]);
    await connection.query(
      `INSERT INTO checklist_machine_assignments (template_id, machine_id, created_by) VALUES ?
       ON DUPLICATE KEY UPDATE is_active = 1, updated_by = VALUES(created_by)`,
      [values]
    );
  }

  if (machineIds.length) {
    await connection.query(
      `UPDATE checklist_machine_assignments SET is_active = 0, updated_by = :updatedBy
       WHERE template_id = :templateId AND machine_id NOT IN (:machineIds)`,
      { templateId, machineIds, updatedBy: updatedBy ?? null }
    );
  } else {
    await connection.query(
      `UPDATE checklist_machine_assignments SET is_active = 0, updated_by = :updatedBy WHERE template_id = :templateId`,
      { templateId, updatedBy: updatedBy ?? null }
    );
  }
}

module.exports = { findActiveTemplatesForMachine, findMachinesForTemplate, replaceAssignments };
