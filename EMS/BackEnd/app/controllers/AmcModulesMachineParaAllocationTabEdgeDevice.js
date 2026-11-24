
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');

const utility = require('../utility/utilityFunction');

exports.store = async (req, res) => {
    try {
        const c = req.body;
        const companyCode = req.headers.companycode;
        const fileName1 = utility.storeFile(c.firmwareBinFile, 'edg');
        const storeQuery = ` INSERT INTO   edge_devices (deviceCategoryId , edgeDeviceName ,deviceTag,macAddress,firmwareVersion,hardwareModelVersion,firmwareBinFile) VALUES
        (? , ?, ?, ?, ?, ?, ?)`;
        const values = [c.deviceCategoryId, c.edgeDeviceName, c.deviceTag, c.macAddress, c.firmwareVersion, c.hardwareModelVersion, fileName1];

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
        const { deviceCategoryId, deviceCategoryName, edgeDeviceName, deviceTag, macAddress, firmwareVersion, hardwareModelVersion, firmwareBinFile } = req.body;
        const fileName1 = utility.storeFile(firmwareBinFile, 'edg');
        // Ensure all necessary data is provided

        const updateQuery = `
            UPDATE edge_devices
            SET deviceCategoryId = ?,edgeDeviceName = ?, deviceTag = ?, macAddress = ?, firmwareVersion = ?, hardwareModelVersion = ?, firmwareBinFile = ?
            WHERE id = ?`;
        const values = [deviceCategoryId, edgeDeviceName, deviceTag, macAddress, firmwareVersion, hardwareModelVersion, fileName1, id];

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


exports.deviceList = async (req, res) => {
    try {

        const { deviceCategoryId } = req.body;

        console.log("deviceCategoryId", deviceCategoryId);

        const [rows] = await connection.execute(
            'SELECT * FROM edge_devices WHERE deviceCategoryId = ?',
            [deviceCategoryId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Edge devices not found for the specified category"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category Device Lists",
            data: rows
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "An error occurred"
        });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM edge_devices WHERE id = ?`;
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
        const showQuery = `SELECT ed.*,d.deviceCategory as dcname FROM edge_devices ed  
                           INNER JOIN device_categories d on d.id=ed.deviceCategoryId`;
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





exports.showdeviceId = async (req, res) => {
    try {
        const { id } = req.body;
        console.log("id===", id)
        const showQuery = `SELECT id,edgeDeviceName FROM edge_devices 
                            where deviceCategoryId  = ?`;
        const [rows] = await connection.execute(showQuery, [id]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No vendors found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.showdevicename = async (req, res) => {
    try {

        const showQuery = `SELECT id,edgeDeviceName FROM edge_devices `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No data found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


