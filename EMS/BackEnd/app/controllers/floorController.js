const { connection, CustomError } = require('../config/dbSql2');
const { storeFile } = require('../utility/utilityFunction');
const path = require('path');


exports.addFloor = async (req, res) => {
  try {
    const { regionId, locationId, areaId, buildingId, floorName, image } = req.body;

    if (!regionId || !locationId || !areaId || !buildingId || !floorName || !image) {
      return res.status(400).json({
        status: false,
        message: 'regionId, locationId, areaId, buildingId, floorName, and image are required'
      });
    }

    // Store image using utility function (inside public/floor/)
    const imagePath = storeFile(image, 'floor');

    // Insert into DB
    const insertSql = `
      INSERT INTO floors (regionId, locationId, areaId, buildingId, floorName, imagePath)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(insertSql, [
      regionId,
      locationId,
      areaId,
      buildingId,
      floorName,
      imagePath
    ]);

    return res.status(201).json({
      status: true,
      message: 'Floor added successfully',
      floorId: result.insertId
    });
  } catch (err) {
    console.error('Error adding floor:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};



exports.getAllFloorsWithDetails = async (req, res) => {
  try {
    const { regionId, locationId, areaId, buildingId } = req.body;

    let sql = `
      SELECT 
        floors.id,
        regions.regionName,
        regions.id AS regionId,
        locations.locationName,
        locations.id AS locationId,
        areas.areaName,
        areas.id AS areaId,
        buildings.buildingName,
        buildings.id AS buildingId,
        floors.floorName,
        floors.imagePath,
        floors.createdAt
      FROM floors
      INNER JOIN buildings ON floors.buildingId = buildings.id
      INNER JOIN areas ON floors.areaId = areas.id
      INNER JOIN locations ON floors.locationId = locations.id
      INNER JOIN regions ON floors.regionId = regions.id
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

    if (areaId) {
      conditions.push('areas.id = ?');
      values.push(areaId);
    }

    if (buildingId) {
      conditions.push('buildings.id = ?');
      values.push(buildingId);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    const [rows] = await connection.execute(sql, values);

    res.status(200).json({
      status: true,
      message: 'Floors fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching floors:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      regionId,
      locationId,
      areaId,
      buildingId,
      floorName,
      image // optional base64
    } = req.body;

    if (!regionId || !locationId || !areaId || !buildingId || !floorName) {
      return res.status(400).json({
        status: false,
        message: 'regionId, locationId, areaId, buildingId, and floorName are required'
      });
    }

    let updateSql = `
      UPDATE floors
      SET regionId = ?, locationId = ?, areaId = ?, buildingId = ?, floorName = ?
    `;
    const values = [regionId, locationId, areaId, buildingId, floorName];

    // If image is included, store and update path
    if (image) {
      const imagePath = storeFile(image, 'floor'); // storeFile returns 'floor/filename.png'
      updateSql += `, imagePath = ?`;
      values.push(imagePath);
    }

    updateSql += ` WHERE id = ?`;
    values.push(id);

    const [result] = await connection.execute(updateSql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'Floor not found'
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Floor updated successfully'
    });
  } catch (err) {
    console.error('Error updating floor:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};



exports.deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;

    await connection.execute('DELETE FROM floors WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Floor deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting Floor:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.fetchFloorsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.query;

    const [rows] = await connection.execute(
      'SELECT id, floorName FROM floors WHERE buildingId = ?',
      [buildingId]
    );

    return res.status(200).json({
      status: true,
      message: 'Floors fetched successfully',
      data: rows
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};