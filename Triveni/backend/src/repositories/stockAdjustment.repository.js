const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT sa.*, w.warehouse_code, wl.location_code, u.full_name AS created_by_name
  FROM stock_adjustments sa
  JOIN warehouses w ON w.id = sa.warehouse_id
  JOIN warehouse_locations wl ON wl.id = sa.location_id
  LEFT JOIN users u ON u.id = sa.created_by
`;

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO stock_adjustments (adjustment_no, item_code, size, lot_no, warehouse_id, location_id, quantity, direction, reason, created_by)
     VALUES (:adjustmentNo, :itemCode, :size, :lotNo, :warehouseId, :locationId, :quantity, :direction, :reason, :createdBy)`,
    {
      adjustmentNo: data.adjustmentNo,
      itemCode: data.itemCode,
      size: data.size || '',
      lotNo: data.lotNo || '',
      warehouseId: data.warehouseId,
      locationId: data.locationId,
      quantity: data.quantity,
      direction: data.direction,
      reason: data.reason,
      createdBy: data.createdBy ?? null,
    }
  );
  return result.insertId;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE sa.id = :id`, { id });
  return rows[0] || null;
}

module.exports = { create, findById };
