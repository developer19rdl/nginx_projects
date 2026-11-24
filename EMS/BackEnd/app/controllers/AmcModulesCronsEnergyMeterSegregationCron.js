const { connection, CustomError } = require('./config/dbSql2');
const cron = require('node-cron');
const moment = require('moment-timezone');

async function split(jsonData) {
    try {
        const segregatedValues = [];
        // Fetch unique device and slave IDs from the database
        const [uniqueDeviceSlaveIds] = await connection.execute(`
            SELECT mpa.deviceId, mpa.slaveId, mpa.Tag_Id, mpa.Tag_Name, mpa.machineId, mpa.function, mpa.functionName, meters.id AS meterId
            FROM machine_parameter_allocation mpa
            INNER JOIN meters ON meters.deviceId = mpa.deviceId AND meters.slaveId = mpa.slaveId
            GROUP by mpa.deviceId, mpa.slaveId;
        `);

        // Preprocess JSON data outside loop
        const decodedJsonData = jsonData.map(record => JSON.parse(record.JsonData));
        for (const { deviceId, slaveId, Tag_Name: tagName, Tag_Id: tagId, machineId, functionName, function: functionNumber, meterId } of uniqueDeviceSlaveIds) {

            for (const record of decodedJsonData) {

                if (record.ID == deviceId && record.SL_ID == slaveId) {

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






async function CalculateKWh(recievedTagId, slaveId, segregatedValues) {
    let tagCheck = false;
    let tagId = null;
    let lastReadKWh = 0;
    let machineId = null;
    let meterId = null;
    let type = null;
    let tagName = null;
    let deviceId = null;
    let functionName = null;
    let functionNumber = null;
    let dateTime = null;

    for (let i = segregatedValues.length - 1; i >= 0; i--) {
        if (segregatedValues[i].tagId === recievedTagId && segregatedValues[i].slaveId === slaveId) {
            if (segregatedValues[i]['tagValue'] == 0) {
                return null;
            }
            tagCheck = true;
            tagId = segregatedValues[i]['tagId'];
            lastReadKWh = segregatedValues[i]['tagValue'];
            machineId = segregatedValues[i]['machineId'];
            meterId = segregatedValues[i]['meterId'];
            type = segregatedValues[i]['type'];
            tagName = segregatedValues[i]['tagName'];
            deviceId = segregatedValues[i]['deviceId'];
            functionName = segregatedValues[i]['functionName'];
            functionNumber = segregatedValues[i]['functionNumber'];
            dateTime = segregatedValues[i]['dateTime'];
            break;
        }
    }

    if (!tagCheck) {
        return null;
    }

    const currentDateTimeHR = moment().tz('Asia/Kolkata');
    const currentDate = currentDateTimeHR.format('YYYY-MM-DD'); // Get current date
    const currentHr = currentDateTimeHR.format('hA');
    const lastHr = currentDateTimeHR.subtract(1, 'hours').format('hA');

    let finalKwh = 0;
    let finalKwhPre = lastReadKWh;

    // Fetch the last inserted 'preValue' from the database
    const [existingDataRows] = await connection.execute(`
            SELECT *
            FROM energy_data
            WHERE date = ?
            AND meterId = ?
            AND HR = ?
            LIMIT 1
        `, [currentDate, meterId, currentHr]
    );

    if (existingDataRows.length > 0) {
        const { id, kWh, kWh_pre } = existingDataRows[0];

        if (lastReadKWh != '0' && (kWh_pre != 0 && kWh_pre != null)) {
            finalKwh = (parseFloat(lastReadKWh) - parseFloat(kWh_pre)) + parseFloat(kWh);
            finalKwhPre = lastReadKWh;
        } else if (kWh != 0 && kWh != null) {
            finalKwh = kWh;
        }
    } else {
        const [rowsKWH] = await connection.execute(`SELECT last_kwh FROM meters WHERE id = ?`, [meterId]);
        const lastKWH = rowsKWH.length > 0 ? rowsKWH[0].last_kwh : 0;
        finalKwh = (parseFloat(lastReadKWh) - parseFloat(lastKWH));
        finalKwhPre = lastReadKWh;

    }

    const [fetchRows] = await connection.execute(`SELECT last_kwh FROM meters WHERE meters.id = ?`, [meterId]);
    if (fetchRows.length > 0 && lastReadKWh > fetchRows[0].last_kwh) {
        await connection.execute(`UPDATE meters SET last_kwh = ? WHERE meters.id = ?`, [lastReadKWh, meterId]);
    }

    const segValue = {
        tagId: tagId,
        type: type,
        tagName: tagName,
        kWh: finalKwh,
        preValue: (finalKwhPre == null || finalKwhPre == undefined) ? finalKwhPre : parseFloat(finalKwhPre).toFixed(2),
        deviceId: deviceId,
        machineId: machineId,
        meterId: meterId,
        functionName: functionName,
        functionNumber: functionNumber,
        dateTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    };

    await InsertSensorKwh(segValue)

    return segValue;
}


async function InsertSensorKwh(segValue) {
    try {

        // Data does not exist, insert a new record
        const insertQuery = `
         INSERT INTO sensor_data
         (dateTime, machineId, deviceId, Tag_Id, Tag_Name, value, preValue)
         VALUES (?, ?, ?, ?, ?, ?, ?)
       `;

        const insertParams = [
            segValue.dateTime,
            segValue.machineId,
            segValue.deviceId,
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


exports.EnergyMeterCronJob = async (req, res) => {
    cron.schedule('0 * * * * *', async () => {
        const currentTime1 = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log('Energy data Cron job executed at:', moment().format('YYYY-MM-DD HH:mm:ss'));

        // Get current time and one minute ago
        const now = moment().utcOffset('+05:30'); // Assuming Asia/Kolkata timezone
        const oneMinuteAgo = now.clone().subtract(5, 'minute');
        // Format date and time for MySQL query
        const date = oneMinuteAgo.format('YYYY-MM-DD');
        const time = oneMinuteAgo.format('HH:mm:ss');

        try {

            const [rows, fields] = await connection.execute(`
            SELECT *
            FROM result_data
            WHERE Date >= ? AND Time >= ? AND JSON_EXTRACT(JsonData, '$.Type') = 'METER'
        `, [date, time]);




            if (rows.length > 0) {
                const segregatedValues = await split(rows);

                // Get current date in Asia/Kolkata time zone
                const currentDateTimeHR = moment.tz('Asia/Kolkata');

                // Format newDate using moment
                const newDate = currentDateTimeHR.format('YYYY-MM-DD');

                // Format current time with AM/PM using moment
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
                            // Data exists, update the existing record
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
                                    console.log(`Unhandled tagName: ${segregatedValue.tagName}`);
                                    break;
                            }

                            // Check if there are fields to update
                            if (Object.keys(updateFields).length > 0) {
                                // Replace undefined values with null
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
                            }
                        }
                        else {
                            // Data does not exist, insert a new record
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
                        }
                    }
                }
                console.log('Energy data Cron job End Time:', moment().format('YYYY-MM-DD HH:mm:ss'));
                return true;
            } else {
                console.error("Energy data not found!");
                return true;
            }
        } catch (error) {
            console.error("Energy seggregation:", error);
            return true;
        }
    });
}