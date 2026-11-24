
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');

// const axios = require('axios');
const https = require('https');



exports.showApprove = async (req, res) => {
    try {
        const type = req.body;

        const viewQuery = `SELECT id, Approve,planed FROM maintcescedue2 Where Maintype =? `;

        const [rows] = await connection.execute(viewQuery, [type.Maintype]);
        if (rows.length > 0) {
            // Calculate counts of 0 and 1 in the Approve column
            let count0 = 0;
            let count1 = 0;
            for (const row of rows) {
                if (row.Approve === 0) {
                    count0++;
                }
                if (row.planed === 1) {
                    count1++;
                }
            }

            return res.status(200).json({ success: true, count0, count1 });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};








exports.deviceAlertCounts = async (req, res) => {
    try {
        // Create an instance of the HTTPS agent with custom options
        const agent = new https.Agent({
            rejectUnauthorized: false // Ignore SSL certificate validation errors
        });

        // Define headers
        const headers = {
            'Authorization': 'Bearer your_token_here',
            'Content-Type': 'application/json',
            'Companycode': '1infiniteUptime',
            // Add any other headers you need
        };

        // Make a POST request to fetch the list of devices
        const deviceResponse = await axios.post('http://iotpi.in/itcBackend/api/searchDevices', {}, {
            headers: headers,
            httpsAgent: agent // Use custom agent
        });

        // Extract devices from the response
        const devices = deviceResponse.data.data;

        // Make a POST request to fetch the list of alerts
        const alertResponse = await axios.post('http://iotpi.in/itcBackend/api/alertData', {}, {
            headers: headers,
            httpsAgent: agent // Use custom agent
        });

        // Extract alerts from the response
        const alerts = alertResponse.data.data;

        // Make a GET request to fetch the list of failed devices
        const failedDeviceResponse = await axios.get('http://192.168.1.13:5000/api/MainteAppro/showpending', {
            headers: headers,
            httpsAgent: agent // Use custom agent
        });
        const failedDevices = failedDeviceResponse.data.data;

        const DeviceResponsedata = await axios.get('http://192.168.1.13:5000/api/PrevMaint/show', {
            headers: headers,
            httpsAgent: agent // Use custom agent
        });
        const responseDevices = DeviceResponsedata.data.data;

        // Extract failed devices from the response


        // Initialize counts
        let goodDeviceCount = 1;
        let alertDeviceCount = 0;
        let failedDeviceCount = 0; // Count of failed devices from the API
        let DeviceResponse = responseDevices.length;

        // Loop through devices
        for (const device of devices) {
            let hasAlert = false;

            // Check if the device has any alerts
            for (const alert of alerts) {
                // Remove prefix from deviceTag before comparison
                const formattedDeviceTag = device.deviceTag.replace(/^0+/, '');
                if (formattedDeviceTag === alert.deviceId) {
                    hasAlert = true;
                    break;
                }
            }

            // Increment counts based on whether the device has alerts or not
            if (hasAlert) {
                alertDeviceCount++;
            } else {
                goodDeviceCount++;
            }
        }

        const dataForGraph = [
            { "name": "Good", "count": goodDeviceCount, "color": "green" },
            { "name": "Moderate", "count": alertDeviceCount, "color": "yellow" },
            { "name": "Need Attention", "count": DeviceResponse, "color": "orange" },
            { "name": "Failed", "count": failedDeviceCount, "color": "red" },
            // Add more categories as needed
        ];

        return res.status(200).json({ success: true, data: dataForGraph });
    } catch (err) {
        return res.status(err.response?.status || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.store = async (req, res) => {
    try {
        const data = req.body;

        // Iterate over devicesWithIncreasingData and insert each item into the table
        for (const item of data.devicesWithIncreasingData) {
            await insertAlertIfNotDuplicate(item);
        }

        // Iterate over devicesWithEnergyPerData and insert each item into the table
        for (const item of data.devicesWithEnergyPerData) {
            await insertAlertIfNotDuplicate(item);
        }

        return res.status(200).json({ success: true, message: "Data added successfully" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

const insertAlertIfNotDuplicate = async (item) => {
    const datetime = new Date(item.lastDate).toISOString().slice(0, 19).replace('T', ' ');
    const checkQuery = `SELECT COUNT(*) AS count
                        FROM maintenencealert
                        WHERE deviceName = ? AND deviceTag = ? AND datetime = ?`;
    const values = [item.deviceName, item.typography, datetime];
    const [rows] = await connection.execute(checkQuery, values);
    console.log("rows=", rows[0].count)

    if (rows[0].count === 0) {
        const storeQuery = `INSERT INTO maintenencealert (deviceName, deviceTag, datetime, Flag)
                            VALUES (?, ?, ?, ?)`;

        const insertValues = [item.deviceName, item.typography, datetime, 'Flag value']; // Replace 'Flag value' with the appropriate value
        await connection.execute(storeQuery, insertValues);
    }
};



exports.showname = async (req, res) => {
    try {
        const viewQuery = `SELECT DISTINCT deviceName FROM maintenencealert`;
        const [rows] = await connection.execute(viewQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.showshopflordata = async (req, res) => {
    try {
        const machineQuery = `SELECT COUNT(*) AS goodMachines FROM machines WHERE isIdle = 0`;
        const moderateQuery = `SELECT COUNT(*) AS moderatemachine FROM alert_data WHERE alertCategory = 2`;
        const needAttentionQuery = `SELECT COUNT(*) AS needAttentionmachine FROM alert_data WHERE alertCategory = 1`;
        const failureQuery = `SELECT COUNT(*) AS Failure FROM maintcescedue2 WHERE Maintype = "BreakDown"`;

        const [goodmachineRows] = await connection.execute(machineQuery);
        const [moderatemachineRows] = await connection.execute(moderateQuery);
        const [needattentionRows] = await connection.execute(needAttentionQuery);
        const [failureRows] = await connection.execute(failureQuery);

        if (goodmachineRows.length > 0 || moderatemachineRows.length > 0 || needattentionRows.length > 0 || failureRows.length > 0) {
            const dataForGraph = [
                { "name": "Good", "count": goodmachineRows[0].goodMachines, "color": "green" },
                { "name": "Moderate", "count": moderatemachineRows[0].moderatemachine, "color": "yellow" },
                { "name": "Need Attention", "count": needattentionRows[0].needAttentionmachine, "color": "orange" },
                { "name": "Failed", "count": failureRows[0].Failure, "color": "red" }
            ];

            return res.status(200).json({
                success: true,
                data: dataForGraph
            });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
