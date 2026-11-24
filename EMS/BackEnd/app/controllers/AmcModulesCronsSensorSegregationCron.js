const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const cron = require('node-cron');


// Fetch recent data
async function fetchRecentData(oneMinuteAgo) {
    const [rows] = await connection.execute(
        `SELECT * FROM result_data WHERE Date >= ? AND Time >= ?`,
        [oneMinuteAgo.format('YYYY-MM-DD'), oneMinuteAgo.format('HH:mm:ss')]
    );
    //console.log("last one min: " + oneMinuteAgo.format('YYYY-MM-DD'), oneMinuteAgo.format('HH:mm:ss') + "data count: ", rows.length)
    return rows;
}

// Save sensor data
async function saveSensorData(data) {
    const { dateTime, machineId, deviceId, tagId, tagName, tagValue, preValue, min, max, avg } = data;

    if (tagName != 'kWh') {
        await connection.execute(
            `INSERT INTO sensor_data (dateTime, machineId, deviceId, Tag_Id, Tag_Name, value, preValue, Min, Max, Avg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dateTime || null, machineId || null, deviceId || null, tagId || null, tagName || null, tagValue || null, preValue || null, min || null, max || null, avg || null]
        );
    }
}

// Aggregate sensor data
async function aggregateSensorData(machineId, deviceId, tagId) {
    const fifteenMinutesAgo = moment().subtract(15, 'minutes');
    const [result] = await connection.execute(
        `SELECT SUM(value) as sum_value, AVG(value) as avg_value, MIN(value) as min_value, MAX(value) as max_value 
         FROM sensor_data 
         WHERE machineId = ? AND deviceId = ? AND Tag_Id = ? AND dateTime BETWEEN ? AND ?`,
        [machineId, deviceId, tagId, fifteenMinutesAgo.toDate(), moment().toDate()]
    );

    const [lastRocord] = await connection.execute(
        `SELECT value FROM sensor_data 
         WHERE machineId = ? AND deviceId = ? AND Tag_Id = ? AND dateTime BETWEEN ? AND ?`,
        [machineId, deviceId, tagId, fifteenMinutesAgo.toDate(), moment().toDate()]
    );

    const obj = { aggregatedData: result[0], rawValue: lastRocord[0].value };
    return obj;
}

// Insert aggregated data
async function insertAggregatedData(aggregatedData, rawValue, machineId, deviceId, tagId, tagName) {
    const latestValue = tagName == 'kWh' ? aggregatedData.sum_value : rawValue;
    await connection.execute(
        `INSERT INTO sensor_data (dateTime, machineId, deviceId, Tag_Id, Tag_Name, value, Min, Max, Avg, isAggregate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [moment().toDate(), machineId, deviceId, tagId, tagName, latestValue, aggregatedData.min_value, aggregatedData.max_value, aggregatedData.avg_value, 1]
    );
}

// Delete individual records
async function deleteIndividualRecords(machineId, deviceId, tagId) {
    const fifteenMinutesAgo = moment().subtract(15, 'minutes');
    await connection.execute(
        `DELETE FROM sensor_data WHERE machineId = ? AND deviceId = ? AND Tag_Id = ? AND isAggregate = 0 AND dateTime BETWEEN ? AND ?`,
        [machineId, deviceId, tagId, fifteenMinutesAgo.toDate(), moment().toDate()]
    );
}

// Check if data should be aggregated
function shouldAggregateData() {
    return moment().minute() % 15 === 0;
}

// Split function
async function split(jsonData) {
    try {
        const segregatedValues = [];
        // Fetch unique device and slave IDs from the database
        const [uniqueDeviceSlaveIds] = await connection.execute(`
            SELECT mpa.deviceId, mpa.slaveId, mpa.Tag_Id, mpa.Tag_Name, mpa.machineId, mpa.function, mpa.functionName, meters.id AS meterId
            FROM machine_parameter_allocation mpa
            LEFT JOIN meters ON meters.deviceId = mpa.deviceId AND meters.slaveId = mpa.slaveId
            GROUP BY mpa.deviceId, mpa.slaveId;
        `);

        // Preprocess JSON data outside loop
        const decodedJsonData = jsonData.map(record => JSON.parse(record.JsonData));

        for (const { deviceId, slaveId, Tag_Name: tagName, Tag_Id: tagId, machineId, functionName, function: functionNumber, meterId } of uniqueDeviceSlaveIds) {
            for (const record of decodedJsonData) {
                if (record.ID == deviceId && record.SL_ID == slaveId) {
                    // //console.log('deviceId ' + deviceId + ' slaveId ' + slaveId)
                    const [tagNameList] = await connection.execute(`
                        SELECT sensors.Tag_Name, sensors.Tag_Id, sensors.deviceId
                        FROM sensors
                        INNER JOIN machine_parameter_allocation ON sensors.deviceId = machine_parameter_allocation.deviceId
                        WHERE sensors.deviceId = ? AND machine_parameter_allocation.slaveId = ?
                    `, [deviceId, slaveId]);

                    for (const tag of tagNameList) {
                        const { Tag_Name: tagName, Tag_Id: tagId, deviceId } = tag;

                        // Check if the tag name exists in the JSON data
                        if (tagName in record) {
                            const tagValue = record[tagName];
                            const type = record.Type;
                            const dateTimeString = await parseDateTime(record.DATE, record.TIME);

                            const DValues = {
                                tagId,
                                type,
                                tagName,
                                tagValue,
                                deviceId,
                                machineId,
                                meterId,
                                functionName,
                                functionNumber,
                                dateTime: dateTimeString,
                                slaveId
                            };

                            segregatedValues.push(DValues);
                        }
                    }
                }
            }
        }

        ////console.log("segregatedValues:  ", segregatedValues.length)
        return await TagBasedCalculation(segregatedValues);

    } catch (error) {
        // //console.error("Error:", error);
        throw error;
    }
}

// Parse date and time
function parseDateTime(date, time) {
    const dateTimeString = `${date} ${time}`;
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedDateTime = `${formattedDate} ${timePart}`;
    return formattedDateTime;
}

// Tag based calculation
// async function TagBasedCalculation(segregatedValues) {
//     const [result] = await connection.execute(
//         `SELECT DISTINCT function, Tag_Id FROM machine_parameter_allocation`
//     );

//     let CalcValues = [];
//     for (const pair of result) {
//         const tagId = pair.Tag_Id;
//         const functionNumber = pair.function;

//         if (functionNumber === '5') {
//             CalcValues.push(SensorAnalogLatestRecordData(tagId, segregatedValues));
//         } else if (functionNumber === '6') {
//             CalcValues.push(SensorAnalogLatestDataWithMinMaxAvg(tagId, segregatedValues));
//         }
//     }

//     return CalcValues;
// }
async function TagBasedCalculation(segregatedValues) {
    try {
        const [result] = await connection.execute(
            `SELECT DISTINCT deviceId, slaveId, function, Tag_Id, Tag_Name as tagName FROM machine_parameter_allocation`
        );

        // const uniqueTagIds = new Set();
        const calcValues = [];

        for (const record of result) {
            const { Tag_Id: tagId, function: functionNumber, deviceId, slaveId, tagName } = record;
            // uniqueTagIds.add(tagId);

            if (functionNumber === '4' || functionNumber === '5') {
                calcValues.push(SensorAnalogLatestRecordData(tagId, deviceId, slaveId, tagName, segregatedValues));
            } else if (functionNumber === '1' || functionNumber === '6') {
                calcValues.push(SensorAnalogLatestDataWithMinMaxAvg(tagId, deviceId, slaveId, tagName, segregatedValues));
            }

            const latestValue = await SensorAnalogLatestRecordData(tagId, deviceId, slaveId, tagName, segregatedValues);
            await checkAlertTriggered(latestValue);
        }

        // //console.log('Unique Tag IDs:', Array.from(uniqueTagIds));
        return Promise.all(calcValues);
    } catch (error) {
        //console.error('Error during TagBasedCalculation:', error);
        throw error; // Re-throw the error to allow calling functions to handle it
    }
}


// Get the latest record data
async function SensorAnalogLatestRecordData(tagId, deviceId, slaveId, tagName, segregatedValues) {
    let latestRecord = null;

    for (const value of segregatedValues.reverse()) {
        if (value.deviceId == deviceId && value.slaveId == slaveId && value.tagName == tagName) {
            // //console.log(tagId)
            latestRecord = value;
            break;
        }
    }
    if (latestRecord) {
        await checkAlertTriggered(latestRecord);
    }

    return latestRecord;
}

//alert
async function checkAlertTriggered(latestValue) {
    try {
        const { tagId, tagValue, deviceId, slaveId, tagName } = latestValue;
        const [sensorDetails] = await connection.execute(`
            SELECT warningMin, warningMax, outOfRangeMin, outOfRangeMax, criticalMin, criticalMax, alertCount, alertResetCount, emailAlert
            FROM sensors
            WHERE Tag_Id = ? AND deviceId = ?
        `, [tagId, deviceId]);

        if (sensorDetails.length > 0) {
            const { warningMin, warningMax, outOfRangeMin, outOfRangeMax, criticalMin, criticalMax, alertCount, alertResetCount, emailAlert } = sensorDetails[0];
            let alertType = null;
            let alertCategory = null;
            let alertMessage = null;

            if (parseFloat(tagValue) < parseFloat(outOfRangeMin) || parseFloat(tagValue) > parseFloat(outOfRangeMax)) {
                alertType = 'Out of Range';
                alertCategory = 3;
                alertMessage = `${tagName} value ${tagValue} is Out of Range!`;

            } else if (parseFloat(tagValue) < parseFloat(warningMin) || parseFloat(tagValue) > parseFloat(warningMax)) {
                alertType = 'Warning';
                alertCategory = 2;
                alertMessage = `${tagName} value ${tagValue} is Warning!`;

            } else if (parseFloat(tagValue) < parseFloat(criticalMin) || parseFloat(tagValue) > parseFloat(criticalMax)) {
                alertType = 'Critical';
                alertCategory = 1;
                alertMessage = `${tagName} value ${tagValue} is Critical!`;
            } else {
                // normal stage
            }

            if (alertType && alertCategory) {
                await insertAlert(latestValue, alertCategory, alertMessage, alertCount, alertResetCount, emailAlert);
            }
        }
        return true;
    } catch (error) {
        //console.error("Error checking alert:", error);
    }
}

async function insertAlert(latestValue, alertCategory, alertMessage, sendAlertCount, resetAlertCount, emailAlert) {
    try {
        const { tagId, tagName, deviceId, machineId, tagValue } = latestValue;
        const now = moment().tz("Asia/Kolkata");
        const currentDateTime = now.format("YYYY-MM-DD HH:mm:ss");  // Format the date as required

        const [fetchRow] = await connection.execute(`SELECT id, alertCount, messageSentStatus FROM alert_data WHERE tagId = ? AND alertCategory = ? AND isCleared = ?`,
            [tagId, alertCategory, '0']);

        if (fetchRow.length > 0) {
            let { id, alertCount, messageSentStatus } = fetchRow[0];
            alertCount++;

            let updateQuery = `UPDATE alert_data SET value = ?`
            let values = [tagValue];

            if (alertCount >= resetAlertCount) {
                updateQuery += ` , alertCount = ?, messageSentStatus = ?`;
                values.push(0, 0);
                //console.log("resetting alert counts!");

            } else if (alertCount >= sendAlertCount) {
                updateQuery += ` , alertCount = ?, triggered = ?, messageSentStatus = ?`;
                values.push(alertCount, 1, 1);

                if (emailAlert == 1 && messageSentStatus == 0) {
                    await sendEmailToUser();
                }
            } else if (alertCount) {
                updateQuery += ` , alertCount = ?`;
                values.push(alertCount);
            }
            updateQuery += ` WHERE id = ?`;
            values.push(id);

            await connection.execute(updateQuery, values);

        } else {
            const triggeredAlertCount = Number(sendAlertCount) == 1 ? 1 : 0;
            //console.log([currentDateTime, tagId, tagName, deviceId, machineId, tagValue, alertCategory, alertMessage, 1, triggeredAlertCount])
            await connection.execute(`
                INSERT INTO alert_data (dateTime, tagId, tagName, deviceId, machineId, value, alertCategory, alertMessage, alertCount, triggered)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [currentDateTime, tagId, tagName, deviceId, machineId, tagValue, alertCategory, alertMessage, 1, triggeredAlertCount]);
        }

        return true;
    } catch (error) {
        //console.error("Error inserting alert:", error);
    }
}


async function sendEmailToUser() {
    //console.log("email sent");
}


// Get the latest data with min, max, and avg values
function SensorAnalogLatestDataWithMinMaxAvg(tagId, deviceId, slaveId, tagName, segregatedValues) {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    let sum = 0;
    let count = 0;
    let latest = null;

    for (const value of segregatedValues) {

        if (value.deviceId == deviceId && value.slaveId == slaveId && value.tagName == tagName) {
            //console.log(tagId)
            const tagValue = parseFloat(value.tagValue);
            min = Math.min(min, tagValue);
            max = Math.max(max, tagValue);
            sum += tagValue;
            count++;
            latest = value;
        }
    }

    const avg = count > 0 ? sum / count : 0;
    const result = latest ? { ...latest, min, max, avg } : null;

    return result;
}

// Handle data aggregation
async function handleDataAggregation(segregatedValue) {
    const { machineId, deviceId, tagId, tagName } = segregatedValue;

    const { aggregatedData, rawValue } = await aggregateSensorData(machineId, deviceId, tagId);
    await insertAggregatedData(aggregatedData, rawValue, machineId, deviceId, tagId, tagName);
    await deleteIndividualRecords(machineId, deviceId, tagId);
}

// Main segregation function
exports.segregation = async (req, res) => {
    cron.schedule('0 * * * * *', async () => {
        // console.log('Sensors Segregation Cron Job start At:', moment().format('YYYY-MM-DD HH:mm:ss'));
        try {
            const now = moment().tz('Asia/Kolkata');


            const oneMinuteAgo = now.clone().subtract(1, 'minute');

            const jsonData = await fetchRecentData(oneMinuteAgo);

            if (jsonData.length > 0) {
                const segregatedValues = await split(jsonData);

                //console.log(segregatedValues)
                for (const segregatedValue of segregatedValues) {
                    // //console.log(segregatedValue)
                    if (segregatedValue != null) {
                        await saveSensorData(segregatedValue);

                        if (shouldAggregateData()) {
                            await handleDataAggregation(segregatedValue);
                        }
                    }
                }

                // return res.status(200).json({
                //     success: true,
                //     message: "Data inserted successfully",
                //     data: segregatedValues
                // });
                //console.log("Data inserted successfully");
                return true;

            } else {
                // return res.status(200).json({
                //     success: true,
                //     message: "No data found in last one minute",
                //     data: []
                // });
                //console.log("No data found in last one minute");
                return true;

            }
            // console.log('Sensor segregation Cron job End Time:', moment().format('YYYY-MM-DD HH:mm:ss'));

        } catch (err) {
            //console.error(err);
            // return res.status(500).json({
            //     success: false,
            //     message: 'Internal server error',
            //     error: err.message
            // });
            return false;
        }
    });
};


exports.testAlert = async (req, res) => {
    try {
        const latestValue = { tagId: 2, tagValue: 5, deviceId: 1, slaveId: 1, tagName: 'vibration', machineId: 1 }
        await checkAlertTriggered(latestValue);
        res.send("success");
    } catch (err) {
        //console.log(err)
        return res.status(200).json({ message: err.message })
    }
}