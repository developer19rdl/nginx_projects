const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT sh.*, w.warehouse_code, wl.location_code, hu.full_name AS held_by_name, ru.full_name AS released_by_name
  FROM stock_holds sh
  JOIN warehouses w ON w.id = sh.warehouse_id
  JOIN warehouse_locations wl ON wl.id = sh.location_id
  LEFT JOIN users hu ON hu.id = sh.held_by
  LEFT JOIN users ru ON ru.id = sh.released_by
`;

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO stock_holds (hold_no, item_code, size, lot_no, warehouse_id, location_id, quantity, reason, held_by)
     VALUES (:holdNo, :itemCode, :size, :lotNo, :warehouseId, :locationId, :quantity, :reason, :heldBy)`,
    {
      holdNo: data.holdNo,
      itemCode: data.itemCode,
      size: data.size || '',
      lotNo: data.lotNo || '',
      warehouseId: data.warehouseId,
      locationId: data.locationId,
      quantity: data.quantity,
      reason: data.reason,
      heldBy: data.heldBy ?? null,
    }
  );
  return result.insertId;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE sh.id = :id`, { id });
  return rows[0] || null;
}

async function findAll({ status } = {}) {
  const where = status ? 'WHERE sh.status = :status' : '';
  const [rows] = await pool.query(`${BASE_SELECT} ${where} ORDER BY sh.held_at DESC`, { status });
  return rows;
}

async function markReleased(id, { releasedBy, releaseRemarks }, connection) {
  await connection.query(
    `UPDATE stock_holds SET status = 'RELEASED', released_by = :releasedBy, released_at = NOW(), release_remarks = :releaseRemarks
     WHERE id = :id`,
    { id, releasedBy: releasedBy ?? null, releaseRemarks: releaseRemarks ?? null }
  );
}

module.exports = { create, findById, findAll, markReleased };
