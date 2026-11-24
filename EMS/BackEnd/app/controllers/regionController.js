const { connection, CustomError } = require('../config/dbSql2');



exports.getAllRegions = async (req, res) => {
  try {
    const selectSql = 'SELECT * FROM regions';
    const [rows] = await connection.execute(selectSql);

    res.status(200).json({
      status: true,
      message: 'Regions fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching regions:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.addRegion = async (req, res) => {
  try {
    const { regionName, description } = req.body;

    if (!regionName) {
      return res.status(400).json({
        status: false,
        message: 'Region name is required'
      });
    }

    const insertSql = 'INSERT INTO regions (regionName, description) VALUES (?, ?)';
    await connection.execute(insertSql, [regionName, description]);

    res.status(201).json({
      status: true,
      message: 'Region added successfully'
    });
  } catch (err) {
    console.error('Error adding region:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.updateRegion = async (req, res) => {
  try {
    const regionId = req.params.id;
    const { regionName, description } = req.body;

    if (!regionName) {
      return res.status(400).json({
        status: false,
        message: 'Region name is required'
      });
    }

    const updateSql = 'UPDATE regions SET regionName = ?, description = ? WHERE id = ?';
    const [result] = await connection.execute(updateSql, [regionName, description, regionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'Region not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Region updated successfully'
    });
  } catch (err) {
    console.error('Error updating region:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};



exports.deleteRegion = async (req, res) => {
  try {
    const regionId = req.params.id;

    const deleteSql = 'DELETE FROM regions WHERE id = ?';
    const [result] = await connection.execute(deleteSql, [regionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'Region not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Region deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting region:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};
