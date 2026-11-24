const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const { getOfflineThresholdMinutes } = require('./EnergyDashBoardEnergyTrendController');

const TZ = 'Asia/Kolkata';

// ── Shared offline/staleness check — a node is Offline when its live_tag_snapshot
//    row hasn't been updated within the global threshold (meter_offline_settings),
//    NOT when its last-known value happens to be 0. A 0 kW reading from a meter
//    that's still checking in is a real, live reading and must stay "Online".
function computeOfflineStatus(lastUpdated, thresholdMinutes) {
    const lastUpdatedMoment = lastUpdated ? moment.tz(lastUpdated, TZ) : null;
    const isOffline = !lastUpdatedMoment || moment.tz(TZ).diff(lastUpdatedMoment, 'minutes') > thresholdMinutes;
    return {
        isOffline,
        lastUpdated: lastUpdatedMoment ? lastUpdatedMoment.format('DD-MM-YYYY hh:mm A') : null
    };
}

const redisClient = require('../config/redisClient');

// ── In-memory cache fallback (TTL-based) ──────────────────────────────────────
const _cache = new Map();

async function cacheGet(key) {
    if (redisClient.isReady()) {
        try {
            const val = await redisClient.get(key);
            if (val) return JSON.parse(val);
        } catch (e) {
            console.warn('[Cache] Redis get error:', e.message);
        }
    }
    const e = _cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > e.ttl) { _cache.delete(key); return null; }
    return e.data;
}

async function cacheSet(key, data, ttlMs = 10 * 60 * 1000) {
    if (redisClient.isReady()) {
        try {
            const ttlSec = Math.round(ttlMs / 1000);
            await redisClient.set(key, JSON.stringify(data), ttlSec);
            return;
        } catch (e) {
            console.warn('[Cache] Redis set error:', e.message);
        }
    }
    _cache.set(key, { data, ts: Date.now(), ttl: ttlMs });
}

async function cacheDelete(key) {
    if (redisClient.isReady()) {
        try {
            await redisClient.del(key);
            return;
        } catch (e) {
            console.warn('[Cache] Redis delete error:', e.message);
        }
    }
    _cache.delete(key);
}

// ── Auto-create meter_default_settings if it does not exist ───────────────────
;(async () => {
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS meter_default_settings (
                id              INT          NOT NULL AUTO_INCREMENT,
                meterId         INT          NOT NULL,
                graph1_tagId    BIGINT       DEFAULT NULL,
                graph2_tagId    BIGINT       DEFAULT NULL,
                graph3_tagId    BIGINT       DEFAULT NULL,
                graph1_displayName VARCHAR(50) DEFAULT NULL,
                graph2_displayName VARCHAR(50) DEFAULT NULL,
                graph3_displayName VARCHAR(50) DEFAULT NULL,
                createdAt       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
                updatedAt       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_meterId (meterId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } catch (e) {
        console.error('[dashboardController] meter_default_settings migration error:', e.message);
    }
})();

// Fixed categories — appear as children of every plant
const FIXED_CATEGORIES = [
    { id: 'Incomer',  name: 'Incomer',  type: 'category', hasChildren: true },
    { id: 'Outgoing', name: 'Outgoing', type: 'category', hasChildren: true },
    { id: 'Category', name: 'Category', type: 'cat_root', hasChildren: true },
];

// Tree chain: root → plant (special) → category (special) → [meter leaf | distributor] → feeder
const treeConfig = {
    root: {
        table: "plant_master",
        idField: "id",
        nameField: "plantName",
        parentField: null,
        type: "plant",
        childType: "category"   // plants expand to fixed Incomer / Outgoing categories
    },
    // plant     → special: returns FIXED_CATEGORIES
    // category  → special: returns incomers for the plant (id = plantId)
    // incomer   → special: returns meters (Incomer) or distributors (Outgoing)
    incomer: {
        table: "distributors",
        idField: "id",
        nameField: "distributorName",
        parentField: "incomerId",
        type: "distributor",
        childType: "feeder"
    },
    distributor: {
        table: "feeder_master",
        idField: "id",
        nameField: "feederName",
        parentField: "distributerId",
        type: "feeder",
        childType: null
    }
};

exports.getTree = async (req, res) => {
    try {
        const { type = "root", id, selectedCategory } = req.query;

        // ── plant level → return fixed Incomer / Outgoing categories ─────────────
        if (type === 'plant') {
            return res.json({
                success: true,
                data: FIXED_CATEGORIES.map(c => ({ ...c, parentId: id || null }))
            });
        }

        // ── category level ────────────────────────────────────────────────────────
        // id = plantId  |  selectedCategory = 'Incomer' | 'Outgoing'
        // Incomer  → meters with category='Incomer' as LEAF nodes (no sub-hierarchy)
        // Outgoing → distributors directly (skip incomer_master level)
        if (type === 'category') {
            if (!id || !selectedCategory) {
                return res.status(400).json({
                    success: false,
                    message: "id (plantId) and selectedCategory are required for category level"
                });
            }

            if (selectedCategory === 'Incomer') {
                const [rows] = await connection.query(
                    `SELECT id,
                            displayName AS name,
                            'meter'     AS type,
                            ?           AS parentId,
                            false       AS hasChildren
                     FROM meters
                     WHERE plantId = ? AND category = 'Incomer'
                     ORDER BY (meterType = 'Electric Board (Incomer)') DESC, displayName`,
                    [id, id]
                );
                return res.json({ success: true, data: rows });
            } else {
                // Outgoing: return distributors that have meters linked to this plant
                const [rows] = await connection.query(
                    `SELECT DISTINCT d.id,
                            d.distributorName AS name,
                            'distributor'     AS type,
                            ?                 AS parentId,
                            true              AS hasChildren
                     FROM distributors d
                     INNER JOIN meters m ON m.distributerId = d.id
                     WHERE m.plantId = ? AND m.category = 'Outgoing'
                     ORDER BY d.distributorName`,
                    [id, id]
                );
                return res.json({ success: true, data: rows });
            }
        }

        // ── Utility-meter filtering (Temperature/Humidity/CO2 dashboards) ─────────
        // meterKind='Utility Meter' + sensorTypes (comma list) restricts the
        // cat_root/cat_building/cat_floor/cat_item branches below to categories
        // whose kind is 'Utility Meter' AND that have a utility meter of one of
        // the requested types grouped somewhere under them (directly on the
        // category, or on one of its subcategories) — empty branches are pruned
        // so the tree only shows nodes with real data for that sensor type.
        // Omitted entirely (as the Energy Dashboard always omits it), behavior is
        // unchanged from before this filtering was added.
        const isUtility   = req.query.meterKind === 'Utility Meter';
        const sensorTypes = isUtility && req.query.sensorTypes
            ? String(req.query.sensorTypes).split(',').map(s => s.trim()).filter(Boolean)
            : [];
        const { sql: typeSql, params: typeParams } = sensorTypeMatch('um.meterType', sensorTypes);

        // ── cat_root (id = plantId) → buildings that have categories for this plant ─
        if (type === 'cat_root') {
            if (isUtility && sensorTypes.length === 0) return res.json({ success: true, data: [] });
            const kindFilter   = isUtility ? `AND c.categoryKind = 'Utility Meter'` : '';
            const existsFilter = isUtility ? `AND EXISTS (
                    SELECT 1 FROM utility_meter_groups ug
                    INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
                    WHERE (ug.categoryId = c.id
                           OR ug.subCategoryId IN (SELECT sc.id FROM subcategory sc WHERE sc.categoryId = c.id))
                      AND ${typeSql}
                )` : '';
            const [rows] = await connection.query(
                `SELECT DISTINCT b.id, b.buildingName AS name,
                        'cat_building' AS type, ? AS parentId,
                        true AS hasChildren, ? AS plantId
                 FROM category c
                 INNER JOIN buildings b ON b.id = c.buildingId
                 WHERE c.plantId = ? ${kindFilter} ${existsFilter}
                 ORDER BY b.buildingName`,
                [id, id, id, ...typeParams]
            );
            return res.json({ success: true, data: rows });
        }

        // ── cat_building (id = buildingId, plantId param) → floors ────────────────
        if (type === 'cat_building') {
            const { plantId } = req.query;
            if (isUtility && sensorTypes.length === 0) return res.json({ success: true, data: [] });
            const kindFilter   = isUtility ? `AND c.categoryKind = 'Utility Meter'` : '';
            const existsFilter = isUtility ? `AND EXISTS (
                    SELECT 1 FROM utility_meter_groups ug
                    INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
                    WHERE (ug.categoryId = c.id
                           OR ug.subCategoryId IN (SELECT sc.id FROM subcategory sc WHERE sc.categoryId = c.id))
                      AND ${typeSql}
                )` : '';
            const [rows] = await connection.query(
                `SELECT DISTINCT f.id, f.floorName AS name,
                        'cat_floor' AS type, ? AS parentId,
                        true AS hasChildren, ? AS plantId
                 FROM category c
                 INNER JOIN floors f ON f.id = c.floorId
                 WHERE c.buildingId = ? AND c.plantId = ? ${kindFilter} ${existsFilter}
                 ORDER BY f.floorName`,
                [id, plantId, id, plantId, ...typeParams]
            );
            return res.json({ success: true, data: rows });
        }

        // ── cat_floor (id = floorId, plantId param) → category items ──────────────
        // hasChildren = true when subcategories exist for that category
        if (type === 'cat_floor') {
            const { plantId } = req.query;
            if (isUtility && sensorTypes.length === 0) return res.json({ success: true, data: [] });
            const kindFilter   = isUtility ? `AND c.categoryKind = 'Utility Meter'` : '';
            const existsFilter = isUtility ? `AND EXISTS (
                    SELECT 1 FROM utility_meter_groups ug
                    INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
                    WHERE (ug.categoryId = c.id
                           OR ug.subCategoryId IN (SELECT sc.id FROM subcategory sc WHERE sc.categoryId = c.id))
                      AND ${typeSql}
                )` : '';
            const [rows] = await connection.query(
                `SELECT c.id, c.categoryName AS name,
                        'cat_item' AS type, ? AS parentId,
                        (EXISTS(SELECT 1 FROM subcategory sc WHERE sc.categoryId = c.id)) AS hasChildren,
                        ? AS plantId
                 FROM category c
                 WHERE c.floorId = ? AND c.plantId = ? ${kindFilter} ${existsFilter}
                 ORDER BY COALESCE(c.sortOrder, 999999), c.categoryName`,
                [id, plantId, id, plantId, ...typeParams]
            );
            return res.json({ success: true, data: rows });
        }

        // ── cat_item (id = categoryId) → subcategory leaf nodes ───────────────────
        if (type === 'cat_item') {
            if (isUtility && sensorTypes.length === 0) return res.json({ success: true, data: [] });
            const existsFilter = isUtility ? `AND EXISTS (
                    SELECT 1 FROM utility_meter_groups ug
                    INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
                    WHERE ug.subCategoryId = sc.id
                      AND ${typeSql}
                )` : '';
            const [rows] = await connection.query(
                `SELECT sc.id, sc.subCategoryName AS name,
                        'cat_sub' AS type, ? AS parentId,
                        false AS hasChildren
                 FROM subcategory sc WHERE sc.categoryId = ? ${existsFilter}
                 ORDER BY sc.subCategoryName`,
                [id, id, ...typeParams]
            );
            return res.json({ success: true, data: rows });
        }

        // ── standard treeConfig levels (root, distributor) ───────────────────────
        const config = treeConfig[type];
        if (!config) {
            return res.status(400).json({ success: false, message: "Invalid tree type" });
        }

        let query = `
            SELECT
                ${config.idField}                              AS id,
                ${config.nameField}                            AS name,
                '${config.type}'                               AS type,
                ${config.parentField || "NULL"}                AS parentId,
                ${config.childType ? "true" : "false"}         AS hasChildren
            FROM ${config.table}
        `;
        let values = [];

        if (config.parentField && id) {
            query += ` WHERE ${config.parentField} = ?`;
            values.push(id);
        }

        query += ` ORDER BY ${config.nameField}`;

        const [rows] = await connection.query(query, values);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ── getUtilityGroupedMeters — meters grouped at a cat_item/cat_sub tree node ───
// Used by the Temperature/Humidity/CO2 sensor dashboards: given the category
// (cat_item) or subcategory (cat_sub) node the user selected in the tree, and
// the sensor type(s) that dashboard cares about, returns the matching utility
// meters (id, deviceId, slaveId, ...) so the frontend can pull live value +
// trend for each one via the existing GetUtilitySensorStats/GetDeviceParams/
// GetIoTSensorGraph endpoints (same ones the Utility Dashboard already uses).
// A meter type renamed/created in the Meter Type master (e.g. "Air pressure") must still count
// as its sensor dashboard's type ("Pressure"), so sensor types match by keyword (same keyword
// map as pickTag / ENV_TAG_KEYWORDS) instead of exact string equality. Unknown types stay exact.
const SENSOR_TYPE_KEYWORDS = {
    Temperature: ['temp'],
    Humidity:    ['humid'],
    CO2:         ['co2', 'carbon'],
    Pressure:    ['pressure', 'press'],
};
function sensorTypeMatch(column, sensorTypes) {
    const clauses = [];
    const params = [];
    for (const t of sensorTypes) {
        const keywords = SENSOR_TYPE_KEYWORDS[t];
        if (keywords) {
            keywords.forEach((k) => { clauses.push(`LOWER(${column}) LIKE ?`); params.push(`%${k}%`); });
        } else {
            clauses.push(`LOWER(${column}) = ?`);
            params.push(String(t).toLowerCase());
        }
    }
    // Empty list can't reach here (callers return early), but keep the SQL valid regardless.
    return { sql: `(${clauses.join(' OR ') || '1 = 0'})`, params };
}

// GET /dashboard/utilityGroupedMeters?type=cat_item|cat_sub&id=&sensorTypes=Temperature,Humidity,CO2
exports.getUtilityGroupedMeters = async (req, res) => {
    try {
        const { type, id, sensorTypes: sensorTypesParam } = req.query;

        if (!type || !id) {
            return res.status(400).json({ success: false, message: "type and id are required" });
        }
        if (!['cat_item', 'cat_sub', 'cat_floor'].includes(type)) {
            return res.status(400).json({ success: false, message: "type must be cat_item, cat_sub or cat_floor" });
        }

        const sensorTypes = String(sensorTypesParam || '')
            .split(',').map(s => s.trim()).filter(Boolean);
        if (sensorTypes.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { sql: typeSql, params: typeParams } = sensorTypeMatch('um.meterType', sensorTypes);
        let scopeFilter, scopeParams;
        if (type === 'cat_item') {
            // A single category (+ everything grouped on its subcategories).
            scopeFilter = `(ug.categoryId = ? OR ug.subCategoryId IN (SELECT sc.id FROM subcategory sc WHERE sc.categoryId = ?))`;
            scopeParams = [id, id];
        } else if (type === 'cat_sub') {
            scopeFilter = `ug.subCategoryId = ?`;
            scopeParams = [id];
        } else {
            // cat_floor (id = floorId) — every category on this floor, and everything
            // grouped on any of those categories' subcategories. Used for the
            // floor-level "all lines on one page" overview (see getUtilityGroupedMeters
            // caller in SensorNodeDetail.js) — no single trend to aggregate across
            // unrelated lines, so the frontend skips the AggregatedTrendCard for this
            // type and just shows one GaugeCard per meter, tagged with its categoryName.
            scopeFilter = `(ug.categoryId IN (SELECT id FROM category WHERE floorId = ?)
                            OR ug.subCategoryId IN (SELECT sc.id FROM subcategory sc INNER JOIN category c ON c.id = sc.categoryId WHERE c.floorId = ?))`;
            scopeParams = [id, id];
        }

        const [rows] = await connection.query(
            `SELECT DISTINCT
                    um.id, um.meterName, um.meterType, um.deviceId, um.slaveId,
                    um.uamSet, um.threshold, um.minLimit, um.maxLimit,
                    COALESCE(cDirect.categoryName, cViaSub.categoryName) AS categoryName,
                    COALESCE(cDirect.sortOrder, cViaSub.sortOrder) AS categorySortOrder
             FROM utility_meter_groups ug
             INNER JOIN utility_meters um ON um.id = ug.utilityMeterId
             LEFT JOIN category cDirect ON cDirect.id = ug.categoryId
             LEFT JOIN subcategory scJoin ON scJoin.id = ug.subCategoryId
             LEFT JOIN category cViaSub ON cViaSub.id = scJoin.categoryId
             WHERE ${scopeFilter} AND ${typeSql} AND COALESCE(um.displayMeter, 1) = 1
             ORDER BY COALESCE(categorySortOrder, 999999), categoryName, um.meterType, um.meterName`,
            [...scopeParams, ...typeParams]
        );
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ── Dynamic-table helpers ─────────────────────────────────────────────────────

const getEnergyTableName = (dateString) => {
    const yearMonth = String(dateString).substring(0, 7).replace('-', '_');
    return `energy_data_${yearMonth}`;
};

// Queries one SQL fragment across every monthly table that covers [fromDate, toDate].
// sqlFn(tableName) must return { sql, params } ready for connection.query.
// Returns the merged rows array.
async function queryEnergyTables(fromDate, toDate, sqlFn) {
    const monthTables = new Set();
    const start = moment(fromDate);
    const end   = moment(toDate);
    for (let d = start.clone(); d.isSameOrBefore(end, 'day'); d.add(1, 'month')) {
        monthTables.add(getEnergyTableName(d.format('YYYY-MM-DD')));
    }
    // also include the end-date month
    monthTables.add(getEnergyTableName(toDate));

    let allRows = [];
    for (const tableName of monthTables) {
        try {
            const { sql, params } = sqlFn(tableName);
            const [rows] = await connection.query(sql, params);
            allRows = allRows.concat(rows);
        } catch (err) {
            if (err.code !== 'ER_NO_SUCH_TABLE') {
                console.error(`Error reading table ${tableName}:`, err.message);
            }
        }
    }
    return allRows;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns meter ids for energy aggregation.
// For type='incomer': id = incomerId, selectedCategory determines scope.
async function getMetersForNode(type, id, selectedCategory) {
    if (!id) return [];
    let query;
    switch (type) {
        // case 'plant':
        //     query = 'SELECT id FROM meters WHERE plantId = ?';
        case 'plant': {
    const [plantRows] = await connection.query(
        'SELECT id FROM meters WHERE plantId = ? AND category = ?',
        [id, 'Incomer']
    );
    return plantRows.map(r => r.id);
}
            break;
       
       
       
       
            case 'category': {
            // id = plantId; filter by category column on meters
            const [catRows] = await connection.query(
                'SELECT id FROM meters WHERE plantId = ? AND category = ?',
                [id, selectedCategory]
            );
            return catRows.map(r => r.id);
        }
        case 'incomer':
            // All meters under this incomer regardless of category path
            query = 'SELECT id FROM meters WHERE incomerId = ?';
            break;
        case 'distributor':
            query = 'SELECT id FROM meters WHERE distributerId = ?';
            break;
        case 'feeder':
            query = 'SELECT id FROM meters WHERE feederId = ?';
            break;
        case 'meter':
            return [parseInt(id)];
        case 'cat_root': {
            const [rows] = await connection.query(
                `SELECT DISTINCT mg.meterId AS id FROM meter_groups mg
                 INNER JOIN category c ON c.id = mg.categoryId
                 WHERE c.plantId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`,
                [id]
            );
            return rows.map(r => r.id);
        }
        case 'cat_building': {
            const [rows] = await connection.query(
                `SELECT DISTINCT mg.meterId AS id FROM meter_groups mg
                 INNER JOIN category c ON c.id = mg.categoryId
                 WHERE c.buildingId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`,
                [id]
            );
            return rows.map(r => r.id);
        }
        case 'cat_floor': {
            const [rows] = await connection.query(
                `SELECT DISTINCT mg.meterId AS id FROM meter_groups mg
                 INNER JOIN category c ON c.id = mg.categoryId
                 WHERE c.floorId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`,
                [id]
            );
            return rows.map(r => r.id);
        }
        case 'cat_item': {
            // Include meters linked directly to the category AND via its subcategories
            const [rows] = await connection.query(
                `SELECT DISTINCT meterId AS id FROM meter_groups
                 WHERE (categoryId = ?
                    OR subCategoryId IN (SELECT id FROM subcategory WHERE categoryId = ?))
                 AND meterId IS NOT NULL AND meterId > 0`,
                [id, id]
            );
            return rows.map(r => r.id);
        }
        case 'cat_sub': {
            const [rows] = await connection.query(
                `SELECT DISTINCT meterId AS id FROM meter_groups
                 WHERE subCategoryId = ? AND meterId IS NOT NULL AND meterId > 0`,
                [id]
            );
            return rows.map(r => r.id);
        }
        default:
            return [];
    }
    const [rows] = await connection.query(query, [id]);
    return rows.map(r => r.id);
}

async function getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth) {
    if (!meterIds.length) return { kW: 0, pf: 0, voltage: 0, kWhDay: 0, kWhMonth: 0, runtime: 0, lastUpdated: null };

    // Live kW/pF/voltage — from live_tag_snapshot via meters.deviceId+slaveId
    const [liveRows] = await connection.query(
        `SELECT
             SUM(CASE WHEN lts.tag_name = 'kW' THEN lts.value ELSE 0 END) AS kW,
             AVG(CASE WHEN lts.tag_name = 'pF' THEN lts.value END)        AS pf,
             AVG(CASE WHEN lts.tag_name = 'vLl' THEN lts.value END)       AS voltage,
             MAX(lts.updated_at)                                          AS lastUpdated
         FROM meters m
         INNER JOIN live_tag_snapshot lts
             ON lts.deviceId = m.deviceId AND lts.slaveId = m.slaveId AND lts.tag_name IN ('kW','pF','vLl')
         WHERE m.id IN (?)`,
        [meterIds]
    );

    // kWhDay — dynamic monthly table for today
    const dayTable  = getEnergyTableName(currentDate);
    let kWhDay = 0;
    try {
        const [dayRows] = await connection.query(
            `SELECT SUM(kWh) as total FROM ${dayTable} WHERE meterId IN (?) AND date = ?`,
            [meterIds, currentDate]
        );
        kWhDay = parseFloat(dayRows[0]?.total || 0);
    } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
    }

    // runtime — hours today where at least one meter in this group recorded
    // consumption (same "hourly bucket with kWh > 0" definition buildMeterCards/
    // getChildrenForNode's per-meter branches already use, generalized across a
    // group of meters via COUNT(DISTINCT HR) instead of COUNT(*)).
    let runtime = 0;
    try {
        const [hrRows] = await connection.query(
            `SELECT COUNT(DISTINCT HR) as cnt FROM ${dayTable} WHERE meterId IN (?) AND date = ? AND kWh > 0`,
            [meterIds, currentDate]
        );
        runtime = parseInt(hrRows[0]?.cnt || 0);
    } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
    }

    // kWhMonth — same monthly table (start and end are within the same month)
    const monthTable = getEnergyTableName(startOfMonth);
    let kWhMonth = 0;
    try {
        const [monthRows] = await connection.query(
            `SELECT SUM(kWh) as total FROM ${monthTable} WHERE meterId IN (?) AND date BETWEEN ? AND ?`,
            [meterIds, startOfMonth, endOfMonth]
        );
        kWhMonth = parseFloat(monthRows[0]?.total || 0);
    } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
    }

    return {
        kW:       parseFloat(liveRows[0]?.kW      || 0),
        pf:       parseFloat(liveRows[0]?.pf      || 0),
        voltage:  parseFloat(liveRows[0]?.voltage  || 0),
        kWhDay,
        kWhMonth,
        runtime,
        lastUpdated: liveRows[0]?.lastUpdated || null
    };
}

// Builds meter cards for a list of meterIds (shared by cat_item, cat_sub, feeder)
async function buildMeterCards(meterIds, currentDate, thresholdMinutes) {
    if (!meterIds.length) return [];
    const [mRows] = await connection.query(
        `SELECT m.id, m.displayName AS name,
             (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'kW'  LIMIT 1) AS kW,
             (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'pF'  LIMIT 1) AS pF,
             (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'vLl' LIMIT 1) AS voltage,
             (SELECT updated_at FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'kW' LIMIT 1) AS lastUpdated
         FROM meters m WHERE m.id IN (?)`,
        [meterIds]
    );
    const meterTable = getEnergyTableName(moment.tz(TZ).format('YYYY-MM-DD'));
    return await Promise.all(mRows.map(async m => {
        let kWhDay = 0;
        try {
            const [dRow] = await connection.query(
                `SELECT SUM(kWh) AS total FROM ${meterTable} WHERE meterId = ? AND date = ?`,
                [m.id, moment.tz(TZ).format('YYYY-MM-DD')]
            );
            kWhDay = parseFloat(dRow[0]?.total || 0);
        } catch (e) {
            if (e.code !== 'ER_NO_SUCH_TABLE') console.error(e.message);
        }
        const kW = parseFloat(m.kW || 0);
        const { isOffline, lastUpdated } = computeOfflineStatus(m.lastUpdated, thresholdMinutes);
        return {
            id: m.id, name: m.name, type: 'meter',
            kW: parseFloat(kW.toFixed(1)), pf: parseFloat(parseFloat(m.pF || 0).toFixed(2)),
            voltage: parseFloat(parseFloat(m.voltage || 0).toFixed(1)),
            status: isOffline ? 'Stopped' : 'Running',
            lastUpdated,
            kWhDay: parseFloat(kWhDay.toFixed(2)), trend: []
        };
    }));
}

// Returns child nodes with live energy for getLiveData.
async function getChildrenForNode(type, id, selectedCategory, plantId, currentDate, startOfMonth, endOfMonth, thresholdMinutes) {
    if (!id) return [];

    // ── plant level → fixed categories ───────────────────────────────────────
    if (type === 'plant') {
        return FIXED_CATEGORIES.map(c => ({ ...c, parentId: id }));
    }

    // ── category level ────────────────────────────────────────────────────────
    // Incomer  → meter leaf cards (kW/pF/voltage from hmidatadisplay)
    // Outgoing → distributor cards with aggregated energy
    if (type === 'category') {
        if (selectedCategory === 'Incomer') {
            const [mRows] = await connection.query(
                `SELECT m.id, m.displayName AS name,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'kW'  LIMIT 1) AS kW,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'pF'  LIMIT 1) AS pF,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'vLl' LIMIT 1) AS voltage,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'vRy' LIMIT 1) AS vRy,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'vYb' LIMIT 1) AS vYb,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'vRb' LIMIT 1) AS vRb,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'iRp' LIMIT 1) AS iRp,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'iYp' LIMIT 1) AS iYp,
                    (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'iBp' LIMIT 1) AS iBp,
                    (SELECT updated_at FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'kW' LIMIT 1) AS lastUpdated
                 FROM meters m
                 WHERE m.plantId = ? AND m.category = 'Incomer'
                 ORDER BY (m.meterType = 'Electric Board (Incomer)') DESC, m.displayName`,
                [id]
            );
            const meterTable = getEnergyTableName(currentDate);
            return await Promise.all(mRows.map(async m => {
                let kWhDay = 0, runtime = 0;
                try {
                    const [dRow] = await connection.query(
                        `SELECT SUM(kWh) AS total FROM ${meterTable} WHERE meterId = ? AND date = ?`,
                        [m.id, currentDate]
                    );
                    const [hrRow] = await connection.query(
                        `SELECT COUNT(*) AS cnt FROM ${meterTable} WHERE meterId = ? AND date = ? AND kWh > 0`,
                        [m.id, currentDate]
                    );
                    kWhDay  = parseFloat(dRow[0]?.total || 0);
                    runtime = parseInt(hrRow[0]?.cnt    || 0);
                } catch (err) {
                    if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
                }
                const kW = parseFloat(m.kW || 0);
                const { isOffline, lastUpdated } = computeOfflineStatus(m.lastUpdated, thresholdMinutes);
                // Data actively arriving (not offline) but reading 0 kW = the meter/generator
                // is genuinely switched off right now, not that it stopped communicating —
                // so it gets its own "Off" badge instead of green "Running", without
                // triggering the offline/grayed-out card treatment reserved for stale data.
                const status = isOffline ? 'Stopped' : (kW === 0 ? 'Off' : 'Running');
                return {
                    id: m.id, name: m.name, type: 'meter',
                    kW:      parseFloat(kW.toFixed(1)),
                    pf:      parseFloat(parseFloat(m.pF || 0).toFixed(2)),
                    voltage: parseFloat(parseFloat(m.voltage || 0).toFixed(1)),
                    vRy:     parseFloat(parseFloat(m.vRy || 0).toFixed(1)),
                    vYb:     parseFloat(parseFloat(m.vYb || 0).toFixed(1)),
                    vRb:     parseFloat(parseFloat(m.vRb || 0).toFixed(1)),
                    iRp:     parseFloat(parseFloat(m.iRp || 0).toFixed(1)),
                    iYp:     parseFloat(parseFloat(m.iYp || 0).toFixed(1)),
                    iBp:     parseFloat(parseFloat(m.iBp || 0).toFixed(1)),
                    status,
                    lastUpdated,
                    runtime,
                    kWhDay:  parseFloat(kWhDay.toFixed(2)),
                    trend:   []
                };
            }));
        } else {
            // Outgoing: distributors that have meters under this plant
            const [childRows] = await connection.query(
                `SELECT DISTINCT d.id, d.distributorName AS name
                 FROM distributors d
                 INNER JOIN meters m ON m.distributerId = d.id
                 WHERE m.plantId = ? AND m.category = 'Outgoing'
                 ORDER BY d.distributorName`,
                [id]
            );
            return await Promise.all(childRows.map(async child => {
                const [mRows] = await connection.query(
                    'SELECT id FROM meters WHERE distributerId = ?', [child.id]
                );
                const meterIds = mRows.map(m => m.id);
                const energy = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
                let trend = [];
                if (meterIds.length > 0) {
                    try {
                        const sparkTable = getEnergyTableName(currentDate);
                        const [sparkRows] = await connection.query(
                            `SELECT SUM(kWh) AS energy FROM ${sparkTable} WHERE meterId IN (?) AND date = ? GROUP BY HR ORDER BY HR DESC LIMIT 6`,
                            [meterIds, currentDate]
                        );
                        trend = sparkRows.map(r => parseFloat(r.energy || 0)).reverse();
                    } catch (err) {
                        if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
                    }
                }
                const { isOffline: distOffline, lastUpdated: distLastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);
                return {
                    id: child.id, name: child.name, type: 'distributor',
                    selectedCategory,
                    kW:      parseFloat(energy.kW.toFixed(1)),
                    pf:      parseFloat(energy.pf.toFixed(2)),
                    voltage: parseFloat(energy.voltage.toFixed(1)),
                    status:  distOffline ? 'Offline' : 'Online',
                    lastUpdated: distLastUpdated,
                    kWhDay:  parseFloat(energy.kWhDay.toFixed(2)),
                    runtime: energy.runtime,
                    trend
                };
            }));
        }
    }

    // ── cat_root (plantId = id) → building cards ─────────────────────────────
    if (type === 'cat_root') {
        const [bRows] = await connection.query(
            `SELECT DISTINCT b.id, b.buildingName AS name
             FROM buildings b INNER JOIN category c ON c.buildingId = b.id
             WHERE c.plantId = ? ORDER BY b.buildingName`,
            [id]
        );
        return await Promise.all(bRows.map(async b => {
            const [mRows] = await connection.query(
                `SELECT DISTINCT mg.meterId FROM meter_groups mg
                 INNER JOIN category c ON c.id = mg.categoryId
                 WHERE c.buildingId = ? AND c.plantId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`,
                [b.id, id]
            );
            const meterIds = mRows.map(r => r.meterId);
            const energy = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
            const { isOffline, lastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);
            return {
                id: b.id, name: b.name, type: 'cat_building', plantId: id,
                kW: parseFloat(energy.kW.toFixed(1)), pf: parseFloat(energy.pf.toFixed(2)),
                status: isOffline ? 'Offline' : 'Online',
                lastUpdated,
                kWhDay: parseFloat(energy.kWhDay.toFixed(2)), runtime: energy.runtime, trend: []
            };
        }));
    }

    // ── cat_building (buildingId = id) → floor cards ──────────────────────────
    if (type === 'cat_building') {
        const [fRows] = await connection.query(
            `SELECT DISTINCT f.id, f.floorName AS name
             FROM floors f INNER JOIN category c ON c.floorId = f.id
             WHERE c.buildingId = ? ORDER BY f.floorName`,
            [id]
        );
        return await Promise.all(fRows.map(async f => {
            const [mRows] = await connection.query(
                `SELECT DISTINCT mg.meterId FROM meter_groups mg
                 INNER JOIN category c ON c.id = mg.categoryId
                 WHERE c.floorId = ? AND c.buildingId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`,
                [f.id, id]
            );
            const meterIds = mRows.map(r => r.meterId);
            const energy = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
            const { isOffline, lastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);
            return {
                id: f.id, name: f.name, type: 'cat_floor', plantId, buildingId: id,
                kW: parseFloat(energy.kW.toFixed(1)), pf: parseFloat(energy.pf.toFixed(2)),
                status: isOffline ? 'Offline' : 'Online',
                lastUpdated,
                kWhDay: parseFloat(energy.kWhDay.toFixed(2)), runtime: energy.runtime, trend: []
            };
        }));
    }

    // ── cat_floor (floorId = id) → category item cards ────────────────────────
    if (type === 'cat_floor') {
        const [cRows] = await connection.query(
            `SELECT id, categoryName AS name FROM category WHERE floorId = ? ORDER BY COALESCE(sortOrder, 999999), categoryName`,
            [id]
        );
        return await Promise.all(cRows.map(async cat => {
            const [mRows] = await connection.query(
                `SELECT DISTINCT meterId FROM meter_groups WHERE categoryId = ? AND meterId IS NOT NULL AND meterId > 0`,
                [cat.id]
            );
            const meterIds = mRows.map(r => r.meterId);
            const energy = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
            const { isOffline, lastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);
            return {
                id: cat.id, name: cat.name, type: 'cat_item',
                kW: parseFloat(energy.kW.toFixed(1)), pf: parseFloat(energy.pf.toFixed(2)),
                status: isOffline ? 'Offline' : 'Online',
                lastUpdated,
                kWhDay: parseFloat(energy.kWhDay.toFixed(2)), runtime: energy.runtime, trend: []
            };
        }));
    }

    // ── cat_item (categoryId = id) → sub cards if exist, else meter cards ────────
    if (type === 'cat_item') {
        const [subRows] = await connection.query(
            `SELECT id, subCategoryName AS name FROM subcategory WHERE categoryId = ? ORDER BY subCategoryName`,
            [id]
        );
        if (subRows.length > 0) {
            // Return subcategory cards with aggregated energy
            return await Promise.all(subRows.map(async sub => {
                const [mRows] = await connection.query(
                    `SELECT DISTINCT meterId FROM meter_groups WHERE subCategoryId = ? AND meterId IS NOT NULL AND meterId > 0`,
                    [sub.id]
                );
                const meterIds = mRows.map(r => r.meterId);
                const energy = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
                const { isOffline, lastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);
                return {
                    id: sub.id, name: sub.name, type: 'cat_sub',
                    kW: parseFloat(energy.kW.toFixed(1)), pf: parseFloat(energy.pf.toFixed(2)),
                    status: isOffline ? 'Offline' : 'Online',
                    lastUpdated,
                    kWhDay: parseFloat(energy.kWhDay.toFixed(2)), runtime: energy.runtime, trend: []
                };
            }));
        }
        // No subcategories — fall through to meter cards
        const [mgRows] = await connection.query(
            `SELECT DISTINCT meterId FROM meter_groups WHERE categoryId = ? AND meterId IS NOT NULL AND meterId > 0`,
            [id]
        );
        const meterIds = mgRows.map(r => r.meterId);
        if (!meterIds.length) return [];
        return await buildMeterCards(meterIds, currentDate, thresholdMinutes);
    }

    // ── cat_sub (subCategoryId = id) → meter cards ────────────────────────────
    if (type === 'cat_sub') {
        const [mgRows] = await connection.query(
            `SELECT DISTINCT meterId FROM meter_groups WHERE subCategoryId = ? AND meterId IS NOT NULL AND meterId > 0`,
            [id]
        );
        const meterIds = mgRows.map(r => r.meterId);
        if (!meterIds.length) return [];
        return await buildMeterCards(meterIds, currentDate, thresholdMinutes);
    }

    // ── feeder → individual meters ───────────────────────────────────────────
    if (type === 'feeder') {
        const [mRows] = await connection.query(
            `SELECT m.id, m.displayName as name,
                (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'kW'  LIMIT 1) as kW,
                (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'pF'  LIMIT 1) as pF,
                (SELECT value FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'vLl' LIMIT 1) as voltage,
                (SELECT updated_at FROM live_tag_snapshot WHERE deviceId = m.deviceId AND slaveId = m.slaveId AND tag_name = 'kW' LIMIT 1) as lastUpdated
             FROM meters m WHERE m.feederId = ?`,
            [id]
        );
        const meterTable = getEnergyTableName(currentDate);
        return await Promise.all(mRows.map(async m => {
            let kWhDay = 0, runtime = 0;
            try {
                const [dRow] = await connection.query(
                    `SELECT SUM(kWh) as total FROM ${meterTable} WHERE meterId = ? AND date = ?`,
                    [m.id, currentDate]
                );
                const [hrRow] = await connection.query(
                    `SELECT COUNT(*) as cnt FROM ${meterTable} WHERE meterId = ? AND date = ? AND kWh > 0`,
                    [m.id, currentDate]
                );
                kWhDay  = parseFloat(dRow[0]?.total || 0);
                runtime = parseInt(hrRow[0]?.cnt    || 0);
            } catch (err) {
                if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
            }
            const kW = parseFloat(m.kW || 0);
            const { isOffline, lastUpdated } = computeOfflineStatus(m.lastUpdated, thresholdMinutes);
            return {
                id: m.id, name: m.name, type: 'meter',
                kW:      parseFloat(kW.toFixed(1)),
                pf:      parseFloat(parseFloat(m.pF || 0).toFixed(2)),
                voltage: parseFloat(parseFloat(m.voltage || 0).toFixed(1)),
                status:  isOffline ? 'Stopped' : 'Running',
                lastUpdated,
                runtime,
                kWhDay:  parseFloat(kWhDay.toFixed(2)),
                trend:   []
            };
        }));
    }

    // ── distributor → feeders with energy data ────────────────────────────────
    const levelMap = {
        distributor: {
            table: 'feeder_master', idField: 'id', nameField: 'feederName',
            parentField: 'distributerId', meterField: 'feederId', childType: 'feeder'
        }
    };
    const cfg = levelMap[type];
    if (!cfg) return [];

    const [childRows] = await connection.query(
        `SELECT ${cfg.idField} as id, ${cfg.nameField} as name FROM ${cfg.table} WHERE ${cfg.parentField} = ?`,
        [id]
    );

    return await Promise.all(childRows.map(async child => {
        const [mRows] = await connection.query(
            `SELECT id FROM meters WHERE ${cfg.meterField} = ?`, [child.id]
        );
        const meterIds = mRows.map(m => m.id);
        const energy = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
        let trend = [];
        if (meterIds.length > 0) {
            const [sparkRows] = await connection.query(
                `SELECT SUM(kWh) as energy FROM energy_data_view WHERE meterId IN (?) AND date = ? GROUP BY HR ORDER BY id DESC LIMIT 6`,
                [meterIds, currentDate]
            );
            trend = sparkRows.map(r => parseFloat(r.energy || 0)).reverse();
        }
        const { isOffline, lastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);
        return {
            id:      child.id,
            name:    child.name,
            type:    cfg.childType,
            kW:      parseFloat(energy.kW.toFixed(1)),
            pf:      parseFloat(energy.pf.toFixed(2)),
            voltage: parseFloat(energy.voltage.toFixed(1)),
            status:  isOffline ? 'Offline' : 'Online',
            lastUpdated,
            kWhDay:  parseFloat(energy.kWhDay.toFixed(2)),
            runtime: energy.runtime,
            trend
        };
    }));
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

exports.getLiveData = async (req, res) => {
    try {
        const { type, id, selectedCategory, plantId } = req.query;
        if (!type || !id) {
            return res.status(400).json({ success: false, message: 'type and id are required' });
        }

        const now          = moment.tz(TZ);
        const currentDate  = now.format('YYYY-MM-DD');
        const startOfMonth = now.clone().startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = now.clone().endOf('month').format('YYYY-MM-DD');
        const past30       = now.clone().subtract(29, 'days').format('YYYY-MM-DD');
        const thresholdMinutes = await getOfflineThresholdMinutes();

        const meterIds = await getMetersForNode(type, id, selectedCategory);
        const energy   = await getEnergyAggregate(meterIds, currentDate, startOfMonth, endOfMonth);
        const { isOffline, lastUpdated } = computeOfflineStatus(energy.lastUpdated, thresholdMinutes);

        // Last 24 hours chart — spans yesterday + today across monthly tables
        let hourlyData = [];
        if (meterIds.length > 0) {
            try {
                const yesterday      = now.clone().subtract(1, 'day').format('YYYY-MM-DD');
                const currentHourNum = now.hour(); // 0-23

                // Parse HR string ('10AM','3PM') → 0-23
                const hrToNum = (hr) => {
                    const m = String(hr).match(/^(\d+)(AM|PM)$/i);
                    if (!m) return -1;
                    let h = parseInt(m[1]);
                    const pm = m[2].toUpperCase() === 'PM';
                    if (h === 12) return pm ? 12 : 0;
                    return pm ? h + 12 : h;
                };

                let allRows = [];
                for (const [d, isPrev] of [[yesterday, true], [currentDate, false]]) {
                    try {
                        const t = getEnergyTableName(d);
                        const [rows] = await connection.query(
                            `SELECT HR as label, SUM(kWh) as energy FROM ${t} WHERE meterId IN (?) AND date = ? GROUP BY HR`,
                            [meterIds, d]
                        );
                        rows.forEach(r => { r._isPrev = isPrev; });
                        allRows = allRows.concat(rows);
                    } catch (e) {
                        if (e.code !== 'ER_NO_SUCH_TABLE') console.error(e.message);
                    }
                }

                // Keep only the 24-hour window
                const filtered = allRows.filter(r => {
                    const h = hrToNum(r.label);
                    if (h < 0) return false;
                    return r._isPrev ? h > currentHourNum : h <= currentHourNum;
                });

                // Sort chronologically: yesterday tail first, then today head
                filtered.sort((a, b) => {
                    if (a._isPrev !== b._isPrev) return a._isPrev ? -1 : 1;
                    return hrToNum(a.label) - hrToNum(b.label);
                });

                const totalH = filtered.reduce((s, r) => s + parseFloat(r.energy || 0), 0);
                const avgH   = filtered.length ? Math.round(totalH / filtered.length) : 0;
                hourlyData   = filtered.map(r => ({
                    label:  r.label,
                    energy: Math.round(parseFloat(r.energy || 0)),
                    avg:    avgH
                }));
            } catch (err) {
                if (err.code !== 'ER_NO_SUCH_TABLE') console.error(err.message);
            }
        }

        // Daily chart (last 30 days) — query across monthly tables dynamically
        let dailyData = [];
        if (meterIds.length > 0) {
            const rawRows = await queryEnergyTables(past30, currentDate, (tableName) => ({
                sql:    `SELECT date as rawDate, SUM(kWh) as energy FROM ${tableName} WHERE meterId IN (?) AND date BETWEEN ? AND ? GROUP BY date`,
                params: [meterIds, past30, currentDate]
            }));

            // Merge rows that came from overlapping table queries
            const mergedMap = {};
            for (const row of rawRows) {
                const key = String(row.rawDate).substring(0, 10);
                mergedMap[key] = (mergedMap[key] || 0) + parseFloat(row.energy || 0);
            }

            const sortedEntries = Object.entries(mergedMap).sort(([a], [b]) => a.localeCompare(b));
            const totalD = sortedEntries.reduce((s, [, v]) => s + v, 0);
            const avgD   = sortedEntries.length ? Math.round(totalD / sortedEntries.length) : 0;
            dailyData    = sortedEntries.map(([date, energy]) => ({
                label:  date.slice(-2),
                energy: Math.round(energy),
                avg:    avgD
            }));
        }

        const children = await getChildrenForNode(type, id, selectedCategory, plantId, currentDate, startOfMonth, endOfMonth, thresholdMinutes);

        return res.json({
            success: true,
            data: {
                power:       parseFloat(energy.kW.toFixed(1)),
                energyToday: Math.round(energy.kWhDay),
                energyMonth: Math.round(energy.kWhMonth),
                voltage:     parseFloat(energy.voltage.toFixed(1)),
                powerFactor: parseFloat(energy.pf.toFixed(2)),
                frequency:   50.0,
                alertCount:  0,
                deviceTotal: meterIds.length,
                status:      isOffline ? 'Offline' : 'Online',
                lastUpdated,
                hourlyData,
                dailyData,
                children
            }
        });
    } catch (err) {
        console.error('getLiveData error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMeterDetail = async (req, res) => {
    try {
        const { meterId } = req.query;
        if (!meterId) return res.status(400).json({ success: false, message: 'meterId required' });

        const now          = moment.tz(TZ);
        const currentDate  = now.format('YYYY-MM-DD');
        const hrampm       = now.format('hA');
        const startOfMonth = now.clone().startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = now.clone().endOf('month').format('YYYY-MM-DD');

        const [meterRows] = await connection.query('SELECT * FROM meters WHERE id = ?', [meterId]);
        if (!meterRows.length) return res.status(404).json({ success: false, message: 'Meter not found' });
        const meter = meterRows[0];

        const [liveRows] = await connection.query(
            'SELECT kW, pF, vll, frequency, l1, l2, l3 FROM hmidatadisplay WHERE meterId = ? ORDER BY id DESC LIMIT 1',
            [meterId]
        );
        const live = liveRows[0] || {};

        const [hourRow] = await connection.query(
            'SELECT SUM(kWh) as total FROM energy_data_view WHERE meterId = ? AND date = ? AND HR = ?',
            [meterId, currentDate, hrampm]
        );
        const [dayRow] = await connection.query(
            'SELECT SUM(kWh) as total FROM energy_data_view WHERE meterId = ? AND date = ?',
            [meterId, currentDate]
        );
        const [monthRow] = await connection.query(
            'SELECT SUM(kWh) as total FROM energy_data_view WHERE meterId = ? AND date BETWEEN ? AND ?',
            [meterId, startOfMonth, endOfMonth]
        );

        const l1 = parseFloat(live.l1 || 0);
        const l2 = parseFloat(live.l2 || 0);
        const l3 = parseFloat(live.l3 || 0);

        return res.json({
            success: true,
            data: {
                id:        meter.id,
                name:      meter.displayName,
                meterType: meter.meterType,
                kW:        parseFloat(parseFloat(live.kW        || 0).toFixed(1)),
                pF:        parseFloat(parseFloat(live.pF        || 0).toFixed(2)),
                voltage:   parseFloat(parseFloat(live.vll       || 0).toFixed(1)),
                frequency: parseFloat(parseFloat(live.frequency || 0).toFixed(1)),
                current:   parseFloat(((l1 + l2 + l3) / 3).toFixed(1)),
                kWhHour:   parseFloat(parseFloat(hourRow[0]?.total  || 0).toFixed(2)),
                kWhDay:    parseFloat(parseFloat(dayRow[0]?.total   || 0).toFixed(2)),
                kWhMonth:  parseFloat(parseFloat(monthRow[0]?.total || 0).toFixed(2))
            }
        });
    } catch (err) {
        console.error('getMeterDetail error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

async function getMetersForSensorNode(nodeType, nodeId) {
    let sql, params;

    switch (nodeType) {
        case 'meter':
            // Direct meter click — use that meter exactly
            sql    = 'SELECT id, deviceId, slaveId, displayName AS name FROM meters WHERE id = ?';
            params = [nodeId];
            break;

        case 'feeder':
            // Show all meters assigned to this feeder (feeder meter + asset meters)
            sql    = 'SELECT id, deviceId, slaveId, displayName AS name FROM meters WHERE feederId = ?';
            params = [nodeId];
            break;

        case 'distributor':
            // Show only the distributor's OWN meter (feederId IS NULL).
            // Feeder/asset meters under this distributor have feederId set —
            // they belong to the feeder level, not the distributor level.
            sql    = `SELECT id, deviceId, slaveId, displayName AS name
                      FROM meters
                      WHERE distributerId = ? AND feederId IS NULL`;
            params = [nodeId];
            break;

        case 'incomer':
            // Show incomer's own meter (distributerId IS NULL means it's the raw incomer)
            sql    = `SELECT id, deviceId, slaveId, displayName AS name
                      FROM meters
                      WHERE incomerId = ? AND distributerId IS NULL`;
            params = [nodeId];
            break;

        case 'cat_item':
            sql    = `SELECT m.id, m.deviceId, m.slaveId, m.displayName AS name
                      FROM meters m
                      INNER JOIN meter_groups mg ON mg.meterId = m.id
                      WHERE mg.categoryId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`;
            params = [nodeId];
            break;

        case 'cat_sub':
            sql    = `SELECT m.id, m.deviceId, m.slaveId, m.displayName AS name
                      FROM meters m
                      INNER JOIN meter_groups mg ON mg.meterId = m.id
                      WHERE mg.subCategoryId = ? AND mg.meterId IS NOT NULL AND mg.meterId > 0`;
            params = [nodeId];
            break;

        default:
            return [];
    }

    const [rows] = await connection.query(sql, params);
    return rows;
}

// ── GET /dashboard/sensorParams?nodeType=X&nodeId=Y ──────────────────────────
// Returns available sensor parameters (from machine_parameter_allocation) for
// all meters associated with the given node, grouped by deviceId+slaveId.
exports.getSensorParams = async (req, res) => {
    try {
        const { nodeType, nodeId } = req.query;
        if (!nodeType || !nodeId) {
            return res.status(400).json({ success: false, message: 'nodeType and nodeId required' });
        }
        const meters = await getMetersForSensorNode(nodeType, nodeId);

        console.log(`getSensorParams for nodeType=${nodeType} nodeId=${nodeId} found ${meters.length} meters`);
        if (!meters.length) {
            return res.json({ success: true, data: [] });
        }

        const results = [];
        const seen = new Set();
        for (const m of meters) {
            const [params] = await connection.query(
                `SELECT DISTINCT Tag_Id, Tag_Name FROM machine_parameter_allocation
                 WHERE deviceId = ? AND slaveId = ? AND isSensor = 1
                 ORDER BY Tag_Name`,
                [m.deviceId, m.slaveId]
            );
            for (const p of params) {
                const key = `${m.deviceId}-${m.slaveId}-${p.Tag_Id}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    results.push({
                        meterId:   m.id,
                        meterName: m.name,
                        deviceId:  m.deviceId,
                        slaveId:   m.slaveId,
                        tagId:     p.Tag_Id,
                        tagName:   p.Tag_Name,
                    });
                }
            }
        }
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error('getSensorParams error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /dashboard/sensorGraph?deviceId=X&slaveId=Y&tagId=Z&last=15days&aggregation=min&interval=1hr
exports.getSensorGraph = async (req, res) => {
    try {
        const {
            deviceId, slaveId, tagId,
            last = '15days', aggregation = 'min', interval = '1hr'
        } = req.query;
        if (!deviceId || !tagId) {
            return res.status(400).json({ success: false, message: 'deviceId and tagId required' });
        }

        // Two key sets share this map: '8hr'/'1day'/'1week'/'15days'/'30days' is what the
        // Energy Dashboard's graph filter sends (SensorChartPanel.js/MeterGraphCard.js
        // LAST_OPTIONS) — don't rename these, that filter already works correctly today.
        // '1hr'/'6hr'/'24hr'/'7days' is what MeterDetailDrawer.js/SensorNodeDetail.js's
        // TIME_OPTIONS send — those keys were previously MISSING here entirely, so every
        // button except "30d" silently fell through to the `|| 360` default below and
        // always rendered a 15-day window regardless of which range was selected.
        const HourOffset     = {
            '8hr': 8, '1day': 24, '1week': 168, '15days': 360, '30days': 720,
            '1hr': 1, '6hr': 6, '24hr': 24, '7days': 168,
        };
        const IntervalSeconds = { '15min': 900, '30min': 1800, '1hr': 3600, '1day': 86400 };
        const AggFn           = { 'min': 'MIN(value)', 'max': 'MAX(value)', 'avg': 'AVG(value)' };

        const hours  = HourOffset[last]      || 360;
        const intSec = IntervalSeconds[interval] || 3600;
        const agg    = AggFn[aggregation]    || 'MIN(value)';

        let where  = 'deviceId = ? AND Tag_Id = ? AND TIMESTAMPDIFF(HOUR, dateTime, NOW()) <= ?';
        let params = [deviceId, tagId, hours];
        if (slaveId) { where += ' AND slaveId = ?'; params.push(slaveId); }

        // Fetch Tag_Name for label
        const [tagRow] = await connection.query(
            'SELECT Tag_Name FROM machine_parameter_allocation WHERE deviceId = ? AND Tag_Id = ? LIMIT 1',
            [deviceId, tagId]
        );

        const [rows] = await connection.query(
            `SELECT
                 DATE_FORMAT(FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(dateTime)/?) * ?),
                             '%Y-%m-%d %H:%i') AS dt,
                 ${agg} AS value
             FROM sensor_data
             WHERE ${where}
             GROUP BY FLOOR(UNIX_TIMESTAMP(dateTime)/?)
             ORDER BY dt`,
            [intSec, intSec, ...params, intSec]
        );

        return res.json({
            success: true,
            tagName: tagRow[0]?.Tag_Name || `Tag ${tagId}`,
            data: rows.map(r => ({
                dateTime: r.dt,
                value:    parseFloat(parseFloat(r.value || 0).toFixed(2))
            }))
        });
    } catch (err) {
        console.error('getSensorGraph error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /dashboard/meterDashboard/:meterId ────────────────────────────────────
// Single-call endpoint: returns defaultGraphs, allocatedParameters, alerts.
// Responses are cached for 10 minutes per meterId.
exports.getMeterDashboard = async (req, res) => {
    try {
        const { meterId } = req.params;
        if (!meterId) return res.status(400).json({ success: false, message: 'meterId required' });

        const cacheKey = `meterDash:${meterId}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json({ success: true, ...cached, fromCache: true });

        // ── 1. Meter info ──
        const [meterRows] = await connection.query(
            'SELECT id, deviceId, slaveId, displayName AS name FROM meters WHERE id = ?',
            [meterId]
        );
        if (!meterRows.length) return res.status(404).json({ success: false, message: 'Meter not found' });
        const meter = meterRows[0];

        // ── 2. All allocated sensor parameters for this device+slave ──
        const [params] = await connection.query(
            `SELECT DISTINCT
                 mpa.Tag_Id   AS tagId,
                 mpa.Tag_Name AS tagName,
                 mpa.slaveId,
                 mpa.Tag_Name AS tagDescription
             FROM machine_parameter_allocation mpa
             WHERE mpa.deviceId = ? AND mpa.slaveId = ? AND mpa.isSensor = 1
             ORDER BY mpa.Tag_Name`,
            [meter.deviceId, meter.slaveId]
        );

        // ── 3. Distinct slaveIds available for this device (for settings dropdown) ──
        const [slaveRows] = await connection.query(
            `SELECT DISTINCT slaveId FROM machine_parameter_allocation
             WHERE deviceId = ? AND isSensor = 1 ORDER BY slaveId`,
            [meter.deviceId]
        );

        // ── 4. Saved default settings ──
        const [defaults] = await connection.query(
            'SELECT * FROM meter_default_settings WHERE meterId = ?',
            [meterId]
        );

        // Build 3 default graph slots
        const defaultGraphs = [1, 2, 3].map(pos => {
            const saved = defaults[0];
            const savedTagId = saved?.[`graph${pos}_tagId`];
            const savedName  = saved?.[`graph${pos}_displayName`];
            if (savedTagId) {
                const p = params.find(x => x.tagId == savedTagId);
                return {
                    position: pos,
                    tagId:       savedTagId,
                    tagName:     p?.tagName    || String(savedTagId),
                    displayName: savedName     || p?.tagName || String(savedTagId),
                    slaveId:     meter.slaveId,
                };
            }
            // Fall back to the (pos-1)th available parameter
            const fallback = params[pos - 1];
            return {
                position:    pos,
                tagId:       fallback?.tagId       || null,
                tagName:     fallback?.tagName      || null,
                displayName: fallback?.tagName      || '—',
                slaveId:     meter.slaveId,
            };
        });

        const result = {
            meter,
            defaultGraphs,
            allocatedParameters: params,
            availableSlaveIds:   slaveRows.map(r => r.slaveId),
            alerts: [],
        };

        await cacheSet(cacheKey, result);
        return res.json({ success: true, ...result });
    } catch (err) {
        console.error('getMeterDashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /dashboard/meterDashboard/:meterId/settings ───────────────────────────
// Update one graph-slot default for a meter. Invalidates cache on success.
exports.updateMeterDefaultSettings = async (req, res) => {
    try {
        const { meterId }                  = req.params;
        const { position, tagId, displayName } = req.body;

        if (!meterId || ![1, 2, 3].includes(Number(position))) {
            return res.status(400).json({ success: false, message: 'meterId and position (1-3) required' });
        }

        const tagCol  = `graph${position}_tagId`;
        const nameCol = `graph${position}_displayName`;

        await connection.query(
            `INSERT INTO meter_default_settings (meterId, ${tagCol}, ${nameCol})
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE ${tagCol} = VALUES(${tagCol}), ${nameCol} = VALUES(${nameCol}), updatedAt = NOW()`,
            [meterId, tagId || null, displayName || null]
        );

        await cacheDelete(`meterDash:${meterId}`);
        return res.json({ success: true, message: 'Default settings saved' });
    } catch (err) {
        console.error('updateMeterDefaultSettings error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /dashboard/deviceParams?deviceId=X&slaveId=Y ─────────────────────────
// Returns sensor parameters for a specific device+slaveId (used in settings dropdown).
exports.getDeviceParams = async (req, res) => {
    try {
        const { deviceId, slaveId } = req.query;
        if (!deviceId || !slaveId) {
            return res.status(400).json({ success: false, message: 'deviceId and slaveId required' });
        }
        const [rows] = await connection.query(
            `SELECT DISTINCT Tag_Id AS tagId, Tag_Name AS tagName
             FROM machine_parameter_allocation
             WHERE deviceId = ? AND slaveId = ? AND isSensor = 1
             ORDER BY Tag_Name`,
            [deviceId, slaveId]
        );
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('getDeviceParams error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /dashboard/liveTags?machineId=X&deviceId=Y ───────────────────────────
// Returns all current tag values for a machine/device from live_tag_snapshot.
// Response pivots rows into tags:{tagName:{value,min,max,avg,unit,updated_at}} for
// easy dynamic widget rendering — no hardcoded column names needed on the frontend.
// Cache TTL: 55 s (just under the 1-min cron cycle so data is never more than ~2 min stale).
exports.getLiveTags = async (req, res) => {
    try {
        const { machineId, deviceId } = req.query;

        const cacheKey = `liveTags:${machineId ?? 'all'}:${deviceId ?? 'all'}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return res.json({ success: true, data: cached, fromCache: true });

        let sql = `SELECT machineId, deviceId, slaveId, tag_id, tag_name, tag_category,
                          value, min_value, max_value, avg_value, unit, sensor_type, updated_at
                   FROM live_tag_snapshot`;
        const params = [];

        if (machineId) {
            sql += ' WHERE machineId = ?';
            params.push(machineId);
            if (deviceId) { sql += ' AND deviceId = ?'; params.push(deviceId); }
        } else if (deviceId) {
            sql += ' WHERE deviceId = ?';
            params.push(deviceId);
        }

        sql += ' ORDER BY tag_name';
        const [rows] = await connection.query(sql, params);

        // Pivot rows → tags object keyed by tag_name
        const tags = {};
        for (const r of rows) {
            tags[r.tag_name] = {
                value:      r.value,
                min:        r.min_value,
                max:        r.max_value,
                avg:        r.avg_value,
                unit:       r.unit,
                category:   r.tag_category,
                sensorType: r.sensor_type,
                updated_at: r.updated_at,
            };
        }

        const data = { machineId: machineId ?? null, deviceId: deviceId ?? null, tags };
        await cacheSet(cacheKey, data, 55 * 1000);
        return res.json({ success: true, data });
    } catch (err) {
        console.error('getLiveTags error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── getTagLiveValue — single-tag live reading for the sensor dashboards ───────
// Same table/join key ScadaController.getLiveValues already uses for live
// widget values (deviceId + slaveId + tag_id) — the canonical "latest value"
// source, refreshed by the ~1-min live-tag cron. Used instead of
// utility_meter_live_data (built for counter-type meters, not calibrated
// instantaneous sensors) or a stale historical trend bucket.
// GET /dashboard/liveTagValue?deviceId=&slaveId=&tagId=
exports.getTagLiveValue = async (req, res) => {
    try {
        const { deviceId, slaveId, tagId } = req.query;
        if (!deviceId || !slaveId || !tagId) {
            return res.status(400).json({ success: false, message: 'deviceId, slaveId and tagId are required' });
        }
        const [rows] = await connection.query(
            `SELECT value, unit, updated_at
             FROM live_tag_snapshot
             WHERE deviceId = ? AND slaveId = ? AND tag_id = ?
             LIMIT 1`,
            [deviceId, slaveId, tagId]
        );
        return res.json({ success: true, data: rows[0] || null });
    } catch (err) {
        console.error('getTagLiveValue error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /dashboard/meterOptions?plantId=
// Flat list of every meter under a plant (id + display name) — lets Plant
// Overview's "Pick Meter(s)" screen select a meter directly by name, the
// same first-class `meters` row every distributor/feeder card on this
// dashboard is already built from, instead of composing a Device+Slave+
// Sensor combination by hand for something that already has its own name.
exports.getMeterOptions = async (req, res) => {
    try {
        const { plantId } = req.query;
        if (!plantId) return res.status(400).json({ success: false, message: 'plantId required' });
        const [rows] = await connection.query(
            'SELECT id, displayName AS name, category FROM meters WHERE plantId = ? ORDER BY displayName ASC',
            [plantId]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('getMeterOptions error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /dashboard/meterCurrentHourValue?meterIds=1,2,3
// Sums THIS calendar hour's consumption across one or more meters in a single
// query — backs Plant Overview's "a box can be a group of several physical
// meters" override (e.g. "AC System" = 4 meters summed). Reads the real
// monthly consumption table (energy_data_YYYY_MM, via the SAME
// getEnergyTableName() helper getEnergyAggregate/buildMeterCards already use
// for this dashboard's other kWhDay/kWhMonth numbers) rather than
// energy_data_view — a plain, unpartitioned passthrough table that isn't the
// one actually populated with meter-based hourly rows per month.
async function readHourTotal(table, meterIds, date, hr) {
    try {
        const [rows] = await connection.query(
            `SELECT SUM(kWh) AS total FROM ${table} WHERE meterId IN (?) AND date = ? AND HR = ?`,
            [meterIds, date, hr]
        );
        return rows[0]?.total;
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') return null; // this month's table doesn't exist yet
        throw err;
    }
}

exports.getMeterCurrentHourValue = async (req, res) => {
    try {
        const meterIds = String(req.query?.meterIds || '')
            .split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
        if (!meterIds.length) return res.status(400).json({ success: false, message: 'meterIds required' });

        const now = moment.tz(TZ);
        const currentDate = now.format('YYYY-MM-DD');
        const hrampm = now.format('hA');
        const table = getEnergyTableName(currentDate); // e.g. energy_data_2026_09

        let total = await readHourTotal(table, meterIds, currentDate, hrampm);
        let isCurrentHour = true;

        // Nothing for this hour yet (ingestion lag, or the hour just started) —
        // find the single most recent (date, HR) that has any row for this
        // group in this month's table (ordered by the real updated_at
        // timestamp, not HR itself — HR is a "3PM"-style string, not
        // chronologically sortable), then sum THAT hour for the whole group
        // so every meter in it reflects the same point in time.
        if (total === null || total === undefined) {
            try {
                const [lastRows] = await connection.query(
                    `SELECT date, HR FROM ${table} WHERE meterId IN (?) ORDER BY updated_at DESC LIMIT 1`,
                    [meterIds]
                );
                if (lastRows.length) {
                    total = await readHourTotal(table, meterIds, lastRows[0].date, lastRows[0].HR);
                    isCurrentHour = false;
                }
            } catch (err) {
                if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
            }
        }

        const value = total !== null && total !== undefined ? parseFloat(total) : null;
        return res.status(200).json({ success: true, data: { value, unit: 'kWh', isCurrentHour } });
    } catch (err) {
        console.error('getMeterCurrentHourValue error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
