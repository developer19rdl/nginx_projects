const { pool } = require('../config/database');
const ApiError = require('../utils/ApiError');

/** Locks (SELECT ... FOR UPDATE) and returns the balance row for one (item, size, lot, warehouse,
 * location), or null if it doesn't exist yet - MUST be called with a connection already inside an
 * open transaction, same convention as every other row-locking helper in this codebase. */
async function lockRow({ itemCode, size, lotNo, warehouseId, locationId }, connection) {
  const [rows] = await connection.query(
    `SELECT * FROM finished_goods_inventory
     WHERE item_code = :itemCode AND size = :size AND lot_no = :lotNo
       AND warehouse_id = :warehouseId AND location_id = :locationId
     FOR UPDATE`,
    { itemCode, size: size || '', lotNo: lotNo || '', warehouseId, locationId }
  );
  return rows[0] || null;
}

/** Adds to available_qty, creating the balance row if this (item,size,lot,warehouse,location)
 * combination has never been stocked before. Used by Quality Acceptance, Transfer-In, and
 * Adjustment-In. */
async function increaseAvailable({ itemCode, size, lotNo, warehouseId, locationId, quantity }, connection) {
  await connection.query(
    `INSERT INTO finished_goods_inventory (item_code, size, lot_no, warehouse_id, location_id, available_qty)
     VALUES (:itemCode, :size, :lotNo, :warehouseId, :locationId, :quantity)
     ON DUPLICATE KEY UPDATE available_qty = available_qty + VALUES(available_qty)`,
    { itemCode, size: size || '', lotNo: lotNo || '', warehouseId, locationId, quantity }
  );
}

/** Decreases available_qty, refusing to let it go negative (rule: inventory must never go
 * negative). Locks the row first so two concurrent dispatches/transfers/adjustments against the
 * same balance can't both read a stale "enough stock" answer. */
async function decreaseAvailable({ itemCode, size, lotNo, warehouseId, locationId, quantity }, connection) {
  const row = await lockRow({ itemCode, size, lotNo, warehouseId, locationId }, connection);
  const available = Number(row?.available_qty) || 0;
  if (available < quantity) {
    throw ApiError.badRequest(
      `Insufficient available stock for ${itemCode}${size ? ` (${size})` : ''}: have ${available}, need ${quantity}`
    );
  }
  await connection.query(
    `UPDATE finished_goods_inventory SET available_qty = available_qty - :quantity
     WHERE item_code = :itemCode AND size = :size AND lot_no = :lotNo AND warehouse_id = :warehouseId AND location_id = :locationId`,
    { itemCode, size: size || '', lotNo: lotNo || '', warehouseId, locationId, quantity }
  );
}

/** Moves quantity from available to hold (Stock Hold) - total on-hand is unchanged. */
async function moveToHold({ itemCode, size, lotNo, warehouseId, locationId, quantity }, connection) {
  const row = await lockRow({ itemCode, size, lotNo, warehouseId, locationId }, connection);
  const available = Number(row?.available_qty) || 0;
  if (available < quantity) {
    throw ApiError.badRequest(`Insufficient available stock to hold for ${itemCode}: have ${available}, need ${quantity}`);
  }
  await connection.query(
    `UPDATE finished_goods_inventory SET available_qty = available_qty - :quantity, hold_qty = hold_qty + :quantity
     WHERE item_code = :itemCode AND size = :size AND lot_no = :lotNo AND warehouse_id = :warehouseId AND location_id = :locationId`,
    { itemCode, size: size || '', lotNo: lotNo || '', warehouseId, locationId, quantity }
  );
}

/** Moves quantity back from hold to available (Stock Release). */
async function releaseFromHold({ itemCode, size, lotNo, warehouseId, locationId, quantity }, connection) {
  const row = await lockRow({ itemCode, size, lotNo, warehouseId, locationId }, connection);
  const held = Number(row?.hold_qty) || 0;
  if (held < quantity) {
    throw ApiError.badRequest(`Insufficient held stock to release for ${itemCode}: on hold ${held}, need ${quantity}`);
  }
  await connection.query(
    `UPDATE finished_goods_inventory SET available_qty = available_qty + :quantity, hold_qty = hold_qty - :quantity
     WHERE item_code = :itemCode AND size = :size AND lot_no = :lotNo AND warehouse_id = :warehouseId AND location_id = :locationId`,
    { itemCode, size: size || '', lotNo: lotNo || '', warehouseId, locationId, quantity }
  );
}

/** Per Item+Size rollup across every batch/warehouse/location - "Get Inventory". */
async function getSummary({ itemCode } = {}) {
  const where = itemCode ? 'WHERE item_code = :itemCode' : '';
  const [rows] = await pool.query(
    `SELECT item_code, size,
            SUM(available_qty) AS available_qty, SUM(reserved_qty) AS reserved_qty, SUM(hold_qty) AS hold_qty,
            SUM(available_qty + reserved_qty + hold_qty) AS total_qty
     FROM finished_goods_inventory ${where}
     GROUP BY item_code, size ORDER BY item_code, size`,
    { itemCode }
  );
  return rows;
}

/** Per-batch, per-warehouse, per-location breakdown - "Get Batch Stock". */
async function getBatchStock({ itemCode, size, lotNo } = {}) {
  const conditions = [];
  const params = {};
  if (itemCode) {
    conditions.push('fgi.item_code = :itemCode');
    params.itemCode = itemCode;
  }
  if (size != null && size !== '') {
    conditions.push('fgi.size = :size');
    params.size = size;
  }
  if (lotNo) {
    conditions.push('fgi.lot_no = :lotNo');
    params.lotNo = lotNo;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT fgi.*, w.warehouse_code, w.warehouse_name, wl.location_code, wl.location_name
     FROM finished_goods_inventory fgi
     JOIN warehouses w ON w.id = fgi.warehouse_id
     JOIN warehouse_locations wl ON wl.id = fgi.location_id
     ${where}
     ORDER BY fgi.item_code, fgi.size, fgi.lot_no`,
    params
  );
  return rows;
}

module.exports = { lockRow, increaseAvailable, decreaseAvailable, moveToHold, releaseFromHold, getSummary, getBatchStock };
