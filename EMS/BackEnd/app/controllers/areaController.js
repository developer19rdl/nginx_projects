const { connection, CustomError } = require('../config/dbSql2');


exports.getAreasWithLocation = async (req, res) => {
  try {
    const { regionId, locationId } = req.body;

    let sql = `
      SELECT 
        areas.id,
        areas.areaName,
        areas.description,
        locations.locationName,
        locations.id AS locationId,
        regions.regionName
      FROM 
        areas
      INNER JOIN 
        locations ON areas.locationId = locations.id
      INNER JOIN 
        regions ON locations.regionId = regions.id
    `;

    const conditions = [];
    const values = [];

    if (regionId) {
      conditions.push('regions.id = ?');
      values.push(regionId);
    }

    if (locationId) {
      conditions.push('locations.id = ?');
      values.push(locationId);
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    const [rows] = await connection.execute(sql, values);

    res.status(200).json({
      status: true,
      message: 'Areas fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching areas:', err);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};



exports.addArea = async (req, res) => {
  try {
    const { regionId,locationId, areaName, description } = req.body;

    if (!regionId || !locationId || !areaName) {
      return res.status(400).json({ message: 'Location ID and Area Name are required' });
    }

    const sql = 'INSERT INTO areas (regionId,locationId, areaName, description) VALUES (?, ?, ?, ?)';
    await connection.execute(sql, [regionId,locationId, areaName, description]);

    res.status(201).json({ message: 'Area added successfully' });
  } catch (err) {
    console.error('Error adding area:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const areaId = req.params.id;
    const { regionId, locationId, areaName, description } = req.body;

    if (!regionId || !locationId || !areaName) {
      return res.status(400).json({ message: 'Region ID, Location ID and Area Name are required' });
    }

    const sql = `
      UPDATE areas 
      SET regionId = ?, locationId = ?, areaName = ?, description = ?
      WHERE id = ?
    `;

    const [result] = await connection.execute(sql, [
      regionId, 
      locationId, 
      areaName, 
      description, 
      areaId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Area not found' });
    }

    res.status(200).json({ message: 'Area updated successfully' });
  } catch (err) {
    console.error('Error updating area:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.deleteArea = async (req, res) => {
  try {
    const areaId = req.params.id;

    const sql = 'DELETE FROM areas WHERE id = ?';
    const [result] = await connection.execute(sql, [areaId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Area not found' });
    }

    res.status(200).json({ message: 'Area deleted successfully' });
  } catch (err) {
    console.error('Error deleting area:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};