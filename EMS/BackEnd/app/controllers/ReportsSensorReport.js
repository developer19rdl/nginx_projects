const { connection } = require('../config/dbSql2');

// datetime-local inputs send 'YYYY-MM-DDTHH:mm' — MySQL wants a space separator.
const toMysqlDateTime = (v) => (v ? v.replace('T', ' ') : v);

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 50;

// Shared WHERE-clause builder for the sensor_data filters used by every query
// in getSensorReport/exportSensorReport (uses idx_device_dt for the range scan).
const buildReportFilter = ({ deviceId, slaveId, tagIds, fromDate, toDate }) => {
    const clauses = ['sd.deviceId = ?', 'sd.isAggregate = 1', 'sd.dateTime BETWEEN ? AND ?'];
    const params = [deviceId, toMysqlDateTime(fromDate), toMysqlDateTime(toDate)];

    if (slaveId && slaveId !== 'all') {
        clauses.push('sd.slaveId = ?');
        params.push(String(slaveId));
    }

    const tagIdList = Array.isArray(tagIds) ? tagIds.filter((t) => t !== undefined && t !== null && t !== '') : [];
    if (tagIdList.length > 0) {
        clauses.push(`sd.Tag_Id IN (${tagIdList.map(() => '?').join(',')})`);
        params.push(...tagIdList);
    }

    return { where: clauses.join(' AND '), params };
};

// A 0 (or negative/missing) reading means the sensor was disconnected/reporting
// nothing meaningful for that bucket, not a genuine zero — same convention the
// Temperature/Humidity/CO2/Pressure gauges already use (isValidReading in
// SensorNodeDetail.js). Treated as "no data" here too: nulled out so the table
// renders '-' (via formatNum) instead of a misleading "0.00", and the chart
// line skips the point (connectNulls) instead of dipping to a fake 0 baseline.
const noZero = (v) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(v);
    return (isNaN(n) || n <= 0) ? null : v;
};

// Pivots flat sensor_data rows into { dateTime, tags: { [Tag_Id]: {value,min,max,avg} } }
const pivotRows = (flatRows) => {
    const rowsMap = new Map(); // dateTime string -> row object
    for (const r of flatRows) {
        let rowObj = rowsMap.get(r.dateTime);
        if (!rowObj) {
            rowObj = { dateTime: r.dateTime, tags: {} };
            rowsMap.set(r.dateTime, rowObj);
        }
        rowObj.tags[r.Tag_Id] = {
            value: noZero(r.value),
            min: noZero(r.Min),
            max: noZero(r.Max),
            avg: noZero(r.Avg),
        };
    }
    return Array.from(rowsMap.values());
};

// ── GET /api/sensorReport/deviceDropdown ───────────────────────────────────────
// Devices (edge_devices) that own at least one sensor tag.
exports.getDeviceDropdown = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT DISTINCT d.id, d.edgeDeviceName AS displayName
             FROM edge_devices d
             WHERE d.id IN (SELECT DISTINCT deviceId FROM sensors)
             ORDER BY d.edgeDeviceName`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── GET /api/sensorReport/meterDropdown ────────────────────────────────────────
// Energy Meter based dropdown — lets the user pick a meter by its own display
// name (e.g. "Assembly Line 1&2") instead of hunting for the underlying raw
// device/slave pair. Only meters whose (deviceId, slaveId) actually has sensor
// tags recorded are listed, since that's a prerequisite for this report anyway.
exports.getMeterDropdown = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT DISTINCT m.id, m.displayName, m.deviceId, m.slaveId,
                    pm.plantName, b.buildingName
             FROM meters m
             LEFT JOIN plant_master pm ON pm.id = m.plantId
             LEFT JOIN buildings b ON b.id = m.buildingId
             WHERE m.deviceId IS NOT NULL AND m.slaveId IS NOT NULL
               AND EXISTS (
                   SELECT 1 FROM sensors s
                   WHERE s.deviceId = m.deviceId AND CAST(s.slaveId AS CHAR) = CAST(m.slaveId AS CHAR)
               )
             ORDER BY m.displayName`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── GET /api/sensorReport/slaveDropdown?deviceId= ──────────────────────────────
exports.getSlaveDropdown = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId || deviceId === 'all') {
            return res.status(200).json({ success: true, data: [] });
        }

        const [rows] = await connection.execute(
            `SELECT CAST(slaveId AS CHAR) AS slaveId, MAX(slaveInformation) AS slaveInformation
             FROM sensors
             WHERE deviceId = ? AND slaveId IS NOT NULL
             GROUP BY slaveId
             ORDER BY CAST(slaveId AS UNSIGNED)`,
            [deviceId]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── GET /api/sensorReport/tagDropdown?deviceId=&slaveId= ───────────────────────
exports.getTagDropdown = async (req, res) => {
    try {
        const { deviceId, slaveId } = req.query;
        const clauses = [];
        const params = [];

        if (deviceId && deviceId !== 'all') {
            clauses.push('deviceId = ?');
            params.push(deviceId);
        }
        if (slaveId && slaveId !== 'all') {
            clauses.push('CAST(slaveId AS CHAR) = ?');
            params.push(slaveId);
        }

        const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        const [rows] = await connection.execute(
            `SELECT Tag_Id AS id, Tag_Name AS displayName
             FROM sensors ${where}
             ORDER BY Tag_Name`,
            params
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/sensorReport/data ────────────────────────────────────────────────
// body: { deviceId, slaveId?, tagIds?: [], fromDate, toDate, page?, pageSize? }
// Table data is paginated by distinct dateTime bucket (one table row = one bucket,
// fanned out across up to tagIds.length physical sensor_data rows). `columns` is
// always the full-range distinct tag set (NOT just this page's) so table headers
// stay stable while paging. `chartSeries` is always the full-range Avg-only series
// (independent of page) so the trend chart/zoom aren't affected by table paging.
exports.getSensorReport = async (req, res) => {
    try {
        const { deviceId, slaveId, tagIds, fromDate, toDate } = req.body;

        if (!deviceId) {
            return res.status(400).json({ success: false, message: 'Device is required' });
        }
        if (!fromDate || !toDate) {
            return res.status(400).json({ success: false, message: 'From Date and To Date are required' });
        }

        const page = Math.max(1, parseInt(req.body.page, 10) || 1);
        const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.body.pageSize, 10) || DEFAULT_PAGE_SIZE));
        const offset = (page - 1) * pageSize;

        const { where, params } = buildReportFilter({ deviceId, slaveId, tagIds, fromDate, toDate });

        // These four reads are all independent (same filter, different projections/
        // aggregates) — run them concurrently instead of round-tripping to the DB
        // one at a time, which is what was turning a handful of small queries into
        // several seconds of sequential wait.
        const [
            [countRows],
            [tagRows],
            [chartRows],
            [pageDateTimeRows],
        ] = await Promise.all([
            // Total distinct dateTime buckets matching the filter (for pagination meta).
            connection.execute(
                `SELECT COUNT(DISTINCT sd.dateTime) AS total FROM sensor_data sd WHERE ${where}`,
                params
            ),
            // Stable, full-range tag list — must NOT be derived from just this page's
            // rows, or table headers would shift between pages when a tag has a gap.
            connection.execute(
                `SELECT DISTINCT sd.Tag_Id, sd.Tag_Name FROM sensor_data sd WHERE ${where} ORDER BY sd.Tag_Name`,
                params
            ),
            // Full-range, Avg-only series for the trend chart — cheap (3 columns) and
            // unpaginated so the chart/zoom always show the whole selected range.
            connection.execute(
                `SELECT DATE_FORMAT(sd.dateTime, '%Y-%m-%d %H:%i:%s') AS dateTime, sd.Tag_Id, sd.Avg
                 FROM sensor_data sd WHERE ${where} ORDER BY sd.dateTime ASC`,
                params
            ),
            // This page's dateTime buckets.
            connection.execute(
                `SELECT DISTINCT DATE_FORMAT(sd.dateTime, '%Y-%m-%d %H:%i:%s') AS dateTime
                 FROM sensor_data sd WHERE ${where}
                 ORDER BY sd.dateTime ASC LIMIT ? OFFSET ?`,
                [...params, pageSize, offset]
            ),
        ]);

        const totalRows = countRows[0]?.total || 0;
        const totalPages = totalRows === 0 ? 0 : Math.ceil(totalRows / pageSize);

        const columns = tagRows.map((r) => ({ tagId: r.Tag_Id, tagName: r.Tag_Name }));

        const chartSeriesMap = new Map(); // dateTime -> point object
        for (const r of chartRows) {
            let point = chartSeriesMap.get(r.dateTime);
            if (!point) {
                point = { dateTime: r.dateTime };
                chartSeriesMap.set(r.dateTime, point);
            }
            // Same 0-or-below → null "no data" rule as pivotRows/noZero above, applied
            // inline here since this loop already parses to a float.
            const avgNum = (r.Avg === null || r.Avg === undefined) ? NaN : parseFloat(r.Avg);
            point[r.Tag_Id] = (isNaN(avgNum) || avgNum <= 0) ? null : avgNum;
        }
        const chartSeries = Array.from(chartSeriesMap.values());

        // Depends on pageDateTimeRows above, so it can't join the Promise.all batch.
        let reportRows = [];
        const pageDateTimes = pageDateTimeRows.map((r) => r.dateTime);
        if (pageDateTimes.length > 0) {
            const placeholders = pageDateTimes.map(() => '?').join(',');
            const [pageRows] = await connection.execute(
                // Compares the raw indexed dateTime column (not a DATE_FORMAT(...)
                // wrapped one) so MySQL can use the index for these lookups instead
                // of scanning + reformatting every row in the whole filtered range.
                `SELECT
                    DATE_FORMAT(sd.dateTime, '%Y-%m-%d %H:%i:%s') AS dateTime,
                    sd.Tag_Id, sd.Tag_Name, sd.value, sd.Min, sd.Max, sd.Avg
                 FROM sensor_data sd
                 WHERE ${where} AND sd.dateTime IN (${placeholders})
                 ORDER BY sd.dateTime ASC, sd.Tag_Id ASC`,
                [...params, ...pageDateTimes]
            );
            reportRows = pivotRows(pageRows);
        }

        return res.status(200).json({
            success: true,
            columns,
            rows: reportRows,
            chartSeries,
            pagination: { page, pageSize, totalRows, totalPages },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/sensorReport/export ──────────────────────────────────────────────
// body: { deviceId, slaveId?, tagIds?: [], fromDate, toDate }
// Same filters as /data but unpaginated — returns the complete { columns, rows }
// for the whole filtered range, for the Excel export to consume on demand.
exports.exportSensorReport = async (req, res) => {
    try {
        const { deviceId, slaveId, tagIds, fromDate, toDate } = req.body;

        if (!deviceId) {
            return res.status(400).json({ success: false, message: 'Device is required' });
        }
        if (!fromDate || !toDate) {
            return res.status(400).json({ success: false, message: 'From Date and To Date are required' });
        }

        const { where, params } = buildReportFilter({ deviceId, slaveId, tagIds, fromDate, toDate });

        const [flatRows] = await connection.execute(
            `SELECT
                DATE_FORMAT(sd.dateTime, '%Y-%m-%d %H:%i:%s') AS dateTime,
                sd.Tag_Id, sd.Tag_Name, sd.value, sd.Min, sd.Max, sd.Avg
             FROM sensor_data sd
             WHERE ${where}
             ORDER BY sd.dateTime ASC, sd.Tag_Id ASC`,
            params
        );

        const columnsMap = new Map(); // Tag_Id -> Tag_Name
        for (const r of flatRows) {
            if (!columnsMap.has(r.Tag_Id)) columnsMap.set(r.Tag_Id, r.Tag_Name);
        }
        const columns = Array.from(columnsMap.entries())
            .map(([tagId, tagName]) => ({ tagId, tagName }))
            .sort((a, b) => a.tagName.localeCompare(b.tagName));

        return res.status(200).json({ success: true, columns, rows: pivotRows(flatRows) });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
