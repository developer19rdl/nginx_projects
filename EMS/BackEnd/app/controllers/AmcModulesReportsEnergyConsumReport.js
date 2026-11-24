const { connection, CustomError } = require('./config/dbSql2');
const moment = require('moment-timezone');
const { getMachineId, getGenratorMachineId } = require('./utility/utilityFunction');

exports.reportMachineDropDown = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT machine_name, id FROM machines
           
           `
        );
        return res.status(200).json({
            success: true,
            message: "Machine List",
            data: rows,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}

exports.allocationMachineDropDown = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT machine_name, id FROM machines
           
           `
        );
        return res.status(200).json({
            success: true,
            message: "Machine List",
            data: rows,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}

exports.EnergyConsumReport = async (req, res) => {
    try {
        const { meterId, fromDate: fd, toDate: td } = req.body;
        const fromDate = moment(fd, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const toDate = moment(td, 'YYYY-MM-DD').format('YYYY-MM-DD');

        const kebMachineId = await getMachineId();
        const genraorMachineId = await getGenratorMachineId();

        // Generate an array of dates from fromDate to toDate
        const dateRange = Array.from({ length: moment(toDate).diff(moment(fromDate), 'days') + 1 }, (_, i) =>
            moment(fromDate).add(i, 'days').format('YYYY-MM-DD')
        );

        if (meterId !== -1) {
            // Initialize an array to store the energy consumption data for each day
            let energyReport = [];
            let dateRangeTotalKWh = 0; // Initialize total kWh for the date range

            // Loop through each date in the range
            for (const date of dateRange) {
                // Execute the SQL query for the current date, summing the kWh values
                const [rows] = await connection.execute(
                    `SELECT SUM(kWh) as totalKWh, meterId FROM energy_data
                WHERE meterId = ? AND date = ?
                GROUP BY date`,
                    [meterId, date]
                );

                // If there are rows for the current date, add them to the report and sum the kWh
                if (rows.length > 0) {
                    energyReport.push({
                        date: date,
                        machineId: meterId,
                        energyConsum: rows[0].totalKWh // Use the summed kWh value
                    });
                    dateRangeTotalKWh += parseFloat(rows[0].totalKWh); // Add the kWh value to the total
                } else {
                    // If there are no rows for the current date, add a default object with energyConsum as 0
                    energyReport.push({
                        date: date,
                        machineId: meterId,
                        energyConsum: 0
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Energy Consumption Report",
                dateRangeTotalKWh: dateRangeTotalKWh, // Include the total kWh for the date range
                data: energyReport,
                machine: true
            });
        } else {
            let machinesKWH = 0;
            let kebSum = 0;
            let genSum = 0;
            let difSum = 0;

            // const [machineList] = await connection.execute(
            //     `SELECT machine_name, id as machineId FROM machines`
            // );

            const [meterList] = await connection.execute(
                `SELECT displayName, id as meterId FROM meters
                WHERE meterType = 'meter'
                `
            );

            const consumption = ['Date', ...meterList.map(meter => meter.displayName), 'Total'];
            const input = ['KEB', 'Generator', 'Diff/loss'];
            // Initialize the response structure
            const response = {
                headers: { consumption: consumption, input: input },
                data: []
            };

            for (const date of dateRange) {
                const dateData = { Date: date };
                let sumKWH = 0;

                for (const meter of meterList) {
                    const [rows] = await connection.execute(
                        `SELECT SUM(kWh) as totalKWh FROM energy_data
                    WHERE meterId = ? AND date = ?`,
                        [meter.meterId, date]
                    );

                    const totalKWh = (rows.length > 0 && rows[0].totalKWh != null) ? rows[0].totalKWh : 0;

                    dateData[meter.displayName] = totalKWh;
                    sumKWH += parseFloat(totalKWh);
                }

                // KEB consumption
                const [kebRows] = await connection.execute(
                    `SELECT SUM(kWh) as totalKWh FROM energy_data
                WHERE meterId = ? AND date = ?`,
                    [kebMachineId, date]
                );
                const kebVal = (kebRows.length > 0 && kebRows[0].totalKWh != null) ? kebRows[0].totalKWh : 0;

                // Genraor consumption
                const [genraorRows] = await connection.execute(
                    `SELECT SUM(kWh) as totalKWh FROM energy_data
                WHERE meterId = ? AND date = ?`,
                    [genraorMachineId, date]
                );
                const genVal = (genraorRows.length > 0 && genraorRows[0].totalKWh != null) ? genraorRows[0].totalKWh : 0;
                const difVal = (parseFloat(kebVal) + parseFloat(genVal)) - parseFloat(sumKWH);

                // setting to data array
                dateData['Total'] = sumKWH.toFixed(2);
                dateData['KEB'] = kebVal;
                dateData['Genrator'] = genVal;
                dateData['diff'] = difVal.toFixed(2);

                machinesKWH = + sumKWH;
                kebSum += parseFloat(kebVal);
                genSum += parseFloat(genVal);
                difSum += parseFloat(difVal);

                response.data.push(dateData);
            }
            const totalCalc = { totConsumption: machinesKWH.toFixed(2), totKeb: kebSum.toFixed(2), totGen: genSum.toFixed(2), totDiff: difSum.toFixed(2) }

            return res.status(200).json({
                success: true,
                message: "Energy Consumption Report",
                data: response,
                total: totalCalc,
                machine: false
            });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}



exports.KebGenerateOnOffState = async (req, res) => {
    try {



    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}


exports.report = async (req, res) => {
    try {
        const { machineId, fromDate: fd, toDate: td } = req.body;
        const fromDate = moment(fd, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const toDate = moment(td, 'YYYY-MM-DD').format('YYYY-MM-DD');

        const kebMachineId = await getMachineId();

        const genraorMachineId = await getGenratorMachineId();

        // Generate an array of dates from fromDate to toDate
        const dateRange = Array.from({ length: moment(toDate).diff(moment(fromDate), 'days') + 1 }, (_, i) =>
            moment(fromDate).add(i, 'days').format('YYYY-MM-DD')
        );

        let energyReport = [];
        let dateRangeTotalKWh = 0;

        let machinesKWH = 0;
        let kebSum = 0;
        let genSum = 0;
        let difSum = 0;

        const [machineList] = await connection.execute(
            `SELECT machine_name, id as machineId FROM machines`
        );

        const consumption = ['Date', ...machineList.map(machine => machine.machine_name), 'Total'];
        const input = ['KEB', 'Generator', 'Diff/loss'];
        // Initialize the response structure
        const response = {
            headers: { consumption: consumption, input: input },
            data: []
        };

        for (const date of dateRange) {
            const dateData = { Date: date };
            let sumKWH = 0;

            for (const machine of machineList) {
                const [rows] = await connection.execute(
                    `SELECT SUM(kWh) as totalKWh FROM energy_data
                    WHERE machineId = ? AND date = ?`,
                    [machine.machineId, date]
                );

                const totalKWh = (rows.length > 0 && rows[0].totalKWh != null) ? rows[0].totalKWh : 0;

                dateData[machine.machine_name] = totalKWh;
                sumKWH += parseFloat(totalKWh);
            }

            // KEB consumption
            const [kebRows] = await connection.execute(
                `SELECT SUM(kWh) as totalKWh FROM energy_data
                WHERE machineId = ? AND date = ?`,
                [kebMachineId, date]
            );
            const kebVal = (kebRows.length > 0 && kebRows[0].totalKWh != null) ? kebRows[0].totalKWh : 0;

            // Genraor consumption
            const [genraorRows] = await connection.execute(
                `SELECT SUM(kWh) as totalKWh FROM energy_data
                WHERE machineId = ? AND date = ?`,
                [genraorMachineId, date]
            );
            const genVal = (genraorRows.length > 0 && genraorRows[0].totalKWh != null) ? genraorRows[0].totalKWh : 0;
            const difVal = (parseFloat(kebVal) + parseFloat(genVal)) - parseFloat(sumKWH);

            // setting to data array
            dateData['Total'] = sumKWH.toFixed(2);
            dateData['KEB'] = kebVal;
            dateData['Genrator'] = genVal;
            dateData['diff'] = difVal

            machinesKWH = + sumKWH;
            kebSum += parseFloat(kebVal);
            genSum += parseFloat(genVal);
            difSum += parseFloat(difVal);

            response.data.push(dateData);
        }
        const totalCalc = { totConsumption: machinesKWH, totKeb: kebSum, totGen: genSum, totDiff: difSum }

        return res.status(200).json({
            success: true,
            message: "Energy Consumption Report",
            data: response,
            total: totalCalc,
            machine: false
        });
    } catch (error) {
        res.send(error.message);
    }
}