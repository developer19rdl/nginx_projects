const { connection, CustomError } = require('../config/dbSql2');

exports.addSubCategory = async (req, res) => {
  try {
    const { categoryId, plantId, buildingId, floorId, subCategoryName, subCategoryDesc } = req.body;

    if (!categoryId || !subCategoryName) {
      return res.status(400).json({
        success: false,
        message: 'categoryId and subCategoryName are required',
      });
    }

    // Check if category exists
    const [cat] = await connection.execute(
      'SELECT * FROM category WHERE id = ?',
      [categoryId]
    );
    if (cat.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const [result] = await connection.execute(
      `INSERT INTO subcategory (plantId, buildingId, floorId, categoryId, subCategoryName, subCategoryDesc) VALUES (?, ?, ?, ?, ?, ?)`,
      [plantId, buildingId, floorId, categoryId, subCategoryName, subCategoryDesc || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Subcategory added successfully',
      subCategoryId: result.insertId,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// UPDATE category by ID


exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { plantId, buildingId, floorId, subCategoryName, subCategoryDesc } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Subcategory ID is required' });
    }

    const [existing] = await connection.execute('SELECT * FROM subcategory WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    await connection.execute(
      `UPDATE subcategory 
       SET plantId = ?, buildingId = ?, floorId = ?, subCategoryName = ?, subCategoryDesc = ? 
       WHERE id = ?`,
      [
        plantId || existing[0].plantId,
        buildingId || existing[0].buildingId,
        floorId || existing[0].floorId,
        subCategoryName || existing[0].subCategoryName,
        subCategoryDesc || existing[0].subCategoryDesc,
        id,
      ]
    );

    res.status(200).json({ success: true, message: 'Subcategory updated successfully' });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const query = `
      SELECT s.id, s.subCategoryName, s.subCategoryDesc, c.categoryName 
      FROM subcategory s
      JOIN category c ON s.categoryId = c.id
      WHERE s.categoryId = ?
    `;

    const [rows] = await connection.execute(query, [categoryId]);

    return res.status(200).json({
      success: true,
      message: 'Subcategories fetched successfully',
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server error',
    });
  }
};



exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await connection.execute('SELECT * FROM subcategory WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    await connection.execute('DELETE FROM subcategory WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Lightweight dropdown — returns id + subCategoryName filtered by categoryId
exports.subCategoryDropDown = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(200).json({ success: true, data: [] });
    }
    const [rows] = await connection.execute(
      `SELECT id, subCategoryName FROM subcategory WHERE categoryId = ? ORDER BY subCategoryName`,
      [categoryId]
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};