const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');

// ─── Dynamic Table Helpers ────────────────────────────────────────────────────

const getEnergyTableName = (yearMonth) => `energy_data_${yearMonth.replace('-', '_')}`;

const getMonthsInRange = (fromDate, toDate) => {
    const months = [];
    let cur = moment(fromDate).startOf('month');
    const end = moment(toDate).startOf('month');
    while (cur.isSameOrBefore(end)) {
        months.push(cur.format('YYYY-MM'));
        cur.add(1, 'month');
    }
    return months;
};

// Silently returns [] if the table does not exist yet
const safeQuery = async (sql, params) => {
    try {
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch {
        return [];
    }
};

// Get incomer meters (Electric Board Incomer, Generator, Solar, Windmill, UPS, ...) —
// each is shown as its own column in the report's Incomer section, named by its
// displayName (e.g. "MAIN MV PANEL", "180 KVA - DG"), optionally scoped to a plant
const getIncomerMeters = async (plantId) => {
    let query = `SELECT displayName, id as meterId FROM meters WHERE category = 'Incomer'`;
    const params = [];
    if (plantId) { query += ` AND plantId = ?`; params.push(plantId); }
    const [rows] = await connection.execute(query, params);
    return rows;
};

// Merge duplicate date+meterId pairs (safety for month boundary overlap)
const mergeDailyRows = (allRows) => {
    const map = {};
    for (const row of allRows) {
        const key = `${row.date}_${row.meterId}`;
        if (map[key]) {
            map[key].totalKWh = parseFloat(map[key].totalKWh) + parseFloat(row.totalKWh);
        } else {
            map[key] = { meterId: row.meterId, date: row.date, totalKWh: parseFloat(row.totalKWh) };
        }
    }
    return Object.values(map);
};

// A "shift" report day runs from 8 PM the previous calendar day to 8 PM the
// current day (industrial 8AM/8PM shift-change convention), instead of
// midnight-to-midnight. Shifting every timestamp forward by (24 - 20) = 4
// hours before truncating to a date reproduces that boundary. "dayShift" and
// "nightShift" split that same 24-hour cycle into its two 12-hour halves —
// day shift (8AM-8PM) stays within one calendar day so needs no date shift;
// night shift (8PM-8AM) reuses the same +4h bucket formula as "shift" so an
// overnight reading is labeled by the morning it ends, e.g. 29-07 8PM through
// 30-07 8AM is reported under 30-07 — matching the confirmed "shift" convention.
const SHIFT_CYCLE_START_HOUR = 20; // 8 PM
const SHIFT_HOUR_OFFSET = 24 - SHIFT_CYCLE_START_HOUR;
const DAY_SHIFT_START_HOUR = 8;  // 8 AM
const DAY_SHIFT_END_HOUR   = SHIFT_CYCLE_START_HOUR; // 8 PM

// Fetch daily energy rows across all monthly tables in the range.
// cycleType: 'calendar' (default, midnight-to-midnight), 'shift' (8PM-to-8PM,
// 24h), 'dayShift' (8AM-to-8PM, 12h) or 'nightShift' (8PM-to-8AM, 12h)
const fetchDailyRows = async (fromDate, toDate, meterIds, cycleType = 'calendar') => {
    if (cycleType === 'shift' || cycleType === 'nightShift') {
        const endHour = cycleType === 'nightShift' ? DAY_SHIFT_START_HOUR : SHIFT_CYCLE_START_HOUR;
        const startDT = moment(fromDate).subtract(1, 'day').format('YYYY-MM-DD') + ` ${SHIFT_CYCLE_START_HOUR}:00:00`;
        const endDT   = moment(toDate).format('YYYY-MM-DD') + ` ${endHour}:00:00`;
        const months  = getMonthsInRange(startDT.substring(0, 10), toDate);
        const allRows = [];

        for (const month of months) {
            const table = getEnergyTableName(month);
            const bucketExpr = `DATE_FORMAT(created_at + INTERVAL ${SHIFT_HOUR_OFFSET} HOUR, '%Y-%m-%d')`;
            let sql = `
                SELECT meterId, ${bucketExpr} as date, SUM(kWh) as totalKWh
                FROM ${table}
                WHERE created_at >= ? AND created_at < ?
            `;
            const params = [startDT, endDT];

            // night-only: exclude the daytime hours of each intermediate day
            if (cycleType === 'nightShift') {
                sql += ` AND (HOUR(created_at) >= ${SHIFT_CYCLE_START_HOUR} OR HOUR(created_at) < ${DAY_SHIFT_START_HOUR})`;
            }

            if (meterIds && meterIds.length > 0) {
                sql += ` AND meterId IN (${meterIds.map(() => '?').join(',')})`;
                params.push(...meterIds);
            }

            sql += ` GROUP BY meterId, ${bucketExpr}`;
            const rows = await safeQuery(sql, params);
            allRows.push(...rows);
        }

        return mergeDailyRows(allRows);
    }

    if (cycleType === 'dayShift') {
        const months = getMonthsInRange(fromDate, toDate);
        const allRows = [];

        for (const month of months) {
            const table = getEnergyTableName(month);
            let sql = `
                SELECT meterId, date, SUM(kWh) as totalKWh
                FROM ${table}
                WHERE date BETWEEN ? AND ?
                  AND HOUR(created_at) >= ${DAY_SHIFT_START_HOUR} AND HOUR(created_at) < ${DAY_SHIFT_END_HOUR}
            `;
            const params = [fromDate, toDate];

            if (meterIds && meterIds.length > 0) {
                sql += ` AND meterId IN (${meterIds.map(() => '?').join(',')})`;
                params.push(...meterIds);
            }

            sql += ` GROUP BY meterId, date`;
            const rows = await safeQuery(sql, params);
            allRows.push(...rows);
        }

        return mergeDailyRows(allRows);
    }

    const months = getMonthsInRange(fromDate, toDate);
    const allRows = [];

    for (const month of months) {
        const table = getEnergyTableName(month);
        let sql = `SELECT meterId, date, SUM(kWh) as totalKWh FROM ${table} WHERE date BETWEEN ? AND ?`;
        const params = [fromDate, toDate];

        if (meterIds && meterIds.length > 0) {
            sql += ` AND meterId IN (${meterIds.map(() => '?').join(',')})`;
            params.push(...meterIds);
        }

        sql += ` GROUP BY meterId, date`;
        const rows = await safeQuery(sql, params);
        allRows.push(...rows);
    }

    return mergeDailyRows(allRows);
};

// Fetch hourly energy rows across all monthly tables in the range
const fetchHourlyRows = async (fromDT, toDT, meterIds) => {
    const months = getMonthsInRange(fromDT.substring(0, 10), toDT.substring(0, 10));
    const allRows = [];

    for (const month of months) {
        const table = getEnergyTableName(month);
        let sql = `
            SELECT meterId, DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour, SUM(kWh) as totalKWh
            FROM ${table}
            WHERE created_at BETWEEN ? AND ?
        `;
        const params = [fromDT, toDT];

        if (meterIds && meterIds.length > 0) {
            sql += ` AND meterId IN (${meterIds.map(() => '?').join(',')})`;
            params.push(...meterIds);
        }

        sql += ` GROUP BY meterId, hour`;
        const rows = await safeQuery(sql, params);
        allRows.push(...rows);
    }

    const map = {};
    for (const row of allRows) {
        const key = `${row.hour}_${row.meterId}`;
        if (map[key]) {
            map[key].totalKWh = parseFloat(map[key].totalKWh) + parseFloat(row.totalKWh);
        } else {
            map[key] = { meterId: row.meterId, hour: row.hour, totalKWh: parseFloat(row.totalKWh) };
        }
    }
    return Object.values(map);
};

// Opening / closing meter reads per report bucket, for one meter.
// energy_data stores each hour's consumption in `kWh` and the meter's cumulative
// reading at the end of that hour in `kWh_pre`. So a bucket's closing read is the
// cumulative reading of its last row, and its opening read is the cumulative
// reading of its first row minus that row's own consumption (= the reading at the
// start of that first hour).
// bucketOf(created_at) maps a row to its bucket key, or null to skip the row.
const fetchMeterReadings = async (meterId, fromDT, toDT, bucketOf) => {
    const months = getMonthsInRange(fromDT.substring(0, 10), toDT.substring(0, 10));
    const rows = [];

    for (const month of months) {
        const table = getEnergyTableName(month);
        const sql = `
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as ts, kWh, kWh_pre
            FROM ${table}
            WHERE meterId = ? AND created_at >= ? AND created_at < ?
            ORDER BY created_at
        `;
        rows.push(...await safeQuery(sql, [meterId, fromDT, toDT]));
    }
    rows.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));

    const readings = {};
    for (const r of rows) {
        const key = bucketOf(r.ts);
        if (key == null) continue;
        const pre = parseFloat(r.kWh_pre);
        if (!pre) continue; // 0 / null = no cumulative reading captured for this hour
        const opening = pre - (parseFloat(r.kWh) || 0);
        if (!readings[key]) readings[key] = { opening, closing: pre };
        else readings[key].closing = pre;
    }
    return readings;
};

const fmtRead = (v) => (v == null ? '-' : v.toFixed(2));

const getMeterName = async (meterId) => {
    const rows = await safeQuery(`SELECT displayName FROM meters WHERE id = ?`, [meterId]);
    return rows[0]?.displayName || '';
};

// Same bucket rules as fetchDailyRows, expressed per row timestamp
const dailyBucketOf = (cycleType) => (ts) => {
    const m = moment(ts, 'YYYY-MM-DD HH:mm:ss');
    const hour = m.hour();
    if (cycleType === 'shift')      return m.clone().add(SHIFT_HOUR_OFFSET, 'hours').format('YYYY-MM-DD');
    if (cycleType === 'nightShift') {
        if (hour < SHIFT_CYCLE_START_HOUR && hour >= DAY_SHIFT_START_HOUR) return null;
        return m.clone().add(SHIFT_HOUR_OFFSET, 'hours').format('YYYY-MM-DD');
    }
    if (cycleType === 'dayShift') {
        if (hour < DAY_SHIFT_START_HOUR || hour >= DAY_SHIFT_END_HOUR) return null;
    }
    return m.format('YYYY-MM-DD');
};

// Query window matching fetchDailyRows for each cycle type
const dailyWindow = (fromDate, toDate, cycleType) => {
    if (cycleType === 'shift' || cycleType === 'nightShift') {
        const endHour = cycleType === 'nightShift' ? DAY_SHIFT_START_HOUR : SHIFT_CYCLE_START_HOUR;
        return [
            moment(fromDate).subtract(1, 'day').format('YYYY-MM-DD') + ` ${SHIFT_CYCLE_START_HOUR}:00:00`,
            moment(toDate).format('YYYY-MM-DD') + ` ${endHour}:00:00`,
        ];
    }
    return [`${fromDate} 00:00:00`, moment(toDate).add(1, 'day').format('YYYY-MM-DD') + ' 00:00:00'];
};

// Get asset meters, optionally filtered by hierarchy
const getAssetMeters = async (plantId, distributerId, feederId, incomerId) => {
    let query = `SELECT displayName, id as meterId FROM meters WHERE meterType = 'meter'`;
    const params = [];
    if (incomerId)    { query += ` AND incomerId = ?`;     params.push(incomerId); }
    if (plantId)      { query += ` AND plantId = ?`;       params.push(plantId); }
    if (distributerId){ query += ` AND distributerId = ?`; params.push(distributerId); }
    if (feederId)     { query += ` AND feederId = ?`;       params.push(feederId); }
    const [rows] = await connection.execute(query, params);
    return rows;
};

// ─── Core Data Function ───────────────────────────────────────────────────────

exports.getEnergyConsumptionData = async (meterId, fromDate, toDate, plantId, distributerId, feederId, incomerId, cycleType = 'calendar') => {
    const incomerMeters   = await getIncomerMeters(plantId);
    const incomerMeterIds = incomerMeters.map(m => m.meterId);

    const dateRange = Array.from(
        { length: moment(toDate).diff(moment(fromDate), 'days') + 1 },
        (_, i) => moment(fromDate).add(i, 'days').format('YYYY-MM-DD')
    );

    // ── Single meter ──────────────────────────────────────────────────────────
    if (meterId != -1) {
        const allFetchIds = [meterId, ...incomerMeterIds].filter(Boolean);
        const rows = await fetchDailyRows(fromDate, toDate, allFetchIds, cycleType);

        const energyMap = {};
        rows.forEach(r => {
            if (!energyMap[r.date]) energyMap[r.date] = {};
            energyMap[r.date][r.meterId] = parseFloat(r.totalKWh);
        });

        const [winFrom, winTo] = dailyWindow(fromDate, toDate, cycleType);
        const readings  = await fetchMeterReadings(meterId, winFrom, winTo, dailyBucketOf(cycleType));
        const meterName = await getMeterName(meterId);

        let totalKwh = 0, totalDiff = 0;
        const meterTotals = {};
        incomerMeters.forEach(m => { meterTotals[m.meterId] = 0; });

        const energyReport = dateRange.map(date => {
            const kwh = energyMap[date]?.[meterId] || 0;
            const row = {
                date, machineId: meterId, energyConsum: kwh.toFixed(2),
                openingRead: fmtRead(readings[date]?.opening),
                closingRead: fmtRead(readings[date]?.closing),
            };

            let incomerSum = 0;
            incomerMeters.forEach(m => {
                const val = energyMap[date]?.[m.meterId] || 0;
                row[m.meterId]         = val.toFixed(2);
                incomerSum             += val;
                meterTotals[m.meterId] += val;
            });

            const difVal = incomerSum - kwh;
            row.diffLoss = difVal.toFixed(2);

            totalKwh  += kwh;
            totalDiff += difVal;

            return row;
        });

        const totalIncomer = {};
        incomerMeters.forEach(m => { totalIncomer[m.meterId] = meterTotals[m.meterId].toFixed(2); });

        return {
            success: true,
            meterName,
            dateRangeTotalKWh: totalKwh.toFixed(2),
            totalDiff:         totalDiff.toFixed(2),
            incomerColumns:    incomerMeters.map(m => ({ key: m.meterId, label: m.displayName })),
            totalIncomer,
            data: energyReport,
            machine: true
        };
    }

    // ── All meters ────────────────────────────────────────────────────────────
    const meterList   = await getAssetMeters(plantId, distributerId, feederId, incomerId);
    const assetIds    = meterList.map(m => m.meterId);
    const allFetchIds = [...assetIds, ...incomerMeterIds];

    const rows = await fetchDailyRows(fromDate, toDate, allFetchIds, cycleType);

    const energyMap = {};
    rows.forEach(r => {
        if (!energyMap[r.date]) energyMap[r.date] = {};
        energyMap[r.date][r.meterId] = parseFloat(r.totalKWh);
    });

    // Incomer section headers — one column per incomer meter (Electric Board
    // Incomer, Generator, Solar, Windmill, UPS, ... whichever are configured)
    const inputLabels = [...incomerMeters.map(m => m.displayName), 'Diff/loss'];

    const consumption = ['Date', ...meterList.map(m => m.displayName), 'Total'];
    const response    = { headers: { consumption, input: inputLabels }, data: [] };

    const totalCalc = {};
    meterList.forEach(m => { totalCalc[m.displayName] = 0; });

    const incomerTotals = {};
    incomerMeters.forEach(m => { incomerTotals[m.displayName] = 0; });

    let machinesKWH = 0, difSum = 0;

    dateRange.forEach(date => {
        const dateData = { Date: date };
        let sumKWH = 0;

        meterList.forEach(meter => {
            const kwh = energyMap[date]?.[meter.meterId] || 0;
            dateData[meter.displayName]  = kwh.toFixed(2);
            sumKWH                       += kwh;
            totalCalc[meter.displayName] += kwh;
        });

        dateData['Total'] = sumKWH.toFixed(2);

        let incomerSum = 0;
        incomerMeters.forEach(meter => {
            const val = energyMap[date]?.[meter.meterId] || 0;
            dateData[meter.displayName]      = val.toFixed(2);
            incomerSum                       += val;
            incomerTotals[meter.displayName] += val;
        });

        const difVal = incomerSum - sumKWH;
        dateData['Diff/loss'] = difVal.toFixed(2);

        machinesKWH += sumKWH;
        difSum      += difVal;

        response.data.push(dateData);
    });

    Object.keys(totalCalc).forEach(k => { totalCalc[k] = totalCalc[k].toFixed(2); });
    Object.keys(incomerTotals).forEach(k => { incomerTotals[k] = incomerTotals[k].toFixed(2); });

    return {
        success: true,
        data: response,
        total: {
            ...totalCalc,
            totConsumption: machinesKWH.toFixed(2),
            ...incomerTotals,
            totDiff:        difSum.toFixed(2)
        },
        totalCalc,
        machine: false
    };
};

// ─── Route Handlers ───────────────────────────────────────────────────────────

exports.reportMachineDropDown = async (req, res) => {
    try {
        const [rows] = await connection.execute(`SELECT machine_name, id FROM machines`);
        return res.status(200).json({ success: true, message: 'Machine List', data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.allocationMachineDropDown = async (req, res) => {
    try {
        const [rows] = await connection.execute(`SELECT machine_name, id FROM machines`);
        return res.status(200).json({ success: true, message: 'Machine List', data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.EnergyConsumReport = async (req, res) => {
    try {
        const { meterId, fromDate: fd, toDate: td, plantId, distributerId, feederId, incomerId, cycleType } = req.body;
        const fromDate = moment(fd, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const toDate   = moment(td, 'YYYY-MM-DD').format('YYYY-MM-DD');

        const result = await exports.getEnergyConsumptionData(meterId, fromDate, toDate, plantId, distributerId, feederId, incomerId, cycleType);
        return res.status(200).json({ success: true, message: 'Energy Consumption Report', ...result });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.EnergyHourReport = async (req, res) => {
    try {
        const { meterId, fromDate: fd, toDate: td, plantId, distributerId, feederId, incomerId } = req.body;
        const fromDate = moment(fd).format('YYYY-MM-DD HH:mm:ss');
        const toDate   = moment(td).format('YYYY-MM-DD HH:mm:ss');

        const incomerMeters   = await getIncomerMeters(plantId);
        const incomerMeterIds = incomerMeters.map(m => m.meterId);

        const dateTimeRange = Array.from(
            { length: moment(toDate).diff(moment(fromDate), 'hours') + 1 },
            (_, i) => moment(fromDate).add(i, 'hours').format('YYYY-MM-DD HH:00:00')
        );

        // ── Single meter ──────────────────────────────────────────────────────
        if (meterId !== -1) {
            const allFetchIds = [meterId, ...incomerMeterIds].filter(Boolean);
            const rows = await fetchHourlyRows(fromDate, toDate, allFetchIds);

            const energyMap = {};
            rows.forEach(r => {
                if (!energyMap[r.hour]) energyMap[r.hour] = {};
                energyMap[r.hour][r.meterId] = parseFloat(r.totalKWh);
            });

            const readings = await fetchMeterReadings(
                meterId, fromDate, moment(toDate).add(1, 'second').format('YYYY-MM-DD HH:mm:ss'),
                (ts) => ts.substring(0, 13) + ':00:00'
            );
            const meterName = await getMeterName(meterId);

            let totalKwh = 0, totalDiff = 0;
            const meterTotals = {};
            incomerMeters.forEach(m => { meterTotals[m.meterId] = 0; });

            const energyReport = dateTimeRange.map(dt => {
                const kwh = energyMap[dt]?.[meterId] || 0;
                const row = {
                    date: dt, meterId, energyConsum: kwh.toFixed(2),
                    openingRead: fmtRead(readings[dt]?.opening),
                    closingRead: fmtRead(readings[dt]?.closing),
                };

                let incomerSum = 0;
                incomerMeters.forEach(m => {
                    const val = energyMap[dt]?.[m.meterId] || 0;
                    row[m.meterId]         = val.toFixed(2);
                    incomerSum             += val;
                    meterTotals[m.meterId] += val;
                });

                const difVal = incomerSum - kwh;
                row.diffLoss = difVal.toFixed(2);

                totalKwh  += kwh;
                totalDiff += difVal;

                return row;
            });

            const totalIncomer = {};
            incomerMeters.forEach(m => { totalIncomer[m.meterId] = meterTotals[m.meterId].toFixed(2); });

            return res.status(200).json({
                success: true,
                message: 'Energy Consumption Report',
                meterName,
                dateRangeTotalKWh: totalKwh.toFixed(2),
                totalDiff:         totalDiff.toFixed(2),
                incomerColumns:    incomerMeters.map(m => ({ key: m.meterId, label: m.displayName })),
                totalIncomer,
                data: energyReport,
                machine: true
            });
        }

        // ── All meters ────────────────────────────────────────────────────────
        const meterList   = await getAssetMeters(plantId, distributerId, feederId, incomerId);
        const allFetchIds = [...meterList.map(m => m.meterId), ...incomerMeterIds];

        const rows = await fetchHourlyRows(fromDate, toDate, allFetchIds);

        const energyMap = {};
        rows.forEach(r => {
            if (!energyMap[r.hour]) energyMap[r.hour] = {};
            energyMap[r.hour][r.meterId] = parseFloat(r.totalKWh);
        });

        const inputHeaders = [...incomerMeters.map(m => m.displayName), 'Diff/loss'];

        const consumptionHeaders = ['Date', ...meterList.map(m => m.displayName), 'Total'];
        const response           = { headers: { consumption: consumptionHeaders, input: inputHeaders }, data: [] };

        const totalCalc = meterList.reduce((acc, m) => { acc[m.displayName] = 0; return acc; }, {});
        const incomerTotals = {};
        incomerMeters.forEach(m => { incomerTotals[m.displayName] = 0; });

        let machinesKWH = 0, difSum = 0;

        dateTimeRange.forEach(hr => {
            const dateData = { Date: hr };
            let sumKWH = 0;

            meterList.forEach(meter => {
                const kwh = energyMap[hr]?.[meter.meterId] || 0;
                dateData[meter.displayName]  = kwh.toFixed(2);
                sumKWH                       += kwh;
                totalCalc[meter.displayName] += kwh;
            });

            dateData['Total'] = sumKWH.toFixed(2);

            let incomerSum = 0;
            incomerMeters.forEach(meter => {
                const val = energyMap[hr]?.[meter.meterId] || 0;
                dateData[meter.displayName]      = val.toFixed(2);
                incomerSum                       += val;
                incomerTotals[meter.displayName] += val;
            });

            const difVal = incomerSum - sumKWH;
            dateData['Diff/loss'] = difVal.toFixed(2);

            machinesKWH += sumKWH;
            difSum      += difVal;

            response.data.push(dateData);
        });

        Object.keys(totalCalc).forEach(k => { totalCalc[k] = totalCalc[k].toFixed(2); });
        Object.keys(incomerTotals).forEach(k => { incomerTotals[k] = incomerTotals[k].toFixed(2); });

        return res.status(200).json({
            success: true,
            message: 'Energy Consumption Report',
            data: response,
            total: {
                ...totalCalc,
                totConsumption: machinesKWH.toFixed(2),
                ...incomerTotals,
                totDiff:        difSum.toFixed(2)
            },
            machine: false
        });
    } catch (err) {
        console.error(err);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.KebGenerateOnOffState = async (req, res) => {
    try {
        return res.status(200).json({ success: true, data: [] });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.gettop5energyData = async (req, res) => {
    const { fromDate, toDate, plantId, distributerId, feederId, incomerId, cycleType } = req.body;

    if (!fromDate || !toDate) {
        return res.status(400).json({ success: false, message: 'Both fromdate and todate are required.' });
    }

    try {
        const meterList = await getAssetMeters(plantId, distributerId, feederId, incomerId);
        const meterIds  = meterList.map(m => m.meterId);
        const nameMap   = {};
        meterList.forEach(m => { nameMap[m.meterId] = m.displayName; });

        const rows = await fetchDailyRows(fromDate, toDate, meterIds.length > 0 ? meterIds : null, cycleType);

        const meterTotals = {};
        rows.forEach(r => {
            if (!meterTotals[r.meterId]) meterTotals[r.meterId] = 0;
            meterTotals[r.meterId] += parseFloat(r.totalKWh);
        });

        const result = Object.entries(meterTotals)
            .map(([meterId, totalKWh]) => ({
                machine_name: nameMap[meterId] || `Meter ${meterId}`,
                totalKWh: totalKWh.toFixed(2)
            }))
            .sort((a, b) => parseFloat(b.totalKWh) - parseFloat(a.totalKWh))
            .slice(0, 5);

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.gettenergyDataingraph = async (req, res) => {
    const { fromDate, toDate, plantId, distributerId, feederId, incomerId, cycleType } = req.body;

    if (!fromDate || !toDate) {
        return res.status(400).json({ success: false, message: 'Both fromdate and todate are required.' });
    }

    try {
        const meterList = await getAssetMeters(plantId, distributerId, feederId, incomerId);
        const meterIds  = meterList.map(m => m.meterId);

        const rows = await fetchDailyRows(fromDate, toDate, meterIds.length > 0 ? meterIds : null, cycleType);

        const dateMap = {};
        rows.forEach(r => {
            const dayKey = moment(r.date).format('DD');
            if (!dateMap[dayKey]) dateMap[dayKey] = 0;
            dateMap[dayKey] += parseFloat(r.totalKWh);
        });

        const graphData = Object.entries(dateMap)
            .map(([date, totalKWh]) => ({ date, totalKWh: totalKWh.toFixed(2) }))
            .sort((a, b) => parseInt(a.date) - parseInt(b.date));

        const max = graphData.reduce((acc, item) => Math.max(acc, parseFloat(item.totalKWh)), 0);

        return res.status(200).json({ success: true, data: graphData, maxValue: max + 100 });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════════
// BUILDING / CATEGORY HIERARCHY ENERGY REPORT
// Uses meter_groups → meters to resolve which meters belong to a category path.
// ═══════════════════════════════════════════════════════════════════════════════

// Get meters from meter_groups for the selected category path
const getCategoryMeterList = async (buildingId, categoryId, subCategoryId) => {
    let query = `
        SELECT DISTINCT m.id as meterId, m.displayName
        FROM meter_groups mg
        INNER JOIN meters m ON m.id = mg.meterId
        WHERE mg.meterId IS NOT NULL AND mg.meterId > 0
    `;
    const params = [];
    if (buildingId)    { query += ` AND mg.buildingId = ?`;    params.push(buildingId); }
    if (categoryId)    { query += ` AND mg.categoryId = ?`;    params.push(categoryId); }
    if (subCategoryId) { query += ` AND mg.subCategoryId = ?`; params.push(subCategoryId); }
    query += ` ORDER BY m.displayName`;
    const [rows] = await connection.execute(query, params);
    return rows;
};

// ── Core building energy data function ────────────────────────────────────────
exports.getBuildingEnergyConsumptionData = async (meterId, fromDate, toDate, buildingId, categoryId, subCategoryId) => {
    const dateRange = Array.from(
        { length: moment(toDate).diff(moment(fromDate), 'days') + 1 },
        (_, i) => moment(fromDate).add(i, 'days').format('YYYY-MM-DD')
    );

    // ── Single meter ──────────────────────────────────────────────────────────
    if (meterId != -1) {
        const rows = await fetchDailyRows(fromDate, toDate, [meterId]);
        const rowMap = {};
        rows.forEach(r => { rowMap[r.date] = parseFloat(r.totalKWh); });

        const energyReport = dateRange.map(date => ({
            date,
            machineId: meterId,
            energyConsum: (rowMap[date] || 0).toFixed(2),
        }));
        const dateRangeTotalKWh = energyReport.reduce((s, r) => s + parseFloat(r.energyConsum), 0);

        return { success: true, dateRangeTotalKWh: dateRangeTotalKWh.toFixed(2), data: energyReport, machine: true };
    }

    // ── All meters in the selected category ───────────────────────────────────
    const meterList = await getCategoryMeterList(buildingId, categoryId, subCategoryId);
    const rows      = await fetchDailyRows(fromDate, toDate, meterList.map(m => m.meterId));

    const energyMap = {};
    rows.forEach(r => {
        if (!energyMap[r.date]) energyMap[r.date] = {};
        energyMap[r.date][r.meterId] = parseFloat(r.totalKWh);
    });

    const consumption = ['Date', ...meterList.map(m => m.displayName), 'Total'];
    const response    = { headers: { consumption, input: [] }, data: [] };
    const totalCalc   = {};
    meterList.forEach(m => { totalCalc[m.displayName] = 0; });
    let machinesKWH = 0;

    dateRange.forEach(date => {
        const dateData = { Date: date };
        let sumKWH = 0;
        meterList.forEach(meter => {
            const kwh = energyMap[date]?.[meter.meterId] || 0;
            dateData[meter.displayName]  = kwh.toFixed(2);
            sumKWH                       += kwh;
            totalCalc[meter.displayName] += kwh;
        });
        dateData['Total'] = sumKWH.toFixed(2);
        machinesKWH       += sumKWH;
        response.data.push(dateData);
    });

    Object.keys(totalCalc).forEach(k => { totalCalc[k] = totalCalc[k].toFixed(2); });

    return {
        success: true,
        data: response,
        total: { ...totalCalc, totConsumption: machinesKWH.toFixed(2) },
        totalCalc,
        machine: false,
    };
};

exports.BuildingEnergyConsumReport = async (req, res) => {
    try {
        const { meterId, fromDate: fd, toDate: td, buildingId, categoryId, subCategoryId } = req.body;
        const fromDate = moment(fd, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const toDate   = moment(td, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const result   = await exports.getBuildingEnergyConsumptionData(meterId, fromDate, toDate, buildingId, categoryId, subCategoryId);
        return res.status(200).json({ success: true, message: 'Building Energy Consumption Report', ...result });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.BuildingEnergyHourReport = async (req, res) => {
    try {
        const { meterId, fromDate: fd, toDate: td, buildingId, categoryId, subCategoryId } = req.body;
        const fromDate = moment(fd).format('YYYY-MM-DD HH:mm:ss');
        const toDate   = moment(td).format('YYYY-MM-DD HH:mm:ss');

        const dateTimeRange = Array.from(
            { length: moment(toDate).diff(moment(fromDate), 'hours') + 1 },
            (_, i) => moment(fromDate).add(i, 'hours').format('YYYY-MM-DD HH:00:00')
        );

        if (meterId !== -1) {
            const rows = await fetchHourlyRows(fromDate, toDate, [meterId]);
            const rowMap = {};
            rows.forEach(r => { rowMap[r.hour] = parseFloat(r.totalKWh); });
            const energyReport = dateTimeRange.map(dt => ({
                date: dt, meterId, energyConsum: (rowMap[dt] || 0).toFixed(2),
            }));
            const dateRangeTotalKWh = energyReport.reduce((s, r) => s + parseFloat(r.energyConsum), 0);
            return res.status(200).json({
                success: true, message: 'Building Energy Hour Report',
                dateRangeTotalKWh: dateRangeTotalKWh.toFixed(2), data: energyReport, machine: true,
            });
        }

        const meterList = await getCategoryMeterList(buildingId, categoryId, subCategoryId);
        const rows = await fetchHourlyRows(fromDate, toDate, meterList.map(m => m.meterId));
        const energyMap = {};
        rows.forEach(r => {
            if (!energyMap[r.hour]) energyMap[r.hour] = {};
            energyMap[r.hour][r.meterId] = parseFloat(r.totalKWh);
        });

        const consumptionHeaders = ['Date', ...meterList.map(m => m.displayName), 'Total'];
        const response = { headers: { consumption: consumptionHeaders, input: [] }, data: [] };
        const totalCalc = meterList.reduce((acc, m) => { acc[m.displayName] = 0; return acc; }, {});
        let machinesKWH = 0;

        dateTimeRange.forEach(hr => {
            const dateData = { Date: hr };
            let sumKWH = 0;
            meterList.forEach(meter => {
                const kwh = energyMap[hr]?.[meter.meterId] || 0;
                dateData[meter.displayName]  = kwh.toFixed(2);
                sumKWH                       += kwh;
                totalCalc[meter.displayName] += kwh;
            });
            dateData['Total'] = sumKWH.toFixed(2);
            machinesKWH       += sumKWH;
            response.data.push(dateData);
        });

        Object.keys(totalCalc).forEach(k => { totalCalc[k] = totalCalc[k].toFixed(2); });

        return res.status(200).json({
            success: true, message: 'Building Energy Hour Report',
            data: response,
            total: { ...totalCalc, totConsumption: machinesKWH.toFixed(2) },
            machine: false,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.getBuildingTop5energyData = async (req, res) => {
    const { fromDate, toDate, buildingId, categoryId, subCategoryId } = req.body;
    if (!fromDate || !toDate)
        return res.status(400).json({ success: false, message: 'fromDate and toDate are required.' });
    try {
        const meterList = await getCategoryMeterList(buildingId, categoryId, subCategoryId);
        const meterIds  = meterList.map(m => m.meterId);
        const nameMap   = {};
        meterList.forEach(m => { nameMap[m.meterId] = m.displayName; });

        const rows = await fetchDailyRows(fromDate, toDate, meterIds.length ? meterIds : null);
        const meterTotals = {};
        rows.forEach(r => {
            if (!meterTotals[r.meterId]) meterTotals[r.meterId] = 0;
            meterTotals[r.meterId] += parseFloat(r.totalKWh);
        });

        const result = Object.entries(meterTotals)
            .map(([id, totalKWh]) => ({ machine_name: nameMap[id] || `Meter ${id}`, totalKWh: totalKWh.toFixed(2) }))
            .sort((a, b) => parseFloat(b.totalKWh) - parseFloat(a.totalKWh))
            .slice(0, 5);

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.getBuildingEnergydatagraph = async (req, res) => {
    const { fromDate, toDate, buildingId, categoryId, subCategoryId } = req.body;
    if (!fromDate || !toDate)
        return res.status(400).json({ success: false, message: 'fromDate and toDate are required.' });
    try {
        const meterList = await getCategoryMeterList(buildingId, categoryId, subCategoryId);
        const meterIds  = meterList.map(m => m.meterId);

        const rows = await fetchDailyRows(fromDate, toDate, meterIds.length ? meterIds : null);
        const dateMap = {};
        rows.forEach(r => {
            const dayKey = moment(r.date).format('DD');
            if (!dateMap[dayKey]) dateMap[dayKey] = 0;
            dateMap[dayKey] += parseFloat(r.totalKWh);
        });

        const graphData = Object.entries(dateMap)
            .map(([date, totalKWh]) => ({ date, totalKWh: totalKWh.toFixed(2) }))
            .sort((a, b) => parseInt(a.date) - parseInt(b.date));

        const max = graphData.reduce((acc, item) => Math.max(acc, parseFloat(item.totalKWh)), 0);
        return res.status(200).json({ success: true, data: graphData, maxValue: max + 100 });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
