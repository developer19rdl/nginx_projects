
const { connection, CustomError } = require('../config/dbSql2');


// Human-readable label for the numeric alertCategory severity code.
const ALERT_SEVERITY_LABEL = {
    1: 'Critical',
    2: 'Warning',
    3: 'Out of Range',
};

// datetime-local inputs send 'YYYY-MM-DDTHH:mm' — MySQL wants a space separator.
const toMysqlDateTime = (v) => (v ? v.replace('T', ' ') : v);

// Same keyword-matching convention as SensorNodeDetail.js (frontend) and
// UtilityMeterController.js's ENV_TAG_KEYWORDS — kept as its own local copy
// here rather than a cross-file import, matching how this codebase already
// duplicates this small map rather than sharing it across controllers.
const ENV_TAG_KEYWORDS = {
    Temperature: ['temp'],
    Humidity:    ['humid'],
    CO2:         ['co2', 'carbon'],
    Pressure:    ['pressure', 'press'],
};

// ── dashboardAlerts — active/uncleared alerts for one sensor dashboard ────────
// GET /alert/dashboardAlerts?sensorType=Temperature|Humidity|CO2|Pressure
// Same alert_data source + triggered/isCleared filter as AlertReport above,
// but scoped to just this sensor type. Two alert sources feed these 4
// dashboards, UNIONed here: the sensors/Tag-based pipeline (tagId =
// sensors.Tag_Id, matched by Tag_Name keyword) and, since
// UtilityEnvThresholdAlertCron started writing Min/Max-limit breaches for
// utility_meters-typed CO2/Temperature/Humidity/Pressure rows (tagId =
// utility_meters.id, matched directly by meterType — no keyword guessing
// needed since that table already carries an exact meterType column).
exports.dashboardAlerts = async (req, res) => {
    try {
        const { sensorType } = req.query;
        const keywords = ENV_TAG_KEYWORDS[sensorType];
        if (!keywords) {
            return res.status(400).json({ success: false, message: 'sensorType must be one of ' + Object.keys(ENV_TAG_KEYWORDS).join(', ') });
        }

        const likeClauses = keywords.map(() => 's.Tag_Name LIKE ?').join(' OR ');
        const likeParams = keywords.map((k) => `%${k}%`);

        const [rows] = await connection.execute(
            `SELECT a.id, a.dateTime, a.alertMessage, a.value, a.alertCategory,
                    a.deviceId, a.tagId, s.Tag_Name AS meterName, s.slaveId
             FROM alert_data a
             INNER JOIN sensors s ON s.Tag_Id = a.tagId AND s.deviceId = a.deviceId
             WHERE a.triggered = 1 AND a.isCleared = 0 AND (${likeClauses})
             UNION ALL
             SELECT a.id, a.dateTime, a.alertMessage, a.value, a.alertCategory,
                    a.deviceId, a.tagId, um.meterName AS meterName, um.slaveId
             FROM alert_data a
             INNER JOIN utility_meters um ON um.id = a.tagId AND um.deviceId = a.deviceId
             WHERE a.triggered = 1 AND a.isCleared = 0 AND (${keywords.map(() => 'LOWER(um.meterType) LIKE ?').join(' OR ')})
             ORDER BY dateTime DESC`,
            [...likeParams, ...likeParams]
        );

        const data = rows.map((row) => ({
            ...row,
            severity: ALERT_SEVERITY_LABEL[row.alertCategory] || 'Alert',
        }));

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.AlertReport = async (req, res) => {
    try {
        // Destructure and assign the default values from the request body
        const { fromDate, toDate, deviceId, slaveId, meterId } = req.body;

        // Base query for fetching data from alert_data table.
        // Alerts come from three independent sources, all writing into the
        // same alert_data table with a different meaning for tagId/deviceId
        // each time:
        //  - WaterMeterSegregationCronNew: tagId = utility_meters.id, machineId = 0
        //  - an equivalent Energy-meter cron: tagId = meters.id, machineId = 0
        //  - CronsSensorSegregationCron (temperature/humidity/carbon/etc.):
        //    tagId = sensors.Tag_Id, deviceId/slaveId from sensors, machineId
        //    = the real production machine id (NOT 0).
        // The old `INNER JOIN machines ON machines.id = a.machineId` only
        // ever matched the third case (and even then only if machineId
        // pointed at a real machine), so utility/energy meter alerts always
        // came back empty, and filtering on machineId = 0 hid the sensor
        // alerts instead. Resolve the display name from whichever of the
        // three tables the (tagId, deviceId) pair matches, and don't filter
        // on machineId at all so every source can show up together.
        let showQuery = `SELECT a.id, a.dateTime, a.alertMessage, a.value, a.alertCategory,
                                a.deviceId, a.tagId,
                                COALESCE(um.id, em.id, s.Tag_Id)                        AS meterId,
                                COALESCE(um.meterName, em.displayName, s.Tag_Name, a.tagName) AS meter_name,
                                CASE
                                    WHEN um.id IS NOT NULL THEN 'Utility'
                                    WHEN em.id IS NOT NULL THEN 'Energy'
                                    WHEN s.Tag_Id IS NOT NULL THEN 'Sensor'
                                    ELSE 'Unknown'
                                END                                                     AS meterType,
                                COALESCE(um.slaveId, em.slaveId, s.slaveId)             AS slaveId
                         FROM alert_data a
                         LEFT JOIN utility_meters um ON um.id = a.tagId AND um.deviceId = a.deviceId
                         LEFT JOIN meters em         ON em.id = a.tagId AND em.deviceId = a.deviceId
                         LEFT JOIN sensors s         ON s.Tag_Id = a.tagId AND s.deviceId = a.deviceId
                         WHERE a.triggered = 1 AND a.isCleared = 0
                         AND a.created_at BETWEEN ? AND ?`;

        // Query parameters for the date range (inclusive; From/To now carry time-of-day).
        let queryParams = [toMysqlDateTime(fromDate), toMysqlDateTime(toDate)];

        // Device filter (edge device that owns the meter/sensor)
        if (deviceId && deviceId !== 'all') {
            showQuery += ` AND a.deviceId = ?`;
            queryParams.push(deviceId);
        }

        // Tag Name filter (the specific meter/sensor tag that raised the alert) —
        // takes priority over the SlaveId filter since it already pins an exact tag.
        if (meterId && meterId !== 'all') {
            showQuery += ` AND a.tagId = ?`;
            queryParams.push(meterId);
        } else if (slaveId && slaveId !== 'all') {
            // No specific tag chosen — filter to every tag under this device+slaveId
            // across all three source tables.
            showQuery += ` AND a.tagId IN (
                SELECT id FROM meters WHERE deviceId = ? AND CAST(slaveId AS CHAR) = ?
                UNION SELECT id FROM utility_meters WHERE deviceId = ? AND CAST(slaveId AS CHAR) = ?
                UNION SELECT Tag_Id FROM sensors WHERE deviceId = ? AND CAST(slaveId AS CHAR) = ?
            )`;
            queryParams.push(deviceId, slaveId, deviceId, slaveId, deviceId, slaveId);
        }

        showQuery += ` ORDER BY a.dateTime DESC`;

        // Execute the query with the dynamic conditions
        const [rows] = await connection.execute(showQuery, queryParams);

        if (rows.length > 0) {
            // Loop through rows and extract date and time from dateTime
            const processedData = rows.map(row => {
                const dateTime = new Date(row.dateTime);
                const date = dateTime.toISOString().split('T')[0];  // Extract date in YYYY-MM-DD format
                const time = dateTime.toTimeString().split(' ')[0];  // Extract time in HH:MM:SS format

                return {
                    ...row,
                    meter_name: row.meter_name || 'Unknown',
                    severity: ALERT_SEVERITY_LABEL[row.alertCategory] || 'Alert',
                    date,  // Add date field
                    time,  // Add time field
                    dateTime: undefined  // Optionally remove the original dateTime field if not needed
                };
            });

            return res.status(200).json({ success: true, data: processedData });
        } else {
            return res.status(200).json({ success: false, message: "Data not found", data: [] });
        }
    } catch (err) {
        // Catch and return any errors
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── Device dropdown — edge devices that own at least one Energy meter, Utility meter, or sensor tag ──
exports.alertDeviceDropdown = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT DISTINCT d.id, d.edgeDeviceName AS displayName
             FROM edge_devices d
             WHERE d.id IN (
                 SELECT deviceId FROM meters
                 UNION SELECT deviceId FROM utility_meters
                 UNION SELECT deviceId FROM sensors
             )
             ORDER BY d.edgeDeviceName`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── Slave ID dropdown — distinct slaveIds (Energy/Utility/Sensor) for a device ──
// GET /alert/slaveDropdown?deviceId=
exports.alertSlaveDropdown = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId || deviceId === 'all') {
            return res.status(200).json({ success: true, data: [] });
        }

        const [rows] = await connection.execute(
            `SELECT x.slaveId,
                    (SELECT MAX(s.slaveInformation) FROM sensors s
                     WHERE s.deviceId = ? AND s.slaveId = x.slaveId) AS slaveInformation
             FROM (
                 SELECT CAST(slaveId AS CHAR) AS slaveId FROM meters WHERE deviceId = ?
                 UNION
                 SELECT CAST(slaveId AS CHAR) AS slaveId FROM utility_meters WHERE deviceId = ?
                 UNION
                 SELECT CAST(slaveId AS CHAR) AS slaveId FROM sensors WHERE deviceId = ?
             ) x
             WHERE x.slaveId IS NOT NULL
             ORDER BY CAST(x.slaveId AS UNSIGNED)`,
            [deviceId, deviceId, deviceId, deviceId]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── Tag Name dropdown — Energy meters + Utility meters + sensor tags, scoped to device + slaveId ──
// GET /alert/tagDropdown?deviceId=&slaveId=
exports.alertTagDropdown = async (req, res) => {
    try {
        const { deviceId, slaveId } = req.query;
        const scopedDevice = deviceId && deviceId !== 'all';
        const scopedSlave = slaveId && slaveId !== 'all';

        const buildWhere = (slaveCol) => {
            const clauses = [];
            if (scopedDevice) clauses.push('deviceId = ?');
            if (scopedSlave) clauses.push(`CAST(${slaveCol} AS CHAR) = ?`);
            return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        };
        const buildParams = () => {
            const params = [];
            if (scopedDevice) params.push(deviceId);
            if (scopedSlave) params.push(slaveId);
            return params;
        };

        const [rows] = await connection.execute(
            `SELECT id, displayName, deviceId, meterKind FROM (
                 SELECT id, displayName, deviceId, 'Energy' AS meterKind FROM meters ${buildWhere('slaveId')}
                 UNION ALL
                 SELECT id, meterName AS displayName, deviceId, 'Utility' AS meterKind FROM utility_meters ${buildWhere('slaveId')}
                 UNION ALL
                 SELECT Tag_Id AS id, Tag_Name AS displayName, deviceId, 'Sensor' AS meterKind FROM sensors ${buildWhere('slaveId')}
             ) x
             ORDER BY displayName`,
            [...buildParams(), ...buildParams(), ...buildParams()]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.alertSettingApi = async (req, res) => {
    try {
        const { smtpServer, alertEmailFrom, password, securityType } = req.body;


        // Insert the new meter data into the database
        const insertQuery = `
            INSERT INTO alert_settings (smtpServer, alertEmailFrom, password, securityType)
            VALUES (?, ?, ?, ?)
        `;
        const values = [smtpServer, alertEmailFrom, password, securityType];
        console.log("values", values);
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


exports.alertSettingApiUpdate = async (req, res) => {
    try {

        const { smtpServer, alertEmailFrom, password, securityType } = req.body;

        const { id } = req.params;

        // Find the existing meter record
        const checkQuery = `
            SELECT * FROM alert_settings
            WHERE id = ?
        `;
        const [plantRows] = await connection.execute(checkQuery, [id]);

        if (plantRows.length === 0) {
            throw new Error("plants not found");
        }


        // Update the meter attributes
        const updateQuery = `
            UPDATE alert_settings
            SET
                 smtpServer = ?,
                 alertEmailFrom = ?,
                 password = ?,
                 securityType = ?
            WHERE
                id = ?
        `;
        const values = [smtpServer, alertEmailFrom, password, securityType, id];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Alert configuration settings updated successfully" });
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

        const deleteQuery = `DELETE FROM alert_settings WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Deleted Successfully!" });
        } else {
            return res.status(404).json({ success: false, message: "Alert settings not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.alertSettingApiShow = async (req, res) => {
    try {
        const showQuery = `
        SELECT *
        FROM alert_settings 
        `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Alert Setting Api Show Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Plant not found", data: [] });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};