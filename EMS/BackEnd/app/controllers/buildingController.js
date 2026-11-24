const { connection, CustomError } = require('../config/dbSql2');
const { storeFile } = require('../utility/utilityFunction');
const path = require('path');


exports.getAllBuildingsWithDetails = async (req, res) => {
  try {
    const { regionId, locationId, areaId } = req.body;

    let sql = `
      SELECT 
        buildings.id,
        regions.regionName,
        locations.locationName,
        locations.id AS locationId,
        areas.id AS areaId,
        areas.areaName,
        buildings.buildingName,
        buildings.description,
        buildings.imagePath
      FROM buildings
      INNER JOIN areas ON buildings.areaId = areas.id
      INNER JOIN locations ON buildings.locationId = locations.id
      INNER JOIN regions ON buildings.regionId = regions.id
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

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    const [rows] = await connection.execute(sql, values);

    res.status(200).json({
      status: true,
      message: 'Buildings fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};




//     if (!regionId || !locationId || !areaId || !buildingName || !image) {
//       return res.status(400).json({
//         status: false,
//         message: 'regionId, locationId, areaId, buildingName, and image are required'
//       });
//     }

//     const imageName = `building_${Date.now()}.png`;
//     const relativePath = path.join('buildings', imageName);
//     const absolutePath = path.join('public', relativePath);
//     await storeFile(image, absolutePath);


exports.addBuilding = async (req, res) => {
  try {
    const {
      regionId,
      locationId,
      areaId,
      buildingName,
      description,
      image
    } = req.body;

    if (!regionId || !locationId || !areaId || !buildingName || !image) {
      return res.status(400).json({
        status: false,
        message: 'regionId, locationId, areaId, buildingName, and image are required'
      });
    }

    // Store image using utility function (inside public/building/)
    const imagePath = storeFile(image, 'building');

    // Insert into DB
    const insertSql = `
      INSERT INTO buildings (regionId, locationId, areaId, buildingName, description, imagePath)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(insertSql, [
      regionId,
      locationId,
      areaId,
      buildingName,
      description,
      imagePath
    ]);

    return res.status(201).json({
      status: true,
      message: 'Building added successfully'
    });
  } catch (err) {
    console.error('Error adding building:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      regionId,
      locationId,
      areaId,
      buildingName,
      description,
      image // optional base64
    } = req.body;

    if (!regionId || !locationId || !areaId || !buildingName) {
      return res.status(400).json({
        status: false,
        message: 'regionId, locationId, areaId, and buildingName are required'
      });
    }

    let updateSql = `
      UPDATE buildings
      SET regionId = ?, locationId = ?, areaId = ?, buildingName = ?, description = ?
    `;
    const values = [regionId, locationId, areaId, buildingName, description];

    // If image is included, store and update path
    if (image) {
      const imagePath = storeFile(image, 'building'); // storeFile returns 'building/filename.png'
      updateSql += `, imagePath = ?`;
      values.push(imagePath);
    }

    updateSql += ` WHERE id = ?`;
    values.push(id);

    await connection.execute(updateSql, values);

    return res.status(200).json({
      status: true,
      message: 'Building updated successfully'
    });
  } catch (err) {
    console.error('Error updating building:', err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;

    await connection.execute('DELETE FROM buildings WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Building deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting building:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.getBuildings = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      `SELECT *  FROM buildings`
    );
    res.status(200).json({
      status: true,
      message: 'Buildings fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};
