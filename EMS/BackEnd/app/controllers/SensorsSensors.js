const { connection, CustomError } = require('../config/dbSql2.js');
const utility = require('../utility/utilityFunction.js');
const bcrypt = require('bcrypt');
const moment = require('moment');


exports.getSlaveIdDropdown = async (req, res) => {
    try {
        const { machineId } = req.body;

        // Input validation
        if (!machineId || isNaN(parseInt(machineId))) {
            return res.status(400).json({ success: false, message: "Valid machineId is required" });
        }

        // Define the SQL query to get distinct slaveId values and their selection status
        const query = `
            SELECT 
                DISTINCT mpa.slaveId as slaveId,
                CASE 
                    WHEN cd.slaveName1 = mpa.slaveId OR cd.slaveName2 = mpa.slaveId OR cd.slaveName3 = mpa.slaveId
                    THEN 1 ELSE 0 
                END as isSlaveSelected
            FROM 
                machine_parameter_allocation as mpa
            LEFT JOIN 
                chart_display as cd ON cd.machineId = mpa.machineId
            WHERE 
               mpa.machineId = ?
        `;

        // Execute the query
        const [rows] = await connection.execute(query, [machineId]);

        let cont = 1;
        rows.map(item => {
            item.id = cont
            cont++
        })

        // Respond with the fetched data
        return res.status(200).json({
            success: true,
            message: "Dropdown Slave Id",
            data: rows,
        });

    } catch (err) {
        console.error("Error in getSlaveIdDropdown function:", err.message, err.stack);
        return res.status(500).json({ success: false, message: "An internal server error occurred" });
    }
};


exports.getSlaveIdDashBoardDropDown = async (req, res) => {
    try {
        const { machineId } = req.body;

        // Input validation
        if (!machineId || isNaN(parseInt(machineId))) {
            return res.status(400).json({ success: false, message: "Valid machineId is required" });
        }

        // Define the SQL query to get distinct slaveId values
        const query = `
            SELECT 
                DISTINCT mpa.slaveId as slaveId
            FROM 
                machine_parameter_allocation mpa
            WHERE 
                mpa.machineId = ?
        `;

        // Execute the query
        const [rows] = await connection.execute(query, [machineId]);

        // Add an 'id' to each item in the rows
        rows.forEach((item, index) => {
            item.id = index + 1;
        });

        // Respond with the fetched data
        return res.status(200).json({
            success: true,
            message: "Dropdown Slave Id",
            data: rows,
        });

    } catch (err) {
        console.error("Error in getSlaveIdDropdown function:", err.message, err.stack);
        return res.status(500).json({ success: false, message: "An internal server error occurred" });
    }
};









exports.getDropdownValues = async (req, res) => {
    try {
        const { machineId, field, chartNo, slaveId } = req.body;

        // Input validation
        if (!machineId || isNaN(parseInt(machineId))) {
            return res.status(400).json({ success: false, message: "Valid machineId is required" });
        }

        if (!field || !['default', 'selectall'].includes(field)) {
            return res.status(400).json({ success: false, message: "Valid field is required ('default' or 'selectall')" });
        }

        const getSlaveInfo = `
        SELECT tagDescription FROM machine_parameter_allocation
        WHERE machineId = ? AND slaveId = ? AND tagDescription IS NOT NULL
    `;
        const [machineTagDescriptionRows] = await connection.execute(getSlaveInfo, [machineId, slaveId]);

        const tagDescription = machineTagDescriptionRows.length > 0 ? machineTagDescriptionRows[0].tagDescription : null;




        // Define the SQL query based on the field value
        const query = field === 'default'
            ? `
                SELECT  
                    mpa.Tag_Id as Id,
                    mpa.Tag_Name as Tag_name,
                    CASE WHEN mpa.isDefault = 1 THEN true ELSE false END as isDefault
                FROM 
                    machine_parameter_allocation as mpa
                WHERE
                    mpa.isSensor = 1 AND mpa.machineId = ? AND mpa.slaveId = ? AND (mpa.chartNumber = ? OR mpa.chartNumber IS NULL OR mpa.chartNumber = 0)
              `
            : `
                SELECT  
                    mpa.Tag_Id as Id, 
                    mpa.Tag_Name as Tag_name
                FROM 
                    machine_parameter_allocation as mpa
                WHERE 
                    mpa.isSensor = 1 AND mpa.machineId = ? AND mpa.slaveId = ?  
              `;

        // Execute the query
        const [rows] = await connection.execute(query, [machineId, slaveId, field === 'default' ? chartNo : undefined]);

        // Respond with the fetched data
        return res.status(200).json({
            success: true,
            message: "Dropdown values with selection status",
            data: rows,
            tagDescription
        });

    } catch (err) {
        console.error("Error in getDropdownValues function:", err.message, err.stack);
        return res.status(500).json({ success: false, message: "An internal server error occurred" });
    }
};



exports.getSelectAllDropdownValues = async (req, res) => {
    try {
        const { machineId, field } = req.body;

        // Input validation
        if (!machineId || isNaN(parseInt(machineId))) {
            return res.status(400).json({ success: false, message: "Valid machineId is required" });
        }

        let rows;
        let query;
        let params = [machineId];

        if (field && field !== 'selectAll') {
            // Additional validation for the field
            if (isNaN(parseInt(field))) {
                return res.status(400).json({ success: false, message: "Valid slaveId is required" });
            }

            query = `
                SELECT  
                    mpa.Tag_Id as Id, 
                    mpa.Tag_Name as Tag_name
                FROM 
                    machine_parameter_allocation as mpa
                WHERE 
                    mpa.isSensor = 1 AND mpa.machineId = ? AND mpa.slaveId = ?
            `;

            // Append field value to query parameters
            params.push(field);
        } else {
            query = `
                SELECT  
                    mpa.Tag_Id as Id, 
                    mpa.Tag_Name as Tag_name
                FROM 
                    machine_parameter_allocation as mpa
                WHERE 
                    mpa.isSensor = 1 AND mpa.machineId = ?
            `;
        }

        // Execute the query
        [rows] = await connection.execute(query, params);

        // Respond with the fetched data
        return res.status(200).json({
            success: true,
            message: "Dropdown values with selection status",
            data: rows,
        });

    } catch (err) {
        console.error("Error in getSelectAllDropdownValues function:", err.message, err.stack);
        return res.status(500).json({ success: false, message: "An internal server error occurred" });
    }
};




exports.updateDropdownValues = async (req, res) => {
    try {
        const { machineId, tagId, chartNo, slaveId } = req.body;

        const tagIds = Array.isArray(tagId) ? tagId : [tagId];

        const placeholders = tagIds.map(() => '?').join(',');

        if (tagId.length > 0) {
            await connection.execute(`
                UPDATE machine_parameter_allocation 
                SET isdefault = ?, chartNumber = ? 
                WHERE machineId = ? AND slaveId = ? AND isSensor = ? AND Tag_Id IN (${placeholders})`,
                [1, chartNo, machineId, slaveId, 1, ...tagIds]
            );
        }

        let updateQuery = `UPDATE machine_parameter_allocation 
            SET isdefault = ?, chartNumber = ? 
            WHERE machineId = ? AND slaveId = ? AND isSensor = ? AND chartNumber = ?
        `;
        let updateValues = [0, null, machineId, slaveId, 1, chartNo];

        if (tagId.length > 0) {
            updateQuery += ` AND Tag_Id NOT IN (${placeholders})`;
            updateValues.push(...tagIds);
        }
        await connection.execute(updateQuery, updateValues);

        return res.status(200).json({ success: true, message: "Successful" });
    } catch (err) {
        console.error("Error in try-catch block:", err);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};




const getDefaultTags = async (machineId) => {
    const [defaultTags] = await connection.execute(`
        SELECT Tag_Id
        FROM machine_parameter_allocation
        WHERE machineId = ? AND isSensor = ? AND isdefault = ?`,
        [machineId, 1, 1]
    );
    return defaultTags.map(row => row.Tag_Id);
};

const getIntervalValue = (interval) => {
    switch (interval) {
        case "1hr": return 3600; // 1 hour
        case "2hr": return 7200; // 2 hours
        case "5hr": return 18000; // 5 hours
        case "8hr": return 28800; // 8 hours
        case "1day": return 86400; // 1 day
        default: throw new Error("Invalid interval");
    }
};



const buildQuery = (machineId, tagId, aggregation, sortDataType, interval) => {
    // Define the mapping of sort data types to their respective hour offsets
    const sortDataTypeToHourOffset = {
        '8Hrs': 8,
        '1day': 24,
        '1week': 24 * 7,
        '15days': 24 * 15
    };

    // Define the mapping of intervals to their respective interval units
    const intervalToIntervalUnit = {
        '1hr': 'HOUR',
        '2hr': 'HOUR',
        '5hr': 'HOUR',
        '8hr': 'HOUR',
        '1day': 'DAY'
        // Add more interval mappings as needed
    };

    // Get the hour offset and interval unit based on the provided sort data type and interval
    const hourOffset = sortDataTypeToHourOffset[sortDataType];
    const intervalUnit = intervalToIntervalUnit[interval];

    // Build the recursive part of the query dynamically
    let recursiveQuery = `
        WITH RECURSIVE hours AS (
            SELECT 
                0 AS hour_offset, 
                DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ${hourOffset} ${intervalUnit}), '%Y-%m-%d %H:00:00') AS interval_start
            UNION ALL
    `;
    for (let i = 1; i < hourOffset; i++) {
        const intervalValue = i === 0 ? '' : `INTERVAL 1 ${intervalUnit}`;
        recursiveQuery += `
            SELECT 
                ${i} AS hour_offset, 
                DATE_FORMAT(DATE_ADD((SELECT MAX(interval_start) FROM hours), ${intervalValue}), '%Y-%m-%d %H:00:00') AS interval_start
            UNION ALL
        `;
    }
    recursiveQuery = recursiveQuery.slice(0, -10); // Remove the last UNION ALL statement

    // Construct the main query with the recursive part
    const query = `
        ${recursiveQuery})
        SELECT 
            h.interval_start, 
            IFNULL(sd.Tag_Id, ?) AS Tag_Id, 
            IFNULL(sd.Tag_Name, 'YourTagName') AS Tag_Name, 
            ${aggregation === 'count' ? 'IFNULL(COUNT(sd.value), 0)' : aggregation === 'sum' ? 'IFNULL(SUM(sd.value), 0)' : aggregation === 'avg' ? 'IFNULL(AVG(sd.value), 0)' : aggregation === 'max' ? 'IFNULL(MAX(sd.value), 0)' : aggregation === 'min' ? 'IFNULL(MIN(sd.value), 0)' : '0'} AS aggregatedValue
        FROM 
            hours h
        LEFT JOIN 
            sensor_data sd ON sd.machineId = ? 
            AND sd.Tag_Id = ? 
            AND DATE_FORMAT(sd.dateTime, '%Y-%m-%d %H:00:00') = h.interval_start
        GROUP BY 
            h.interval_start, 
            sd.Tag_Id, 
            sd.Tag_Name
        ORDER BY 
            h.interval_start`;

    return query;
};



exports.ChartData = async (req, res) => {
    // const { machineId, sortDataType, aggregation, interval, selected } = req.body;

    try {
        // if (!machineId || !sortDataType || !aggregation || !selected) {
        //     return res.status(400).json({ error: "Missing required parameters" });
        // }

        // if (selected === "default") {
        //     const tagIdsArray = await getDefaultTags(machineId);
        //     console.log(tagIdsArray)
        //     const final = {};

        //     // for (const tagId of tagIdsArray) {
        //     const tagId = 329;
        //     const query = buildQuery(machineId, tagId, aggregation, sortDataType, interval);
        //     const [rows] = await connection.execute(query);
        //     final[tagId] = rows;
        //     // }

        //     return res.status(200).json({ rowsResult: final });
        // } else {
        //     // Handle other 'selected' values if applicable
        //     return res.status(400).json({ error: "Unsupported 'selected' value" });
        // }

        const machineId = 26; // Example machine ID
        const tagId = 329; // Example tag ID
        const aggregation = 'avg'; // Example aggregation type
        const sortDataType = '1day'; // Example sort data type
        const interval = '2hr'; // Example interval

        const sampleQuery = buildQuery(machineId, tagId, aggregation, sortDataType, interval);
        const [rows] = await connection.execute(sampleQuery, [tagId, machineId, tagId]);
        res.send(rows);
    } catch (err) {
        console.error("Error in try-catch block:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};




exports.insertData = async (req, res) => {
    try {
        const jsonData = req.body;
        const tagName = "kWh";
        const value = req.body.kWh;

        // Get current date and time in Asia/Kolkata time zone
        const now = moment().tz("Asia/Kolkata");
        const currentDate = now.format("YYYY-MM-DD");  // Format the date as required
        const currentTime = now.format("HH:mm:ss");    // Format the time as required

        const query = `INSERT INTO resulttable (Date, Time, AssetId, TagId, SlaveId, TagName, Value, JsonData) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
        const values = [currentDate, currentTime, 1, 6, 3, tagName, value, JSON.stringify(jsonData)];

        console.log(values)
        await connection.execute(query, values);
        res.send({ success: true });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
