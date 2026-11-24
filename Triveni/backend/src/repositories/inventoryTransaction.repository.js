const { pool } = require('../config/database');

const IN_TYPES = ['QUALITY_ACCEPTANCE', 'TRANSFER_IN', 'ADJUSTMENT_IN'];
const OUT_TYPES = ['DISPATCH', 'TRANSFER_OUT', 'ADJUSTMENT_OUT'];
// HOLD/RELEASE move quantity between available and hold within the same on-hand total, so they
// don't count as an In or Out for the running-balance ledger - they're still stored (and shown)
// for full audit traceability, just excluded from the In/Out/Balance columns.

// qi.coil_no/grade/coil_size/coil_wt below: coil identity as it stood at inspection time, from
// quality_inspections' own denormalized snapshot columns (migration 034) - not a live join back to
// machine_planning, same "don't let a later edit rewrite this report's history" reasoning as that
// table's own order_no/lot_no. NOTE: this explanation is deliberately kept as a plain JS comment
// rather than an inline SQL `--` comment inside the template literal below - mysql2's
// `namedPlaceholders` scanner tracks quote state through the whole query text, and an apostrophe
// inside a SQL comment (e.g. "table's") still toggles that tracking, which silently broke
// substitution of the real `:id` placeholder appended after this constant (mysql2 sent it through
// to MariaDB unresolved). Keep comments about this query's SQL out of the SQL string itself.
const BASE_SELECT = `
  SELECT it.*, w.warehouse_code, w.warehouse_name, wl.location_code, wl.location_name,
         qi.inspection_no, po.order_no, m.machine_code, u.full_name AS created_by_name,
         qi.coil_no, qi.grade, qi.coil_size, qi.coil_wt
  FROM inventory_transactions it
  JOIN warehouses w ON w.id = it.warehouse_id
  JOIN warehouse_locations wl ON wl.id = it.location_id
  LEFT JOIN quality_inspections qi ON qi.id = it.quality_inspection_id
  LEFT JOIN production_order po ON po.id = it.production_order_id
  LEFT JOIN machines m ON m.id = it.machine_id
  LEFT JOIN users u ON u.id = it.created_by
`;

async function insert(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO inventory_transactions
       (transaction_no, transaction_type, item_code, size, lot_no, quantity, warehouse_id, location_id,
        production_order_id, quality_inspection_id, machine_id, reference_type, reference_id, remarks, created_by)
     VALUES
       (:transactionNo, :transactionType, :itemCode, :size, :lotNo, :quantity, :warehouseId, :locationId,
        :productionOrderId, :qualityInspectionId, :machineId, :referenceType, :referenceId, :remarks, :createdBy)`,
    {
      transactionNo: data.transactionNo,
      transactionType: data.transactionType,
      itemCode: data.itemCode,
      size: data.size || '',
      lotNo: data.lotNo || '',
      quantity: data.quantity,
      warehouseId: data.warehouseId,
      locationId: data.locationId,
      productionOrderId: data.productionOrderId ?? null,
      qualityInspectionId: data.qualityInspectionId ?? null,
      machineId: data.machineId ?? null,
      referenceType: data.referenceType ?? null,
      referenceId: data.referenceId ?? null,
      remarks: data.remarks ?? null,
      createdBy: data.createdBy ?? null,
    }
  );
  return result.insertId;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE it.id = :id`, { id });
  return rows[0] || null;
}

async function findByQualityInspectionId(inspectionId, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE it.quality_inspection_id = :inspectionId`, { inspectionId });
  return rows[0] || null;
}

async function findAll({ itemCode, transactionType, dateFrom, dateTo, page = 1, pageSize = 25 } = {}) {
  const conditions = ['1 = 1'];
  const params = {};
  if (itemCode) {
    conditions.push('it.item_code = :itemCode');
    params.itemCode = itemCode;
  }
  if (transactionType) {
    conditions.push('it.transaction_type = :transactionType');
    params.transactionType = transactionType;
  }
  if (dateFrom) {
    conditions.push('it.created_at >= :dateFrom');
    params.dateFrom = dateFrom;
  }
  if (dateTo) {
    conditions.push('it.created_at <= :dateTo');
    params.dateTo = dateTo;
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY it.created_at DESC, it.id DESC LIMIT :limit OFFSET :offset`,
    { ...params, limit: pageSize, offset }
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM inventory_transactions it ${where}`, params);
  return { rows, total };
}

/** The Inventory Ledger: every movement for one item(+size/+lot), oldest first, with a running
 * on-hand balance computed via a window function - In/Out/Balance, same shape as the spec's
 * example table. Hold/Release rows are included for audit but contribute 0 to In/Out/Balance
 * since they don't change the on-hand total (see IN_TYPES/OUT_TYPES above). */
async function getLedger({ itemCode, size, lotNo, dateFrom, dateTo } = {}) {
  const conditions = ['1 = 1'];
  const params = {};
  if (itemCode) {
    conditions.push('it.item_code = :itemCode');
    params.itemCode = itemCode;
  }
  if (size != null && size !== '') {
    conditions.push('it.size = :size');
    params.size = size;
  }
  if (lotNo) {
    conditions.push('it.lot_no = :lotNo');
    params.lotNo = lotNo;
  }
  if (dateFrom) {
    conditions.push('it.created_at >= :dateFrom');
    params.dateFrom = dateFrom;
  }
  if (dateTo) {
    conditions.push('it.created_at <= :dateTo');
    params.dateTo = dateTo;
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const inList = IN_TYPES.map((t) => `'${t}'`).join(',');
  const outList = OUT_TYPES.map((t) => `'${t}'`).join(',');

  const [rows] = await pool.query(
    `SELECT it.*, w.warehouse_code, wl.location_code, qi.inspection_no, u.full_name AS created_by_name,
            po.order_no, qi.coil_no, qi.grade, qi.coil_size, qi.coil_wt,
            CASE WHEN it.transaction_type IN (${inList}) THEN it.quantity ELSE 0 END AS qty_in,
            CASE WHEN it.transaction_type IN (${outList}) THEN it.quantity ELSE 0 END AS qty_out,
            SUM(
              CASE WHEN it.transaction_type IN (${inList}) THEN it.quantity
                   WHEN it.transaction_type IN (${outList}) THEN -it.quantity
                   ELSE 0 END
            ) OVER (PARTITION BY it.item_code, it.size, it.lot_no ORDER BY it.created_at, it.id) AS running_balance
     FROM inventory_transactions it
     JOIN warehouses w ON w.id = it.warehouse_id
     JOIN warehouse_locations wl ON wl.id = it.location_id
     LEFT JOIN quality_inspections qi ON qi.id = it.quality_inspection_id
     LEFT JOIN production_order po ON po.id = it.production_order_id
     LEFT JOIN users u ON u.id = it.created_by
     ${where}
     ORDER BY it.created_at, it.id`,
    params
  );
  return rows;
}

module.exports = { insert, findById, findByQualityInspectionId, findAll, getLedger };
