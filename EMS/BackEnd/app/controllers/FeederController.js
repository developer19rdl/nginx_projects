const { connection } = require('../config/dbSql2');

exports.fetchFeeder = async (req, res) => {
    try {
        const { distributerId } = req.query;

        const [rows] = await connection.execute(`
            SELECT id, feederName FROM feeder_master
            WHERE distributerId = ?
        `, [distributerId]);

        return res.status(200).json({
            success: true,
            message: "Feeder Lists",
            data: rows
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}

exports.showDropdown = async (req, res) => {
    try {

        const { plantId, incomerId, distributorId } = req.query;

        let showQuery = `
            SELECT 
                db.id AS distributorId,
                db.distributorName,

                fm.id AS id,
                fm.feederName,

                im.id AS incomerId,
                im.incomerName,

                pm.id AS plantId,
                pm.plantName

            FROM distributors db

            INNER JOIN feeder_master fm
                ON fm.distributerId = db.id

            INNER JOIN incomer_master im 
                ON im.id = db.incomerId

            INNER JOIN plant_master pm 
                ON pm.id = db.plantId

            WHERE 1=1
        `;

        let params = [];

        // ✅ Filter by plantId
        if (plantId) {
            showQuery += ` AND db.plantId = ?`;
            params.push(plantId);
        }

        // ✅ Filter by incomerId
        if (incomerId) {
            showQuery += ` AND db.incomerId = ?`;
            params.push(incomerId);
        }

        // ✅ Filter by distributorId
        if (distributorId) {
            showQuery += ` AND db.id = ?`;
            params.push(distributorId);
        }

        const [rows] = await connection.execute(showQuery, params);

        return res.status(200).json({
            success: true,
            message: rows.length > 0
                ? "Feeder Lists"
                : "No data found",
            data: rows || []
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred'
        });
    }
};

exports.store = async (req, res) => {
    try {
        const distriButer = req.body;

        // Check if the meter with the given deviceId and slaveId already exists
        const checkQuery = `
            SELECT * FROM feeder_master
            WHERE feederName = ?
        `;
        const [plantFound] = await connection.execute(checkQuery, [distriButer.feederName]);

        if (plantFound.length > 0) {
            throw new Error("Duplicate entry for Plant");
        }

        // Insert the new meter data into the database
        const insertQuery = `
            INSERT INTO feeder_master (incomerId, plantId, distributerId, feederName , description)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [distriButer.incomerId, distriButer.plantId, distriButer.distributerId, distriButer.feederName, distriButer.description];

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
        const distriButer = req.body;
        const { id } = req.params;

        console.log("ididididididididid", id)

        // Find the existing meter record
        const checkQuery = `
            SELECT * FROM feeder_master
            WHERE id = ?
        `;
        const [plantRows] = await connection.execute(checkQuery, [id]);

        if (plantRows.length === 0) {
            throw new Error("Feeder or Subdistributer not found");
        }

        // Check if the requested meter allocation already exists
        const checkExistingQuery = `
            SELECT * FROM feeder_master
            WHERE feederName = ? AND id <> ?
        `;
        const [existingMeter] = await connection.execute(checkExistingQuery, [distriButer.feederName, id]);

        if (existingMeter.length > 0) {
            throw new Error(`${distriButer.feederName} is already allocated to another Plant`);
        }

        // Update the meter attributes
        const updateQuery = `
            UPDATE feeder_master
            SET
                incomerId = ?,
                plantId = ?,
                distributerId = ?,
                feederName = ?,
                description = ?
            WHERE
                id = ?
        `;
        const values = [distriButer.incomerId, distriButer.plantId, distriButer.distributerId, distriButer.feederName, distriButer.description, id];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Feeder master updated successfully" });
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

        const deleteQuery = `DELETE FROM feeder_master WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Deleted Successfully!" });
        } else {
            return res.status(404).json({ success: false, message: "Distributor not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM feeder_master
                           `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Plant Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found", data: [] });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.dropDown = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM feeder_master
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
