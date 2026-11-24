const { connection } = require('../config/dbSql2');

exports.fetchDistributor = async (req, res) => {
    try {
        const [rows] = await connection.execute(`SELECT id, distributorName FROM distributors`);

        return res.status(200).json({
            success: true,
            message: "Distributor Lists",
            data: rows
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

exports.store = async (req, res) => {
    try {
        const distriButer = req.body;

        // Check if the meter with the given deviceId and slaveId already exists
        const checkQuery = `
            SELECT * FROM distributors
            WHERE distributorName = ?
        `;
        const [plantFound] = await connection.execute(checkQuery, [distriButer.distributorName]);

        if (plantFound.length > 0) {
            throw new Error("Duplicate entry for Plant");
        }

        // Insert the new meter data into the database
        const insertQuery = `
            INSERT INTO distributors (incomerId, plantId, distributorName, description)
            VALUES (?, ?, ?, ?)
        `;
        const values = [distriButer.incomerId, distriButer.plantId, distriButer.distributorName, distriButer.description];

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

        // Find the existing meter record
        const checkQuery = `
            SELECT * FROM distributors
            WHERE id = ?
        `;
        const [plantRows] = await connection.execute(checkQuery, [id]);

        if (plantRows.length === 0) {
            throw new Error("plants not found");
        }

        // Check if the requested meter allocation already exists
        const checkExistingQuery = `
            SELECT * FROM distributors
            WHERE distributorName = ? AND id <> ?
        `;
        const [existingMeter] = await connection.execute(checkExistingQuery, [distriButer.distributorName, id]);

        if (existingMeter.length > 0) {
            throw new Error(`${plant.distributorName} is already allocated to another Plant`);
        }

        // Update the meter attributes
        // Update the meter attributes
        const updateQuery = `
            UPDATE distributors
            SET
                incomerId = ?,
                plantId  = ?,
                distributorName = ?,
                description = ?
            WHERE
                id = ?
            `;

        const values = [distriButer.incomerId, distriButer.plantId, distriButer.distributorName, distriButer.description, id];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Distributors updated successfully" });
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

        const deleteQuery = `DELETE FROM distributors WHERE id = ?`;
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

// exports.show = async (req, res) => {
//     try {
//         const showQuery = ` SELECT db.id, im.id as incomerId, im.incomerName, pm.id as plantId, pm.plantName, db.distributorName, db.description FROM distributors db
//                 INNER JOIN incomer_master im ON im.id = db.incomerId
//                 INNER JOIN plant_master pm ON pm.id = db.plantId`;


//         const [rows] = await connection.execute(showQuery);

//         if (rows.length > 0) {
//             return res.status(200).json({ success: true, message: "Plant Lists", data: rows });
//         } else {
//             return res.status(404).json({ success: false, message: "Plant not found" });
//         }

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };
exports.show = async (req, res) => {
    try {

        const { plantId, incomerId } = req.query;

        let showQuery = `
            SELECT 
                db.id, 
                im.id AS incomerId, 
                im.incomerName, 
                pm.id AS plantId, 
                pm.plantName, 
                db.distributorName, 
                db.description 
            FROM distributors db
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

        const [rows] = await connection.execute(showQuery, params);
        return res.status(200).json({
            success: true,
            message: rows.length > 0
                ? "Distributor Lists"
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




exports.dropDown = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM distributors
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
