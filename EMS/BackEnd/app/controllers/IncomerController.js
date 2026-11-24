const { connection } = require('../config/dbSql2');

exports.showIncomerByplant = async (req, res) => {
    try {

        const showQuery = `
        SELECT * FROM incomer_master where plantId = ?
        `;
        const [rows] = await connection.execute(showQuery, [req.params.plantId]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Incomer Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Incomer not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.store = async (req, res) => {
    try {
        const incomerData = req.body;

        // console.log(incomerData)

        // Check if the meter with the given deviceId and slaveId already exists
        const checkQuery = `
            SELECT * FROM incomer_master
            WHERE incomerName = ?
        `;
        const [plantFound] = await connection.execute(checkQuery, [incomerData.incomerName]);

        if (plantFound.length > 0) {
            throw new Error("Duplicate entry for Plant");
        }

        // Insert the new meter data into the database
        const insertQuery = `
            INSERT INTO incomer_master (plantId,incomerName, description)
            VALUES (?,?, ?)
        `;
        const values = [incomerData.plantId, incomerData.incomerName, incomerData.description];

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
        const incomerData = req.body;
        const { id } = req.params;  // Using req.params to get the id from the path

        // Find the existing meter record
        const checkQuery = `
            SELECT * FROM incomer_master
            WHERE id = ?
        `;
        const [plantRows] = await connection.execute(checkQuery, [id]);

        if (plantRows.length === 0) {
            throw new Error("plants not found");
        }

        // Check if the requested meter allocation already exists
        const checkExistingQuery = `
            SELECT * FROM incomer_master
            WHERE plantId = ? AND incomerName = ? AND id <> ?
        `;
        const [existingMeter] = await connection.execute(checkExistingQuery, [incomerData.plantId, incomerData.incomerName, id]);

        if (existingMeter.length > 0) {
            throw new Error(`${incomerData.incomerName} is already allocated to another Plant`);
        }

        // Update the meter attributes
        const updateQuery = `
            UPDATE incomer_master
            SET
                plantId = ?,
                incomerName = ?,
                description = ?
            WHERE
                id = ?
        `;
        const values = [incomerData.plantId, incomerData.incomerName, incomerData.description, id];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "incomer_master updated successfully" });
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

        const deleteQuery = `DELETE FROM incomer_master WHERE id = ?`;
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
        const showQuery = `SELECT * FROM incomer_master
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
        const showQuery = `SELECT id,incomerName FROM incomer_master where plantId = ?`;
        const [rows] = await connection.execute(showQuery, [req.params.plantId]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Drop down Plant Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
