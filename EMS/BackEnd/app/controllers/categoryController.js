const { connection, CustomError } = require('../config/dbSql2');

exports.postMainCategory = async (req, res) => {
  try {
    const { categoryName, categoryDesc, plantId, buildingId, floorId, categoryKind, sortOrder } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // sortOrder is optional — blank/undefined stays NULL, which the tree/floor-
    // overview queries treat as "sort alphabetically" (see dashboardController.js).
    const [result] = await connection.execute(
      `INSERT INTO category (plantId, buildingId, floorId, categoryName, categoryDesc, categoryKind, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [plantId, buildingId, floorId, categoryName, categoryDesc || null, categoryKind || 'Energy Meter', sortOrder === '' || sortOrder == null ? null : sortOrder]
    );

    return res.status(201).json({
      message: 'Category added successfully',
      categoryId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server error' });
  }
};


// UPDATE category by ID


exports.updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      plantId, buildingId, floorId, categoryName, categoryDesc, categoryKind, sortOrder
    } = req.body;

    let updateSql = `
      UPDATE category
      SET plantId=?, buildingId=?, floorId=?, categoryName=?, categoryDesc=?, categoryKind=?, sortOrder=?
    `;
    const values = [
      plantId, buildingId, floorId, categoryName, categoryDesc, categoryKind || 'Energy Meter',
      sortOrder === '' || sortOrder == null ? null : sortOrder,
    ];

    // If image is included, store and update path
   
    updateSql += ` WHERE id = ?`;
    values.push(id);

    await connection.execute(updateSql, values);

    return res.status(200).json({
      status: true,
      message: 'category updated successfully'
    });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.getMainCategory = async (req, res) => {
  try {
    const { id } = req.params;

    let query = 'SELECT * FROM category';
    let params = [];

    if (id) {
      query += ' WHERE id = ?';
      params.push(id);
    }

    const [rows] = await connection.execute(query, params);

    if (id && rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: id ? 'Category fetched successfully' : 'All categories fetched successfully',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: [],
    });
  }
};



exports.deleteMainCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    // Check if category exists
    const [existing] = await connection.execute(
      'SELECT * FROM category WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await connection.execute('DELETE FROM category WHERE id = ?', [id]);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Report dropdown helpers ──────────────────────────────────────────────────

exports.buildingDropDown = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      `SELECT id, buildingName FROM buildings ORDER BY buildingName`
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.floorDropDown = async (req, res) => {
  try {
    const { buildingId } = req.body;
    let query = `SELECT id, floorName FROM floors`;
    const params = [];
    if (buildingId) { query += ` WHERE buildingId = ?`; params.push(buildingId); }
    query += ` ORDER BY floorName`;
    const [rows] = await connection.execute(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.categoryDropDown = async (req, res) => {
  try {
    const { buildingId, floorId } = req.body;
    let query = `SELECT id, categoryName FROM category WHERE 1=1`;
    const params = [];
    if (buildingId) { query += ` AND buildingId = ?`; params.push(buildingId); }
    if (floorId)    { query += ` AND floorId = ?`;    params.push(floorId); }
    query += ` ORDER BY COALESCE(sortOrder, 999999), categoryName`;
    const [rows] = await connection.execute(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get meters linked to a category (and optional subcategory) via meter_groups
exports.categoryMeterDropDown = async (req, res) => {
  try {
    const { buildingId, categoryId, subCategoryId } = req.body;
    let query = `
      SELECT DISTINCT m.id, m.displayName
      FROM meter_groups mg
      INNER JOIN meters m ON m.id = mg.meterId
      WHERE mg.meterId IS NOT NULL AND mg.meterId > 0
    `;
    const params = [];
    if (buildingId)    { query += ` AND mg.buildingId = ?`;    params.push(buildingId); }
    if (categoryId)    { query += ` AND mg.categoryId = ?`;    params.push(categoryId); }
    if (subCategoryId) { query += ` AND mg.subCategoryId = ?`; params.push(subCategoryId); }
    query += ` ORDER BY m.displayName`;
    const [rows] = await connection.execute(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};