const { pool } = require('../config/database');

const BASE_SELECT = `SELECT m.* FROM machines m`;

async function findById(id, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE m.id = :id`, { id });
  return rows[0] || null;
}

async function findByCode(machineCode, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE m.machine_code = :machineCode`, { machineCode });
  return rows[0] || null;
}

/** Resolves an MQTT production message's Device_ID + Slave_ID back to a machine - used only for
 * diagnostics (telling "unknown device" apart from "known device, nothing running right now" in
 * mqttProduction.service.js logs); the actual update path re-joins this itself in one query
 * (poDetail.repository.js#findActiveByDeviceSlave). */
async function findByDeviceSlave(deviceId, slaveId, connection = pool) {
  const [rows] = await connection.query(`${BASE_SELECT} WHERE m.device_id = :deviceId AND m.slave_id = :slaveId`, {
    deviceId,
    slaveId,
  });
  return rows[0] || null;
}

/** Batch-resolves machine codes to rows (active machines only), for the Excel import's Machine
 * column - mirrors itemRepository.findCodesMap. */
async function findCodesMap(machineCodes, connection = pool) {
  if (!machineCodes.length) return new Map();
  const [rows] = await connection.query(
    `SELECT * FROM machines WHERE machine_code IN (:machineCodes) AND is_active = 1`,
    { machineCodes }
  );
  return new Map(rows.map((r) => [r.machine_code, r]));
}

async function findAll({ search, status, limit, offset }) {
  const conditions = ['m.is_active = 1'];
  const params = {};
  if (search) {
    conditions.push('(m.machine_code LIKE :search OR m.machine_name LIKE :search)');
    params.search = `%${search}%`;
  }
  if (status) {
    conditions.push('m.status = :status');
    params.status = status;
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const [rows] = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY m.machine_code LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM machines m ${where}`, params);
  return { rows, total };
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO machines (machine_code, machine_name, machine_type, device_id, slave_id, production_rate, capacity_per_day, location, status, created_by)
     VALUES (:machineCode, :machineName, :machineType, :deviceId, :slaveId, :productionRate, :capacityPerDay, :location, :status, :createdBy)`,
    {
      machineCode: data.machineCode,
      machineName: data.machineName,
      machineType: data.machineType ?? null,
      deviceId: data.deviceId ?? null,
      slaveId: data.slaveId ?? null,
      productionRate: data.productionRate,
      capacityPerDay: data.capacityPerDay ?? null,
      location: data.location ?? null,
      status: data.status || 'Available',
      createdBy: data.createdBy ?? null,
    }
  );
  return findById(result.insertId);
}

async function update(id, data, updatedBy) {
  await pool.query(
    `UPDATE machines SET
      machine_name = :machineName, machine_type = :machineType, device_id = :deviceId, slave_id = :slaveId,
      production_rate = :productionRate, capacity_per_day = :capacityPerDay, location = :location,
      status = :status, is_active = :isActive, updated_by = :updatedBy
     WHERE id = :id`,
    {
      id,
      machineName: data.machineName,
      machineType: data.machineType ?? null,
      deviceId: data.deviceId ?? null,
      slaveId: data.slaveId ?? null,
      productionRate: data.productionRate,
      capacityPerDay: data.capacityPerDay ?? null,
      location: data.location ?? null,
      status: data.status,
      isActive: data.isActive ?? 1,
      updatedBy: updatedBy ?? null,
    }
  );
  return findById(id);
}

async function updateStatus(id, status, updatedBy) {
  await pool.query(`UPDATE machines SET status = :status, updated_by = :updatedBy WHERE id = :id`, {
    id,
    status,
    updatedBy: updatedBy ?? null,
  });
  return findById(id);
}

/** Soft-delete: flips is_active off rather than a hard DELETE, since machine_planning rows may
 * still reference this machine - it just disappears from the active machine list (and therefore
 * every dropdown/assignment screen) going forward. */
async function deactivate(id, updatedBy) {
  await pool.query(`UPDATE machines SET is_active = 0, updated_by = :updatedBy WHERE id = :id`, {
    id,
    updatedBy: updatedBy ?? null,
  });
}

module.exports = { findById, findByCode, findByDeviceSlave, findCodesMap, findAll, create, update, updateStatus, deactivate };
