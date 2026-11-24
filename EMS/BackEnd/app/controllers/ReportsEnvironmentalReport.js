const { connection } = require('../config/dbSql2');

// Environmental Hourly Report — Temperature/Humidity/CO2/Pressure only.
// Separate from ReportsSensorReport.js per the client's ask: no Min/Max/Avg columns,
// just the actual recorded reading once per hour (the last value logged within each
// hour). Filtered by Sensor (single) then Location (single, scoped to that sensor
// type) — the client doesn't want to deal with device/slave wiring or multi-select
// here, so sensorType + category -> utility_meters -> sensors.Tag_Id is resolved
// server-side. Reuses `sensor_data` (populated every 15 min by SensorAggregateCron.js)
// — hourly buckets are derived here by keeping the latest 15-min row within each hour.

const toMysqlDateTime = (v) => (v ? v.replace('T', ' ') : v);

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 50;

// Same keyword convention duplicated across UtilityMeterController.js/AlertController.js/
// SensorNodeDetail.js/alertNotifier.js/UtilityEnvThresholdAlertCron.js — a meter type
// renamed in the Meter Type master (e.g. "Air pressure") still resolves to its sensor type.
const ENV_TAG_KEYWORDS = {
    Temperature: ['temp'],
    Humidity:    ['humid'],
    CO2:         ['co2', 'carbon'],
    Pressure:    ['pressure', 'press'],
};
const ENV_SENSOR_TYPES = Object.keys(ENV_TAG_KEYWORDS);

const likeClauseFor = (column, type) => {
    const keywords = ENV_TAG_KEYWORDS[type] || [];
    return {
        sql: `(${keywords.map(() => `LOWER(${column}) LIKE ?`).join(' OR ')})`,
        params: keywords.map((k) => `%${k}%`),
    };
};

const canonicalType = (name) => {
    const lower = String(name || '').toLowerCase();
    return ENV_SENSOR_TYPES.find((t) => ENV_TAG_KEYWORDS[t].some((k) => lower.includes(k))) || null;
};

// A 0 (or negative/missing) reading means the sensor was disconnected, not a real
// measurement — same "no data" convention used throughout the sensor dashboards.
const noZero = (v) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(v);
    return (isNaN(n) || n <= 0) ? null : v;
};

// ── GET /api/environmentalReport/categoryDropdown?sensorType= ──────────────────
// Utility Meter categories/locations that have at least one meter of the given
// sensor type grouped on them (directly or via a subcategory) — scoped to ONE
// sensor type so the same-named line under a different building/floor doesn't
// show up when it doesn't actually have that sensor. Building/floor are included
// in the label to disambiguate categories that legitimately share a name (e.g.
// "IDG Assembly Line - 1&2" allocated separately per building).
exports.getCategoryDropdown = async (req, res) => {
    try {
        const { sensorType } = req.query;
        if (!sensorType || !ENV_SENSOR_TYPES.includes(sensorType)) {
            return res.status(400).json({ success: false, message: 'sensorType must be one of ' + ENV_SENSOR_TYPES.join(', ') });
        }
        const { sql: typeSql, params: typeParams } = likeClauseFor('um.meterType', sensorType);
        const [rows] = await connection.execute(
            `SELECT DISTINCT c.id, c.categoryName, b.buildingName, f.floorName
             FROM category c
             LEFT JOIN buildings b ON b.id = c.buildingId
             LEFT JOIN floors f ON f.id = c.floorId
             WHERE c.categoryKind = 'Utility Meter'
               AND EXISTS (
                   SELECT 1 FROM utility_meter_groups ug
                   INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
                   WHERE (ug.categoryId = c.id
                          OR ug.subCategoryId IN (SELECT sc.id FROM subcategory sc WHERE sc.categoryId = c.id))
                     AND ${typeSql}
               )
             ORDER BY COALESCE(c.sortOrder, 999999), c.categoryName`,
            typeParams
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// Resolves { categoryId, sensorType } -> [{ meterId, label, tagId }], one entry per
// meter (of that type, grouped on that category/its subcategories) that has a
// matching sensors.Tag_Id — meters with no resolvable tag are skipped.
async function resolveColumns(categoryId, sensorType) {
    const { sql: typeSql, params: typeParams } = likeClauseFor('um.meterType', sensorType);

    const [meters] = await connection.execute(
        `SELECT DISTINCT um.id AS meterId, um.meterName, um.meterType, um.deviceId, um.slaveId,
                um.minLimit, um.maxLimit,
                COALESCE(cDirect.categoryName, cViaSub.categoryName) AS categoryName
         FROM utility_meter_groups ug
         INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
         LEFT JOIN category cDirect ON cDirect.id = ug.categoryId
         LEFT JOIN subcategory scJoin ON scJoin.id = ug.subCategoryId
         LEFT JOIN category cViaSub ON cViaSub.id = scJoin.categoryId
         WHERE (ug.categoryId = ? OR scJoin.categoryId = ?)
           AND ${typeSql}`,
        [categoryId, categoryId, ...typeParams]
    );
    if (!meters.length) return [];

    const deviceIds = [...new Set(meters.map((m) => m.deviceId))];
    const [tagRows] = await connection.execute(
        `SELECT deviceId, slaveId, Tag_Id, Tag_Name FROM sensors WHERE deviceId IN (${deviceIds.map(() => '?').join(',')})`,
        deviceIds
    );

    const keywords = ENV_TAG_KEYWORDS[sensorType] || [];
    const columns = [];
    for (const m of meters) {
        const tag = tagRows.find((t) => t.deviceId === m.deviceId && String(t.slaveId) === String(m.slaveId)
            && keywords.some((k) => String(t.Tag_Name || '').toLowerCase().includes(k)));
        if (!tag) continue; // no matching sensor tag wired for this meter — skip rather than error
        columns.push({
            meterId: m.meterId,
            label: meters.length > 1 ? `${m.categoryName || m.meterName} — ${m.meterName}` : (m.categoryName || m.meterName),
            tagId: tag.Tag_Id,
            minLimit: m.minLimit,
            maxLimit: m.maxLimit,
        });
    }
    return columns;
}

// Collapses flat 15-min sensor_data rows into one row per hour per column, keeping the
// LAST (latest-dateTime) reading within that hour as "the recorded value for that hour".
const buildHourlyRows = (flatRowsAsc, columns) => {
    const tagToColumn = new Map(columns.map((c) => [c.tagId, c.meterId]));
    const bucketMap = new Map(); // hourBucket -> { dateTime, tags: {meterId: value} }

    for (const r of flatRowsAsc) {
        const meterId = tagToColumn.get(r.Tag_Id);
        if (meterId == null) continue;
        let bucket = bucketMap.get(r.hourBucket);
        if (!bucket) {
            bucket = { dateTime: r.hourBucket, tags: {} };
            bucketMap.set(r.hourBucket, bucket);
        }
        bucket.tags[meterId] = noZero(r.value);
    }

    return Array.from(bucketMap.values()).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
};

async function fetchHourlyRows({ categoryId, sensorType, fromDate, toDate }) {
    const columns = await resolveColumns(categoryId, sensorType);
    if (!columns.length) return { columns: [], rows: [] };

    const tagIds = columns.map((c) => c.tagId);
    const [flatRows] = await connection.execute(
        `SELECT DATE_FORMAT(sd.dateTime, '%Y-%m-%d %H:00:00') AS hourBucket, sd.Tag_Id, sd.value
         FROM sensor_data sd
         WHERE sd.isAggregate = 1 AND sd.dateTime BETWEEN ? AND ? AND sd.Tag_Id IN (${tagIds.map(() => '?').join(',')})
         ORDER BY sd.dateTime ASC`,
        [toMysqlDateTime(fromDate), toMysqlDateTime(toDate), ...tagIds]
    );

    const rows = buildHourlyRows(flatRows, columns);
    // Frontend table/chart code expects {tagId, tagName} — meterId/label map onto those field names.
    // minLimit/maxLimit are carried through so the table can color each value red/green against
    // this column's own configured safe range (same convention as IoTGauge's zone coloring).
    const responseColumns = columns.map((c) => ({ tagId: c.meterId, tagName: c.label, minLimit: c.minLimit, maxLimit: c.maxLimit }));
    return { columns: responseColumns, rows };
}

// ── POST /api/environmentalReport/data ─────────────────────────────────────────
// body: { categoryId, sensorType, fromDate, toDate, page?, pageSize? }
exports.getHourlyReport = async (req, res) => {
    try {
        const { categoryId, sensorType, fromDate, toDate } = req.body;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: 'Location is required' });
        }
        if (!sensorType || !ENV_SENSOR_TYPES.includes(sensorType)) {
            return res.status(400).json({ success: false, message: 'sensorType must be one of ' + ENV_SENSOR_TYPES.join(', ') });
        }
        if (!fromDate || !toDate) {
            return res.status(400).json({ success: false, message: 'From Date and To Date are required' });
        }

        const page = Math.max(1, parseInt(req.body.page, 10) || 1);
        const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.body.pageSize, 10) || DEFAULT_PAGE_SIZE));

        const { columns, rows: allRows } = await fetchHourlyRows({ categoryId, sensorType, fromDate, toDate });
        const totalRows = allRows.length;
        const totalPages = totalRows === 0 ? 0 : Math.ceil(totalRows / pageSize);
        const offset = (page - 1) * pageSize;
        const pageRows = allRows.slice(offset, offset + pageSize);

        return res.status(200).json({
            success: true,
            columns,
            rows: pageRows,
            chartSeries: allRows.map((r) => ({ dateTime: r.dateTime, ...r.tags })),
            pagination: { page, pageSize, totalRows, totalPages },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/environmentalReport/export ───────────────────────────────────────
exports.exportHourlyReport = async (req, res) => {
    try {
        const { categoryId, sensorType, fromDate, toDate } = req.body;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: 'Location is required' });
        }
        if (!sensorType || !ENV_SENSOR_TYPES.includes(sensorType)) {
            return res.status(400).json({ success: false, message: 'sensorType must be one of ' + ENV_SENSOR_TYPES.join(', ') });
        }
        if (!fromDate || !toDate) {
            return res.status(400).json({ success: false, message: 'From Date and To Date are required' });
        }

        const { columns, rows } = await fetchHourlyRows({ categoryId, sensorType, fromDate, toDate });
        return res.status(200).json({ success: true, columns, rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
