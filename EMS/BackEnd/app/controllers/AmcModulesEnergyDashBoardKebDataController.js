const { connection, CustomError } = require('./config/dbSql2');

const moment = require('moment-timezone');
const { getMachineId } = require('./utility/utilityFunction');


exports.KebData = async (req, res) => {
    try {
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
        // const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const currentDate = currentDateTimeHR.format('YYYY-MM-DD'); // Current date in 'YYYY-MM-DD' format
        const hrampm = currentDateTimeHR.format('hA');
        const startOfMonth = currentDateTimeHR.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentDateTimeHR.endOf('month').format('YYYY-MM-DD');

        const machineId = await getMachineId();

        // get energy parameter data fetch
        const [resultRows] = await connection.execute(
            `SELECT kWh, kWh_pre, kW, pF, Frequency, Voltage, current
             FROM energy_data
             WHERE meterId = ? 
             ORDER BY id DESC
             LIMIT 1`,
            [machineId]
        );
        const result = resultRows[0];

        // get energy kWh data fetch for current date
        const [energyDataRows] = await connection.execute(
            `SELECT kWh
             FROM energy_data
             WHERE meterId = ? AND date = ?
             ORDER BY id DESC`,
            [machineId, currentDate]
        );


        let totalDayKWh = 0;
        for (const data of energyDataRows) {
            totalDayKWh += parseFloat(data.kWh);
        }

        // get energy kWh data fetch for current hour
        const [energyDataHurRows] = await connection.execute(
            `SELECT kWh
             FROM energy_data
             WHERE meterId = ? AND date = ? AND HR = ?
             ORDER BY id DESC`,
            [machineId, currentDate, hrampm]
        );

        let totalHourKWh = 0;
        for (const data of energyDataHurRows) {
            totalHourKWh += data.kWh;
        }


        // get energy kWh data fetch for current Month
        const [energyDataMonthRows] = await connection.execute(
            `SELECT kWh
             FROM energy_data
             WHERE meterId = ? AND date >= ? AND date <= ?
             ORDER BY id DESC`,
            [machineId, startOfMonth, endOfMonth]
        );

        let totalMonthKWh = 0;
        for (const data of energyDataMonthRows) {
            totalMonthKWh += parseFloat(data.kWh);
        }






        if (!resultRows.length) {
            throw new Error("Live Machine Data not found");
        }



        const response = {
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

        return res.status(200).json(response);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.GeneratorData = async (req, res) => {
    try {
        const response = {
            message: "Live Generator Data",
            data: {
                litre: 395,
                kW: 10,
                pF: 10,
                Frequency: 0,
                Voltage: 0,
                current: 0,
                kWh: 0,

            }
        };

        return res.status(200).json(response);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
