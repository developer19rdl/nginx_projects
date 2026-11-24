const { connection, CustomError } = require('./config/dbSql2');

const moment = require('moment-timezone');
const { getMachineId } = require('./utility/utilityFunction');


exports.Last30DaysEnergyConsumptionTrend = async (req, res) => {
    try {
        const machineId = await getMachineId();
        // Array to store the results
        let responseData = [];
        let totalConsumption = 0;

        // Loop through each day in the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');

            // SQL query to get energy consumption data for the current date
            const [rows] = await connection.execute(
                `SELECT SUM(kWh) as energyConsum
                 FROM energy_data
                 WHERE meterId = ? AND date = ?
                 GROUP BY date`,
                [machineId, date]
            );

            // Get energy consumption for the current date
            let energyConsum = 0;
            if (rows.length > 0) {
                energyConsum = parseFloat(rows[0].energyConsum);
            }
            totalConsumption += energyConsum;



            // Push the data for the current date to responseData
            responseData.push({
                date,
                energyConsum,
                avgConsum: 0, // Example: you can calculate actual avg
            });
        }
        // Calculate average daily consumption
        const avgConsum = Math.round(totalConsumption / 30);



        // Update each entry with the calculated avgConsum
        responseData = responseData.map(item => ({
            ...item,
            avgConsum,
        }));

        // Fill in missing dates with energyConsum as 0 and avgConsum as 0
        const allDates = Array.from({ length: 30 }, (_, index) => {
            const date = moment().subtract(index, 'days').format('YYYY-MM-DD');
            const found = responseData.find(item => item.date === date);
            if (!found) {
                return {
                    date,
                    energyConsum: 0,
                    avgConsum,
                };
            } else {
                return {
                    ...found,
                    avgConsum,
                };
            }
        });

        // Reverse the allDates array to have most recent date first
        responseData = allDates.reverse();

        return res.status(200).json({
            success: true,
            message: "Last 30 days energy consumption",
            data: responseData
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}



// exports.Last24HourEnergyConsumptionTrend = async (req, res) => {
//     try {
//         const machineId = 70;

//         // Array to store the results
//         let responseData = [];


//             console.log('date:  ', hourAgo, 'rows: ', rows.length, "last24date ", last24date)

//             // Get energy consumption for the current hour
//             let energyConsum = 0;
//             let hourFormat = "";
//             if (rows.length > 0) {
//                 energyConsum = parseFloat(rows[0].energyConsum);

//                 // console.log('energyConsum ', energyConsum)

//                 hourFormat = moment(rows[0].HR, 'hha').format('hA');// Convert hour to 12-hour format
//             } else {
//                 // hourFormat = hourAgo; // If no data, use the hourAgo value
//                 hourFormat = moment(hourAgo, 'hha').format('hA');
//             }

//             // Push the data for the current hour to responseData
//             responseData.push({
//                 hour: hourFormat,
//                 energyConsum,
//                 avgConsum: energyConsum.toFixed(2), // Example: you can calculate actual avg
//             });
//         }

//         // Reverse the responseData array to have earliest hour first
//         responseData.reverse();

//         return res.status(200).json({
//             success: true,
//             message: "Last 24 Hour Energy Consumption",
//             data: responseData
//         });

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// }




exports.Last24HourEnergyConsumptionTrend = async (req, res) => {
    try {
        const machineId = await getMachineId();
        const last24date = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');

        let responseData = [];
        let totalConsumption = 0;

        for (let i = 0; i < 24; i++) {
            const hourAgo = moment().subtract(i, 'hours').format('hA');

            const [rows] = await connection.execute(
                `SELECT kWh AS energyConsum, HR
                 FROM energy_data
                 WHERE meterId = ? AND HR = ? AND created_at > ?
                 ORDER BY date DESC
                 LIMIT 1`,
                [machineId, hourAgo, last24date]
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
        // const avgConsum = totalConsumption / 24;
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



exports.EnergyMeterDataList = async (req, res) => {
    try {
        // Get all meters with meterType equal to "Asset"
        const [meters] = await connection.execute(`
            SELECT id, slaveId, meterType, displayName, deviceId
            FROM meters
           
            WHERE meterType = 'Asset'
           
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
                WHERE meterId = ?
                ORDER BY id DESC
                LIMIT 1
            `, [meter.id]);

            // Add meter data to response
            response.push({
                id: meter.id,
                slaveId: meter.slaveId,
                meterType: meter.meterType,
                displayName: meter.displayName,
                deviceId: meter.deviceId,
                kWvalue: totalKWh,
                pFvalue: latestPF.length > 0 ? latestPF[0].pF != null ? parseFloat(latestPF[0].pF).toFixed(1) : null : null,
                kW: latestkW.length > 0 ? latestkW[0].kW != null ? parseFloat(latestkW[0].kW).toFixed(1) : null : null
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







exports.meterDropDownList = async (req, res) => {
    try {
        const [metersList] = await connection.execute(`
            SELECT id, displayName
            FROM meters
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
