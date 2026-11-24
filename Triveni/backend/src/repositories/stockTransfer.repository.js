const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT st.*,
         fw.warehouse_code AS from_warehouse_code, fl.location_code AS from_location_code,
         tw.warehouse_code AS to_warehouse_code, tl.location_code AS to_location_code,
         u.full_name AS created_by_name
  FROM stock_transfers st
  JOIN warehouses fw ON fw.id = st.from_warehouse_id
  JOIN warehouse_locations fl ON fl.id = st.from_location_id
  JOIN warehouses tw ON tw.id = st.to_warehouse_id
  JOIN warehouse_locations tl ON tl.id = st.to_location_id
  LEFT JOIN users u ON u.id = st.created_by
`;

async function create(data, connection) {
  const [result] = await connection.query(
    `INSERT INTO stock_transfers
       (transfer_no, item_code, size, lot_no, quantity, from_warehouse_id, from_location_id,
        to_warehouse_id, to_location_id, remarks, created_by)
     VALUES
       (:transferNo, :itemCode, :size, :lotNo, :quantity, :fromWarehouseId, :fromLocationId,
        :toWarehouseId, :toLocationId, :remarks, :createdBy)`,
    {
      transferNo: data.transferNo,
      itemCode: data.itemCode,
      size: data.size || '',
      lotNo: data.lotNo || '',
      quantity: data.quantity,
      fromWarehouseId: data.fromWarehouseId,
      fromLocationId: data.fromLocationId,
      toWarehouseId: data.toWarehouseId,
      toLocationId: data.toLocationId,
      remarks: data.remarks ?? null,
      createdBy: data.createdBy ?? null,
    }
  );
  return result.insertId;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE st.id = :id`, { id });
  return rows[0] || null;
}

module.exports = { create, findById };
