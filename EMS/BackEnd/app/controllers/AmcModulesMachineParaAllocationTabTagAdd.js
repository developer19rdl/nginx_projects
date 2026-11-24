
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');

const utility = require('../utility/utilityFunction');
const excel = require('exceljs');

exports.store = async (req, res) => {
    try {
        const c = req.body;
        const companyCode = req.headers.companycode;

        // Check if the sensor with the given deviceId and tagName already exists
        const checkQuery = `
            SELECT * FROM sensors
            WHERE deviceId = ? AND Tag_Name = ? AND slaveId = ?
        `;
        const [existingSensor] = await connection.execute(checkQuery, [c.deviceId, c.tagName, c.slaveId]);

        if (existingSensor.length > 0) {
            throw new Error(`${c.sensorTag} sensor is already deployed for device`);
        }

        // Insert the new sensor data into the database
        const insertQuery = `
            INSERT INTO sensors (
                deviceCategoryId, deviceId, Tag_Name, jsonType,slaveId, slaveInformation, criticalMin, criticalMax,
                warningMin, warningMax, outOfRangeMin, outOfRangeMax, alert,
                alertCount, alertResetCount, emailAlert, smsAlert, latchAlert
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            c.categoryId, c.deviceId, c.tagName, c.jsonType,c.slaveId, c.slaveInformation || null, c.criticalMinValue, c.criticalMaxValue,
            c.warningMinValue, c.warningMaxValue, c.outOfRangeMinValue, c.outOfRangeMaxValue, c.alert,
            c.alertCount, c.alertResetCount, c.emailAlert, c.smsAlert || 0, c.latchAlert
        ];

        const [insertResult] = await connection.execute(insertQuery, values);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data added successfully" });
        } else {
            throw new Error("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const c = req.body;

        // Find the sensor by id
        const findQuery = `
            SELECT * FROM sensors WHERE Tag_Id = ?
        `;
        const [sensor] = await connection.execute(findQuery, [id]);

        if (sensor.length === 0) {
            throw new Error("Data not found");
        }

        // Check if the tag name is already allocated to another sensor
        const checkQuery = `
            SELECT * FROM sensors
            WHERE deviceId = ? AND Tag_Name = ? AND slaveId = ? AND Tag_Id <> ?
        `;
        const [tagDataFound] = await connection.execute(checkQuery, [c.deviceId, c.tagName, c.slaveId, id]);

        if (tagDataFound.length > 0) {
            throw new Error(`${c.tagName} is already allocated to another sensor`);
        }

        // Update the sensor data
        const updateQuery = `
            UPDATE sensors
            SET deviceCategoryId = ?, deviceId = ?, Tag_Name = ?, jsonType = ?,slaveId=?, slaveInformation = ?, criticalMin = ?, criticalMax = ?,
                warningMin = ?, warningMax = ?, outOfRangeMin = ?, outOfRangeMax = ?, alert = ?,
                alertCount = ?, alertResetCount = ?, emailAlert = ?, smsAlert = ?, latchAlert = ?
            WHERE Tag_Id = ?
        `;
        const values = [
            c.categoryId, c.deviceId, c.tagName, c.jsonType,c.slaveId, c.slaveInformation || null, c.criticalMinValue, c.criticalMaxValue,
            c.warningMinValue, c.warningMaxValue, c.outOfRangeMinValue, c.outOfRangeMaxValue, c.alert,
            c.alertCount, c.alertResetCount, c.emailAlert, c.smsAlert || 0, c.latchAlert, id
        ];

        const [updateResult] = await connection.execute(updateQuery, values);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Sensor updated successfully" });
        } else {
            throw new Error("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM tagadd WHERE id = ?`;
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
        const showQuery = `
            SELECT sensors.*, edge_devices.edgeDeviceName, device_categories.deviceCategory
            FROM sensors
            INNER JOIN edge_devices ON sensors.deviceId = edge_devices.id
            INNER JOIN device_categories ON sensors.deviceCategoryId = device_categories.id
        `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            // Iterate through the results and rename Tag_Id to id
            const result = rows.map(item => {
                item.id = item.Tag_Id;
                delete item.Tag_Id;
                return item;
            });

            return res.status(200).json({ success: true, message: "Sensor Lists", data: result });
        } else {
            return res.status(404).json({ success: false, message: "Sensors not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};





exports.showTagName = async (req, res) => {
    try {
        const { id, slaveId } = req.body;

        let showQuery;
        let params;

        if (slaveId !== undefined && slaveId !== null && slaveId !== '') {
            showQuery = `SELECT Tag_Id, Tag_Name FROM sensors WHERE deviceId = ? AND slaveId = ?`;
            params = [id, slaveId];
        } else {
            showQuery = `SELECT Tag_Id, Tag_Name FROM sensors WHERE deviceId = ?`;
            params = [id];
        }

        const [rows] = await connection.execute(showQuery, params);

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



exports.storeexceldata = async (req, res) => {
    try {
        const base64URL = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
        const base64Data = req.body.file.replace(base64URL, "");
        const buffer = Buffer.from(base64Data, "base64");
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);

        const dataArray = [];

        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            if (rowNumber > 1) { // Assuming the first row is headers
                const rowData = {
                    categoryName: row.getCell(1).value,
                    edgeDeviceName: row.getCell(2).value,
                    tagName: row.getCell(3).value,
                    jsonType: row.getCell(4).value,
                    warningMinValue: row.getCell(5).value,
                    warningMaxValue: row.getCell(6).value,
                    outOfRangeMinValue: row.getCell(7).value,
                    outOfRangeMaxValue: row.getCell(8).value,
                    criticalMinValue: row.getCell(9).value,
                    criticalMaxValue: row.getCell(10).value,
                    alert: row.getCell(11).value
                };
                dataArray.push(rowData);
            }
        });

        if (Array.isArray(dataArray) && dataArray.length > 0) {
            for (const item of dataArray) {
                // Fetch deviceCategoryId from device_categories table
                const categoryQuery = `SELECT id FROM device_categories WHERE categoryName = ?`;
                const [categoryRows] = await connection.execute(categoryQuery, [item.categoryName]);

                if (categoryRows.length === 0) {
                    throw new Error(`Category not found for name: ${item.categoryName}`);
                }

                const deviceCategoryId = categoryRows[0].id;

                // Fetch deviceId from devices table
                const deviceQuery = `SELECT id FROM edge_devices WHERE edgeDeviceName = ?`;
                const [deviceRows] = await connection.execute(deviceQuery, [item.edgeDeviceName]);

                if (deviceRows.length === 0) {
                    throw new Error(`Device not found for name: ${item.edgeDeviceName}`);
                }

                const deviceId = deviceRows[0].id;

                // Set alert value based on item.alert
                const alertValue = item.alert === 'Y' ? 1 : item.alert === 'N' ? 0 : null;

                if (alertValue === null) {
                    throw new Error(`Invalid alert value for item: ${item.tagName}`);
                }

                const storeQuery = `INSERT INTO sensors (deviceCategoryId, deviceId, Tag_Name, jsonType, warningMin, warningMax, outOfRangeMin, outOfRangeMax, criticalMin, criticalMax, alert) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [
                    deviceCategoryId,
                    deviceId,
                    item.tagName,
                    item.jsonType,
                    item.warningMinValue,
                    item.warningMaxValue,
                    item.outOfRangeMinValue,
                    item.outOfRangeMaxValue,
                    item.criticalMinValue,
                    item.criticalMaxValue,
                    alertValue
                ];

                const [sRows] = await connection.execute(storeQuery, values);

                if (sRows.affectedRows === 0) {
                    throw new Error("Something went wrong while inserting data!");
                }
            }

            return res.status(200).json({ success: true, message: "All data added successfully" });
        } else {
            throw new Error("Invalid data format");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
