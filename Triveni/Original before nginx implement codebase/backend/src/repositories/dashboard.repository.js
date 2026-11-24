const { pool } = require('../config/database');

async function getSummary() {
  const [[orderCounts]] = await pool.query(`
    SELECT
      COUNT(*) AS totalOrderPlans,
      SUM(status = 'Imported') AS pendingPlanning,
      SUM(status = 'Assigning') AS partiallyPlanned
    FROM production_order
  `);

  const [[rowCounts]] = await pool.query(`
    SELECT
      SUM(machine_id IS NULL) AS unassignedRows,
      COALESCE(SUM(CASE WHEN machine_id IS NULL THEN quantity ELSE 0 END), 0) AS unplannedQuantity,
      SUM(machine_id IS NOT NULL) AS assignedRows,
      COUNT(*) AS totalRows
    FROM machine_planning
  `);

  const [[todaysProduction]] = await pool.query(`
    SELECT COALESCE(SUM(mp.quantity), 0) AS todaysProduction
    FROM machine_planning mp
    WHERE mp.schedule_date = CURDATE() AND mp.machine_id IS NOT NULL
  `);

  const [[machineCounts]] = await pool.query(`
    SELECT
      SUM(is_active = 1) AS activeMachines,
      SUM(status = 'Maintenance') AS machinesUnderMaintenance
    FROM machines
  `);

  const [[machinesInUse]] = await pool.query(`
    SELECT COUNT(DISTINCT machine_id) AS machinesInUse FROM machine_planning WHERE machine_id IS NOT NULL
  `);

  return { orderCounts, rowCounts, todaysProduction, machineCounts, machinesInUse };
}

/** Total vs. assigned quantity for the most recently created production orders. */
async function plannedVsRemainingByOrder(limit = 10) {
  const [rows] = await pool.query(
    `SELECT po.order_no, po.total_quantity,
            COALESCE(SUM(CASE WHEN mpd.machine_id IS NOT NULL THEN mpd.quantity ELSE 0 END), 0) AS assigned_quantity
     FROM production_order po
     LEFT JOIN machine_planning mpd ON mpd.order_id = po.id
     GROUP BY po.id, po.order_no, po.total_quantity
     ORDER BY po.created_at DESC
     LIMIT :limit`,
    { limit }
  );
  return rows.map((r) => ({
    order_no: r.order_no,
    total_quantity: r.total_quantity,
    assigned_quantity: r.assigned_quantity,
    remaining_quantity: Number(r.total_quantity) - Number(r.assigned_quantity),
  }));
}

async function productionByMachine(limit = 10) {
  const [rows] = await pool.query(
    `SELECT m.machine_code, COALESCE(SUM(mpd.quantity), 0) AS quantity
     FROM machine_planning mpd JOIN machines m ON m.id = mpd.machine_id
     WHERE mpd.machine_id IS NOT NULL
     GROUP BY m.id, m.machine_code ORDER BY quantity DESC LIMIT :limit`,
    { limit }
  );
  return rows;
}

async function productionByItem(limit = 10) {
  // item_code is free text on the row itself now - no items-master join to group through.
  const [rows] = await pool.query(
    `SELECT mpd.item_code, COALESCE(SUM(mpd.quantity), 0) AS quantity
     FROM machine_planning mpd
     WHERE mpd.machine_id IS NOT NULL
     GROUP BY mpd.item_code ORDER BY quantity DESC LIMIT :limit`,
    { limit }
  );
  return rows;
}

/** One row per active machine with everything the live floor dashboard needs for "today"
 * (target/produced qty, downtime minutes, whether it's down right now, last-touched timestamp).
 * Each aggregate is a correlated subquery rather than a LEFT JOIN + GROUP BY, because joining
 * machine_planning and downtime_logs together would fan out and double-count both sums.
 * "Today" is mp.schedule_date (the date a row is actually scheduled to run), not the parent
 * order's order_date (when the order was uploaded) - a row can be scheduled for a different day
 * than its order was created, so schedule_date is the field that actually means "today's plan". */
async function machineLiveStatus() {
  // last_production_update is scoped by real production activity today (production_start_at
  // falling in "today"'s actual calendar window), not by the plan row's nominal schedule_date -
  // the same "submitted date, not scheduled date" fix applied to Machine Insights/OEE. A row whose
  // schedule_date is stale (or missing) but that is actually running/ran today still counts.
  // Produced/Target themselves are NOT computed here - they're current-shift-scoped, sourced from
  // machineInsightsService.getLiveOeeForMachines (the same per-shift computeRuntimeAnalytics the
  // Machine Insights panel's Live Production card uses), not a day-wide SQL aggregate - a whole-day
  // total kept showing a finished earlier shift's numbers after the machine sat idle all shift.
  // has_active_production isn't day-scoped like the above - it's "is there a machine_planning row
  // for this machine sitting in production_status = 'RUNNING' right this instant" (set by the
  // Start/Resume action, cleared by Stop/Complete), the ground truth dashboard.service.js derives
  // the live Running/Idle status from, instead of trusting the machines.status master field.
  const [rows] = await pool.query(`
    SELECT
      m.id, m.machine_code, m.machine_name, m.machine_type, m.status, m.production_rate,
      m.updated_at AS machine_updated_at,
      (
        SELECT MAX(mp.updated_at) FROM machine_planning mp
        WHERE mp.machine_id = m.id
          AND mp.production_start_at IS NOT NULL
          AND mp.production_start_at < CURDATE() + INTERVAL 1 DAY
          AND (mp.production_end_at IS NULL OR mp.production_end_at >= CURDATE())
      ) AS last_production_update,
      COALESCE((
        SELECT SUM(TIMESTAMPDIFF(MINUTE, GREATEST(dtl.started_at, CURDATE()), COALESCE(dtl.ended_at, NOW())))
        FROM downtime_logs dtl
        WHERE dtl.machine_id = m.id AND COALESCE(dtl.ended_at, NOW()) >= CURDATE()
      ), 0) AS downtime_minutes,
      (
        SELECT dtl2.started_at FROM downtime_logs dtl2
        WHERE dtl2.machine_id = m.id AND dtl2.ended_at IS NULL
        ORDER BY dtl2.id DESC LIMIT 1
      ) AS active_downtime_started_at,
      (
        SELECT dtr.reason_name FROM downtime_logs dtl3
        JOIN downtime_reasons dtr ON dtr.id = dtl3.reason_id
        WHERE dtl3.machine_id = m.id AND dtl3.ended_at IS NULL
        ORDER BY dtl3.id DESC LIMIT 1
      ) AS active_downtime_reason,
      (
        SELECT MAX(dtl4.updated_at) FROM downtime_logs dtl4
        WHERE dtl4.machine_id = m.id AND COALESCE(dtl4.ended_at, NOW()) >= CURDATE()
      ) AS last_downtime_update,
      EXISTS (
        SELECT 1 FROM machine_planning mp
        WHERE mp.machine_id = m.id AND mp.production_status = 'RUNNING'
      ) AS has_active_production
    FROM machines m
    WHERE m.is_active = 1
    ORDER BY m.machine_code
  `);
  return rows;
}

module.exports = { getSummary, plannedVsRemainingByOrder, productionByMachine, productionByItem, machineLiveStatus };
