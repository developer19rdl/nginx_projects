
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');





exports.store = async (req, res) => {
    try {
        const c = req.body;
        // if (!c.sensorCategoryName || !c.sensorName || !c.manufacture || !c.modelNumber || !c.sensorOutput) {
        //     return res.status(400).json({ success: false, message: "Missing required fields" });
        // }
        const companyCode = req.headers.companycode;
        // Query to get sensorCategoryId based on sensorCategoryName
        const categoryQuery = `SELECT id FROM sensor_categories WHERE id = ?`;
        const [categoryRows] = await connection.execute(categoryQuery, [c.sensorCategoryId]);
        if (!categoryRows || categoryRows.length === 0) {
            return res.status(404).json({ success: false, message: "Sensor category not found!" });
        }
        const sensorCategoryId = categoryRows[0].id;
        const storeQuery = `INSERT INTO sensor_units (sensorCategoryId,sensorName, manufacture, modelNumber, sensorOutput) VALUES (? ,?, ?, ?, ?)`;
        const values = [sensorCategoryId,c.sensorName, c.manufacture, c.modelNumber, c.sensorOutput];
        const [sRows] = await connection.execute(storeQuery, values);
        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data added successfully" });
        } else {
            throw new Error("Something went wrong during the insert operation!");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { sensorCategoryName, sensorName, manufacture, modelNumber, sensorOutput } = req.body;
        if (!sensorCategoryName || !sensorName || !manufacture || !modelNumber || !sensorOutput) {
            throw new CustomError("All fields are required!");
        }
        // Query to get sensorCategoryId based on sensorCategoryName
        const categoryQuery = `SELECT id FROM sensor_categories WHERE sensorCategoryName = ?`;
        const [categoryRows] = await connection.execute(categoryQuery, [sensorCategoryName]);
        if (categoryRows.length === 0) {
            throw new CustomError("Sensor category not found!");
        }
        const sensorCategoryId = categoryRows[0].id;
        const updateQuery = `
            UPDATE sensor_units
            SET sensorCategoryId = ?, sensorName = ?, manufacture = ?, modelNumber = ?, sensorOutput = ?
            WHERE id = ?`;
        const values = [sensorCategoryId, sensorName, manufacture, modelNumber, sensorOutput, id];
        const [uRows] = await connection.execute(updateQuery, values);
        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            throw new CustomError("No matching record found or no changes made", 404);
        }
    } catch (err) {
        console.error("Error: ", err); // Log the error for debugging purposes
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM sensor_units WHERE id = ?`;
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
        const showQuery = `SELECT su.*,sc.sensorCategoryName FROM sensor_units su 
        INNER JOIN sensor_categories sc on sc.id=su.sensorCategoryId   `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No Data found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
