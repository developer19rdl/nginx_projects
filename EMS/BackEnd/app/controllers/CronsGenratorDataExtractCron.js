const { connection, CustomError } = require('../config/dbSql2');
const moment = require('moment-timezone');


exports.generatorDataExtractCron = async () => {
    // cron.schedule('*/15 * * * *', async () => {
    const now = moment();
    const currentDateTime = moment();  // Get the current date and time

    const fiveTeenMinutesAgo = now.clone().subtract(15, 'minute');
    const date = fiveTeenMinutesAgo.format('YYYY-MM-DD');
    const time = fiveTeenMinutesAgo.format('HH:mm:ss');

    let dateCustom, newTime, hourValCmp, prevCons = 0, curCons = 0, curTopUp = 0;
    let cnt = 0, x = 0, lastClosingValue;

    try {

        const currentDateTimeTimestampLag = moment(currentDateTime).unix();
        const prevDateTimeTimestampLag = currentDateTimeTimestampLag - 3600;

        const prevDate = moment.unix(prevDateTimeTimestampLag).format('YYYY-MM-DD');
        const prevHr = moment.unix(prevDateTimeTimestampLag).format('HH');

        const dateh = moment(`0000-00-00 ${prevHr}:00:00`, 'YYYY-MM-DD HH:mm:ss');
        const prevHrAmPm = dateh.format('hA');

        let lastClosingValue = 0;

        const [preCountRows] = await connection.execute(`
                SELECT * 
                FROM generator_data 
                WHERE dateTime = ? 
                AND HR = ?
            `, [prevDate, prevHrAmPm]);

        if (preCountRows.length > 0) {
            lastClosingValue = preCountRows[0].prev_value;
        }

        if (lastClosingValue === "" || lastClosingValue === null || lastClosingValue === undefined) {
            lastClosingValue = 0;
        }

        const prevCons = lastClosingValue;
        console.log('Previous Consumption:', prevCons);


        const [rows] = await connection.execute(`
                SELECT *
                FROM result_data
                WHERE Date >= ? AND Time >= ? AND ltrTank = 4
            `, [date, time]);

        for (let row of rows) {
            let curCount = row.value;
            let rowTime = row.time;
            let curLevelInLtr = curCount / 1000.0;
            let [hourValChk, minValChk] = rowTime.split(":");

            // Check if the current row is within the same hour and date
            if ((dateCustom === newTime) && (hourValChk === hourValCmp)) {
                if (x === 0) {
                    console.log(row);
                    console.log("prox count:", curCount);
                }
                cnt += 1;

                // Calculate consumption and top-up
                if (prevCons > 0) {
                    let diff = prevCons - curLevelInLtr;
                    curCons += Math.max(diff, 0);

                    diff = curLevelInLtr - prevCons;
                    curTopUp += Math.max(diff, 0);
                }

                prevCons = curLevelInLtr;
                lastClosingValue = prevCons;
            }
        }

        let totFuelConsPerHr = Math.max(curCons, 0);
        let totFuelTopUpPerHr = Math.max(curTopUp, 0);


        let hrAmPm = date.toLocaleString('en-US', { hour: 'numeric', hour12: true });

        const [res2] = await connection.execute(`
                SELECT * 
                FROM fuel_data_new 
                WHERE date_t = ? AND hr = ?
            `, [newTime, hrAmPm]);

        let sql;

        if (res2.length > 0) {
            sql = `
                    UPDATE generator_data 
                    SET fuelConsum = ?, fuelTopup = ?, prevValue = ? 
                    WHERE dateTime = ? AND HR = ?
                `;
            await connection.execute(sql, [totFuelConsPerHr, totFuelTopUpPerHr, lastClosingValue, newTime, hrAmPm]);
        } else {
            sql = `
                    INSERT INTO generator_data (dateTime, HR, fuelConsum, fuelTopup, prevValue) 
                    VALUES (?, ?, ?, ?, ?)
                `;
            await connection.execute(sql, [newTime, hrAmPm, totFuelConsPerHr, totFuelTopUpPerHr, lastClosingValue]);
        }
    } catch (error) {
        console.error(error);
    }

    console.log("Done");
    // });
};