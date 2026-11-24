const { pool } = require('../config/database');

async function findById(id, connection = pool) {
  const [rows] = await connection.query(
    `SELECT po.*, u.full_name AS created_by_name FROM production_order po LEFT JOIN users u ON u.id = po.created_by WHERE po.id = :id`,
    { id }
  );
  return rows[0] || null;
}

async function findByOrderNo(orderNo, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM production_order WHERE order_no = :orderNo`, { orderNo });
  return rows[0] || null;
}

async function findAll({ search, status, fromDate, toDate, limit, offset, sortBy = 'priority', sortDir = 'ASC' }) {
  const conditions = ['1 = 1'];
  const params = {};
  if (search) {
    conditions.push('po.order_no LIKE :search');
    params.search = `%${search}%`;
  }
  if (Array.isArray(status) && status.length) {
    conditions.push('po.status IN (:status)');
    params.status = status;
  } else if (typeof status === 'string' && status) {
    conditions.push('po.status = :status');
    params.status = status;
  }
  if (fromDate) {
    conditions.push('po.order_date >= :fromDate');
    params.fromDate = fromDate;
  }
  if (toDate) {
    conditions.push('po.order_date <= :toDate');
    params.toDate = toDate;
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const allowedSort = new Set(['priority', 'order_date', 'order_no', 'status', 'created_at', 'total_quantity']);
  const safeSortBy = allowedSort.has(sortBy) ? sortBy : 'priority';
  const safeSortDir = sortDir === 'DESC' ? 'DESC' : 'ASC';

  const [rows] = await pool.query(
    `SELECT po.*, u.full_name AS created_by_name,
            (SELECT COUNT(*) FROM machine_planning mpd WHERE mpd.order_id = po.id AND mpd.schedule_date IS NOT NULL) AS assigned_rows
     FROM production_order po LEFT JOIN users u ON u.id = po.created_by
     ${where} ORDER BY ${safeSortBy} ${safeSortDir} LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM production_order po ${where}`, params);
  return { rows, total };
}

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO production_order (order_no, order_date, priority, source_file_name, total_rows, total_quantity, status, created_by)
     VALUES (:orderNo, :orderDate, :priority, :sourceFileName, :totalRows, :totalQuantity, 'Imported', :createdBy)`,
    data
  );
  return findById(result.insertId, connection);
}

async function updateStatus(id, status, updatedBy, connection = pool) {
  await connection.query(`UPDATE production_order SET status = :status, updated_by = :updatedBy WHERE id = :id`, {
    id,
    status,
    updatedBy: updatedBy ?? null,
  });
  return findById(id, connection);
}

/** Recomputes status from its detail rows: Assigned once every row is scheduled (has a Date +
 * Shift), Assigning if some are, else Imported. Unassigning a row clears its schedule (not its
 * machine), so scheduling - not machine_id - is what "assigned" means here. */
async function recomputeStatus(orderId, connection) {
  const [[agg]] = await connection.query(
    `SELECT COUNT(*) AS total, SUM(schedule_date IS NOT NULL) AS assigned FROM machine_planning WHERE order_id = :orderId`,
    { orderId }
  );
  const total = Number(agg.total);
  const assigned = Number(agg.assigned) || 0;
  const status = total > 0 && assigned === total ? 'Assigned' : assigned > 0 ? 'Assigning' : 'Imported';
  await connection.query(`UPDATE production_order SET status = :status WHERE id = :orderId`, { orderId, status });
  return status;
}

// machine_planning.order_id has ON DELETE CASCADE, so this also removes every detail row
// (and, with them, any coil/produced-qty info attached) that belonged to this order.
async function remove(id, connection = pool) {
  await connection.query(`DELETE FROM production_order WHERE id = :id`, { id });
}

module.exports = { findById, findByOrderNo, findAll, create, updateStatus, recomputeStatus, remove };
