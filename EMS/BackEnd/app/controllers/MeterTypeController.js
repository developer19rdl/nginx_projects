
const { connection } = require('../config/dbSql2');

// SQL to create table (run once):
// CREATE TABLE meter_type_master (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   meterType VARCHAR(100) NOT NULL,
//   categoryId INT NOT NULL,
//   FOREIGN KEY (categoryId) REFERENCES meter_category(id)
// );

exports.store = async (req, res) => {
  try {
    const { meterType, categoryId } = req.body;
    if (!meterType || !categoryId) throw new Error('meterType and categoryId are required');

    const [existing] = await connection.execute(
      `SELECT id FROM meter_type_master WHERE meterType = ? AND categoryId = ?`,
      [meterType, categoryId]
    );
    if (existing.length > 0) throw new Error('Meter type already exists for this category');

    const [result] = await connection.execute(
      `INSERT INTO meter_type_master (meterType, categoryId) VALUES (?, ?)`,
      [meterType, categoryId]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Meter type added successfully' });
    }
    throw new Error('Something went wrong');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = `
      SELECT mt.*, mc.categoryName, mc.meterKind
      FROM meter_type_master mt
      LEFT JOIN meter_category mc ON mc.id = mt.categoryId
    `;
    const params = [];
    if (categoryId) {
      query += ` WHERE mt.categoryId = ?`;
      params.push(categoryId);
    }
    query += ` ORDER BY mt.id DESC`;
    const [rows] = await connection.execute(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { meterType, categoryId } = req.body;
    if (!meterType || !categoryId) throw new Error('meterType and categoryId are required');

    const [existing] = await connection.execute(
      `SELECT id FROM meter_type_master WHERE meterType = ? AND categoryId = ? AND id <> ?`,
      [meterType, categoryId, id]
    );
    if (existing.length > 0) throw new Error('Meter type already exists for this category');

    const [result] = await connection.execute(
      `UPDATE meter_type_master SET meterType = ?, categoryId = ? WHERE id = ?`,
      [meterType, categoryId, id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Meter type updated successfully' });
    }
    throw new Error('Meter type not found');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.execute(
      `DELETE FROM meter_type_master WHERE id = ?`, [id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Meter type deleted successfully' });
    }
    return res.status(404).json({ success: false, message: 'Meter type not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
