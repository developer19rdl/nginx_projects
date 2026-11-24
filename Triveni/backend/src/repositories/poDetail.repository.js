const { pool } = require('../config/database');

// item_code is free text straight from the Excel row - there's no items-master join or FK backing
// it, so no compatibility/data-quality check happens on it at all.
const BASE_SELECT = `
  SELECT mpd.*, po.order_no, po.priority AS order_priority,
         m.machine_code, m.machine_name, s.shift_code, s.shift_name
  FROM machine_planning mpd
  JOIN production_order po ON po.id = mpd.order_id
  LEFT JOIN machines m ON m.id = mpd.machine_id
  LEFT JOIN shifts s ON s.id = mpd.shift_id
`;

async function bulkInsert(rows, connection) {
  if (!rows.length) return;
  // machineId is always populated here - the Excel template names the machine per row, so every
  // detail row is created already assigned rather than waiting for a later manual assignment.
  // scheduleDate/shiftId are likewise the same for every row in a batch - they come from the
  // Date + Shift picked once on the upload screen, not from the Excel file itself.
  const values = rows.map((r) => [
    r.orderId,
    r.customerName,
    r.priority,
    r.itemCode,
    r.division,
    r.size,
    r.lotNo,
    r.quantity,
    r.scheduleDate,
    r.shiftId,
    r.machineId,
    r.operatorName,
  ]);
  await connection.query(
    `INSERT INTO machine_planning
       (order_id, customer_name, priority, item_code, division, size, lot_no, quantity, schedule_date, shift_id, machine_id, operator_name)
     VALUES ?`,
    [values]
  );
}

async function findByOrder(orderId) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE mpd.order_id = :orderId ORDER BY mpd.id`, { orderId });
  return rows;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE mpd.id = :id`, { id });
  return rows[0] || null;
}

/** Rows with no Schedule Date/Shift (unassigned from the plan, though they keep whatever machine
 * they had), optionally scoped to one order and/or the order's Order Date. */
async function findUnassigned({ orderId, orderDate, search } = {}) {
  const conditions = ['mpd.schedule_date IS NULL'];
  const params = {};
  if (orderId) {
    conditions.push('mpd.order_id = :orderId');
    params.orderId = orderId;
  }
  if (orderDate) {
    conditions.push('po.order_date = :orderDate');
    params.orderDate = orderDate;
  }
  if (search) {
    conditions.push('(mpd.item_code LIKE :search OR mpd.customer_name LIKE :search OR mpd.lot_no LIKE :search)');
    params.search = `%${search}%`;
  }
  const [rows] = await pool.query(`${BASE_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY po.priority, mpd.id`, params);
  return rows;
}

/**
 * Rows assigned to a machine, optionally narrowed to one machine_id/schedule_date/shift_id - this
 * is a direct filter, not a computed slice. Omitting machineId (the Machine Planning screen's
 * default "all machines" view for a date) lists every machine's rows for that date instead;
 * omitting scheduleDate/shiftId (used only by the manual assign flow's return value) returns the
 * machine's whole queue instead.
 */
async function findByMachine({ machineId, scheduleDate, shiftId }, connection = pool) {
  const conditions = [];
  const params = {};
  if (machineId) {
    conditions.push('mpd.machine_id = :machineId');
    params.machineId = machineId;
  }
  if (scheduleDate) {
    conditions.push('mpd.schedule_date = :scheduleDate');
    params.scheduleDate = scheduleDate;
  }
  if (shiftId) {
    conditions.push('mpd.shift_id = :shiftId');
    params.shiftId = shiftId;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await connection.query(`${BASE_SELECT} ${where} ORDER BY m.machine_code, mpd.id`, params);
  return rows;
}

/** Rows on this machine whose actual production activity overlaps a given real-time window - the
 * basis for the Machine Insights dashboard's "today"/"this shift" numbers being driven by when
 * work was actually submitted (Start/Stop/Resume stamps production_start_at/production_end_at),
 * not by the row's own schedule_date/shift_id fields, which can go stale relative to when the
 * operator genuinely ran it (e.g. a plan uploaded for one date but actually worked days later).
 * A row with no production_start_at (never started) never matches - nothing to report yet. */
async function findByMachineActualWindow(machineId, windowStart, windowEnd, connection = pool) {
  const [rows] = await connection.query(
    `${BASE_SELECT}
     WHERE mpd.machine_id = :machineId
       AND mpd.production_start_at IS NOT NULL
       AND mpd.production_start_at < :windowEnd
       AND (mpd.production_end_at IS NULL OR mpd.production_end_at > :windowStart)
     ORDER BY mpd.production_start_at`,
    { machineId, windowStart, windowEnd }
  );
  return rows;
}

async function lockRows(ids, connection) {
  const [rows] = await connection.query(`SELECT * FROM machine_planning WHERE id IN (:ids) FOR UPDATE`, { ids });
  return rows;
}

/** Row-locks this row plus, in the same query, any other row on its machine that's currently
 * RUNNING - startProduction and resumeProduction both use this (the target row plus "is something
 * else already running on this machine") atomically under one transaction, so two operators racing
 * to hit Start/Resume on the same machine can't both succeed. */
async function lockRowAndMachineRunning(id, connection) {
  const [[row]] = await connection.query(`SELECT * FROM machine_planning WHERE id = :id FOR UPDATE`, { id });
  if (!row) return { row: null, runningRow: null };
  const [running] = await connection.query(
    `SELECT * FROM machine_planning WHERE machine_id = :machineId AND production_status = 'RUNNING' AND id != :id FOR UPDATE`,
    { machineId: row.machine_id, id }
  );
  return { row, runningRow: running[0] || null };
}

/** Whether any machine_planning row for this machine is production_status = 'RUNNING' right this
 * instant - the real-time "is this machine actually producing" signal used to derive live
 * Running/Idle status, instead of trusting the machines.status master field (which a Machine
 * Master edit, or simply nothing ever resetting it, can leave stale). Mirrors dashboard.repository
 * .js's own has_active_production EXISTS check, exposed here as a reusable single-machine lookup
 * for machineInsights.service.js#getMachineInsights. */
async function hasActiveProduction(machineId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT 1 FROM machine_planning WHERE machine_id = :machineId AND production_status = 'RUNNING' LIMIT 1`,
    { machineId }
  );
  return rows.length > 0;
}

async function startProduction(id, connection) {
  await connection.query(
    `UPDATE machine_planning SET production_status = 'RUNNING', production_start_at = NOW() WHERE id = :id`,
    { id }
  );
}

/** Manually halts a RUNNING row's timer (the Stop button) - this is NOT completion. STOPPED means
 * "the operator ended this before it reached the planned quantity"; the timer stops (production_
 * end_at freezes the elapsed time) and produced_qty is left exactly as it was. Only actually
 * reaching the planned quantity marks a row COMPLETED (see updateProducedQty/applyMqttProducedQty
 * below) - a manual Stop must never do that itself. Resuming (resumeProduction) undoes this. */
async function stopProduction(id, connection = pool) {
  await connection.query(
    `UPDATE machine_planning SET production_status = 'STOPPED', production_end_at = NOW() WHERE id = :id`,
    { id }
  );
}

/** Un-halts a STOPPED row (the Resume button) and continues the timer from where it left off,
 * rather than restarting it from zero - production_start_at is shifted forward by exactly the
 * paused duration (now - production_end_at), so elapsed-so-far (production_end_at -
 * production_start_at, what was showing while stopped) is preserved and simply keeps counting up
 * from there once production_end_at is cleared. */
async function resumeProduction(id, connection) {
  await connection.query(
    `UPDATE machine_planning
     SET production_start_at = DATE_ADD(production_start_at, INTERVAL TIMESTAMPDIFF(SECOND, production_end_at, NOW()) SECOND),
         production_end_at = NULL,
         production_status = 'RUNNING'
     WHERE id = :id`,
    { id }
  );
}

/** Discards the current run (the Reset button) - back to NOT_STARTED with no start/end time and
 * produced_qty zeroed, as if Start had never been clicked, so the order can be started fresh. */
async function resetProduction(id, connection = pool) {
  await connection.query(
    `UPDATE machine_planning
     SET production_status = 'NOT_STARTED', production_start_at = NULL, production_end_at = NULL, produced_qty = 0
     WHERE id = :id`,
    { id }
  );
}

async function assignToMachine(id, { machineId, scheduleDate, shiftId }, connection) {
  await connection.query(
    `UPDATE machine_planning
     SET machine_id = :machineId, schedule_date = :scheduleDate, shift_id = :shiftId
     WHERE id = :id`,
    { id, machineId, scheduleDate, shiftId }
  );
}

// Clears Schedule Date + Shift only - the machine assignment is left alone, so the row keeps
// whichever machine it's destined for and just comes off the plan until it's rescheduled.
async function unassign(id, connection = pool) {
  await connection.query(`UPDATE machine_planning SET schedule_date = NULL, shift_id = NULL WHERE id = :id`, { id });
}

/** Identifies the "active production record" for an MQTT message's Device_ID + Slave_ID (joined
 * through machines.device_id/slave_id) - at most one row can be RUNNING per machine at a time, so
 * this is unambiguous. Returns null if that machine has nothing currently running (the message is
 * ignored in that case, per the MQTT spec). */
async function findActiveByDeviceSlave({ deviceId, slaveId }, connection = pool) {
  const [rows] = await connection.query(
    `SELECT mp.* FROM machine_planning mp
     JOIN machines m ON m.id = mp.machine_id
     WHERE m.device_id = :deviceId AND m.slave_id = :slaveId AND mp.production_status = 'RUNNING'
     LIMIT 1`,
    { deviceId, slaveId }
  );
  return rows[0] || null;
}

/** Applies one MQTT produced-qty reading atomically. prod_qty is a cumulative total (each message
 * reports the running total for the current job, not a delta), so the WHERE guard
 * ":prodQty >= produced_qty" is what makes this idempotent: replaying the same reading, or a
 * stale/out-of-order one that arrives after a newer reading, is a no-op (0 rows affected) rather
 * than corrupting produced_qty or double-firing completion. Completion (produced >= planned) is
 * decided and stamped in the same statement, and the "WHERE ... production_status = 'RUNNING'"
 * guard means a row can only ever complete once - a second message reaching the target quantity
 * (or arriving after completion) simply no-ops. Returns true if this reading was applied. */
async function applyMqttProducedQty({ id, prodQty }, connection = pool) {
  const [result] = await connection.query(
    `UPDATE machine_planning
     SET produced_qty = :prodQty,
         production_end_at = IF(:prodQty >= quantity, NOW(), production_end_at),
         production_status = IF(:prodQty >= quantity, 'COMPLETED', production_status)
     WHERE id = :id AND production_status = 'RUNNING' AND :prodQty >= produced_qty`,
    { id, prodQty }
  );
  return result.affectedRows > 0;
}

/** Saving Produced Qty completes a RUNNING or STOPPED row only if the saved quantity actually
 * reaches the planned quantity - the same "reaches target" rule applyMqttProducedQty uses, so
 * manual entry and MQTT agree on what "Completed" means. A manual Stop never completes a row by
 * itself; if the operator later corrects/finishes the tally on a STOPPED row up to the planned
 * quantity, saving that here is what completes it. production_end_at is only stamped fresh when
 * completing from RUNNING - a STOPPED row already has its timer frozen at the Stop time, and
 * completing it shouldn't move that. Rows that are NOT_STARTED or already COMPLETED just have
 * their quantity updated, same as always.
 * NB: MySQL/MariaDB evaluates a single UPDATE's SET clauses left-to-right, and a column reference
 * sees the *new* value from an earlier clause in the same statement - so production_end_at (which
 * still needs the original, pre-update production_status) is computed before production_status is
 * overwritten. Flipping this order silently breaks it (production_end_at would never be set). */
async function updateProducedQty(id, producedQty, connection = pool) {
  await connection.query(
    `UPDATE machine_planning
     SET produced_qty = :producedQty,
         production_end_at = IF(production_status = 'RUNNING' AND :producedQty >= quantity, NOW(), production_end_at),
         production_status = IF(production_status IN ('RUNNING', 'STOPPED') AND :producedQty >= quantity, 'COMPLETED', production_status)
     WHERE id = :id`,
    { id, producedQty }
  );
}

async function updateCoilInfo(id, { coilNo, grade, coilSize, coilWt }, connection = pool) {
  await connection.query(
    `UPDATE machine_planning SET coil_no = :coilNo, grade = :grade, coil_size = :coilSize, coil_wt = :coilWt WHERE id = :id`,
    { id, coilNo: coilNo ?? null, grade: grade ?? null, coilSize: coilSize ?? null, coilWt: coilWt ?? null }
  );
}

module.exports = {
  bulkInsert,
  findByOrder,
  findById,
  findUnassigned,
  findByMachine,
  findByMachineActualWindow,
  hasActiveProduction,
  lockRows,
  lockRowAndMachineRunning,
  startProduction,
  stopProduction,
  resumeProduction,
  resetProduction,
  findActiveByDeviceSlave,
  applyMqttProducedQty,
  assignToMachine,
  unassign,
  updateProducedQty,
  updateCoilInfo,
};
