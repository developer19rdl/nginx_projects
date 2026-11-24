const { connection, CustomError } = require('../config/dbSql2');
const cron = require('node-cron');
const moment = require('moment-timezone');
const winston = require('winston');


// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});



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

                    

                    //  const [tagNameList] = await connection.execute(`
                    //     SELECT sensors.Tag_Name, sensors.Tag_Id, sensors.deviceId
                    //     FROM sensors
                    //     INNER JOIN machine_parameter_allocation ON sensors.deviceId = machine_parameter_allocation.deviceId
                    //     WHERE sensors.deviceId = ? AND machine_parameter_allocation.slaveId = ?
                    // `, [deviceId, slaveId]);

                    const [tagNameList] = await connection.execute(`
                        SELECT *
                        FROM energy_machine_parameter_view
                        WHERE deviceId = ? AND slaveId = ?
                    `, [deviceId, slaveId]);

                    for (const tag of tagNameList) {
                        const { Tag_Name: tagName, Tag_Id: tagId, deviceId } = tag;

                        // Check if the tag name exists in the JSON data
                        if (tagName in record) {
                            const tagValue = record[tagName];
                            const type = record.Type;
                            const dateTimeString = `${record.DATE} ${record.TIME}`

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
        return await TagBasedCalculation(segregatedValues);

    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

async function TagBasedCalculation(segregatedValues) {
    try {

        const [result] = await connection.execute(`
            SELECT function, Tag_Id, slaveId
            FROM machine_parameter_allocation
            GROUP BY function, Tag_Id, slaveId
        `, []);

        const calcValues = [];

        for (const pair of result) {
            const { function: functionNumber, Tag_Id: tagId, slaveId } = pair;

            if (functionNumber == '1') {
                calcValues.push(await StatusDigitalLatestRecord(tagId, slaveId, segregatedValues));
            } else if (functionNumber == '4') {
                const a = await CalculateKWh(tagId, slaveId, segregatedValues);

                calcValues.push(a);
            }
        }
        return calcValues;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}


async function StatusDigitalLatestRecord(tagId, slaveId, segregatedValues) {
    // Iterate over the array in reverse order to find the last record with the specified tagId
    for (let i = segregatedValues.length - 1; i >= 0; i--) {
        if (segregatedValues[i].tagId === tagId && segregatedValues[i].slaveId === slaveId) {
            // Return the last record found with the specified tagId
            return segregatedValues[i];
        }
    }
}



async function CalculateKWh(receivedTagId, slaveId, segregatedValues) {
    try {
        let tagData = segregatedValues.reverse().find(item => item.tagId == receivedTagId && item.slaveId == slaveId);

        if (!tagData || tagData.tagValue <= 0) {
            return null;
        }

        const {
            tagId, tagValue: latestKwh, machineId, meterId, type,
            tagName, deviceId, functionName, functionNumber, dateTime
        } = tagData;

        const currentDateTimeHR = moment().tz('Asia/Kolkata');
        const currentDate = currentDateTimeHR.format('YYYY-MM-DD');
        const currentHr = currentDateTimeHR.format('hA');
        const lastHr = currentDateTimeHR.subtract(1, 'hours').format('hA');

        let finalKwh = 0;
        let finalKwhPre = latestKwh;

        // Fetch the last inserted 'preValue' from the database
        const [existingDataRows] = await connection.execute(`
            SELECT id, kWh, kWh_pre
            FROM energy_data
            WHERE date = ? AND meterId = ? AND HR = ?
            LIMIT 1
        `, [currentDate, meterId, currentHr]);

        if (meterId == 32) {
            console.log("existingDataRows", existingDataRows.length > 0);
        }

        // Fetch the last 3 hours of kWh values to calculate the average consumption
        const [last3HourRows] = await connection.execute(`
            SELECT kWh 
            FROM energy_data
            WHERE meterId = ? AND
            HR != ? AND kWh > ?
            ORDER BY id DESC 
            LIMIT 3
        `, [meterId, currentHr, 0]);

        let avgKwh = 0;

        if (last3HourRows.length > 0) {
            avgKwh = last3HourRows.reduce((sum, row) => sum + parseFloat(row.kWh), 0) / last3HourRows.length;
        }
        if (meterId == 32) {
            console.log("avgKwh", avgKwh);
        }
        if (existingDataRows.length > 0) {
            const { kWh, kWh_pre } = existingDataRows[0];

            if (meterId == 32) {
                console.log("kWh", kWh, "kWh_pre", kWh_pre);

            }

            if (kWh_pre != 0 && kWh_pre != null) {
                finalKwh = Math.max(parseFloat(latestKwh) - parseFloat(kWh_pre) + parseFloat(kWh), 0);

                finalKwhPre = parseFloat(latestKwh) > parseFloat(kWh_pre) ? parseFloat(latestKwh) : parseFloat(kWh_pre);

            } else {
                const [rowsKWH] = await connection.execute(`SELECT last_kwh FROM meters WHERE id = ?`, [meterId]);
                const lastKWH = rowsKWH.length > 0 ? rowsKWH[0].last_kwh : 0;
                finalKwh = Math.max(parseFloat(latestKwh) - parseFloat(lastKWH) + parseFloat(kWh), 0);
                // finalKwh = parseFloat(kWh) || 0;
                finalKwhPre = parseFloat(latestKwh) > parseFloat(lastKWH) ? parseFloat(latestKwh) : parseFloat(lastKWH);
            }
            // finalKwhPre = parseFloat(latestKwh) > parseFloat(kWh_pre) ? parseFloat(latestKwh) : parseFloat(kWh_pre);
        } else {
            const [rowsKWH] = await connection.execute(`SELECT last_kwh FROM meters WHERE id = ?`, [meterId]);
            const lastKWH = rowsKWH.length > 0 ? rowsKWH[0].last_kwh : 0;
            finalKwh = Math.max(parseFloat(latestKwh) - parseFloat(lastKWH), 0);
            finalKwhPre = parseFloat(latestKwh) > parseFloat(lastKWH) ? parseFloat(latestKwh) : parseFloat(lastKWH);
        }

        // Ensure finalKwh is not abnormally large compared to recent consumption
        // if (finalKwh > avgKwh * 25) {
        //     console.warn(`Skipping update for meter ${meterId} due to abnormally high kWh value: ${finalKwh}`);
        //     return null; // Skip the update
        // }

        if (avgKwh === 0 || last3HourRows.length === 0) {
            console.log(`No valid data or average is 0 for meter ${meterId}. Proceeding without outlier check.`);
        } else if (finalKwh > avgKwh * 45) {
            console.log(`Skipping kWh update for meter ${meterId} due to abnormally high kWh value: ${finalKwh}`);
            // Still update the latestKwh value, even if the finalKwh is ignored
            return null; // Skip updating finalKwh
        }

        //------------------------------------------Start-----------------------------------//
        if (meterId == 32) {
            console.log("finalKwhPre", finalKwhPre)

            console.log("avgKwh * 25", avgKwh * 25);

            console.log("finalKwh", finalKwh);

            console.log("meterId", meterId);
        }
        // -------------------------------------------End-------------------------------------//

        // Ensure finalKwh is rounded to a reasonable number of decimal places
        finalKwh = parseFloat(finalKwh.toFixed(2));

        // Update the meter's last_kwh if needed
        const [fetchRows] = await connection.execute(`SELECT last_kwh FROM meters WHERE meters.id = ?`, [meterId]);
        if (fetchRows.length > 0 && parseFloat(latestKwh) > parseFloat(fetchRows[0].last_kwh)) {
            await connection.execute(`UPDATE meters SET last_kwh = ? WHERE meters.id = ?`, [latestKwh, meterId]);
        }

        // Create data object to insert
        const segValue = {
            tagId, type, tagName, kWh: finalKwh,
            preValue: (finalKwhPre == null || finalKwhPre == undefined) ? finalKwhPre : parseFloat(finalKwhPre).toFixed(2),
            deviceId, machineId, meterId, functionName, functionNumber,
            dateTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        };

        // Insert the calculated kWh data into the database
        await InsertSensorKwh(segValue, slaveId);
        if (meterId == 32) {
            console.log("segValue", segValue)
        }

        return segValue;
    } catch (error) {
        console.error("Error in CalculateKWh: ", error);
        return null;
    }
}











async function InsertSensorKwh(segValue, slaveId) {
    try {

        // Data does not exist, insert a new record
        const insertQuery = `
         INSERT INTO sensor_segregated_data
         (dateTime, machineId, deviceId, slaveId, Tag_Id, Tag_Name, value, preValue)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       `;

        const insertParams = [
            segValue.dateTime,
            segValue.machineId,
            segValue.deviceId,
            slaveId,
            segValue.tagId,
            segValue.tagName,
            segValue.kWh,
            segValue.preValue,
        ];
        await connection.execute(insertQuery, insertParams);

    } catch (error) {
        console.error("Error:", error);
        return [];
    }

}


const updateEnergyData = async (segregatedValue, newDate, hrampm) => {
    let updateFields = {};

    switch (segregatedValue.tagName) {
        case 'avgVoltage':
        case 'avgVLL':
            updateFields = { Voltage: segregatedValue.tagValue };
            break;
        case 'kWh':
            updateFields = {
                kWh: segregatedValue.kWh,
                kWh_pre: segregatedValue.preValue
            };
            break;
        case 'frequency':
            updateFields = { Frequency: segregatedValue.tagValue };
            break;
        case 'kW':
            updateFields = { kW: segregatedValue.tagValue };
            break;
        case 'pF':
            updateFields = { pF: segregatedValue.tagValue };
            break;
        case 'avgCurrent':
            updateFields = { current: segregatedValue.tagValue };
            break;
        case 'currentI1':
            updateFields = { I1: segregatedValue.tagValue };
            break;
        case 'currentI2':
            updateFields = { I2: segregatedValue.tagValue };
            break;
        case 'currentI3':
            updateFields = { I3: segregatedValue.tagValue };
            break;
        case 'voltageRy':
            updateFields = { V1: segregatedValue.tagValue };
            break;
        case 'voltageYb':
            updateFields = { V2: segregatedValue.tagValue };
            break;
        case 'voltageRb':
            updateFields = { V3: segregatedValue.tagValue };
            break;
        case 'kVA':
            updateFields = { kVA: segregatedValue.tagValue };
            break;
        default:
            // console.log(`Unhandled tagName: ${segregatedValue.tagName}`);
            return;
    }

    if (Object.keys(updateFields).length > 0) {
        const updateFieldsArray = Object.values(updateFields).map(value => value === undefined ? null : value);
        const updateParams = [...updateFieldsArray, newDate, segregatedValue.meterId, hrampm];

        const updateQuery = `
            UPDATE energy_data
            SET ${Object.keys(updateFields).map(field => `${field} = ?`).join(', ')}
            WHERE date = ?
            AND meterId = ?
            AND HR = ?
        `;

        await connection.execute(updateQuery, updateParams);
        await consumptionOfDay(segregatedValue, newDate);
    }
};

const insertEnergyData = async (segregatedValue, newDate, hrampm) => {
    // Insert current data into energy_data table
    const insertQuery = `
        INSERT INTO energy_data
        (machineId, meterId, date, HR, kWh, kWh_pre, kW, pF, Frequency, current, I1, I2, I3, Voltage, V1, V2, V3, kVA, dateTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
        segregatedValue.machineId,
        segregatedValue.meterId,
        newDate,
        hrampm,
        (segregatedValue.tagName === 'kWh' && segregatedValue.kWh) ? segregatedValue.kWh : 0,
        segregatedValue.preValue ?? 0,
        segregatedValue.tagName === 'kW' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'pF' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'frequency' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'current' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'currentI1' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'currentI2' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'currentI3' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'Voltage' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'voltageRy' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'voltageYb' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'voltageRb' ? segregatedValue.tagValue : null,
        segregatedValue.tagName === 'kVA' ? segregatedValue.tagValue : null,
        segregatedValue.dateTime,
    ];

    await connection.execute(insertQuery, insertParams);
    await consumptionOfDay(segregatedValue, newDate);
};


async function consumptionOfDay(segregatedValue, newDate) {
    // Check if a record for the current day already exists
    const [existingRecord] = await connection.execute(`
        SELECT id, max_kWh
        FROM temp_energy_verification
        WHERE date = ? AND meterId = ?
    `, [newDate, segregatedValue.meterId]);

    const current_kWh = (segregatedValue.tagName === 'kWh' && segregatedValue.kWh) ? segregatedValue.kWh : 0;

    if (current_kWh) {
        if (existingRecord.length > 0) {
            const { id, max_kWh } = existingRecord[0];
            const maxkWh = Math.max(current_kWh, max_kWh);

            await connection.execute(`
                UPDATE temp_energy_verification
                SET max_kWh = ?
                WHERE id = ?
            `, [maxkWh, id]);
        } else {
            await connection.execute(`
                INSERT INTO temp_energy_verification
                (meterId, date, min_kWh, max_kWh)
                VALUES (?, ?, ?, ?)
            `, [segregatedValue.meterId, newDate, current_kWh, current_kWh]);
        }
    }
}



exports.EnergyMeterCronJob = async (req, res) => {
    cron.schedule('*/5 * * * *', async () => {

        const startTime = process.hrtime(); // Start timer

        const now = moment().utcOffset('+05:30'); // Assuming Asia/Kolkata timezone
        const oneMinuteAgo = now.clone().subtract(5, 'minute');
        const date = oneMinuteAgo.format('YYYY-MM-DD');
        const time = oneMinuteAgo.format('HH:mm:ss');

        try {
            const [rows] = await connection.execute(`
                SELECT *
                FROM result_data
                WHERE Date >= ? AND Time >= ?  AND TagCategory = 4
            `, [date, time]);

            if (rows.length > 0) {
                const segregatedValues = await split(rows);
                const currentDateTimeHR = moment.tz('Asia/Kolkata');
                const newDate = currentDateTimeHR.format('YYYY-MM-DD');
                const hrampm = currentDateTimeHR.format('hA');

                for (const segregatedValue of segregatedValues) {
                    if (segregatedValue != null && segregatedValue != undefined) {
                        const [existingDataRows] = await connection.execute(`
                            SELECT *
                            FROM energy_data
                            WHERE date = ?
                            AND meterId = ?
                            AND HR = ?
                        `, [newDate, segregatedValue.meterId, hrampm]);

                        if (existingDataRows.length > 0) {
                            await updateEnergyData(segregatedValue, newDate, hrampm);
                        } else {
                            await insertEnergyData(segregatedValue, newDate, hrampm);
                        }
                    }
                }
                // console.log('Energy data Cron job End Time:', moment().format('YYYY-MM-DD HH:mm:ss'));

                const endTime = process.hrtime(startTime); // End timer
                const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
                logger.info(`EnergyMeterCronJob execution time: ${executionTime.toFixed(3)} ms`);


            } else {
                // console.error("Energy data not found!");


                const endTime = process.hrtime(startTime); // End timer
                const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
                logger.info(`EnergyMeterCronJob execution time: ${executionTime.toFixed(3)} ms`);



            }
        } catch (error) {

            const endTime = process.hrtime(startTime); // End timer
            const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
            logger.info(`EnergyMeterCronJob execution time: ${executionTime.toFixed(3)} ms`);


            console.error("Energy segregation:", error);
        }
    });
};
