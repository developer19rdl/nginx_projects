
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection, CustomError } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        const companyCode = req.headers.companycode;
        const storeQuery = ` INSERT INTO   device_categories (deviceCategory,description) VALUES
        (?,?)`;
        const values = [c.deviceCategory, c.description];

        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "data addded successfully" });
        } else {
            throw new CustomError("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occured' });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { deviceCategory, description } = req.body;


        // Ensure all necessary data is provided
        if (!id || !deviceCategory || !description) {
            throw new CustomError("All fields are required!", 400);
        }

        const updateQuery = `
            UPDATE device_categories
            SET deviceCategory = ?, description = ?
            WHERE id = ? `;
        const values = [deviceCategory, description, id];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            throw new CustomError("No matching record found or no changes made", 404);
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM device_categories WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Record deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};





exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM device_categories`;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No vendors found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




