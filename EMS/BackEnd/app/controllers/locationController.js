const { connection, CustomError } = require('../config/dbSql2');



exports.getAllLocations = async (req, res) => {
  try {
    const { regionId } = req.body;

    let selectSql = `
      SELECT locations.id, locations.locationName, locations.description,
             locations.latitude, locations.longitude, locations.city,
             locations.state, locations.plantType, locations.status,
             locations.dashboardPath, locations.contactEmail,
             regions.regionName
      FROM locations
      INNER JOIN regions ON regions.id = locations.regionId
    `;
    const values = [];

    if (regionId) {
      selectSql += ` WHERE locations.regionId = ?`;
      values.push(regionId);
    }

    const [rows] = await connection.execute(selectSql, values);

    res.status(200).json({
      status: true,
      message: 'Locations fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.getPlantMapData = async (req, res) => {
  try {
    const selectSql = `
      SELECT l.id, l.locationName, l.description, l.latitude, l.longitude,
             l.city, l.state, l.plantType, l.status, l.dashboardPath,
             l.contactEmail, r.regionName
      FROM locations l
      INNER JOIN regions r ON r.id = l.regionId
      WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      ORDER BY l.state, l.locationName
    `;
    const [rows] = await connection.execute(selectSql);

    res.status(200).json({
      status: true,
      message: 'Plant map data fetched successfully',
      data: rows
    });
  } catch (err) {
    console.error('Error fetching plant map data:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};




exports.addLocations = async (req, res) => {
  try {
    const { regionId, locationName, description, latitude, longitude, city, state, plantType, status, dashboardPath, contactEmail } = req.body;

    if (!regionId || !locationName) {
      return res.status(400).json({
        status: false,
        message: 'Both regionId and locationName are required'
      });
    }

    const insertSql = `INSERT INTO locations
      (regionId, locationName, description, latitude, longitude, city, state, plantType, status, dashboardPath, contactEmail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await connection.execute(insertSql, [
      regionId, locationName, description,
      latitude || null, longitude || null, city || null,
      state || null, plantType || 'Manufacturing',
      status || 'active', dashboardPath || '/EMS_Dashboard', contactEmail || null
    ]);

    res.status(201).json({
      status: true,
      message: 'Location added successfully'
    });
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


exports.updateLocations = async (req, res) => {
  try {
    const LocationID = req.params.id;
    const { regionId,locationName, description } = req.body;

    if (!locationName) {
      return res.status(400).json({
        status: false,
        message: 'locationName name is required'
      });
    }

    const { latitude, longitude, city, state, plantType, status, dashboardPath, contactEmail } = req.body;
    const updateSql = `UPDATE locations SET
      regionId=?, locationName=?, description=?,
      latitude=?, longitude=?, city=?, state=?,
      plantType=?, status=?, dashboardPath=?, contactEmail=?
      WHERE id=?`;
    const [result] = await connection.execute(updateSql, [
      regionId, locationName, description,
      latitude || null, longitude || null, city || null, state || null,
      plantType || 'Manufacturing', status || 'active',
      dashboardPath || '/EMS_Dashboard', contactEmail || null,
      LocationID
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'location not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'location updated successfully'
    });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};



exports.deleteLocations = async (req, res) => {
  try {
    const regionId = req.params.id;

    const deleteSql = 'DELETE FROM locations WHERE id = ?';
    const [result] = await connection.execute(deleteSql, [regionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: 'Locations not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Locations deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting Locations:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};
