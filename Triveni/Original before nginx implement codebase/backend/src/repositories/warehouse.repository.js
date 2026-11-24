const { pool } = require('../config/database');

async function findAllWarehouses({ activeOnly = true } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM warehouses ${where} ORDER BY warehouse_code`);
  return rows;
}

async function findWarehouseById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM warehouses WHERE id = :id`, { id });
  return rows[0] || null;
}

async function findLocationsByWarehouse(warehouseId, { activeOnly = true } = {}) {
  const conditions = ['warehouse_id = :warehouseId'];
  if (activeOnly) conditions.push('is_active = 1');
  const [rows] = await pool.query(
    `SELECT * FROM warehouse_locations WHERE ${conditions.join(' AND ')} ORDER BY location_code`,
    { warehouseId }
  );
  return rows;
}

async function findLocationById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM warehouse_locations WHERE id = :id`, { id });
  return rows[0] || null;
}

/** The single seeded warehouse/location Phase 1 posts every automatic movement to (Quality
 * Acceptance receipts, and the default for actions that don't specify one). Phase 2's Warehouse
 * Master UI will let more be added; this just always resolves the first active one so today's
 * single-warehouse setup needs no explicit selection anywhere. */
async function findDefaultLocation(connection = pool) {
  const [rows] = await connection.query(
    `SELECT wl.* FROM warehouse_locations wl
     JOIN warehouses w ON w.id = wl.warehouse_id
     WHERE wl.is_active = 1 AND w.is_active = 1
     ORDER BY w.id, wl.id LIMIT 1`
  );
  return rows[0] || null;
}

async function createWarehouse({ warehouseCode, warehouseName }) {
  const [result] = await pool.query(
    `INSERT INTO warehouses (warehouse_code, warehouse_name) VALUES (:warehouseCode, :warehouseName)`,
    { warehouseCode, warehouseName }
  );
  return findWarehouseById(result.insertId);
}

async function setWarehouseActive(id, isActive) {
  await pool.query(`UPDATE warehouses SET is_active = :isActive WHERE id = :id`, { id, isActive: isActive ? 1 : 0 });
  return findWarehouseById(id);
}

async function createLocation({ warehouseId, locationCode, locationName }) {
  const [result] = await pool.query(
    `INSERT INTO warehouse_locations (warehouse_id, location_code, location_name) VALUES (:warehouseId, :locationCode, :locationName)`,
    { warehouseId, locationCode, locationName: locationName ?? null }
  );
  return findLocationById(result.insertId);
}

async function setLocationActive(id, isActive) {
  await pool.query(`UPDATE warehouse_locations SET is_active = :isActive WHERE id = :id`, { id, isActive: isActive ? 1 : 0 });
  return findLocationById(id);
}

/** Every location across every warehouse (active by default) - powers the master list page,
 * which shows the whole warehouse/location tree at once rather than one warehouse at a time. */
async function findAllLocations({ activeOnly = true } = {}) {
  const where = activeOnly ? 'WHERE wl.is_active = 1' : '';
  const [rows] = await pool.query(
    `SELECT wl.*, w.warehouse_code, w.warehouse_name
     FROM warehouse_locations wl JOIN warehouses w ON w.id = wl.warehouse_id
     ${where} ORDER BY w.warehouse_code, wl.location_code`
  );
  return rows;
}

module.exports = {
  findAllWarehouses,
  findWarehouseById,
  findLocationsByWarehouse,
  findLocationById,
  findDefaultLocation,
  createWarehouse,
  setWarehouseActive,
  createLocation,
  setLocationActive,
  findAllLocations,
};
