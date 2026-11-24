const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT qi.*, m.machine_code, m.machine_name, s.shift_name, u.full_name AS inspector_full_name,
         ru.full_name AS released_by_name
  FROM quality_inspections qi
  JOIN machines m ON m.id = qi.machine_id
  LEFT JOIN shifts s ON s.id = qi.shift_id
  LEFT JOIN users u ON u.id = qi.inspector_id
  LEFT JOIN users ru ON ru.id = qi.released_by
`;

/**
 * Completed-but-unhandled lots: machine_planning rows fully produced (produced_qty >= quantity)
 * with either no quality_inspections row yet (brand new, pending_reason='NEW'), or an existing
 * one sitting in REWORK_REQUIRED/HOLD awaiting the inspector to come back to it. lot_no has no
 * uniqueness constraint anywhere in this app, so machine_planning.id (not lot_no) is the join key.
 */
async function findPendingLots() {
  const [rows] = await pool.query(
    `SELECT mp.id AS machine_planning_id, mp.order_id, po.order_no, mp.lot_no, mp.item_code, mp.customer_name,
            mp.quantity, mp.produced_qty, mp.machine_id, m.machine_code, m.machine_name, mp.operator_name, mp.shift_id,
            qi.id AS inspection_id, qi.status AS inspection_status,
            CASE WHEN qi.id IS NULL THEN 'NEW' ELSE qi.status END AS pending_reason
     FROM machine_planning mp
     JOIN production_order po ON po.id = mp.order_id
     JOIN machines m ON m.id = mp.machine_id
     LEFT JOIN quality_inspections qi ON qi.machine_planning_id = mp.id
     WHERE mp.machine_id IS NOT NULL
       AND mp.produced_qty >= mp.quantity
       AND (qi.id IS NULL OR qi.status IN ('REWORK_REQUIRED', 'HOLD'))
     ORDER BY mp.id DESC`
  );
  return rows;
}

async function findMachinePlanningRow(machinePlanningId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT mp.*, po.order_no, i.item_name
     FROM machine_planning mp
     JOIN production_order po ON po.id = mp.order_id
     LEFT JOIN items i ON i.item_code = mp.item_code AND i.size = COALESCE(mp.size, '')
     WHERE mp.id = :machinePlanningId`,
    { machinePlanningId }
  );
  return rows[0] || null;
}

async function findByMachinePlanningId(machinePlanningId, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE qi.machine_planning_id = :machinePlanningId`, { machinePlanningId });
  return rows[0] || null;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE qi.id = :id`, { id });
  return rows[0] || null;
}

/** Traceability list - full history across every inspection, filterable. Mirrors
 * machine.repository.js's findAll pagination shape. */
async function findAll({ status, machineId, itemCode, customerName, inspectorId, dateFrom, dateTo, page = 1, pageSize = 25 } = {}) {
  const conditions = ['1=1'];
  const params = {};
  if (status) {
    conditions.push('qi.status = :status');
    params.status = status;
  }
  if (machineId) {
    conditions.push('qi.machine_id = :machineId');
    params.machineId = machineId;
  }
  if (itemCode) {
    conditions.push('qi.item_code LIKE :itemCode');
    params.itemCode = `%${itemCode}%`;
  }
  if (customerName) {
    conditions.push('qi.customer_name LIKE :customerName');
    params.customerName = `%${customerName}%`;
  }
  if (inspectorId) {
    conditions.push('qi.inspector_id = :inspectorId');
    params.inspectorId = inspectorId;
  }
  if (dateFrom) {
    conditions.push('qi.inspection_datetime >= :dateFrom');
    params.dateFrom = dateFrom;
  }
  if (dateTo) {
    conditions.push('qi.inspection_datetime <= :dateTo');
    params.dateTo = dateTo;
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = Number(pageSize);
  const offset = (Number(page) - 1) * limit;

  const [rows] = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY qi.id DESC LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM quality_inspections qi ${where}`,
    params
  );
  return { rows, total, page: Number(page), pageSize: limit };
}

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO quality_inspections
       (inspection_no, machine_planning_id, order_no, lot_no, item_code, size, item_name, customer_name, machine_id,
        operator_name, shift_id, quantity_produced, coil_no, grade, coil_size, coil_wt, inspection_plan_id,
        inspection_type, sample_size, inspection_datetime, inspector_id)
     VALUES
       (:inspectionNo, :machinePlanningId, :orderNo, :lotNo, :itemCode, :size, :itemName, :customerName, :machineId,
        :operatorName, :shiftId, :quantityProduced, :coilNo, :grade, :coilSize, :coilWt, :inspectionPlanId,
        :inspectionType, :sampleSize, :inspectionDatetime, :inspectorId)`,
    {
      inspectionNo: data.inspectionNo,
      machinePlanningId: data.machinePlanningId,
      orderNo: data.orderNo,
      lotNo: data.lotNo ?? null,
      itemCode: data.itemCode,
      size: data.size || '',
      itemName: data.itemName ?? null,
      customerName: data.customerName,
      machineId: data.machineId,
      operatorName: data.operatorName ?? null,
      shiftId: data.shiftId ?? null,
      quantityProduced: data.quantityProduced,
      coilNo: data.coilNo ?? null,
      grade: data.grade ?? null,
      coilSize: data.coilSize ?? null,
      coilWt: data.coilWt ?? null,
      inspectionPlanId: data.inspectionPlanId ?? null,
      inspectionType: data.inspectionType,
      sampleSize: data.sampleSize ?? 1,
      inspectionDatetime: data.inspectionDatetime,
      inspectorId: data.inspectorId ?? null,
    }
  );
  return result.insertId;
}

async function findParameterResults(inspectionId, attemptNo, connection = pool) {
  const [rows] = await connection.query(
    `SELECT * FROM quality_inspection_parameter_results WHERE inspection_id = :inspectionId AND attempt_no = :attemptNo ORDER BY id`,
    { inspectionId, attemptNo }
  );
  return rows;
}

/** Replaces this attempt's parameter results wholesale (delete-then-insert) - simpler than a
 * per-row upsert since the whole set is always submitted together from one form. */
async function replaceParameterResults(inspectionId, attemptNo, results, connection = pool) {
  await connection.query(`DELETE FROM quality_inspection_parameter_results WHERE inspection_id = :inspectionId AND attempt_no = :attemptNo`, {
    inspectionId,
    attemptNo,
  });
  if (!results.length) return;
  const values = results.map((r) => [
    inspectionId,
    attemptNo,
    r.planParameterId ?? null,
    r.parameterName,
    r.parameterCategory,
    r.specification ?? null,
    r.tolerance ?? null,
    r.unitOfMeasure ?? null,
    r.actualValue ?? null,
    r.result ?? null,
    r.remarks ?? null,
  ]);
  await connection.query(
    `INSERT INTO quality_inspection_parameter_results
       (inspection_id, attempt_no, plan_parameter_id, parameter_name, parameter_category, specification, tolerance, unit_of_measure, actual_value, result, remarks)
     VALUES ?`,
    [values]
  );
}

async function findDefects(inspectionId, attemptNo, connection = pool) {
  const [rows] = await connection.query(
    `SELECT qid.*, dc.defect_code, dc.defect_name, dc.category
     FROM quality_inspection_defects qid
     JOIN quality_defect_catalog dc ON dc.id = qid.defect_catalog_id
     WHERE qid.inspection_id = :inspectionId AND qid.attempt_no = :attemptNo
     ORDER BY qid.id`,
    { inspectionId, attemptNo }
  );
  return rows;
}

async function addDefect(inspectionId, attemptNo, data, connection) {
  const [result] = await connection.query(
    `INSERT INTO quality_inspection_defects (inspection_id, attempt_no, defect_catalog_id, quantity_rejected, notes, created_by)
     VALUES (:inspectionId, :attemptNo, :defectCatalogId, :quantityRejected, :notes, :createdBy)`,
    {
      inspectionId,
      attemptNo,
      defectCatalogId: data.defectCatalogId,
      quantityRejected: data.quantityRejected,
      notes: data.notes ?? null,
      createdBy: data.createdBy ?? null,
    }
  );
  return result.insertId;
}

async function findDefectById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM quality_inspection_defects WHERE id = :id`, { id });
  return rows[0] || null;
}

async function removeDefect(id, connection = pool) {
  await connection.query(`DELETE FROM quality_inspection_defects WHERE id = :id`, { id });
}

async function findStatusHistory(inspectionId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT qish.*, u.full_name AS changed_by_name
     FROM quality_inspection_status_history qish
     LEFT JOIN users u ON u.id = qish.changed_by
     WHERE qish.inspection_id = :inspectionId
     ORDER BY qish.id`,
    { inspectionId }
  );
  return rows;
}

async function insertStatusHistory({ inspectionId, fromStatus, toStatus, changedBy, remarks }, connection) {
  await connection.query(
    `INSERT INTO quality_inspection_status_history (inspection_id, from_status, to_status, changed_by, remarks)
     VALUES (:inspectionId, :fromStatus, :toStatus, :changedBy, :remarks)`,
    { inspectionId, fromStatus: fromStatus ?? null, toStatus, changedBy: changedBy ?? null, remarks: remarks ?? null }
  );
}

async function recordDecision(id, data, connection) {
  await connection.query(
    `UPDATE quality_inspections SET
       status = :status, quantity_accepted = :quantityAccepted, quantity_rework = :quantityRework,
       quantity_rejected = :quantityRejected, rejection_reason = :rejectionReason, root_cause = :rootCause,
       corrective_action = :correctiveAction, preventive_action = :preventiveAction, remarks = :remarks
     WHERE id = :id`,
    {
      id,
      status: data.status,
      quantityAccepted: data.quantityAccepted ?? null,
      quantityRework: data.quantityRework ?? null,
      quantityRejected: data.quantityRejected ?? null,
      rejectionReason: data.rejectionReason ?? null,
      rootCause: data.rootCause ?? null,
      correctiveAction: data.correctiveAction ?? null,
      preventiveAction: data.preventiveAction ?? null,
      remarks: data.remarks ?? null,
    }
  );
}

/** Reopens a REWORK_REQUIRED (or HOLD) report for another inspection pass: bumps attempt_no and
 * resets status to UNDER_INSPECTION. The previous attempt's parameter results/defects stay under
 * their own attempt_no, untouched. */
async function reopenForRework(id, nextAttemptNo, connection) {
  await connection.query(`UPDATE quality_inspections SET status = 'UNDER_INSPECTION', attempt_no = :nextAttemptNo WHERE id = :id`, {
    id,
    nextAttemptNo,
  });
}

async function markReleased(id, releasedBy, connection) {
  await connection.query(
    `UPDATE quality_inspections SET released_to_inventory = 1, released_at = NOW(), released_by = :releasedBy WHERE id = :id`,
    { id, releasedBy: releasedBy ?? null }
  );
}

/** Accepted vs. rejected quantity recorded against this machine's inspections for one shift on
 * one day - the real input to an OEE Quality % (see machineInsights.service.js#getMachineInsights).
 * quantity_accepted/quantity_rejected are NULL until an inspection is actually decided, and SUM()
 * skips NULLs on its own, so an inspection still UNDER_INSPECTION simply doesn't contribute yet. */
/** windowStart/windowEnd is the shift's actual [start, end) time range (machineInsights.service.js
 * #shiftWindow) - inspection_datetime falling in it is what decides membership, not the
 * inspection's own snapshotted shift_id (itself just a copy of whatever the lot's shift_id
 * happened to be at inspection-start time, which can be stale relative to when the inspection was
 * actually submitted). Same "submitted time, not a stored schedule field" rule as runtime/
 * production elsewhere in Machine Insights. */
async function sumQualityForMachineShift(machineId, windowStart, windowEnd) {
  const [[row]] = await pool.query(
    `SELECT COALESCE(SUM(quantity_accepted), 0) AS accepted_qty, COALESCE(SUM(quantity_rejected), 0) AS rejected_qty
     FROM quality_inspections
     WHERE machine_id = :machineId AND inspection_datetime >= :windowStart AND inspection_datetime < :windowEnd`,
    { machineId, windowStart, windowEnd }
  );
  return row;
}

module.exports = {
  findPendingLots,
  findMachinePlanningRow,
  findByMachinePlanningId,
  findById,
  findAll,
  create,
  findParameterResults,
  replaceParameterResults,
  findDefects,
  addDefect,
  findDefectById,
  removeDefect,
  findStatusHistory,
  insertStatusHistory,
  sumQualityForMachineShift,
  recordDecision,
  reopenForRework,
  markReleased,
};
