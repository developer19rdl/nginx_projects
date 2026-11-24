const { connection, CustomError } = require('../config/dbSql2');

const moment = require('moment-timezone');
const { getMachineId, getGenratorMachineId, getPlantDistributerId, getPlant2DistributerId } = require('../utility/utilityFunction');


//server deployee


exports.PlantDistributerData = async (req, res) => {
    try {
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
        // const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const currentDate = currentDateTimeHR.format('YYYY-MM-DD'); // Current date in 'YYYY-MM-DD' format
        const hrampm = currentDateTimeHR.format('hA');
        const startOfMonth = currentDateTimeHR.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentDateTimeHR.endOf('month').format('YYYY-MM-DD');

        // const plant = req.body;
        const { plantId, distributerId, feederId } = req.body;

        const meterId = await getPlantDistributerId(plantId, distributerId, feederId);

        let response;

        let totalDayKWh = 0;
        let totalHourKWh = 0;
        let totalMonthKWh = 0;
        let current = 0;
        let kW = 0;
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




            response = {
                message: "Live Machine Data",
                data: {
                    Current: parseFloat(current).toFixed(1),
                    kW: parseInt(kW),
                    pF: latestPFVoltageFreq.length > 0 ? Math.round(parseFloat(latestPFVoltageFreq[0].pF)) : 0,
                    Voltage: latestPFVoltageFreq.length > 0 ? Math.round(parseFloat(latestPFVoltageFreq[0].Voltage)) : 0,
                    Frequency: latestPFVoltageFreq.length > 0 ? Math.round(parseFloat(latestPFVoltageFreq[0].Frequency)) : 0,
                    kWh: parseFloat(totalHourKWh).toFixed(1),
                    kWhDay: totalDayKWh.toFixed(2),
                    kWhMonth: parseFloat(totalMonthKWh).toFixed(1),
                }
            };




        } else {

            // get energy parameter data fetch
            const [resultRows] = await connection.execute(
                `SELECT kWh, kWh_pre, kW, pF, Frequency, Voltage, current
             FROM energy_data_view
             WHERE meterId = ? 
             ORDER BY id DESC
             LIMIT 1`,
                [meterId]
            );
            const result = resultRows[0];

            // get energy kWh data fetch for current date
            const [energyDataRows] = await connection.execute(
                `SELECT kWh
             FROM energy_data_view
             WHERE meterId = ? AND date = ?
             ORDER BY id DESC`,
                [meterId, currentDate]
            );


            let totalDayKWh = 0;
            for (const data of energyDataRows) {
                totalDayKWh += parseFloat(data.kWh);
            }

            // get energy kWh data fetch for current hour
            const [energyDataHurRows] = await connection.execute(
                `SELECT kWh
             FROM energy_data_view
             WHERE meterId = ? AND date = ? AND HR = ?
             ORDER BY id DESC`,
                [meterId, currentDate, hrampm]
            );

            let totalHourKWh = 0;
            for (const data of energyDataHurRows) {
                totalHourKWh += data.kWh;
            }


            // get energy kWh data fetch for current Month
            const [energyDataMonthRows] = await connection.execute(
                `SELECT kWh
             FROM energy_data_view
             WHERE meterId = ? AND date >= ? AND date <= ?
             ORDER BY id DESC`,
                [meterId, startOfMonth, endOfMonth]
            );

            let totalMonthKWh = 0;


            for (const data of energyDataMonthRows) {
                const kWhValue = parseFloat(data.kWh);
                if (!isNaN(kWhValue)) {  // Check if the parsed value is a valid number
                    totalMonthKWh += kWhValue;
                }
            }

            if (!resultRows.length) {
                throw new Error("Live Machine Data not found");
            }

            response = {
                message: "Live Machine Data",
                data: {
                    Current: parseFloat(result.current).toFixed(1),
                    kW: parseInt(result.kW),
                    pF: parseFloat(result.pF).toFixed(1),
                    Voltage: parseFloat(result.Voltage).toFixed(1),
                    Frequency: parseFloat(result.Frequency).toFixed(1),
                    kWh: parseFloat(totalHourKWh).toFixed(1),
                    kWhDay: totalDayKWh.toFixed(2),
                    kWhMonth: parseFloat(totalMonthKWh).toFixed(1),
                }
            };
        }
        return res.status(200).json(response);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};







exports.LastMonthDistributerTrend = async (req, res) => {
    try {
        // const plant = req.body;

        const { plantId, distributerId, feederId } = req.body;

        if (plantId != 2) {
            // Get meter ID for non-plant 2 plants
            const meterId = await getPlantDistributerId(plantId, distributerId, feederId);

            let responseData = [];
            let totalConsumption = 0;

            // Loop through each day in the last 30 days
            for (let i = 0; i < 30; i++) {
                const date = moment().subtract(i, 'days').format('YYYY-MM-DD');

                // SQL query to get energy consumption for the current date
                const [rows] = await connection.execute(
                    `SELECT SUM(kWh) as energyConsum
                     FROM energy_data_view
                     WHERE meterId = ? AND date = ?
                     GROUP BY date`,
                    [meterId, date]
                );

                let energyConsum = 0;
                if (rows.length > 0) {
                    energyConsum = parseFloat(rows[0].energyConsum);
                }
                totalConsumption += energyConsum;

                responseData.push({
                    date,
                    energyConsum,
                    avgConsum: 0, // Placeholder for average consumption
                });
            }

            // Calculate average daily consumption
            const avgConsum = Math.round(totalConsumption / 30);

            // Update each entry with the calculated average consumption
            responseData = responseData.map(item => ({
                ...item,
                avgConsum,
            }));

            responseData.reverse(); // Reverse the data to have the most recent date first

            return res.status(200).json({
                success: true,
                message: "Last 30 days energy consumption",
                data: responseData
            });

        } else {
            // Handle plant 2 with multiple meters
            const meterIds = await getPlant2DistributerId(plantId, distributerId, feederId);

            let responseData = [];
            let totalConsumption = 0;

            // Loop through each day in the last 30 days
            for (let i = 0; i < 30; i++) {
                const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
                let dailySum = 0;

                // Sum the energy consumption across all meters for this day
                for (let meterId of meterIds) {
                    const [rows] = await connection.execute(
                        `SELECT SUM(kWh) as energyConsum
                         FROM energy_data_view
                         WHERE meterId = ? AND date = ?
                         GROUP BY date`,
                        [meterId, date]
                    );

                    if (rows.length > 0) {
                        dailySum += parseFloat(rows[0].energyConsum || 0);
                    }
                }

                totalConsumption += dailySum;

                responseData.push({
                    date,
                    energyConsum: dailySum,
                    avgConsum: 0, // Placeholder for average consumption
                });
            }

            // Calculate average daily consumption
            const avgConsum = Math.round(totalConsumption / 30);

            // Update each entry with the calculated average consumption
            responseData = responseData.map(item => ({
                ...item,
                avgConsum,
            }));

            responseData.reverse(); // Reverse the data to have the most recent date first

            return res.status(200).json({
                success: true,
                message: "Last 30 days energy consumption for Plant 2",
                data: responseData
            });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};








//server deployed



exports.Last24HourDistributerTrend = async (req, res) => {
    try {
        // const plant = req.body;

        const { plantId, distributerId, feederId } = req.body;

        if (plantId != 2) {
            const meterId = await getPlantDistributerId(plantId, distributerId, feederId);

            const last24date = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
            let responseData = [];
            let totalConsumption = 0;

            for (let i = 0; i < 24; i++) {
                const hourAgo = moment().subtract(i, 'hours').format('hA');

                const [rows] = await connection.execute(
                    `SELECT kWh AS energyConsum, HR
                     FROM energy_data_view
                     WHERE meterId = ? AND HR = ? AND created_at > ?
                     ORDER BY date DESC
                     LIMIT 1`,
                    [meterId, hourAgo, last24date]
                );

                let energyConsum = 0;
                let hourFormat = "";

                if (rows.length > 0) {
                    energyConsum = parseFloat(rows[0].energyConsum);
                    hourFormat = moment(rows[0].HR, 'hA').format('hA');
                } else {
                    hourFormat = moment(hourAgo, 'hA').format('hA');
                }

                totalConsumption += energyConsum;

                responseData.push({
                    hour: hourFormat,
                    energyConsum,
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

        } else {

            // Plant 2 has two meters, so we sum their energy consumption

            const meterIds = await getPlant2DistributerId(plantId, distributerId, feederId);




            // console.log("meterIds", meterIds);

            const last24date = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
            let responseData = [];
            let totalConsumption = 0;

            for (let i = 0; i < 24; i++) {
                const hourAgo = moment().subtract(i, 'hours').format('hA');
                let hourlySum = 0;

                for (let meterId of meterIds) {
                    const [rows] = await connection.execute(
                        `SELECT kWh AS energyConsum, HR
                         FROM energy_data_view
                         WHERE meterId = ? AND HR = ? AND created_at > ?
                         ORDER BY date DESC
                         LIMIT 1`,
                        [meterId, hourAgo, last24date]
                    );

                    if (rows.length > 0) {
                        hourlySum += parseFloat(rows[0].energyConsum || 0);
                    }
                }

                totalConsumption += hourlySum;

                responseData.push({
                    hour: hourAgo,
                    energyConsum: hourlySum,
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
                message: "Last 24 Hour Energy Consumption for Plant 2",
                data: responseData
            });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
