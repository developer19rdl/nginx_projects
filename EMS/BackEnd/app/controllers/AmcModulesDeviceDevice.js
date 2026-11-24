
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');



exports.store = async (req, res) => {
    try {
        const {
            companyCode,
            locationId,
            branchId,
            facilityId,
            buildingId,
            floorId,
            zoneId,
            deviceCategory,
            deviceName,
            deviceTag,
            macAddress,
            firmwareVersion,
            hardwareVersion,
            coordinates
        } = req.body;

        const storeQuery = `INSERT INTO devices (
            companyCode,
            locationId,
            branchId,
            facilityId,
            buildingId,
            floorId,
            zoneId,
            deviceCategory,
            deviceName,
            deviceTag,
            macAddress,
            firmwareVersion,
            hardwareVersion,
            inActiveStatus,
            coordinates
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            companyCode,
            locationId,
            branchId,
            facilityId,
            buildingId,
            floorId,
            zoneId,
            deviceCategory,
            deviceName,
            deviceTag,
            macAddress,
            firmwareVersion,
            hardwareVersion,
            '0',
            coordinates
        ];

        const [result] = await connection.execute(storeQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully added" });
        } else {
            throw new Error("Something went wrong!");
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.update = async (req, res) => {
    try {
        const {
            companyCode,
            locationId,
            branchId,
            facilityId,
            buildingId,
            floorId,
            zoneId,
            deviceCategory,
            deviceName,
            deviceTag,
            macAddress,
            firmwareVersion,
            hardwareVersion,
            coordinates
        } = req.body;

        const { id } = req.params;

        const updateQuery = `UPDATE devices SET
            companyCode = ?,
            locationId = ?,
            branchId = ?,
            facilityId = ?,
            buildingId = ?,
            floorId = ?,
            zoneId = ?,
            deviceCategory = ?,
            deviceName = ?,
            deviceTag = ?,
            macAddress = ?,
            firmwareVersion = ?,
            hardwareVersion = ?,
            coordinates = ?
            WHERE id = ?`;

        const values = [
            companyCode,
            locationId,
            branchId,
            facilityId,
            buildingId,
            floorId,
            zoneId,
            deviceCategory,
            deviceName,
            deviceTag,
            macAddress,
            firmwareVersion,
            hardwareVersion,
            coordinates,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            throw new Error("Record not found or no changes made");
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM devices WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Record deleted successfully" });
        } else {
            throw new Error("Record not found");
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.showData = async (req, res) => {
    try {
        const companyCode = req.headers.companycode;
        const location = req.body.locationId;

        const branch = req.body.branchId;
        const facility = req.body.facilityId;
        const building = req.body.buildingId;
        const floor = req.body.floorId;
        const zone = req.body.zoneId;
        console.log("zone", zone)

        let result;
        let deviceCount = 0;

        if (location && branch && facility && building && floor && zone) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.zoneId = ?`,
                [companyCode, zone]
            );
            deviceCount = result[0].length;
        } else {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ?`,
                [companyCode]
            );
        }

        if (!result[0]) {
            throw new Error("Device not found");
        }

        const response = {
            message: "Device Lists",
            totalDevice: deviceCount,
            data: result[0]
        };
        const status = 200;

        return res.status(status).json(response);
    } catch (err) {
        const response = {
            message: err.message || 'An error occurred',
            status: 406
        };
        const status = 406;

        return res.status(status).json(response);
    }
};



exports.searchDevices = async (req, res) => {
    try {
        const companyCode = req.headers.companycode;
        const location = req.body.locationId;
        const branch = req.body.branchId;
        const facility = req.body.facilityId;
        const building = req.body.buildingId;
        const floor = req.body.floorId;
        const zone = req.body.zoneId;

        let result;
        let deviceCount = 0;
        console.log("companyCode==", companyCode)

        if (location && branch && facility && building && floor && zone) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.zoneId = ?`,
                [companyCode, zone]
            );
            deviceCount = result[0].length;
        } else if (location && branch && facility && building && floor) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.locationId = ? AND d.branchId = ? AND d.facilityId = ? AND d.buildingId = ? AND d.floorId = ?`,
                [companyCode, location, branch, facility, building, floor]
            );
            deviceCount = result[0].length;
        } else if (location && branch && facility && building) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.locationId = ? AND d.branchId = ? AND d.facilityId = ? AND d.buildingId = ? `,
                [companyCode, location, branch, facility, building]
            );
            deviceCount = result[0].length;
        } else if (location && branch && facility) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.locationId = ? AND d.branchId = ? AND d.facilityId = ? `,
                [companyCode, location, branch, facility]
            );
            deviceCount = result[0].length;
        } else if (location && branch) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.locationId = ? AND d.branchId = ? `,
                [companyCode, location, branch]
            );
            deviceCount = result[0].length;
        } else if (location) {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? AND d.locationId = ?  `,
                [companyCode, location]
            );
            deviceCount = result[0].length;
        } else {
            result = await connection.execute(
                `SELECT d.*, dc.deviceCategory AS deviceCategory, dc.id AS deviceCategoryId 
                 FROM devices AS d
                 JOIN device_categories AS dc ON dc.id = d.deviceCategory
                 WHERE d.companyCode = ? `,
                [companyCode]
            );
            deviceCount = result[0].length;
        }

        if (!result[0]) {
            throw new Error("Device not found");
        }

        const response = {
            message: "Device Lists",
            totalDevice: deviceCount,
            data: result[0]
        };
        const status = 200;

        return res.status(status).json(response);
    } catch (err) {
        const response = {
            message: err.message || 'An error occurred',
            status: 406
        };
        const status = 406;

        return res.status(status).json(response);
    }
};

