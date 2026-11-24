
require('dotenv').config();
const { connection } = require('../config/dbSql2');

// Group utility meters to a category
exports.groupMeters = async (req, res) => {
  const conn = await connection.getConnection();
  await conn.beginTransaction();
  try {
    const { meterObj } = req.body;

    if (!Array.isArray(meterObj) || meterObj.length === 0) {
      throw new Error('Select at least one utility meter to group');
    }

    for (const m of meterObj) {
      const [dup] = await conn.query(
        `SELECT id FROM utility_meter_groups WHERE categoryId = ? AND subCategoryId <=> ? AND utilityMeterId = ?`,
        [m.categoryId, m.subCategoryId || null, m.utilityMeterId]
      );
      if (dup.length > 0) {
        throw new Error(`Duplicate: utilityMeterId ${m.utilityMeterId} already grouped under this category`);
      }
    }

    const values = meterObj.map((m) => [m.categoryId, m.subCategoryId || null, m.utilityMeterId]);
    await conn.query(
      `INSERT INTO utility_meter_groups (categoryId, subCategoryId, utilityMeterId) VALUES ?`,
      [values]
    );

    await conn.commit();
    return res.status(200).json({ success: true, message: 'Utility meters grouped successfully' });
  } catch (err) {
    await conn.rollback();
    return res.status(400).json({ success: false, message: err.message || 'Internal server error' });
  } finally {
    conn.release();
  }
};

// Get grouped utility meters for a category
exports.getGroupedMeters = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.body;

    if (!categoryId && !subCategoryId) {
      return res.status(400).json({ message: 'categoryId or subCategoryId is required' });
    }

    let query = `
      SELECT
        ug.id,
        ug.categoryId,
        ug.subCategoryId,
        um.id AS utilityMeterId,
        um.meterName,
        um.meterType,
        um.slaveId,
        um.uamSet,
        um.threshold,
        ed.edgeDeviceName,
        pm.plantName
      FROM utility_meter_groups ug
      JOIN utility_meters um ON ug.utilityMeterId = um.id
      LEFT JOIN edge_devices ed ON um.deviceId = ed.id
      LEFT JOIN plant_master pm ON um.plantId = pm.id
      WHERE 1=1
    `;
    const params = [];
    if (categoryId)    { query += ' AND ug.categoryId = ?';    params.push(categoryId); }
    if (subCategoryId) { query += ' AND ug.subCategoryId = ?'; params.push(subCategoryId); }

    const [rows] = await connection.execute(query, params);
    return res.status(200).json({ success: true, message: 'Utility grouped meters', data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// Ungroup utility meters by group row ids
exports.ungroupMeters = async (req, res) => {
  try {
    const { groupIds } = req.body;

    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      throw new Error('Select at least one meter to ungroup');
    }

    const placeholders = groupIds.map(() => '?').join(',');
    await connection.execute(`DELETE FROM utility_meter_groups WHERE id IN (${placeholders})`, groupIds);

    return res.status(200).json({ success: true, message: 'Utility meters ungrouped successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};
