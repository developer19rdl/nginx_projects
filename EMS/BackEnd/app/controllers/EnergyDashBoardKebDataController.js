const { connection, CustomError } = require('../config/dbSql2');

const moment = require('moment-timezone');
const { getMachineId, getGenratorMachineId, getActiveTariff } = require('../utility/utilityFunction');

//old deployed


// Dynamic monthly table name helper
const getEnergyTableName = (dateString) => {
    const yearMonth = dateString.substring(0, 7).replace('-', '_');
    return `energy_data_${yearMonth}`;
};

exports.KebData = async (req, res) => {
    try {
        const currentDateTimeHR = moment.tz('Asia/Kolkata');
        const currentDate  = currentDateTimeHR.format('YYYY-MM-DD');
        const hrampm       = currentDateTimeHR.format('hA');
        const startOfMonth = moment.tz('Asia/Kolkata').startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = moment.tz('Asia/Kolkata').endOf('month').format('YYYY-MM-DD');
        const currentTable = getEnergyTableName(currentDate);

        // meterId query param = a specific incomer selected in the IoT Dashboard tree;
        // absent = default fixed "Electric board (incomer)" meter (e.g. Plant/Incomer-group view).
        const { meterId: requestedMeterId } = req.query;

        // Get meterId (for energy tables) + deviceId/slaveId (for live_tag_snapshot) in one query
        const [meterRows] = requestedMeterId
            ? await connection.execute(
                `SELECT id AS meterId, deviceId, slaveId
                 FROM meters
                 WHERE id = ?
                 LIMIT 1`,
                [requestedMeterId]
            )
            : await connection.execute(
                `SELECT id AS meterId, deviceId, slaveId
                 FROM meters
                 WHERE LOWER(meterType) = LOWER('Electric board (incomer)')
                 LIMIT 1`
            );

        if (!meterRows.length) {
            return res.status(200).json({
                message: 'Live Machine Data',
                data: { Current: '0.0', kW: 0, pF: '0.000', Voltage: '0.0',
                        Frequency: '0.0', kWh: '0.0', kWhDay: '0.00', kWhMonth: '0.0' },
            });
        }

        const { meterId, deviceId, slaveId } = meterRows[0];

        // ── Live params from live_tag_snapshot ────────────────────────────────
        const liveTags     = ['pF', 'frequency', 'vLl', 'currentTotal', 'kW'];
        const placeholders = liveTags.map(() => '?').join(',');

        const [tagRows] = await connection.execute(
            `SELECT tag_name, COALESCE(value, 0) AS value
             FROM live_tag_snapshot
             WHERE deviceId = ? AND slaveId = ? AND tag_name IN (${placeholders})`,
            [deviceId, slaveId, ...liveTags]
        );

        const tagMap = {};
        tagRows.forEach(row => { tagMap[row.tag_name] = parseFloat(row.value) || 0; });

        // ── Aggregated kWh — dynamic monthly table ────────────────────────────
        let aggregateData = { totalDayKWh: 0, totalHourKWh: 0, totalMonthKWh: 0 };
        try {
            const [aggRows] = await connection.execute(
                `SELECT
                    SUM(CASE WHEN date = ? THEN kWh ELSE 0 END)                AS totalDayKWh,
                    SUM(CASE WHEN date = ? AND HR = ? THEN kWh ELSE 0 END)     AS totalHourKWh,
                    SUM(CASE WHEN date >= ? AND date <= ? THEN kWh ELSE 0 END) AS totalMonthKWh
                 FROM ${currentTable}
                 WHERE meterId = ?`,
                [currentDate, currentDate, hrampm, startOfMonth, endOfMonth, meterId]
            );
            if (aggRows[0]) aggregateData = aggRows[0];
        } catch {
            // monthly table may not exist yet — keep zeros
        }

        return res.status(200).json({
            message: 'Live Machine Data',
            data: {
                Current:   parseFloat(tagMap.currentTotal || 0).toFixed(1),
                kW:        parseFloat(tagMap.kW || 0).toFixed(2),
                pF:        parseFloat(tagMap.pF           || 0).toFixed(3),
                Voltage:   parseFloat(tagMap.vLl          || 0).toFixed(1),
                Frequency: parseFloat(tagMap.frequency    || 0).toFixed(1),
                kWh:       parseFloat(aggregateData.totalHourKWh  || 0).toFixed(1),
                kWhDay:    parseFloat(aggregateData.totalDayKWh   || 0).toFixed(2),
                kWhMonth:  parseFloat(aggregateData.totalMonthKWh || 0).toFixed(1),
            },
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred',
        });
    }
};




exports.KEBCurrentData = async (req, res) => {
    try {
        const { meterId: requestedMeterId } = req.query;
        const machineId = requestedMeterId ? parseInt(requestedMeterId, 10) : await getMachineId();
        const currentDate   = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
        const startOfMonth  = moment.tz('Asia/Kolkata').startOf('month').format('YYYY-MM-DD');
        const endOfMonth    = moment.tz('Asia/Kolkata').endOf('month').format('YYYY-MM-DD');
        const currentTable  = getEnergyTableName(currentDate);

        // Current day and current month always fall in the same monthly-sharded table.
        let totalDayKWh = 0, totalMonthKWh = 0;
        try {
            const [rows] = await connection.execute(
                `SELECT
                    SUM(CASE WHEN date = ?          THEN kWh ELSE 0 END) AS totalDayKWh,
                    SUM(CASE WHEN date BETWEEN ? AND ? THEN kWh ELSE 0 END) AS totalMonthKWh
                 FROM ${currentTable}
                 WHERE meterId = ?`,
                [currentDate, startOfMonth, endOfMonth, machineId]
            );
            totalDayKWh   = parseFloat(rows[0]?.totalDayKWh   || 0);
            totalMonthKWh = parseFloat(rows[0]?.totalMonthKWh || 0);
        } catch {
            // current month's table may not exist yet — keep zeros
        }

        // Bill = incomer meter kWh × the tariff rate active on the billing date
        // (energy_tariff, configured under Configuration > Energy).
        const tariff = await getActiveTariff(currentDate);
        const ratePerKWh = parseFloat(tariff.energyCostPerUnit) || 0;

        return res.status(200).json({
            message: 'KEB Current Data',
            data: {
                totalKWhDay:   totalDayKWh.toFixed(2),
                costperDay:    (totalDayKWh   * ratePerKWh).toFixed(2),
                totalKWhMonth: totalMonthKWh.toFixed(2),
                costperMonth:  (totalMonthKWh * ratePerKWh).toFixed(2),
            }
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// exports.TopFiveDevices = async (req, res) => {
//     try {
//         const currentDate  = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
//         const pastWeekDate = moment.tz('Asia/Kolkata').subtract(7, 'days').format('YYYY-MM-DD');

//         const [rows] = await connection.execute(
//             `SELECT m.displayName, SUM(e.kWh) AS totalKWh
//              FROM meters m
//              JOIN  e ON m.id = e.meterId
//              WHERE m.meterType = 'Asset' AND e.date BETWEEN ? AND ?
//              GROUP BY m.id, m.displayName
//              ORDER BY totalKWh DESC
//              LIMIT 5`,
//             [pastWeekDate, currentDate]
//         );

//         const colors = ['#3FA2F6', '#FF4191', '#F4CE14', '#AF47D2', '#40A578'];
//         const result = rows.map((row, i) => ({
//             machineName: row.displayName,
//             totalKWh:    parseFloat(row.totalKWh || 0).toFixed(3),
//             color:       colors[i],
//         }));

//         return res.status(200).json({ message: 'Top 5 Devices', data: result });
//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };

exports.TopFiveDevices = async (req, res) => {
    try {
        const currentDate = new Date();
        const lastWeekDate = new Date();
        lastWeekDate.setDate(currentDate.getDate() - 6);

        const currentDateString = currentDate.toISOString().split('T')[0];
        const lastWeekDateString = lastWeekDate.toISOString().split('T')[0];

        // Collect all dates between last 7 days
        const dates = [];
        const loopDate = new Date(lastWeekDate);

        while (loopDate <= currentDate) {
            dates.push(loopDate.toISOString().split('T')[0]);
            loopDate.setDate(loopDate.getDate() + 1);
        }

        // Extract distinct year-months
        const uniqueMonths = [...new Set(dates.map(d => d.substring(0, 7)))];

        let combinedResults = [];

        // Loop through each month and query its table
        for (const month of uniqueMonths) {
            const tableName = getEnergyTableName(month);

            const sql = `
                SELECT
                    ed.meterId,
                    m.displayName AS machineName,
                    SUM(ed.kWh) AS totalKWh
                FROM
                    ${tableName} ed
                INNER JOIN
                    meters m ON ed.meterId = m.id
                WHERE
                    m.meterType = 'meter'
                    AND ed.date BETWEEN ? AND ?
                GROUP BY
                    ed.meterId, m.displayName
            `;

            try {
                const [rows] = await connection.query(sql, [
                    lastWeekDateString,
                    currentDateString
                ]);
                combinedResults = combinedResults.concat(rows);
            } catch (error) {
                // Table may not exist (example: first days of month)
                console.warn(`Skipping missing table: ${tableName}`);
            }
        }

        // Merge duplicate meterIds across months
        const mergedMap = {};

        combinedResults.forEach(row => {
            const totalKWh = parseFloat(row.totalKWh) || 0;
            if (!mergedMap[row.meterId]) {
                mergedMap[row.meterId] = { ...row, totalKWh };
            } else {
                mergedMap[row.meterId].totalKWh += totalKWh;
            }
        });

        // Convert map to array
        const finalData = Object.values(mergedMap)
            .sort((a, b) => b.totalKWh - a.totalKWh)
            .slice(0, 5); // Top 5 outgoing meters

        res.status(200).json({
            success: true,
            data: finalData
        });

    } catch (error) {
        console.error("Error retrieving top device consumption:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



exports.HourlyPowerByDevice = async (req, res) => {
    try {
         const currentDateTime = moment.tz('Asia/Kolkata');
        const currentDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
         const newDate = currentDateTime.format('YYYY-MM-DD');
//meter == asset
        const [meters] = await connection.execute(
            `SELECT id, displayName FROM meters WHERE meterType = 'meter' LIMIT 10`
        );

        if (!meters.length) {
            return res.status(200).json({ message: 'Hourly Power by Device', data: [] });
        }

        // Build 12-hour buckets (oldest → newest)
        const hourBuckets = {};
        for (let h = 11; h >= 0; h--) {
            const hr = moment.tz('Asia/Kolkata').subtract(h, 'hours').format('hA');
            hourBuckets[hr] = { time: hr };
        }
  const energyTableName = getEnergyTableName(newDate);
        for (const meter of meters) {
            const [rows] = await connection.execute(
                `SELECT HR, SUM(kWh) AS totalKWh
                 FROM ${energyTableName}
                 WHERE meterId = ? AND date = ?
                 GROUP BY HR`,
                [meter.id, currentDate]
            );
            rows.forEach(row => {
                if (hourBuckets[row.HR]) {
                    hourBuckets[row.HR][meter.displayName] = parseFloat(row.totalKWh || 0);
                }
            });
        }

        return res.status(200).json({ message: 'Hourly Power by Device', data: Object.values(hourBuckets) });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.GeneratorData = async (req, res) => {
    try {
        const machineId = await getGenratorMachineId();

        // Get energy parameter data fetch
        const [resultRows] = await connection.execute(
            `SELECT kWh, kWh_pre, kW, pF, Frequency, Voltage, current
             FROM energy_data_view
             WHERE meterId = ? 
             ORDER BY id DESC
             LIMIT 1`,
            [machineId]
        );
        const result = resultRows[0];

        // Helper function to safely parse values and return 0 if NaN
        const parseValue = (value, type = 'number') => {
            if (type === 'float') {
                return isNaN(parseFloat(value)) ? 0 : parseFloat(value).toFixed(1);
            }
            return isNaN(parseInt(value)) ? 0 : parseInt(value);
        };

        const response = {
            message: "Live Generator Data",
            data: {
                litre: 396,
                kW: parseValue(result?.kW),
                pF: parseValue(result?.pF, 'float'),
                Frequency: parseValue(result?.Frequency, 'float'),
                Voltage: parseValue(result?.Voltage, 'float'),
                Current: parseValue(result?.current, 'float'),
                kWh: 0 // Assuming no calculation or data for kWh is needed
            }
        };

        return res.status(200).json(response);
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.Last30DaysEnergyConsumptionTrend = async (req, res) => {
  const startTime = moment();
  try {
    const machineId = await getMachineId();

    const currentDateTime = moment.tz('Asia/Kolkata');
    const currentDate = currentDateTime.format('YYYY-MM-DD');
    // const pastDate = currentDateTime.clone().subtract(29, 'days').format('YYYY-MM-DD');

    const pastDate = currentDateTime.clone().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endDate = currentDateTime.clone().endOf('day').format('YYYY-MM-DD HH:mm:ss');



    // Build list of all unique months involved in last 30 days
    const monthTables = new Set();
    for (let i = 0; i < 30; i++) {
      const date = currentDateTime.clone().subtract(i, 'days').format('YYYY-MM-DD');
      monthTables.add(getEnergyTableName(date));
    }

    let allRows = [];

    // 🔹 Fetch data from each monthly table dynamically
    for (const tableName of monthTables) {
      try {
        const [rows] = await connection.execute(
          `SELECT DATE(created_at) as date, SUM(kWh) as energyConsum
           FROM ${tableName}
           WHERE meterId = ? AND created_at BETWEEN ? AND ?
           GROUP BY DATE(created_at)
           ORDER BY DATE(created_at) DESC`,
          [machineId, pastDate, endDate]
        );
        allRows = [...allRows, ...rows];
      } catch (err) {
        // Skip if table doesn't exist (e.g., no data for that month)
        if (err.code !== 'ER_NO_SUCH_TABLE') {
          console.error(`Error reading table ${tableName}:`, err.message);
        }
      }
    }

    // 🔹 Merge and aggregate data by date
    const mergedMap = {};
    for (const row of allRows) {
      const dateKey = moment(row.date).format('YYYY-MM-DD');
      mergedMap[dateKey] = (mergedMap[dateKey] || 0) + parseFloat(row.energyConsum || 0);
    }

    // 🔹 Prepare response array and calculate totals
    let responseData = [];
    let totalConsumption = 0;

    for (let i = 0; i < 30; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const energyConsum = mergedMap[date] || 0;
      totalConsumption += energyConsum;

      responseData.push({
        date,
        energyConsum,
        avgConsum: 0
      });
    }

    // 🔹 Calculate average
    const avgConsum = Math.round(totalConsumption / 30);

    responseData = responseData.map(item => ({
      ...item,
      avgConsum
    }));

    responseData.reverse(); // Oldest to newest

    const endTime = moment();
    const actualExecutionTime = endTime.diff(startTime, 'seconds');
    await logExecution('apiFunction', 'Last30DaysEnergyConsumptionTrend', actualExecutionTime);

    return res.status(200).json({
      success: true,
      message: "Last 30 days energy consumption (cross-month supported)",
      data: responseData
    });

  } catch (err) {
    console.error("Error in Last30DaysEnergyConsumptionTrend:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'An error occurred'
    });
  }
};

