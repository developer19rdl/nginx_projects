
const { connection } = require('../config/dbSql2');

// Run migration_meter_category_kind.sql to add meterKind column to meter_category

exports.store = async (req, res) => {
  try {
    const { categoryName, meterKind } = req.body;
    if (!categoryName) throw new Error('categoryName is required');
    if (!meterKind) throw new Error('meterKind is required');

    const [existing] = await connection.execute(
      `SELECT id FROM meter_category WHERE categoryName = ? AND meterKind = ?`,
      [categoryName, meterKind]
    );
    if (existing.length > 0) throw new Error('Category already exists for this meter kind');

    const [result] = await connection.execute(
      `INSERT INTO meter_category (categoryName, meterKind) VALUES (?, ?)`,
      [categoryName, meterKind]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Category added successfully' });
    }
    throw new Error('Something went wrong');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const { meterKind } = req.query;
    let query = `SELECT * FROM meter_category`;
    const params = [];
    if (meterKind) {
      query += ` WHERE meterKind = ?`;
      params.push(meterKind);
    }
    query += ` ORDER BY id DESC`;
    const [rows] = await connection.execute(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, meterKind } = req.body;
    if (!categoryName) throw new Error('categoryName is required');
    const kind = meterKind || 'Energy Meter';

    const [existing] = await connection.execute(
      `SELECT id FROM meter_category WHERE categoryName = ? AND meterKind = ? AND id <> ?`,
      [categoryName, kind, id]
    );
    if (existing.length > 0) throw new Error('Category name already in use for this meter kind');

    const [result] = await connection.execute(
      `UPDATE meter_category SET categoryName = ?, meterKind = ? WHERE id = ?`,
      [categoryName, kind, id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Category updated successfully' });
    }
    throw new Error('Category not found');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.execute(
      `DELETE FROM meter_category WHERE id = ?`, [id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Category deleted successfully' });
    }
    return res.status(404).json({ success: false, message: 'Category not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
