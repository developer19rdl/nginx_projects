
const { connection } = require('../config/dbSql2');



exports.store = async (req, res) => {
    try {
        const plant = req.body;

        // Check if the meter with the given deviceId and slaveId already exists
        const checkQuery = `
            SELECT * FROM plant_master
            WHERE plantName = ?
        `;
        const [plantFound] = await connection.execute(checkQuery, [plant.plantName]);

        if (plantFound.length > 0) {
            throw new Error("Duplicate entry for Plant");
        }

        // Insert the new meter data into the database
        const insertQuery = `
            INSERT INTO plant_master (plantName,plantDescription)
            VALUES (?, ?)
        `;
        const values = [plant.plantName, plant.plantDescription];
        // console.log("values", values);
        const [insertResult] = await connection.execute(insertQuery, values);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully added" });
        } else {
            throw new Error("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.update = async (req, res) => {
    try {
        const plant = req.body;
        const { id } = req.params;

        // Find the existing meter record
        const checkQuery = `
            SELECT * FROM plant_master
            WHERE id = ?
        `;
        const [plantRows] = await connection.execute(checkQuery, [id]);

        if (plantRows.length === 0) {
            throw new Error("plants not found");
        }

        // Check if the requested meter allocation already exists
        const checkExistingQuery = `
            SELECT * FROM plant_master
            WHERE plantName = ? AND id <> ?
        `;
        const [existingMeter] = await connection.execute(checkExistingQuery, [plant.plantName, id]);

        if (existingMeter.length > 0) {
            throw new Error(`${plant.plantName} is already allocated to another Plant`);
        }

        // Update the meter attributes
        const updateQuery = `
            UPDATE plant_master
            SET
                 plantName = ?,
                 plantDescription = ?
            WHERE
                id = ?
        `;
        const values = [plant.plantName, plant.plantDescription, id];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Plant updated successfully" });
        } else {
            throw new Error("Update failed, no rows affected");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM plant_master WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Deleted Successfully!" });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.show = async (req, res) => {
    try {

        const showQuery = `
        SELECT * FROM plant_master
        `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Plant Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.dropDown = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM plant_master
                           `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Drop down Plant Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.PlantTabList = async (req, res) => {
    try {
        // const showQuery = `SELECT * FROM plant_master
        //           `;

        

        const showQuery = `
        SELECT DISTINCT pm.*
        FROM plant_master AS pm
        JOIN meters m ON m.plantId = pm.id
        WHERE m.meterType = 'meter'
    `;


        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Tab Plant Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.feederList = async (req, res) => {
    try {
        // const showQuery = `SELECT * FROM plant_master
        //           `;
        const { plantId } = req.query;
        const showQuery = `
          SELECT displayName,plantId
          FROM meters 
          WHERE dashDisplayNumber = '2'
          AND plantId =  ?
        `;


        const [rows] = await connection.execute(showQuery, [plantId]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Feeder Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Feeder not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.searchPlantDropDown = async (req, res) => {
    try {
        const { incomerId, plantId, distributerId } = req.body;

        let showQuery = '';
        let queryParams = [];

        if (incomerId && plantId && distributerId) {
            // showQuery = `
            //     SELECT *
            //     FROM feeder_master 
            //     WHERE incomerId = ? AND plantId = ? AND distributerId = ?
            // `;

            showQuery = `
                SELECT fm.id, im.id as incomerId, im.incomerName, pm.id as plantId, pm.plantName, db.id as distributerId, db.distributorName, fm.feederName FROM feeder_master fm
                INNER JOIN incomer_master im ON im.id = fm.incomerId
                INNER JOIN plant_master pm ON pm.id = fm.plantId
                INNER JOIN distributors db ON db.id = fm.distributerId
                WHERE fm.incomerId = ? AND fm.plantId = ? AND fm.distributerId = ?
            `;

            queryParams = [incomerId, plantId, distributerId];

        } else if (incomerId && plantId) {
            // showQuery = `
            //     SELECT *
            //     FROM distributors 
            //     WHERE incomerId = ? AND plantId = ?
            // `;
            showQuery = `
                SELECT db.id, im.id as incomerId, im.incomerName, pm.id as plantId, pm.plantName, db.distributorName FROM distributors db
                INNER JOIN incomer_master im ON im.id = db.incomerId
                INNER JOIN plant_master pm ON pm.id = db.plantId
                WHERE db.incomerId = ? AND db.plantId = ?
            `;
            queryParams = [incomerId, plantId];

        } else if (incomerId) {
            // One value: incomerId
            // showQuery = `
            //     SELECT *
            //     FROM plant_master 
            //     WHERE incomerId = ?
            // `;
            showQuery = `
                SELECT pm.id, im.id as incomerId, im.incomerName, pm.plantName FROM plant_master pm 
                INNER JOIN incomer_master im ON im.id = pm.incomerId
                WHERE pm.incomerId = ?
            `;
            queryParams = [incomerId];

        } else {
            showQuery = `
                SELECT *
                FROM incomer_master
            `;
        }

        const [rows] = await connection.execute(showQuery, queryParams);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Search List", data: rows });
        } else {
            return res.status(200).json({ success: false, message: "Item not found", data: [] });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.reportPlantDropDown = async (req, res) => {
    try {
        const { plantId, distributerId, feederId } = req.body;

        let showQuery = '';
        let queryParams = [];


        if (plantId && distributerId && feederId) {


            showQuery = `
                SELECT  m.displayName , m.id, pm.id as plantId, pm.plantName, db.id as distributerId, db.distributorName, fm.feederName FROM meters m
                INNER JOIN plant_master pm ON pm.id = m.plantId
                INNER JOIN distributors db ON db.id = m.distributerId
                INNER JOIN feeder_master fm ON fm.id = m.feederId
                WHERE m.plantId = ? AND m.distributerId = ?  AND m.feederId = ? AND m.meterType = 'meter'
            `;

            queryParams = [plantId, distributerId, feederId];

        } else if (plantId && distributerId) {

            showQuery = `
                SELECT fm.id, pm.id as plantId,  db.id as distributerId, fm.feederName FROM feeder_master fm
                INNER JOIN plant_master pm ON pm.id = fm.plantId
                INNER JOIN distributors db ON db.id = fm.distributerId
                WHERE fm.plantId = ? AND fm.distributerId = ?
            `;

            queryParams = [plantId, distributerId];

        } else if (plantId) {

            showQuery = `
                SELECT db.id, pm.id as plantId,  db.distributorName FROM distributors db
                INNER JOIN plant_master pm ON pm.id = db.plantId
                WHERE db.plantId = ?
            `;
            queryParams = [plantId];

        } else {
            showQuery = `
                SELECT *
                FROM plant_master
            `;
            queryParams = [];
        }

        const [rows] = await connection.execute(showQuery, queryParams);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Search List", data: rows });
        } else {
            return res.status(200).json({ success: false, message: "Item not found", data: [] });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// Returns distinct incomers that have meters in the selected plant (or all if no plantId)
exports.incomerDropDown = async (req, res) => {
    try {
        const { plantId } = req.body;

        let query = `
            SELECT DISTINCT im.id, im.incomerName
            FROM incomer_master im
            INNER JOIN meters m ON m.incomerId = im.id
        `;
        const params = [];

        if (plantId) {
            query += ` WHERE m.plantId = ?`;
            params.push(plantId);
        }

        const [rows] = await connection.execute(query, params);
        return res.status(200).json({ success: true, message: "Incomer List", data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
