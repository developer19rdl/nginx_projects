const { connection, CustomError } = require('../config/dbSql2');
const moment = require('moment-timezone');
const { getMachineId, getGenratorMachineId } = require('../utility/utilityFunction');


exports.GeneratorUsageReport = async (meterId, fromDate, toDate) => {
    // Fetch machine IDs
    const kebMachineId = await getMachineId();
    const genraorMachineId = await getGenratorMachineId();

    // Generate an array of dates from fromDate to toDate
    const dateRange = Array.from({ length: moment(toDate).diff(moment(fromDate), 'days') + 1 }, (_, i) =>
        moment(fromDate).add(i, 'days').format('YYYY-MM-DD')
    );

    if (meterId != -1) {
        let energyReport = [];
        let dateRangeTotalKWh = 0;

        for (const date of dateRange) {
            const [rows] = await connection.execute(
                `SELECT SUM(kWh) as totalKWh, meterId FROM energy_data WHERE meterId = ? AND date = ? GROUP BY date`,
                [meterId, date]
            );

            if (rows.length > 0) {
                energyReport.push({
                    date: date,
                    machineId: meterId,
                    energyConsum: rows[0].totalKWh
                });
                dateRangeTotalKWh += parseFloat(rows[0].totalKWh);
            } else {
                energyReport.push({
                    date: date,
                    machineId: meterId,
                    energyConsum: 0
                });
            }
        }

        return {
            success: true,
            dateRangeTotalKWh: dateRangeTotalKWh,
            data: energyReport,
            machine: true
        };
    } else {
        let machinesKWH = 0;
        let kebSum = 0;
        let genSum = 0;
        let difSum = 0;

        const [meterList] = await connection.execute(
            `SELECT displayName, id as meterId FROM meters WHERE meterType = 'meter'`
        );

        const consumption = ['Date', ...meterList.map(meter => meter.displayName), 'Total'];
        const input = ['KEB', 'Generator', 'Diff/loss'];

        const response = {
            headers: { consumption: consumption, input: input },
            data: []
        };

        for (const date of dateRange) {
            const dateData = { Date: date };
            let sumKWH = 0;

            for (const meter of meterList) {
                const [rows] = await connection.execute(
                    `SELECT SUM(kWh) as totalKWh FROM energy_data WHERE meterId = ? AND date = ?`,
                    [meter.meterId, date]
                );

                const totalKWh = (rows.length > 0 && rows[0].totalKWh != null) ? rows[0].totalKWh : 0;

                dateData[meter.displayName] = totalKWh;
                sumKWH += parseFloat(totalKWh);
            }

            const [kebRows] = await connection.execute(
                `SELECT SUM(kWh) as totalKWh FROM energy_data WHERE meterId = ? AND date = ?`,
                [kebMachineId, date]
            );
            const kebVal = (kebRows.length > 0 && kebRows[0].totalKWh != null) ? kebRows[0].totalKWh : 0;

            const [genraorRows] = await connection.execute(
                `SELECT SUM(kWh) as totalKWh FROM energy_data WHERE meterId = ? AND date = ?`,
                [genraorMachineId, date]
            );
            const genVal = (genraorRows.length > 0 && genraorRows[0].totalKWh != null) ? genraorRows[0].totalKWh : 0;
            const difVal = (parseFloat(kebVal) + parseFloat(genVal)) - parseFloat(sumKWH);

            dateData['Total'] = sumKWH.toFixed(2);
            dateData['KEB'] = kebVal;
            dateData['Genrator'] = genVal;
            dateData['diff'] = difVal.toFixed(2);

            machinesKWH = +sumKWH;
            kebSum += parseFloat(kebVal);
            genSum += parseFloat(genVal);
            difSum += parseFloat(difVal);

            response.data.push(dateData);
        }
        const totalCalc = { totConsumption: machinesKWH.toFixed(2), totKeb: kebSum.toFixed(2), totGen: genSum.toFixed(2), totDiff: difSum.toFixed(2) }

        return {
            success: true,
            data: response,
            total: totalCalc,
            machine: false
        };
    }
};

