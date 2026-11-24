
const { connection, CustomError } = require('./config/dbSql2');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const sensor = req.body;
        // Check if the email already exists for Parameter1
        const [sensorRows, sensorFields] = await connection.execute(`SELECT * FROM sensors_dashboard_settings WHERE Parameter1 = ?`, [sensor.Parameter1]);
        if (sensorRows.length > 0) {
            return res.status(400).json({ success: false, message: "Parameter1 already exists!" });
        }
        // Check if Parameter2 already exists
        const [sensorRowss, sensorFieldss] = await connection.execute(`SELECT * FROM sensors_dashboard_settings WHERE Parameter2 = ?`, [sensor.Parameter2]);
        if (sensorRowss.length > 0) {
            return res.status(400).json({ success: false, message: "Parameter2 already exists!" });
        }
        // Check if Parameter3 already exists
        const [sensorRowsss, sensorFieldsss] = await connection.execute(`SELECT * FROM sensors_dashboard_settings WHERE Parameter3 = ?`, [sensor.Parameter3]);
        if (sensorRowsss.length > 0) {
            return res.status(400).json({ success: false, message: "Parameter3 already exists!" });
        }
        // Modify the query to include the current timestamp
        const storeQuery = 'INSERT INTO sensors_dashboard_settings (Parameter1, Parameter1_setvalue,Parameter1_labelname,Parameter2,Parameter2_setvalue,Parameter2_labelname,Parameter3,Parameter3_labelname) VALUES (?, ?,?,?,?,?,?,?)';
        const values = [sensor.Parameter1, sensor.Parameter1_setvalue, sensor.Parameter1_labelname, sensor.Parameter2, sensor.Parameter2_setvalue, sensor.Parameter2_labelname, sensor.Parameter3, sensor.Parameter3_labelname];
        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Sensors added successfully" });
        } else {
            throw new CustomError("Failed to add Sensors");
        }
    } catch (err) {
        // Handle database connection errors
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};








exports.update = async (req, res) => {
    try {
        const machineId = req.params.machineId;
        const {
            Parameter1, Parameter1_setvalue, Parameter1_labelname, Parameter1_setname,
            Parameter2, Parameter2_setvalue, Parameter2_labelname, Parameter2_setname,
            Parameter3, Parameter3_labelname
        } = req.body;

        // Check if a row exists for the given machineId
        const checkQuery = "SELECT COUNT(*) AS count FROM sensors_dashboard_settings WHERE machineId = ?";
        const [checkRows] = await connection.execute(checkQuery, [machineId]);
        const rowCount = checkRows[0].count;

        let query;
        let values;

        if (rowCount > 0) {
            // Row exists, perform an update
            query = `
                UPDATE sensors_dashboard_settings
                SET Parameter1 = ?, Parameter1_setvalue = ?, Parameter1_labelname = ?, Parameter1_setname = ?,
                    Parameter2 = ?, Parameter2_setvalue = ?, Parameter2_labelname = ?, Parameter2_setname = ?,
                    Parameter3 = ?, Parameter3_labelname = ?
                WHERE machineId = ?`;

            values = [
                Parameter1, Parameter1_setvalue, Parameter1_labelname, Parameter1_setname,
                Parameter2, Parameter2_setvalue, Parameter2_labelname, Parameter2_setname,
                Parameter3, Parameter3_labelname, machineId
            ];
        } else {
            // Row does not exist, perform an insert
            query = `
                INSERT INTO sensors_dashboard_settings (machineId, Parameter1, Parameter1_setvalue, Parameter1_labelname, Parameter1_setname,
                    Parameter2, Parameter2_setvalue, Parameter2_labelname, Parameter2_setname, Parameter3, Parameter3_labelname)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            values = [
                machineId, Parameter1, Parameter1_setvalue, Parameter1_labelname, Parameter1_setname,
                Parameter2, Parameter2_setvalue, Parameter2_labelname, Parameter2_setname,
                Parameter3, Parameter3_labelname
            ];
        }

        // Execute the query with the values array
        const [result] = await connection.execute(query, values);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            throw new CustomError("Failed to update sensor data", 500);
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.updateDisplayName = async (req, res) => {
    try {
        const { chartNumber, displayName, machineId } = req.body;

        const displayCol = `displayName${chartNumber}`;
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM chart_display WHERE machineId = ?`, [machineId]);

        let sqlQuery;
        if (rows[0].count > 0) {
            sqlQuery = `UPDATE chart_display SET ${displayCol} = ? WHERE machineId = ?`;
        } else {
            sqlQuery = `INSERT INTO chart_display (${displayCol}, machineId) VALUES(?, ?)`;
        }
        await connection.execute(sqlQuery, [displayName, machineId]);

        return res.status(200).json({ success: true, message: "Display name updated successfully" })
    } catch (err) {
        return res.status(400).json({ success: false, message: 'An error occurred', error: err.message });
    }
};







exports.getMachineData = async (req, res) => {
    try {
        const { machineId } = req.body;
        if (!machineId) {
            return res.status(400).json({ success: false, message: 'machineId is required' });
        }

        // Get alert count
        const alertCountQuery = "SELECT COUNT(*) AS alertCount FROM alert_data WHERE machineId = ?;";
        const [alertCountRows] = await connection.execute(alertCountQuery, [machineId]);
        const alertCount = alertCountRows[0].alertCount;

        // Get sensors dashboard settings
        const [rows] = await connection.execute("SELECT * FROM sensors_dashboard_settings WHERE machineId = ?", [machineId]);

        let rowsWithDetails = [];
        if (rows.length > 0) {
            const tagId1 = rows[0].Parameter1;
            const tagId2 = rows[0].Parameter2;
            const tagId3 = rows[0].Parameter3;

            // Fetch latest values for each parameter.
            // dateTime bound limits the scan to the current monthly partition only.
            const getLatestValue = async (tagId) => {
                const query = `SELECT value FROM sensor_data
                               WHERE machineId = ? AND Tag_Id = ?
                                 AND isAggregate = 1
                                 AND dateTime >= DATE_SUB(NOW(), INTERVAL 720 HOUR)
                               ORDER BY dateTime DESC, id DESC LIMIT 1`;
                const [result] = await connection.execute(query, [machineId, tagId]);
                return result.length > 0 ? result[0].value : null;
            };

            const Parameter1Value = await getLatestValue(tagId1);
            const Parameter2Value = await getLatestValue(tagId2);
            const Parameter3Value = await getLatestValue(tagId3);

            // Add alertCount and parameter values to each row
            rowsWithDetails = rows.map(row => ({
                ...row,
                alertCount,
                Parameter1Value,
                Parameter2Value,
                Parameter3Value
            }));
        }
        const [displayNames] = await connection.execute(`SELECT * FROM chart_display WHERE machineId = ?`, [machineId]);

        let displayName1 = null;
        let displayName2 = null;
        let displayName3 = null;

        if (displayNames.length > 0) {
            ({ displayName1, displayName2, displayName3 } = displayNames[0]);
        }

        return res.status(200).json({
            success: true,
            message: "Device list",
            data: rowsWithDetails,
            displayNames: { displayName1, displayName2, displayName3 }
        });


        // return res.status(404).json({ success: false, message: "No data found for the given machineId" });
    } catch (err) {
        console.error("Database Error:", err);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};















exports.show = async (req, res) => {
    try {
        const { machineId, dateRange } = req.body;
        if (!machineId) {
            return res.status(400).json({ success: false, message: 'machineId is required' });
        }
        const dateRanges = {
            '30days': 'INTERVAL 30 DAY',
            '15days': 'INTERVAL 15 DAY',
            '1week': 'INTERVAL 7 DAY',
            '1day': 'INTERVAL 1 DAY',
        };
        const dateCondition = (dateRange && dateRanges[dateRange]) ? `AND ad.dateTime >= NOW() - ${dateRanges[dateRange]}` : '';
        const fetchQuery = `
            SELECT
                ad.id as id,
                m.machine_name,
                ad.machineId,
                ad.tagName,
                ad.tagId,
                ad.alertMessage,
                ad.value,
                DATE_FORMAT(ad.dateTime, '%d-%m-%Y') AS Date
            FROM
                alert_data AS ad
            INNER JOIN
                machines AS m
            ON
                ad.machineId = m.id
            WHERE
                ad.triggered = ? AND
                ad.isCleared = ? AND
                ad.machineId = ? ${dateCondition}
        `;
        const [rows] = await connection.execute(fetchQuery, [1, 0, machineId]);
        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const [fRows] = await connection.execute(`SELECT * FROM sensors_dashboard_settings WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Department not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE from sensors_dashboard_settings WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.clear = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark } = req.body;
        await connection.execute(`UPDATE alert_data SET latchRemark = ?, triggered = ?, isCleared = ? WHERE id = ?`, [remark, 0, 1, id]);
        res.status(200).json({ success: true, message: 'Alert cleared successfully' });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
};
