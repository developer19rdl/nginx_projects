const { connection } = require('../config/dbSql2');

const { sendEmail } = require('../config/emailService')
const moment = require('moment-timezone');
const cron = require('node-cron');

const BATCH_SIZE = 500;


// Fetch recent data
async function fetchRecentData(oneMinuteAgo) {
    const [rows] = await connection.execute(
        `SELECT Date, Time, JsonData FROM result_data WHERE Date >= ? AND Time >= ?`,
        [oneMinuteAgo.format('YYYY-MM-DD'), oneMinuteAgo.format('HH:mm:ss')]
    );
    //console.log("last one min: " + oneMinuteAgo.format('YYYY-MM-DD'), oneMinuteAgo.format('HH:mm:ss') + "data count: ", rows.length)
    return rows;
}

// Save sensor data
async function saveSensorData(data) {
    const { dateTime, machineId, deviceId, slaveId, tagId, tagName, tagValue, preValue, min, max, avg } = data;

    if (tagName != 'kWh') {
        await connection.execute(
            `INSERT INTO sensor_segregated_data (dateTime, machineId, deviceId, slaveId, Tag_Id, Tag_Name, value, preValue, Min, Max, Avg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dateTime || null, machineId || null, deviceId || null, slaveId || null, tagId || null, tagName || null, tagValue || null, preValue || null, min || null, max || null, avg || null]
        );
    }
}


// Split function
async function split(jsonData) {
    try {
        const segregatedValues = [];
        // Fetch unique device and slave IDs from the database
        

        const [uniqueDeviceSlaveIds] = await connection.execute(`
            SELECT * from machine_device_aloc_view
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
                        GROUP BY sensors.Tag_Name, sensors.Tag_Id, sensors.deviceId;
                    `, [deviceId, slaveId]);

                    for (const tag of tagNameList) {
                        const { Tag_Name: tagName, Tag_Id: tagId, deviceId } = tag;

                        // Check if the tag name exists in the JSON data
                        if (tagName in record) {
                            const tagValue = record[tagName];
                            const type = record.Type;
                            const dateTimeString = parseDateTime(record.DATE, record.TIME);

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



async function TagBasedCalculation(segregatedValues) {
    try {
        const [result] = await connection.execute(
            `SELECT DISTINCT deviceId, slaveId, function, Tag_Id, Tag_Name as tagName FROM machine_parameter_allocation`
        );

        const calcValues = [];

        for (const record of result) {
            const { Tag_Id: tagId, function: functionNumber, deviceId, slaveId, tagName } = record;

            // Skip if no function is applicable
            if (!functionNumber) continue;

            if (functionNumber === '4' || functionNumber === '5') {
                calcValues.push(SensorAnalogLatestRecordData(tagId, deviceId, slaveId, tagName, segregatedValues));
            } else if (functionNumber === '1' || functionNumber === '6') {
                calcValues.push(SensorAnalogLatestDataWithMinMaxAvg(tagId, deviceId, slaveId, tagName, segregatedValues));
            }

            // Retrieve the latest value
            const latestValue = await SensorAnalogLatestRecordData(tagId, deviceId, slaveId, tagName, segregatedValues);

            // Only proceed if latestValue is not null or undefined
            // if (latestValue) {
            //     await checkAlertTriggered(latestValue);
            // } else {
            //     console.log(`Skipping alert check for tagId ${tagId} as latestValue is null`);
            // }
        }

        return Promise.all(calcValues);
    } catch (error) {
        console.error('Error during TagBasedCalculation:', error);
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

    return latestRecord;
}

//alert


async function checkAlertTriggered(latestValue) {
    try {
        console.log("alert trigger")
        if (!latestValue) {
            console.log("latestValue is null or undefined. Skipping alert check.");
            return false; // Exit early if latestValue is not valid
        }

        const { tagId, tagValue, deviceId, slaveId, tagName } = latestValue;

        const [sensorDetails] = await connection.execute(`
            SELECT warningMin, warningMax, outOfRangeMin, outOfRangeMax, criticalMin, criticalMax, alertCount, alertResetCount, emailAlert
            FROM sensors
            WHERE Tag_Id = ? AND deviceId = ? AND alert = '1'
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
            }

            if (alertType && alertCategory) {
                await insertAlert(latestValue, alertCategory, alertMessage, alertCount, alertResetCount, emailAlert);
            }
        }
        return true;
    } catch (error) {
        console.error("Error checking alert:", error);
    }
}





const emailCooldown = new Map(); // Stores the last email sent timestamp for each tagId

async function insertAlert(latestValue, alertCategory, alertMessage, sendAlertCount, resetAlertCount, emailAlert) {
    try {
        const { tagId, tagName, deviceId, machineId, tagValue } = latestValue;
        const now = moment().tz("Asia/Kolkata");
        const currentDateTime = now.format("YYYY-MM-DD HH:mm:ss");

        const [fetchRow] = await connection.execute(
            `SELECT id, alertCount, messageSentStatus FROM alert_data WHERE tagId = ? AND alertCategory = ? AND isCleared = ?`,
            [tagId, alertCategory, '0']
        );

        if (fetchRow.length > 0) {
            let { id, alertCount, messageSentStatus } = fetchRow[0];
            alertCount++;

            let updateQuery = `UPDATE alert_data SET value = ?`;
            let values = [tagValue];

            if (alertCount >= resetAlertCount) {
                updateQuery += ` , alertCount = ?, messageSentStatus = ?`;
                values.push(0, 0);
            } else if (alertCount >= sendAlertCount) {
                updateQuery += ` , alertCount = ?, triggered = ?, messageSentStatus = ?`;
                values.push(alertCount, 1, 1);

                if (emailAlert == 1 && messageSentStatus == 0) {
                    const lastEmailSentTime = emailCooldown.get(tagId) || 0;
                    const timeSinceLastEmail = now.unix() - lastEmailSentTime;

                    // Send email only if more than 15 minutes have passed since the last email for the same tagId
                    if (timeSinceLastEmail > 900) {
                        await sendEmailToUser(alertMessage, tagId, deviceId, machineId);
                        emailCooldown.set(tagId, now.unix()); // Update the last email sent time
                    }
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
            await connection.execute(
                `INSERT INTO alert_data (dateTime, tagId, tagName, deviceId, machineId, value, alertCategory, alertMessage, alertCount, triggered)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [currentDateTime, tagId, tagName, deviceId, machineId, tagValue, alertCategory, alertMessage, 1, triggeredAlertCount]
            );
        }

        return true;
    } catch (error) {
        console.error("Error inserting alert:", error);
    }
}


async function sendEmailToUser(alertMessage, tagId, deviceId, machineId) {
    const fetchQuery = `SELECT email, empname FROM user WHERE userRole = 'Supervisor'`;
    const [userRows] = await connection.query(fetchQuery);

    const [machineResult] = await connection.execute(`SELECT machine_name FROM machines WHERE id = ?`, [machineId]);
    const machineName = machineResult[0].machine_name;

    // Send individual email for each user
    for (const user of userRows) {
        const emailBody = `
            <p>Dear ${user.empname},</p>
            <p><strong>Alert:</strong> ${alertMessage}</p>
            <p>Machine: <strong>${machineName}</strong></p>
            <div style="text-align: center; margin-top: 20px;">
                <a href="http://125.18.47.138/NVH_India_Ananthapur/NVH_Shop_Floor/Ems_Monitor/#/Sign_in" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    DASHBOARD
                </a>
            </div>
            <br>
        `;

        try {
            // Send email only to this user
            await sendEmail([user.email], "Alert Notification", emailBody, emailBody);
        } catch (error) {
            if (error.responseCode === 454) {
                console.error('Too many login attempts, retrying after delay...');
                await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute before retrying
            } else {
                console.error('Error sending email:', error);
            }
        }
    }
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

exports.segregation = async (req, res) => {
    cron.schedule('0 * * * * *', async () => {
        // console.log('Sensors Segregation Cron Job start At:', moment().format('YYYY-MM-DD HH:mm:ss'));
        try {
            const now = moment().tz('Asia/Kolkata');
            const oneMinuteAgo = now.clone().subtract(1, 'minute');
            const jsonData = await fetchRecentData(oneMinuteAgo);
            if (jsonData.length > 0) {
                // Process data in batches
                for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
                    // Get a batch of data
                    const batch = jsonData.slice(i, i + BATCH_SIZE);

                    // Split data into segregated values for this batch
                    const segregatedValues = await split(batch);

                    // Save data in parallel for each batch
                    await Promise.all(segregatedValues.map(async segregatedValue => {
                        if (segregatedValue != null) {
                            await saveSensorData(segregatedValue);

                        }
                    }));
                }


                return true;
            } else {

                return true;
            }
        } catch (err) {

            return false;
        }
    });
};
