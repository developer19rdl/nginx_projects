const { connection, CustomError } = require('./config/dbSql2');
const cron = require('node-cron');
const moment = require('moment-timezone');

async function split(jsonData) {
    const startTime = Date.now();
    const segregatedValues = [];
    const deviceIdSlaveIdSet = new Set();

    try {
        // Fetch unique device and slave IDs
        const [uniqueDeviceSlaveIds, fields] = await connection.execute(`
            SELECT DISTINCT deviceId, slaveId
            FROM machine_parameter_allocation
        `);

        // Store unique device and slave IDs in a Set for faster lookup
        uniqueDeviceSlaveIds.forEach(({ deviceId, slaveId }) => {
            deviceIdSlaveIdSet.add(`${deviceId}_${slaveId}`);
        });


        // Preprocess JSON data outside loop
        const decodedJsonData = jsonData.map(record => JSON.parse(record.JsonData));



        // Iterate through decoded JSON data
        for (const record of decodedJsonData) {
            const key = `${record.ID}_${record.SL_ID}`;

            // Check if the record matches any unique device and slave ID combination
            if (deviceIdSlaveIdSet.has(key)) {
                // Fetch tag names for the current device and slave ID combination
                const [tagNameList, fields] = await connection.execute(`
                    SELECT sensors.Tag_Name, sensors.Tag_Id, sensors.deviceId,sensors.warningMin,sensors.warningMax,sensors.outOfRangeMin,sensors.outOfRangeMax,sensors.criticalMin,sensors.criticalMax
                    FROM sensors
                    INNER JOIN machine_parameter_allocation ON sensors.deviceId = machine_parameter_allocation.deviceId
                    WHERE sensors.deviceId = ? AND machine_parameter_allocation.slaveId = ?
                `, [record.ID, record.SL_ID]);

                // Iterate through tag names
                for (const tag of tagNameList) {
                    const { Tag_Name: tagName, Tag_Id: tagId, deviceId, warningMin, warningMax, outOfRangeMin, outOfRangeMax, criticalMin, criticalMax } = tag;

                    // Check if the tag name exists in the JSON data
                    if (record[tagName] !== undefined) {
                        // Process tag data
                        const tagValue = record[tagName];
                        const type = record.Type;
                        let formattedDateTime = '';

                        if (record.DATE !== undefined && record.TIME !== undefined) {
                            const dateTimeString = record.DATE + ' ' + record.TIME;
                            const dateTime = moment(dateTimeString, 'DD-MM-YYYY HH:mm:ss');

                            if (dateTime.isValid()) {
                                formattedDateTime = dateTime.format('YYYY-MM-DD HH:mm:ss');
                            } else {
                                console.error("Failed to parse date or time");
                            }
                        } else {
                            console.error("DATE or TIME key is missing in record");
                        }

                        // Fetch machine allocation data
                        const [machineAllocations, fields] = await connection.execute(`
                            SELECT machineId, functionName, function
                            FROM machine_parameter_allocation
                            WHERE deviceId = ? AND Tag_Id = ?
                            LIMIT 1
                        `, [deviceId, tagId]);

                        const machineAllocation = machineAllocations[0];

                        // Construct segregated value object
                        const DValues = {
                            tagId,
                            type,
                            tagName,
                            tagValue,
                            deviceId,
                            machineId: machineAllocation.machineId,
                            functionName: machineAllocation.functionName,
                            functionNumber: machineAllocation.function,
                            dateTime: formattedDateTime,
                            warningMin,
                            warningMax,
                            outOfRangeMin,
                            outOfRangeMax,
                            criticalMin,
                            criticalMax
                        };

                        // Push segregated value object to array
                        segregatedValues.push(DValues);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error during split:', error);
    }

    // const executionTime = Date.now() - startTime;
    // console.log("Execution time of split:", executionTime, "milliseconds");


    return TagBasedCalculation(segregatedValues); // Assuming TagBasedCalculation function is defined elsewhere
}



async function TagBasedCalculation(segregatedValues) {
    try {
        const [rows] = await connection.execute(`
            SELECT function, Tag_Id
            FROM machine_parameter_allocation
            GROUP BY function, Tag_Id
        `);

        const calcValues = [];

        for (const row of rows) {
            const { Tag_Id: tagId, function: functionNumber } = row;

            if (functionNumber == '1') {
                calcValues.push(await statusDigitalLatestRecord(tagId, segregatedValues));
            }
        }

        return calcValues;
    } catch (error) {
        console.error("Error in tag based calculation:", error);
        throw error; // handle the error as needed
    }
}

function statusDigitalLatestRecord(tagId, segregatedValues) {
    const startTime = Date.now();
    // Iterate over the array in reverse order to find the last record with the specified tagId
    for (let i = segregatedValues.length - 1; i >= 0; i--) {
        if (segregatedValues[i].tagId == tagId) {
            // Return the last record found with the specified tagId
            // const executionTime = (Date.now() - startTime) / 1000;
            // console.log(`Execution time of statusDigitalLatestRecord: ${executionTime} seconds`);
            return segregatedValues[i];
        }
    }

    const executionTime = (Date.now() - startTime) / 1000;
    console.log(`Execution time of statusDigitalLatestRecord: ${executionTime} seconds`);
    // Return null if no record with the specified tagId is found
    return null;
}



exports.AlertCronJob = async (req, res) => {
    // cron.schedule('0 * * * * *', async () => {
    const now = moment().tz('Asia/Kolkata');
    const oneMinuteAgo = now.clone().subtract(1, 'minute');

    try {
        const [rows, fields] = await connection.execute(` SELECT *
          FROM result_data
          WHERE Date >= ?
          AND Time >= ?
          AND JSON_EXTRACT(JsonData, '$.Type') = 'METER'
        `, [oneMinuteAgo.format('YYYY-MM-DD'), oneMinuteAgo.format('HH:mm:ss')]);

        if (rows.length > 0) {
            const segregatedValues = await split(rows);

            // Iterate through segregatedValues
            for (const value of segregatedValues) {

                if (value !== null) {

                    // Check if alert for this tagId has already been triggered in the last minute
                    const alreadyTriggered = await checkAlertTriggered(value.tagId);
                    if (!alreadyTriggered) {

                        // Compare tagValue with threshold values
                        const { tagValue, warningMin, warningMax, outOfRangeMin, outOfRangeMax, criticalMin, criticalMax, tagName } = value;
                        let alertMessage = null;

                        if (parseFloat(tagValue) < parseFloat(warningMin) || parseFloat(tagValue) > parseFloat(warningMax)) {
                            alertMessage = `${tagName} value ${tagValue} is Warning!`;
                        } else if (parseFloat(tagValue) < parseFloat(outOfRangeMin) || parseFloat(tagValue) > parseFloat(outOfRangeMax)) {
                            alertMessage = `${tagName} value ${tagValue} is Out of Range!`;
                        } else if (parseFloat(tagValue) < parseFloat(criticalMin) || parseFloat(tagValue) > parseFloat(criticalMax)) {
                            alertMessage = `${tagName} value ${tagValue} is Critical!`;
                        }

                        // Insert alert data into alert_data table
                        // Insert alert data into alert_data table
                        await connection.execute(`INSERT INTO alert_data (dateTime, tagId, tagName, deviceId, machineId, value, alertMessage, triggered) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [value.dateTime, value.tagId, value.tagName, value.deviceId, value.machineId, value.tagValue, alertMessage, true]);
                    }
                } else {
                    console.log("tagValue is null for:", value);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Users list",
                data: segregatedValues
            });
        } else {
            console.log("No Data Found" + oneMinuteAgo)
            return res.status(200).json({
                success: true,
                message: "No Data Found"
            });
        }

    } catch (error) {
        console.log('Error during scheduling:', error);
        return res.status(500).json({
            success: false,
            message: "Error during scheduling",
            error: error.message
        });
    }
    // });
}
// Function to check if alert for a given tagId has already been triggered
async function checkAlertTriggered(tagId) {
    const [rows, fields] = await connection.execute('SELECT COUNT(*) as count FROM alert_data WHERE tagId = ? AND triggered = true', [tagId]);
    return rows[0].count > 0;
}