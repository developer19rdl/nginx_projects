const { connection, CustomError } = require('./config/dbSql2');
const moment = require('moment-timezone');

exports.InsertHmiMachineManualProduction = async (req, res) => {
    try {
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
        const newDate = currentDateTimeHR.format('YYYY-MM-DD');
        const hrampm = currentDateTimeHR.format('hA');

        const { machineId, tagId, tagName, tagValue } = req.body;

        const existingDataRows = await getExistingData(newDate, machineId, tagId, hrampm);

        if (existingDataRows.length > 0) {
            await updateProductionData(tagValue, newDate, machineId, tagId, hrampm);
        } else {
            await insertProductionData(machineId, tagId, tagName, tagValue, newDate, hrampm);
        }

        return res.status(200).json({ success: true, message: 'Data processed successfully' });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// Helper function to get existing data
const getExistingData = async (date, machineId, tagId, hr) => {
    const [rows] = await connection.execute(`
        SELECT *
        FROM production_data
        WHERE date = ?
        AND machineId = ?
        AND Tag_Id = ?
        AND HR = ?
    `, [date, machineId, tagId, hr]);
    return rows;
};

// Helper function to update production data
const updateProductionData = async (tagValue, date, machineId, tagId, hr) => {
    await connection.execute(`
        UPDATE production_data
        SET value = value + ?
        WHERE date = ?
        AND machineId = ?
        AND Tag_Id = ?
        AND HR = ?
    `, [tagValue, date, machineId, tagId, hr]);
};

// Helper function to insert production data
const insertProductionData = async (machineId, tagId, tagName, tagValue, date, hr) => {
    await connection.execute(`
        INSERT INTO production_data (machineId, Tag_Id, Tag_Name, value, dateTime, date, HR)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [machineId, tagId, tagName, tagValue, new Date(), date, hr]);
};


exports.DownTimeStart = async (req, res) => {
    try {
        const startDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        const { machineId, oeeParaReasonId, startTime, startDate } = req.body;

        const insertQuery = `
            INSERT INTO downtime (machineId, startDateTime, oeeParaReasonId, startTime, startDate)
            VALUES (?, ?, ?, ?, ?)
        `;
        const insertParams = [machineId, startDateTime, oeeParaReasonId, startTime, startDate];
        await connection.execute(insertQuery, insertParams);

        const updateQuery = `
            UPDATE machines
            SET isDownTime = 1
            WHERE id = ?
        `;
        const updateParams = [machineId];

        await connection.execute(updateQuery, updateParams);

        return res.status(200).json({ success: true, message: 'DownTime Started' });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.DownTimeEnd = async (req, res) => {
    try {
        const endDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        const { machineId, remarks, endTime, endDate } = req.body;

        // Find the existing downtime record based on machineId and endDateTime being null
        const [rows] = await connection.execute(`
            SELECT * FROM downtime 
            WHERE machineId = ? 
            AND startDateTime IS NOT NULL 
            AND endDateTime IS NULL
        `, [machineId]);

        if (rows.length === 0) {
            throw new Error("No active downtime record found for the specified machine.");
        }

        // Assuming there is only one active record
        const downtimeId = rows[0].id;

        // Update downtime record with endDateTime and other details
        await connection.execute(`
            UPDATE downtime 
            SET endDateTime = ?, remarks = ?, endTime = ?, endDate = ?
            WHERE id = ?
        `, [endDateTime, remarks, endTime, endDate, downtimeId]);

        const updateQuery = `
            UPDATE machines
            SET isDownTime = 0
            WHERE id = ?
        `;
        const updateParams = [machineId];

        await connection.execute(updateQuery, updateParams);

        return res.status(200).json({ success: true, message: 'DownTime Ended' });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.machineDropDown = async (req, res) => {
    try {

        const [result] = await connection.execute(`
            SELECT id, machine_name
            FROM machines
        `);

        if (result.length === 0) {
            throw new Error("Machine not found");
        }

        res.status(200).json({
            message: "Machine Lists",
            data: result,
        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: 406
        });
    }
};


exports.OeeDownReason = async (req, res) => {
    try {
        const [result] = await connection.execute(`
            SELECT 
                oee_parameters.oeeParaCategoryId, 
                oee_parameter_categories.oeeCategoryName AS categoryName, 
                oee_parameters.parameterName, 
                oee_parameters.id
            FROM 
              oee_parameters
            JOIN 
                oee_parameter_categories 
            ON 
                oee_parameters.oeeParaCategoryId = oee_parameter_categories.id
        `);

        if (result.length === 0) {
            throw new Error("Oee Downtime reason");
        }

        res.status(200).json({
            message: "Oee Reason Lists",
            data: result,
        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: 406
        });
    }
};


exports.getPerformanceReason = async (req, res) => {
    try {
        const [result] = await connection.execute(`
            SELECT 
                oee_parameters.oeeParaCategoryId, 
                oee_parameter_categories.oeeCategoryName AS categoryName, 
                oee_parameters.parameterName, 
                oee_parameters.id
            FROM 
                oee_parameters
            JOIN 
                oee_parameter_categories 
            ON 
                oee_parameters.oeeParaCategoryId = oee_parameter_categories.id
            WHERE 
                oee_parameters.oeeParaCategoryId = ?
        `, [2]);

        if (result.length === 0) {
            throw new Error("Performance reason List");
        }

        res.status(200).json({
            message: "Oee Reason Lists",
            data: result,
        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: 406
        });
    }
};

exports.addPerformance = async (req, res) => {
    const dateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    try {
        const { machineId, oeeParaReasonId, DurationMin } = req.body;

        const [result] = await connection.execute(`
            INSERT INTO performances (machineId, dateTime, oeeParaReasonId, DurationMin)
            VALUES (?, ?, ?, ?)
        `, [machineId, dateTime, oeeParaReasonId, DurationMin]);

        res.status(200).json({
            message: "Performance submitted",
            status: 200
        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: 406
        });
    }
};
