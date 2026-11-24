const { connection, CustomError } = require('../config/dbSql2');

const moment = require('moment-timezone');
const { getMachineId, getSolarMeterIds, getWindmillMeterIds } = require('../utility/utilityFunction');


        // Dynamic monthly table name helper
const getEnergyTableName = (dateString) => {
    const yearMonth = dateString.substring(0, 7).replace('-', '_');
    return `energy_data_${yearMonth}`;
};

const DEFAULT_OFFLINE_THRESHOLD_MINUTES = 30;

// ✅ Single global "meter offline" duration threshold, shared by the Meter Online/Offline
// Status screen, the Energy dashboard, the SCADA dashboard, and the Cronjob alert service —
// stored in meter_offline_settings (id = 1) instead of being hardcoded in any one of them.
const getOfflineThresholdMinutes = async () => {
    try {
        const [rows] = await connection.execute(
            'SELECT offline_threshold_minutes FROM meter_offline_settings WHERE id = 1'
        );
        return rows.length ? parseInt(rows[0].offline_threshold_minutes, 10) : DEFAULT_OFFLINE_THRESHOLD_MINUTES;
    } catch (err) {
        return DEFAULT_OFFLINE_THRESHOLD_MINUTES;
    }
};
exports.getOfflineThresholdMinutes = getOfflineThresholdMinutes;

// GET /api/energy/meterOfflineThreshold
exports.getMeterOfflineThresholdSetting = async (req, res) => {
    try {
        const offlineThresholdMinutes = await getOfflineThresholdMinutes();
        return res.status(200).json({ success: true, offlineThresholdMinutes });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// PUT /api/energy/meterOfflineThreshold   body: { offlineThresholdMinutes }
exports.updateMeterOfflineThresholdSetting = async (req, res) => {
    try {
        const minutes = parseInt(req.body.offlineThresholdMinutes, 10);
        if (!Number.isInteger(minutes) || minutes <= 0) {
            return res.status(400).json({ success: false, message: 'offlineThresholdMinutes must be a positive integer' });
        }

        const [existing] = await connection.execute('SELECT id FROM meter_offline_settings WHERE id = 1');
        if (existing.length) {
            await connection.execute(
                'UPDATE meter_offline_settings SET offline_threshold_minutes = ? WHERE id = 1',
                [minutes]
            );
        } else {
            await connection.execute(
                'INSERT INTO meter_offline_settings (id, offline_threshold_minutes) VALUES (1, ?)',
                [minutes]
            );
        }

        return res.status(200).json({ success: true, message: 'Offline threshold updated successfully', offlineThresholdMinutes: minutes });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


//optimized
exports.Last30DaysEnergyConsumptionTrend = async (req, res) => {
    try {
        const { meterId: requestedMeterId } = req.query;
        const machineId = requestedMeterId ? parseInt(requestedMeterId, 10) : await getMachineId();
        const currentDate = moment().format('YYYY-MM-DD');
        const pastDate = moment().subtract(29, 'days').format('YYYY-MM-DD');
 
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
      

      const currentTable  = getEnergyTableName(currentDate);
        // Fetch all energy consumption data for the past 30 days in one query
        const [rows] = await connection.execute(
            `SELECT date, SUM(kWh) as energyConsum
             FROM ${currentTable}   
             WHERE meterId = ? AND date BETWEEN ? AND ?
             GROUP BY date
             ORDER BY date DESC`,
            [machineId, pastDate, currentDate]
        );

        // Create a lookup map for the dates with consumption data
        const consumptionMap = rows.reduce((map, row) => {
            map[row.date] = parseFloat(row.energyConsum) || 0;
            return map;
        }, {});

        // Array to store the final result and total consumption calculation
        let responseData = [];
        let totalConsumption = 0;

        // Loop through the last 30 days and populate the data
        for (let i = 0; i < 30; i++) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            const energyConsum = consumptionMap[date] || 0; // Default to 0 if no data
            totalConsumption += energyConsum;

            responseData.push({
                date,
                energyConsum,
                avgConsum: 0 // Will be updated later
            });
        }

        // Calculate average daily consumption
        const avgConsum = Math.round(totalConsumption / 30);

        // Update each entry with the calculated avgConsum
        responseData = responseData.map(item => ({
            ...item,
            avgConsum
        }));

        return res.status(200).json({
            success: true,
            message: "Last 30 days energy consumption",
            data: responseData.reverse() // Most recent date first
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred'
        });
    }
};

// last deployed


//latest optimized

exports.Last24HourEnergyConsumptionTrend = async (req, res) => {
    try {
        const machineId = await getMachineId();
        const last24date = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');

        // Fetch all rows for the last 24 hours in one query
        const [rows] = await connection.execute(
            `SELECT kWh AS energyConsum, HR, created_at
             FROM energy_data_view
             WHERE meterId = ? AND created_at > ?
             ORDER BY created_at DESC`,
            [machineId, last24date]
        );

        // Initialize variables for the response
        let responseData = [];
        let totalConsumption = 0;

        // Group data by hour
        let hourlyData = {};

        for (let i = 0; i < 24; i++) {
            const hourAgo = moment().subtract(i, 'hours').format('hA');
            hourlyData[hourAgo] = { energyConsum: 0, hourFormat: hourAgo };
        }

        rows.forEach(row => {
            const hourFormat = moment(row.HR, 'hA').format('hA');
            if (hourlyData[hourFormat]) {
                hourlyData[hourFormat].energyConsum = parseFloat(row.energyConsum);
            }
        });

        // Create the response data and calculate total consumption
        for (let hour in hourlyData) {
            const data = hourlyData[hour];
            totalConsumption += data.energyConsum;

            responseData.push({
                hour: data.hourFormat,
                energyConsum: data.energyConsum,
                avgConsum: 0, // Placeholder, will be updated later
            });
        }

        // Calculate average hourly consumption
        const avgConsum = Math.round(totalConsumption / 24);

        // Update each entry with the calculated avgConsum
        responseData = responseData.map(item => ({
            ...item,
            avgConsum: avgConsum,
        }));

        // Reverse the responseData array to have the most recent hour first
        responseData.reverse();

        return res.status(200).json({
            success: true,
            message: "Last 24 Hour Energy Consumption",
            data: responseData
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



//server deployee  EnergyMeterDataList


exports.EnergyMeterDataList = async (req, res) => {
    try {

        const { plantId, distributerId, feederId } = req.body;

        // Initialize the query and query parameters
        let showQuery = `
            SELECT id, slaveId, meterType, feederId, displayName, deviceId, plantId, valueKW
            FROM meters
            WHERE meterType = 'Asset' 
        `;
        let queryParams = [];

        // Add conditions based on what is provided in the request
        if (feederId) {
            showQuery += ` AND feederId = ?`;
            queryParams.push(feederId);
        } else if (distributerId) {
            showQuery += ` AND distributerId = ?`;
            queryParams.push(distributerId);
        } else if (plantId) {
            showQuery += ` AND plantId = ?`;
            queryParams.push(plantId);
        } else {
            // If no parameters provided, return an error
            return res.status(400).json({ success: false, message: "Please provide plantId, distributerId, or feederId" });
        }

        // Execute the query
        const [meters] = await connection.execute(showQuery, queryParams);




        let response = [];
        let status = 200;

        for (const meter of meters) {
            // Get the current date
            const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });

            // Fetch the total kWh for all hours of the current date for the machineId
            const [energyData] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date = ?
            `, [meter.id, currentDate]);

            // Calculate the total kWh
            let totalKWh = 0;
            for (const data of energyData) {
                totalKWh += data.kWh;
            }

            // Fetch latest pF
            const [latestPF] = await connection.execute(`
                SELECT pF
                FROM energy_data_view
                WHERE meterId = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meter.id]);

            // Fetch latest kW
            const [latestkW] = await connection.execute(`
                SELECT kW
                FROM energy_data_view
                WHERE meterId = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meter.id]);

            // Add meter data to response
            response.push({
                id: meter.id,
                slaveId: meter.slaveId,
                plantId: meter.plantId,
                feederId: meter.feederId,
                distributerId: meter.distributerId,
                meterType: meter.meterType,
                displayName: meter.displayName,
                deviceId: meter.deviceId,
                kWvalue: totalKWh,
                valueSetKW: meter.valueKW,
                pFvalue: latestPF.length > 0 ? latestPF[0].pF != null ? parseFloat(latestPF[0].pF).toFixed(1) : null : null,
                kW: latestkW.length > 0 ? latestkW[0].kW != null ? parseFloat(latestkW[0].kW).toFixed(1) : null : null,
                kVA: 0
                // pFvalue: latestPF.length > 0 ? Math.round(parseFloat(latestPF[0].pF)) : null,
                // kW: latestkW.length > 0 ? Math.round(parseFloat(latestkW[0].kW)) : null
            });
        }

        if (response.length === 0) {
            response = {
                message: "Meters with meterType 'Asset' not found",
                status: 404
            };
            status = 404;
        } else {
            response = {
                message: "meter Data Lists",
                data: response
            };
        }

        res.status(status).json(response);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};










//server deployee





exports.MainIncomer = async (req, res) => {
    try {
        const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
        let displayMeters = [[], [], [], []];
        let status = 200;

        const fetchEnergyData = async (meterId) => {
            const currentDateTimeHR = moment.tz('Asia/Kolkata');
            const currentDate = currentDateTimeHR.format('YYYY-MM-DD'); // Current date in 'YYYY-MM-DD' format
            const hrampm = currentDateTimeHR.format('hA');
            const startOfMonth = currentDateTimeHR.startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentDateTimeHR.endOf('month').format('YYYY-MM-DD');

            let totalDayKWh = 0;
            let totalHourKWh = 0;
            let totalMonthKWh = 0;
            let current = 0;
            let kW = 0;

            // If meterId is 62, handle the summation for meters 63 and 64
            if (meterId === 62) {
                const meterIds = [63, 64];

                // Fetch totalDayKWh for meters 63 and 64
                for (const id of meterIds) {
                    const [energyDataRows] = await connection.execute(
                        `SELECT kWh
                         FROM energy_data_view
                         WHERE meterId = ? AND date = ?
                         ORDER BY id DESC`,
                        [id, currentDate]
                    );

                    for (const data of energyDataRows) {
                        totalDayKWh += parseFloat(data.kWh);
                    }

                    // Fetch totalHourKWh for meters 63 and 64
                    const [energyDataHurRows] = await connection.execute(
                        `SELECT kWh
                         FROM energy_data_view
                         WHERE meterId = ? AND date = ? AND HR = ?
                         ORDER BY id DESC`,
                        [id, currentDate, hrampm]
                    );

                    for (const data of energyDataHurRows) {
                        totalHourKWh += parseFloat(data.kWh);
                    }

                    // Fetch totalMonthKWh for meters 63 and 64
                    const [energyDataMonthRows] = await connection.execute(
                        `SELECT kWh
                         FROM energy_data_view
                         WHERE meterId = ? AND date >= ? AND date <= ?
                         ORDER BY id DESC`,
                        [id, startOfMonth, endOfMonth]
                    );

                    for (const data of energyDataMonthRows) {
                        totalMonthKWh += parseFloat(data.kWh);
                    }

                    // Fetch kW and current for meters 63 and 64
                    const [latestKWCurrent] = await connection.execute(`
                        SELECT kW, current
                        FROM energy_data_view
                        WHERE meterId = ?
                        ORDER BY id DESC
                        LIMIT 1
                    `, [id]);

                    if (latestKWCurrent.length > 0) {
                        kW += parseFloat(latestKWCurrent[0].kW);
                        current += parseFloat(latestKWCurrent[0].current);
                    }
                }

                // Fetch pF, Voltage, Frequency for meter 62
                const [latestPFVoltageFreq] = await connection.execute(`
                    SELECT pF, Voltage, Frequency
                    FROM energy_data_view
                    WHERE meterId = ?
                    ORDER BY id DESC
                    LIMIT 1
                `, [63]);


                return {
                    totalDayKWh,
                    pFvalue: latestPFVoltageFreq.length > 0 ? Math.round(parseFloat(latestPFVoltageFreq[0].pF)) : 0,
                    kW: Math.round(kW),
                    Frequency: latestPFVoltageFreq.length > 0 ? Math.round(parseFloat(latestPFVoltageFreq[0].Frequency)) : 0,
                    Voltage: latestPFVoltageFreq.length > 0 ? Math.round(parseFloat(latestPFVoltageFreq[0].Voltage)) : 0,
                    current: Math.round(current),
                    totalHourKWh,
                    totalMonthKWh
                };
            } else {
                // Fetch data for the given meterId (assuming it's not 62)
                const [energyDataRows] = await connection.execute(
                    `SELECT kWh
                     FROM energy_data_view
                     WHERE meterId = ? AND date = ?
                     ORDER BY id DESC`,
                    [meterId, currentDate]
                );

                for (const data of energyDataRows) {
                    totalDayKWh += parseFloat(data.kWh);
                }

                const [latestPF] = await connection.execute(`
                    SELECT pF
                    FROM energy_data_view
                    WHERE meterId = ?
                    ORDER BY id DESC
                    LIMIT 1
                `, [meterId]);

                const [latestkW] = await connection.execute(`
                    SELECT kW,  kWh_pre, kW, pF, Frequency, Voltage, current
                    FROM energy_data_view
                    WHERE meterId = ?
                    ORDER BY id DESC
                    LIMIT 1
                `, [meterId]);

                // Fetch energy kWh data for the current hour
                const [energyDataHurRows] = await connection.execute(
                    `SELECT kWh
                     FROM energy_data_view
                     WHERE meterId = ? AND date = ? AND HR = ?
                     ORDER BY id DESC`,
                    [meterId, currentDate, hrampm]
                );

                for (const data of energyDataHurRows) {
                    totalHourKWh += parseFloat(data.kWh);
                }

                // Fetch energy kWh data for the current month
                const [energyDataMonthRows] = await connection.execute(
                    `SELECT kWh
                     FROM energy_data_view
                     WHERE meterId = ? AND date >= ? AND date <= ?
                     ORDER BY id DESC`,
                    [meterId, startOfMonth, endOfMonth]
                );

                for (const data of energyDataMonthRows) {
                    const kWhValue = parseFloat(data.kWh);
                    if (!isNaN(kWhValue)) {  // Check if the parsed value is a valid number
                        totalMonthKWh += kWhValue;
                    }
                }

                return {
                    totalDayKWh,
                    pFvalue: latestPF.length > 0 ? Math.round(parseFloat(latestPF[0].pF)) : 0,
                    kW: latestkW.length > 0 ? Math.round(parseFloat(latestkW[0].kW)) : 0,
                    Frequency: latestkW.length > 0 ? Math.round(parseFloat(latestkW[0].Frequency)) : 0,
                    Voltage: latestkW.length > 0 ? Math.round(parseFloat(latestkW[0].Voltage)) : 0,
                    current: latestkW.length > 0 ? Math.round(parseFloat(latestkW[0].current)) : 0,
                    totalHourKWh,
                    totalMonthKWh
                };
            }
        };

        // Fetch distributors for dashDisplayNumber 1
        const [distributors] = await connection.execute(`
            SELECT m.id, m.slaveId, m.meterType, m.displayName, m.deviceId, m.plantId, m.distributerId, d.distributorName, d.description
            FROM meters m
            JOIN distributors d ON m.distributerId = d.id
            WHERE m.meterType = 'Distributors' AND m.feederId IS NULL
        `);

        displayMeters[0] = await Promise.all(distributors.map(async (distributor) => {
            const energyData = await fetchEnergyData(distributor.id);
            return {
                id: distributor.id,
                slaveId: distributor.slaveId,
                plantId: distributor.plantId,
                displayName: distributor.displayName,
                meterType: distributor.meterType,
                distributerId: distributor.distributerId,
                distributorName: distributor.distributorName,
                description: distributor.description,
                kW: energyData.kW,
                Current: energyData.current,
                pF: energyData.pFvalue,
                Voltage: energyData.Voltage,
                Frequency: energyData.Frequency,
                kWh: energyData.totalHourKWh.toFixed(2),
                kWhDay: energyData.totalDayKWh.toFixed(2),
                kWhMonth: energyData.totalMonthKWh.toFixed(2),
                kVA: 0
            };
        }));

        // Fetch feeders for dashDisplayNumber 2
        const [feeders] = await connection.execute(`
            SELECT m.id, m.slaveId, m.meterType, m.displayName, m.deviceId, m.plantId, m.feederId, f.feederName, f.description
            FROM meters m
            JOIN feeder_master f ON m.feederId = f.id
            WHERE m.meterType = 'Feeder';
        `);

        displayMeters[1] = await Promise.all(feeders.map(async (feeder) => {
            const energyData = await fetchEnergyData(feeder.id);
            return {
                id: feeder.id,
                slaveId: feeder.slaveId,
                plantId: feeder.plantId,
                feederId: feeder.feederId,
                displayName: feeder.displayName,
                meterType: feeder.meterType,
                feederName: feeder.feederName,
                description: feeder.description,
                kW: energyData.kW,
                Current: energyData.current,
                pF: energyData.pFvalue,
                Voltage: energyData.Voltage,
                Frequency: energyData.Frequency,
                kWh: energyData.totalHourKWh.toFixed(2),
                kWhDay: energyData.totalDayKWh.toFixed(2),
                kWhMonth: energyData.totalMonthKWh.toFixed(2),
                kVA: 0
            };
        }));

        if (displayMeters[0].length === 0 && displayMeters[1].length === 0) {
            response = {
                message: "No distributors or feeders found",
                status: 404
            };
            status = 404;
        } else {
            response = {
                message: "Incomer Data Lists",
                dashDisplayNo1: displayMeters[0], // Distributors
                dashDisplayNo2: displayMeters[1], // Feeders
                dashDisplayNo3: displayMeters[2], // Keep empty if no further requirements
                dashDisplayNo4: displayMeters[3]  // Keep empty if no further requirements
            };
        }

        res.status(status).json(response);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};










/*
exports.EnergyMeterDataList = async (req, res) => {
    try {
        // Get all meters with meterType equal to "Asset"
  

        const [meters] = await connection.execute(`
        SELECT id, slaveId, meterType, displayName, deviceId
        FROM meters
      
        WHERE meterType = 'Asset'
        GROUP BY meters.id
    `);

        let response = [];
        let status = 200;

        for (const meter of meters) {
            // Get the current date
            const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });

            // Fetch the total kWh for all hours of the current date for the machineId
            const [energyData] = await connection.execute(`
                SELECT kWh
                FROM energy_data
                WHERE meterId = ? AND date = ?
            `, [meter.id, currentDate]);

            // Calculate the total kWh
            let totalKWh = 0;
            for (const data of energyData) {
                totalKWh += data.kWh;
            }

            // Fetch latest pF
            const [latestPF] = await connection.execute(`
                SELECT pF
                FROM energy_data
                WHERE meterId = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meter.id]);

            // Fetch latest kW
            const [latestkW] = await connection.execute(`
                SELECT kW
                FROM energy_data
                WHERE meter = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meter.machineId]);

            // Add meter data to response
            response.push({
                id: meter.id,
                slaveId: meter.slaveId,
                meterType: meter.meterType,
                displayName: meter.displayName,
                deviceId: meter.deviceId,
                kWvalue: totalKWh,
                // pFvalue: latestPF.length > 0 ? parseFloat(latestPF[0].pF).toFixed(2) : null,
                // kW: latestkW.length > 0 ? parseFloat(latestkW[0].kW).toFixed(2) : null
                pFvalue: latestPF.length > 0 ? Math.round(parseFloat(latestPF[0].pF)) : null,
                kW: latestkW.length > 0 ? Math.round(parseFloat(latestkW[0].kW) ) : null
            });
        }

        if (response.length === 0) {
            response = {
                message: "Meters with meterType 'Asset' not found",
                status: 404
            };
            status = 404;
        } else {
            response = {
                message: "meter Data Lists",
                data: response
            };
        }

        res.status(status).json(response);
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
*/


/*
exports.EnergyConsumptionMonth = async (req, res) => {
    try {
        const machineId = await getMachineId();
        const months = [];
        let maxValue = 0;

        for (let i = 5; i >= 0; i--) {
            const monthStart = moment.tz('Asia/Kolkata').subtract(i, 'months').startOf('month').format('YYYY-MM-DD');
            const monthEnd   = moment.tz('Asia/Kolkata').subtract(i, 'months').endOf('month').format('YYYY-MM-DD');
            const monthLabel = moment.tz('Asia/Kolkata').subtract(i, 'months').format('YYYY-MM');

            const [rows] = await connection.execute(
                `SELECT SUM(kWh) AS totalKWh FROM energy_data_view WHERE meterId = ? AND date BETWEEN ? AND ?`,
                [machineId, monthStart, monthEnd]
            );

            const monthTotal = parseFloat(rows[0]?.totalKWh || 0);
            if (monthTotal > maxValue) maxValue = monthTotal;
            months.push({ month: monthLabel, EnergyConsumption: parseFloat(monthTotal.toFixed(2)) });
        }

        return res.status(200).json({
            message: 'Monthly Energy Consumption',
            data: months,
            maxValue: parseFloat((maxValue * 1.1).toFixed(2))
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
*/



exports.EnergyConsumptionMonth = async (req, res) => {
    try {
        const { meterId: requestedMeterId } = req.query;
        const machineId = requestedMeterId ? parseInt(requestedMeterId, 10) : await getMachineId();
        const months = [];
        let maxValue = 0;

        for (let i = 5; i >= 0; i--) {
            const monthMoment = moment.tz('Asia/Kolkata').subtract(i, 'months');
            const monthStart  = monthMoment.clone().startOf('month').format('YYYY-MM-DD');
            const monthEnd    = monthMoment.clone().endOf('month').format('YYYY-MM-DD');
            const monthLabel  = monthMoment.format('YYYY-MM');
            const tableName   = getEnergyTableName(monthStart); // e.g. energy_data_2026_06

            let monthTotal = 0;

            // Check the table exists before querying — avoids SQL error on missing months
            const [tableCheck] = await connection.execute(
                `SELECT COUNT(*) AS cnt FROM information_schema.tables
                 WHERE table_schema = DATABASE() AND table_name = ?`,
                [tableName]
            );

            if (tableCheck[0].cnt > 0) {
                const [rows] = await connection.execute(
                    `SELECT SUM(kWh) AS totalKWh FROM ${tableName}
                     WHERE meterId = ? AND date BETWEEN ? AND ?`,
                    [machineId, monthStart, monthEnd]
                );
                monthTotal = parseFloat(rows[0]?.totalKWh || 0);
            }

            if (monthTotal > maxValue) maxValue = monthTotal;
            months.push({
                month: monthLabel,
                EnergyConsumption: parseFloat(monthTotal.toFixed(2))
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Monthly Energy Consumption',
            data: months,
            maxValue: parseFloat((maxValue * 1.1).toFixed(2))
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred'
        });
    }
};


exports.meterDropDownList = async (req, res) => {
    try {
        const [metersList] = await connection.execute(`
            SELECT id, displayName
            FROM meters
            WHERE meterType = 'meter'
        `, []);

        if (metersList.length === 0) {
            throw new Error("Meters not found");
        }

        res.status(200).json({
            message: "Meter Lists",
            data: metersList,
        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: err.statusCode || 406
        });
    }
};


exports.solarData = async (req, res) => {
    try {
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
        const currentDate = currentDateTimeHR.format('YYYY-MM-DD');
        const hrampm = currentDateTimeHR.format('hA');
        const startOfMonth = currentDateTimeHR.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentDateTimeHR.endOf('month').format('YYYY-MM-DD');

        const meterIds = await getSolarMeterIds();
        const meterDataArray = [];

        for (const meterId of meterIds) {
            // Get the latest energy parameter data
            const [resultRows] = await connection.execute(`
                SELECT kWh, kWh_pre, kW, pF, Frequency, Voltage, current
                FROM energy_data_view
                WHERE meterId = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meterId]);

            if (resultRows.length <= 0) {
                throw new Error(`Live Machine Data not found for meter ID: ${meterId}`);
            }

            const result = resultRows[0];

            // Get daily kWh data
            const [energyDataRows] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date = ?
                ORDER BY id DESC
            `, [meterId, currentDate]);

            let totalDayKWh = 0;
            energyDataRows.forEach(data => {
                totalDayKWh += parseFloat(data.kWh);
            });

            // Get hourly kWh data
            const [energyDataHourRows] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date = ? AND HR = ?
                ORDER BY id DESC
            `, [meterId, currentDate, hrampm]);

            let totalHourKWh = 0;
            energyDataHourRows.forEach(data => {
                totalHourKWh += parseFloat(data.kWh);
            });

            // Get monthly kWh data
            const [energyDataMonthRows] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date >= ? AND date <= ?
                ORDER BY id DESC
            `, [meterId, startOfMonth, endOfMonth]);

            let totalMonthKWh = 0;
            energyDataMonthRows.forEach(data => {
                totalMonthKWh += parseFloat(data.kWh);
            });

            const meterData = {
                meterId,
                Current: parseFloat(result.current).toFixed(1),
                kW: parseFloat(result.kW).toFixed(1),
                pF: parseFloat(result.pF).toFixed(1),
                Voltage: parseFloat(result.Voltage).toFixed(1),
                Frequency: parseFloat(result.Frequency).toFixed(1),
                kWh: parseFloat(totalHourKWh).toFixed(1),
                kWhDay: totalDayKWh.toFixed(2),
                kWhMonth: totalMonthKWh.toFixed(1),
                kVA: 0
            };

            meterDataArray.push(meterData);
        }

        return res.status(200).json({
            message: "Live Machine Data",
            data: meterDataArray
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.meterDataOnOffStatus = async (req, res) => {
  try {
    const now = moment.tz('Asia/Kolkata');
    const currentDateTime = now.format('YYYY-MM-DD HH:mm:ss');
    const OFFLINE_WINDOW_MINUTES = await getOfflineThresholdMinutes(); // global, admin-configurable (meter_offline_settings)

    // ✅ Fetch meter details + latest kW snapshot (value + its updated_at) per meter,
    // plus any open "meter data not coming" alert raised by MeterDataNotComingAlertCron
    // (Cronjob service) so this screen can surface triggered alerts alongside status.
    // meterType is read live via meterTypeId -> meter_type_master so a rename in the
    // Meter Type CRUD shows up here immediately; m.meterType (the raw copied string,
    // still relied on elsewhere for hierarchy filtering) is only the fallback for any
    // meter allocated before meterTypeId existed.
    const [metersList] = await connection.execute(`
      SELECT
        m.id,
        m.deviceId,
        m.displayName AS meterName,
        COALESCE(mtm.meterType, m.meterType) AS meterType,
        m.slaveId,
        a.AssetName,
        lts.value      AS kW,
        lts.updated_at AS updated_at,
        ad.id          AS alertId,
        ad.alertMessage AS alertMessage,
        ad.dateTime    AS alertSince
      FROM meters m
      LEFT JOIN asset a ON m.deviceId = a.AssetId
      LEFT JOIN meter_type_master mtm ON mtm.id = m.meterTypeId
      LEFT JOIN live_tag_snapshot lts
             ON lts.deviceId = m.deviceId AND lts.slaveId = m.slaveId AND lts.tag_name = 'kW'
      LEFT JOIN alert_data ad
             ON ad.tagId = m.id AND ad.deviceId = m.deviceId
            AND ad.tagName = 'DataNotReceived' AND ad.isCleared = 0
      ORDER BY m.id ASC
    `);

    if (!metersList.length) {
      return res.status(404).json({ message: "No meters found" });
    }

    // ✅ Offline = no update in the last OFFLINE_WINDOW_MINUTES AND kW is 0. Otherwise Online.
    const updatedList = metersList.map(meter => {
      const updatedMoment = meter.updated_at ? moment.tz(meter.updated_at, 'Asia/Kolkata') : null;
      const minutesSinceUpdate = updatedMoment ? now.diff(updatedMoment, 'minutes') : Infinity;
      const kWValue = parseFloat(meter.kW) || 0;
      const isOffline = minutesSinceUpdate > OFFLINE_WINDOW_MINUTES;
      const { alertId, alertMessage, alertSince, ...meterFields } = meter;
      return {
        ...meterFields,
        kW: kWValue,
        updated_at: updatedMoment ? updatedMoment.format('DD-MM-YYYY hh:mm A') : 'Not available',
        onOffStatus: isOffline ? 0 : 1, // 1 = Online, 0 = Offline
        noDataAlertTriggered: alertId ? 1 : 0,
        noDataAlertMessage: alertMessage || null,
        noDataAlertSince: alertSince ? moment.tz(alertSince, 'Asia/Kolkata').format('DD-MM-YYYY hh:mm A') : null,
      };
    });

    // ✅ Count online/offline
    const onlineMetersCount = updatedList.filter(m => m.onOffStatus === 1).length;
    const offlineMetersCount = updatedList.filter(m => m.onOffStatus === 0).length;
    const totalMetersCount = updatedList.length;
    const noDataAlertsCount = updatedList.filter(m => m.noDataAlertTriggered === 1).length;

    // ✅ Response
    res.status(200).json({
      message: "Meter Online/Offline Status fetched successfully",
      currentDateTime,
      data: updatedList,
      onlineMetersCount,
      offlineMetersCount,
      totalMetersCount,
      noDataAlertsCount
    });

  } catch (err) {
    res.status(500).json({
      message: err.message || 'An error occurred while fetching meter status',
      status: 500
    });
  }
};

exports.WindmillData = async (req, res) => {
    try {
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
        const currentDate = currentDateTimeHR.format('YYYY-MM-DD');
        const hrampm = currentDateTimeHR.format('hA');
        const startOfMonth = currentDateTimeHR.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentDateTimeHR.endOf('month').format('YYYY-MM-DD');

        const meterIds = await getWindmillMeterIds();
        const meterDataArray = [];

        for (const meterId of meterIds) {
            // Get the latest energy parameter data
            const [resultRows] = await connection.execute(`
                SELECT kWh, kWh_pre, kW, pF, Frequency, Voltage, current
                FROM energy_data_view
                WHERE meterId = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meterId]);

            if (resultRows.length <= 0) {
                throw new Error(`Live Machine Data not found for meter ID: ${meterId}`);
            }

            const result = resultRows[0];

            // Get daily kWh data
            const [energyDataRows] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date = ?
                ORDER BY id DESC
            `, [meterId, currentDate]);

            let totalDayKWh = 0;
            energyDataRows.forEach(data => {
                totalDayKWh += parseFloat(data.kWh);
            });

            // Get hourly kWh data
            const [energyDataHourRows] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date = ? AND HR = ?
                ORDER BY id DESC
            `, [meterId, currentDate, hrampm]);

            let totalHourKWh = 0;
            energyDataHourRows.forEach(data => {
                totalHourKWh += parseFloat(data.kWh);
            });

            // Get monthly kWh data
            const [energyDataMonthRows] = await connection.execute(`
                SELECT kWh
                FROM energy_data_view
                WHERE meterId = ? AND date >= ? AND date <= ?
                ORDER BY id DESC
            `, [meterId, startOfMonth, endOfMonth]);

            let totalMonthKWh = 0;
            energyDataMonthRows.forEach(data => {
                totalMonthKWh += parseFloat(data.kWh);
            });

            const meterData = {
                meterId,
                Current: parseFloat(result.current).toFixed(1),
                kW: parseFloat(result.kW).toFixed(1),
                pF: parseFloat(result.pF).toFixed(1),
                Voltage: parseFloat(result.Voltage).toFixed(1),
                Frequency: parseFloat(result.Frequency).toFixed(1),
                kWh: parseFloat(totalHourKWh).toFixed(1),
                kWhDay: totalDayKWh.toFixed(2),
                kWhMonth: totalMonthKWh.toFixed(1),
                kVA: 0
            };

            meterDataArray.push(meterData);
        }

        return res.status(200).json({
            message: "Live Windmill Data",
            data: meterDataArray
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
