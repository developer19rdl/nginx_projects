const { connection, CustomError } = require('../config/dbSql2');
const cron = require('node-cron');
const moment = require('moment-timezone');
const winston = require('winston');

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
                            // const dateTimeString = `${record.DATE} ${record.TIME}`

                            const dateTimeString = moment().format('YYYY-MM-DD HH:mm:ss');


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

        if (existingDataRows.length > 0) {
            const { kWh, kWh_pre } = existingDataRows[0];



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
        } else if (finalKwh > (avgKwh * 100)) {

            const [last1HourRows] = await connection.execute(`
                SELECT kWh 
                FROM energy_data
                WHERE meterId = ? 
                ORDER BY id DESC 
                LIMIT 1
            `, [meterId]);

            if (last1HourRows.length !== 0 && last1HourRows[0].kWh != 0) {
                console.log(`Skipping kWh update for meter ${meterId} due to abnormally high kWh value: ${finalKwh}`);
                return null;
            }
        }

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

const batchInsertEnergyData = async (records, conn) => {
    const insertQuery = `
        INSERT INTO energy_data (
            machineId, meterId, date, HR, kWh, kWh_pre, kW, pF, Frequency, current, 
            I1, I2, I3, Voltage, V1, V2, V3, kVA, dateTime
        )
        VALUES ${records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
        ON DUPLICATE KEY UPDATE
            kWh = VALUES(kWh),
            kWh_pre = VALUES(kWh_pre),
            kW = VALUES(kW),
            pF = VALUES(pF),
            Frequency = VALUES(Frequency),
            current = VALUES(current),
            I1 = VALUES(I1),
            I2 = VALUES(I2),
            I3 = VALUES(I3),
            Voltage = VALUES(Voltage),
            V1 = VALUES(V1),
            V2 = VALUES(V2),
            V3 = VALUES(V3),
            kVA = VALUES(kVA),
            dateTime = VALUES(dateTime)
    `;

    const insertParams = records.flatMap(record => [
        record.machineId,
        record.meterId,
        record.date,
        record.hrampm,
        record.tagName === 'kWh' ? record.kWh : 0,
        record.preValue ?? 0,
        record.tagName === 'kW' ? record.tagValue : null,
        record.tagName === 'pF' ? record.tagValue : null,
        record.tagName === 'frequency' ? record.tagValue : null,
        record.tagName === 'avgCurrent' ? record.tagValue : null,
        record.tagName === 'currentI1' ? record.tagValue : null,
        record.tagName === 'currentI2' ? record.tagValue : null,
        record.tagName === 'currentI3' ? record.tagValue : null,
        record.tagName === 'avgVoltage' || record.tagName === 'avgVLL' ? record.tagValue : null,
        record.tagName === 'voltageRy' ? record.tagValue : null,
        record.tagName === 'voltageYb' ? record.tagValue : null,
        record.tagName === 'voltageRb' ? record.tagValue : null,
        record.tagName === 'kVA' ? record.tagValue : null,
        record.dateTime,
    ]);

    try {
        await conn.execute(insertQuery, insertParams);
    } catch (error) {
        console.error("Error in batchInsertEnergyData:", error);
        throw error;
    }
};

const batchUpdateEnergyData = async (records, conn) => {
    const updatePromises = records.map(record => {
        const updateFields = [];
        const updateValues = [];

        const tagMappings = {
            kWh: 'kWh',
            preValue: 'kWh_pre',
            kW: 'kW',
            pF: 'pF',
            frequency: 'Frequency',
            avgCurrent: 'current',
            currentI1: 'I1',
            currentI2: 'I2',
            currentI3: 'I3',
            avgVoltage: 'Voltage',
            avgVLL: 'Voltage',
            voltageRy: 'V1',
            voltageYb: 'V2',
            voltageRb: 'V3',
            kVA: 'kVA',
        };

        const tagFieldName = tagMappings[record.tagName];
        const tagValue = record[record.tagName] ?? record.tagValue;

        if (tagFieldName && tagValue !== undefined) {
            updateFields.push(`${tagFieldName} = ?`);
            updateValues.push(tagValue);

            // Add kWh_pre if the tagName is kWh
            if (record.tagName === 'kWh' && record.preValue !== undefined) {
                updateFields.push(`${tagMappings.preValue} = ?`);
                updateValues.push(record.preValue);
            }
        }

        if (updateFields.length === 0) {
            return Promise.resolve();
        }

        updateValues.push(record.dateTime, record.meterId, record.hrampm);

        const updateQuery = `
            UPDATE energy_data
            SET ${updateFields.join(', ')}
            WHERE DATE(date) = DATE(?) AND meterId = ? AND HR = ?
        `;

        return conn.execute(updateQuery, updateValues).catch(error => {
            console.error(`Error updating meterId = ${record.meterId}, HR = ${record.hrampm}`, error);
        });
    });

    await Promise.all(updatePromises);
};

const batchUpsertHmiDisplay = async (records, conn) => {
    const upsertPromises = records.map(async (record) => {
        try {
            if (record != null && record != undefined) {
                const [existingHmiData] = await conn.execute(
                    `SELECT * FROM hmidatadisplay WHERE machineId = ? AND meterId = ?`,
                    [record.machineId, record.meterId]
                );

                const tagMappings = {
                    kWh: 'kWh',
                    kW: 'kW',
                    pF: 'pF',
                    avgVLL: 'vll',
                    avgVoltage: 'vll',
                    frequency: 'frequency',
                    currentI1: 'I1',
                    currentI2: 'I2',
                    currentI3: 'I3',
                };

                if (existingHmiData.length > 0) {
                    const updateFields = [];
                    const updateValues = [];

                    // Populate update fields and values if the tag exists in mappings and has a value
                    if (tagMappings[record.tagName] && record.tagValue !== undefined) {
                        updateFields.push(`${tagMappings[record.tagName]} = ?`);
                        updateValues.push(record.tagValue);
                    }

                    if (updateFields.length > 0) {  // Only proceed with update if there are fields to update
                        updateValues.push(record.machineId, record.meterId);
                        const updateQuery = `
                            UPDATE hmidatadisplay
                            SET ${updateFields.join(', ')}
                            WHERE machineId = ? AND meterId = ?
                        `;
                        await conn.execute(updateQuery, updateValues);
                    }
                } else {
                    const insertFields = ['machineId', 'meterId'];
                    const insertValues = [record.machineId, record.meterId];
                    const placeholders = ['?', '?'];

                    // Dynamically add fields and values based on tag mappings
                    if (tagMappings[record.tagName]) {
                        insertFields.push(tagMappings[record.tagName]);
                        insertValues.push(record.tagValue);
                        placeholders.push('?');
                    }

                    const insertQuery = `
                        INSERT INTO hmidatadisplay (${insertFields.join(', ')})
                        VALUES (${placeholders.join(', ')})
                    `;
                    await conn.execute(insertQuery, insertValues);
                }
            }
        } catch (error) {
            console.error("Error in batchUpsertHmiDisplay:", error);
            throw error;
        }
    });

    await Promise.all(upsertPromises);
};

const BATCH_SIZE = 50;

exports.EnergyMeterCronJobNew = async (req, res) => {
    cron.schedule('*/5 * * * *', async () => {
        const now = moment().utcOffset('+05:30');
        const oneMinuteAgo = now.clone().subtract(5, 'minutes');
        const date = oneMinuteAgo.format('YYYY-MM-DD');
        const time = oneMinuteAgo.format('HH:mm:ss');

        const conn = await connection.getConnection();

        try {
            // Step 1: Fetch and segregate values outside transaction
            const [rows] = await connection.execute(`
                SELECT * FROM result_data
                WHERE Date >= ? AND Time >= ? AND TagCategory = 4
            `, [date, time]);

            if (rows.length > 0) {
                const segregatedValues = await split(rows);
                const currentDateTimeHR = moment.tz('Asia/Kolkata');
                const newDate = currentDateTimeHR.format('YYYY-MM-DD');
                const hrampm = currentDateTimeHR.format('hA');

                // Prepare insert and update records
                const insertRecords = [];
                const updateRecords = [];

                for (const segregatedValue of segregatedValues) {
                    if (segregatedValue != null && segregatedValue != undefined) {
                        if (segregatedValue.meterId != null) {

                            const [existingData] = await connection.execute(`
                            SELECT * FROM energy_data
                            WHERE date = ? AND meterId = ? AND HR = ?
                        `, [newDate, segregatedValue.meterId, hrampm]);

                            if (existingData.length > 0) {
                                updateRecords.push({ ...segregatedValue, date: newDate, hrampm });
                            } else {
                                insertRecords.push({ ...segregatedValue, date: newDate, hrampm });
                            }

                        }
                    }
                }

                // Process insert records in chunks
                await processChunks(insertRecords, BATCH_SIZE, batchInsertEnergyData, conn);
                // Process update records in chunks
                await processChunks(updateRecords, BATCH_SIZE, batchUpdateEnergyData, conn);
                // Upsert into hmi_display
                await processChunks(segregatedValues, BATCH_SIZE, batchUpsertHmiDisplay, conn);

            }
        } catch (error) {
            console.error("Error in EnergyMeterCronJob:", error);
        } finally {
            conn.release();
        }
    });
};

// Helper function to process data in chunks
async function processChunks(records, batchSize, batchFunction, conn) {
    for (let i = 0; i < records.length; i += batchSize) {
        const chunk = records.slice(i, i + batchSize);
        await conn.beginTransaction();
        try {
            await batchFunction(chunk, conn);
            await conn.commit();
        } catch (error) {
            await conn.rollback();
            console.error(`Error in batch operation:`, error);
            throw error; // Stop further execution if a chunk fails
        }
    }
}
