const fs   = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { connection } = require('../config/dbSql2');

// process.cwd() is the real filesystem dir (works inside pkg snapshots too)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'scada');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Auto-migrate: add background_image column if it doesn't exist yet
(async () => {
    try {
        await connection.execute(
            'ALTER TABLE scada_tabs ADD COLUMN background_image VARCHAR(500) NULL DEFAULT NULL'
        );
    } catch (_) { /* column already exists — ignore */ }
})();

// ── Multer config ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename:    (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /\.(jpeg|jpg|png|gif|webp|svg)$/i;
    allowed.test(path.extname(file.originalname))
        ? cb(null, true)
        : cb(new Error('Only image files are allowed'));
};

exports.upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── POST /api/scada/uploadImage  (multipart/form-data, field: "image") ─────────
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const imagePath = `scada/${req.file.filename}`;

        // Persist background_image to scada_tabs so it survives page reloads.
        // module distinguishes the SCADA Dashboard's tabs from the Plant
        // Overview page's screens — both reuse tabIndex starting at 1.
        const { tabIndex, module, scadaName } = req.body;
        const mod = module || 'scada';
        if (tabIndex !== undefined && tabIndex !== null) {
            const idx = Number(tabIndex);
            // A freshly "+ Add Screen"'d tab has no scada_tabs row yet (one is
            // only ever created by the rename flow) — an UPDATE here would
            // silently affect 0 rows: the file uploads fine and the frontend
            // shows it immediately from local state, but nothing is actually
            // persisted, so the image quietly reverts to blank the next time
            // this screen is opened unless a marker also got saved on it
            // (whose own `image` column happens to carry it). Upsert instead.
            const [existing] = await connection.execute(
                'SELECT id FROM scada_tabs WHERE tabIndex = ? AND module = ?',
                [idx, mod]
            );
            if (existing.length) {
                await connection.execute(
                    'UPDATE scada_tabs SET background_image = ? WHERE id = ?',
                    [imagePath, existing[0].id]
                );
            } else {
                // scada_tabs.userId is NOT NULL — fall back to 0 rather than
                // null in the (rare) case this multipart request didn't
                // include one, so a missing userId can't turn "upload an
                // image" into a hard 500 instead of just an unattributed row.
                await connection.execute(
                    'INSERT INTO scada_tabs (userId, module, scadaName, tabIndex, background_image) VALUES (?, ?, ?, ?, ?)',
                    [req.body.userId || 0, mod, scadaName || `Screen ${idx}`, idx, imagePath]
                );
            }
            // Also sync any existing markers on this tab
            await connection.execute(
                'UPDATE scada_markers SET image = ? WHERE scadaTab = ? AND module = ?',
                [imagePath, String(idx), mod]
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imagePath,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
    }
};

// ── POST /api/scada/showData — shared view, same for every user ────────────────
// body: { userId, module? } — module defaults to 'scada' (SCADA Dashboard);
// Plant Overview passes module: 'plantOverview' to see only its own markers.
exports.showData = async (req, res) => {
    try {
        const mod = req.body?.module || 'scada';
        const query = `
            SELECT
                sm.id,
                sm.userId,
                sm.locationId,
                sm.deviceId,
                sm.edgeDeviceId,
                sm.slaveId,
                sm.tagsId,
                sm.titleName,
                sm.units,
                sm.x,
                sm.y,
                sm.color,
                sm.image,
                sm.scadaTab,
                s.Tag_Name  AS tagName,
                ls.value    AS sensorValue,
                ls.updated_at AS lastUpdated
            FROM scada_markers sm
            LEFT JOIN sensors s
                ON s.Tag_Id = sm.tagsId
            LEFT JOIN live_tag_snapshot ls
                ON  ls.deviceId = sm.deviceId
                AND ls.slaveId  = sm.slaveId
                AND ls.tag_id   = sm.tagsId
            WHERE sm.module = ?
            ORDER BY sm.scadaTab ASC, sm.id ASC
        `;

        const [rows] = await connection.execute(query, [mod]);

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scada/add   body: JSON (image is a path string, not base64) ──────
exports.add = async (req, res) => {
    try {
        const {
            id,
            userId,
            locationId,
            deviceId,
            edgeDeviceId,
            slaveId,
            tagsId,
            titleName,
            units,
            x,
            y,
            color,
            image,      // relative path, e.g. "scada/uuid.jpg"
            scadaTab,
            module,
        } = req.body;
        const mod = module || 'scada';

        // Strip base URL if frontend accidentally sends the full URL
        let imagePath = image || null;
        if (imagePath && imagePath.startsWith('http')) {
            // extract everything after the host:port/
            try {
                const url = new URL(imagePath);
                imagePath = url.pathname.replace(/^\//, ''); // e.g. "scada/uuid.jpg"
            } catch (_) { /* keep as-is */ }
        }
        // Reject accidental base64 payloads gracefully
        if (imagePath && imagePath.startsWith('data:')) {
            imagePath = null;
        }

        const isUpdate = id && Number(String(id).length) < 13;

        if (isUpdate) {
            const setImage = imagePath !== null ? 'image = ?,' : '';
            const updateQuery = `
                UPDATE scada_markers SET
                    deviceId     = ?,
                    edgeDeviceId = ?,
                    slaveId      = ?,
                    tagsId       = ?,
                    titleName    = ?,
                    units        = ?,
                    x            = ?,
                    y            = ?,
                    color        = ?,
                    ${setImage}
                    scadaTab     = ?,
                    updated_at   = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const values = imagePath !== null
                ? [deviceId || null, edgeDeviceId || null, slaveId || null, tagsId || null, titleName, units, x, y, color, imagePath, scadaTab, id]
                : [deviceId || null, edgeDeviceId || null, slaveId || null, tagsId || null, titleName, units, x, y, color, scadaTab, id];

            await connection.execute(updateQuery, values);
            return res.status(200).json({ success: true, message: 'Marker updated successfully', id });
        } else {
            const insertQuery = `
                INSERT INTO scada_markers
                    (userId, module, locationId, deviceId, edgeDeviceId, slaveId,
                     tagsId, titleName, units, x, y, color, image, scadaTab)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(insertQuery, [
                userId,
                mod,
                locationId   || null,
                deviceId     || null,
                edgeDeviceId || null,
                slaveId      || null,
                tagsId       || null,
                titleName    || null,
                units        || null,
                x,
                y,
                color        || null,
                imagePath,
                scadaTab,
            ]);

            return res.status(201).json({
                success: true,
                message: 'Marker added successfully',
                id: result.insertId,
            });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scada/:id/delete ─────────────────────────────────────────────────
exports.deleteMarker = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await connection.execute(
            'DELETE FROM scada_markers WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Marker not found' });
        }
        return res.status(200).json({ success: true, message: 'Marker deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scadaName/add ────────────────────────────────────────────────────
// body: { scadaName, tabIndex, module? } — tabIndex pins this name to a specific
// tab; module defaults to 'scada' (SCADA Dashboard) — Plant Overview passes
// module: 'plantOverview' so its screens are stored separately.
exports.createScadaName = async (req, res) => {
    try {
        const userId = req.user?.userId ?? req.body.userId;
        const { scadaName, tabIndex, module } = req.body;
        const mod = module || 'scada';

        // If a row already exists for this tab position (within this module),
        // update it instead of inserting a duplicate.
        if (tabIndex !== undefined && tabIndex !== null) {
            const [existing] = await connection.execute(
                'SELECT id FROM scada_tabs WHERE tabIndex = ? AND module = ?',
                [tabIndex, mod]
            );
            if (existing.length) {
                await connection.execute(
                    'UPDATE scada_tabs SET scadaName = ? WHERE id = ?',
                    [scadaName, existing[0].id]
                );
                return res.status(200).json({ success: true, message: 'Tab updated', id: existing[0].id });
            }
        }

        const [result] = await connection.execute(
            'INSERT INTO scada_tabs (userId, module, scadaName, tabIndex) VALUES (?, ?, ?, ?)',
            [userId, mod, scadaName, tabIndex ?? null]
        );
        return res.status(201).json({ success: true, message: 'Tab created', id: result.insertId });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scadaName/showData ──────────────────────────────────────────────
// body: { userId, module? }
exports.showScadaNames = async (req, res) => {
    try {
        const mod = req.body?.module || 'scada';
        const [rows] = await connection.execute(
            'SELECT id, scadaName, tabIndex, background_image FROM scada_tabs WHERE module = ? ORDER BY id ASC',
            [mod]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scadaName/:id/update ────────────────────────────────────────────
// body: { scadaName, tabIndex? }
exports.updateScadaName = async (req, res) => {
    try {
        const { id } = req.params;
        const { scadaName, tabIndex } = req.body;

        if (tabIndex !== undefined && tabIndex !== null) {
            const [result] = await connection.execute(
                'UPDATE scada_tabs SET scadaName = ?, tabIndex = ? WHERE id = ?',
                [scadaName, tabIndex, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Tab not found' });
            }
        } else {
            const [result] = await connection.execute(
                'UPDATE scada_tabs SET scadaName = ? WHERE id = ?',
                [scadaName, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Tab not found' });
            }
        }
        return res.status(200).json({ success: true, message: 'Tab updated' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scadaName/:tabIndex/deleteTab ────────────────────────────────────
// body: { module? } — Deletes the tab's name row AND all its markers (within
// that module), then shifts every later tab/marker position in that same
// module down by one so positions stay contiguous. Scoped by module so
// deleting a Plant Overview screen can never touch SCADA Dashboard tabs (or
// vice versa) even though both reuse tabIndex starting at 1.
exports.deleteTab = async (req, res) => {
    try {
        const tabIndex = Number(req.params.tabIndex);
        const mod = req.body?.module || 'scada';
        if (!tabIndex || tabIndex < 1) {
            return res.status(400).json({ success: false, message: 'Invalid tab index' });
        }

        await connection.execute(
            'DELETE FROM scada_markers WHERE scadaTab = ? AND module = ?',
            [String(tabIndex), mod]
        );

        await connection.execute(
            'DELETE FROM scada_tabs WHERE tabIndex = ? AND module = ?',
            [tabIndex, mod]
        );

        const [laterMarkers] = await connection.execute(
            'SELECT id, scadaTab FROM scada_markers WHERE CAST(scadaTab AS UNSIGNED) > ? AND module = ?',
            [tabIndex, mod]
        );
        for (const row of laterMarkers) {
            const newTab = String(Number(row.scadaTab) - 1);
            await connection.execute('UPDATE scada_markers SET scadaTab = ? WHERE id = ?', [newTab, row.id]);
        }

        const [laterTabs] = await connection.execute(
            'SELECT id, tabIndex FROM scada_tabs WHERE tabIndex > ? AND module = ?',
            [tabIndex, mod]
        );
        for (const row of laterTabs) {
            await connection.execute('UPDATE scada_tabs SET tabIndex = ? WHERE id = ?', [row.tabIndex - 1, row.id]);
        }

        return res.status(200).json({ success: true, message: 'Tab deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scada/liveValues   body: { tab } ─────────────────────────────────
// Returns live_tag_snapshot values for all markers on the given SCADA tab.
// JOIN key: deviceId + slaveId + tagsId — matches how scada_markers identifies each widget.
exports.getLiveValues = async (req, res) => {
    try {
        const { tab, module } = req.body;
        const mod = module || 'scada';

        if (tab === undefined || tab === null) {
            return res.status(400).json({ success: false, message: 'tab is required' });
        }

        const [rows] = await connection.execute(
            `SELECT ls.deviceId, ls.slaveId, ls.tag_id, ls.tag_name,
                    ls.value, ls.min_value, ls.max_value, ls.avg_value,
                    ls.unit, ls.tag_category, ls.sensor_type, ls.updated_at
             FROM live_tag_snapshot ls
             INNER JOIN scada_markers sm
                ON  ls.deviceId = sm.deviceId
                AND ls.slaveId  = sm.slaveId
                AND ls.tag_id   = sm.tagsId
             WHERE sm.scadaTab = ? AND sm.module = ?`,
            [String(tab), mod]
        );

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/DevTagList   body: { deviceId, slaveId? } ───────────────────────
// Returns sensors from `sensors` table as { id, tagDisplayName }
exports.getTagsByDevice = async (req, res) => {
    try {
        const { deviceId, slaveId } = req.body;

        let query, params;
        if (slaveId !== undefined && slaveId !== null && slaveId !== '') {
            query  = `SELECT Tag_Id AS id, Tag_Name AS tagDisplayName, slaveId, jsonType
                      FROM sensors WHERE deviceId = ? AND slaveId = ? ORDER BY Tag_Name ASC`;
            params = [deviceId, slaveId];
        } else {
            query  = `SELECT Tag_Id AS id, Tag_Name AS tagDisplayName, slaveId, jsonType
                      FROM sensors WHERE deviceId = ? ORDER BY slaveId ASC, Tag_Name ASC`;
            params = [deviceId];
        }

        const [rows] = await connection.execute(query, params);
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/device/showByUser   body: { userId } ────────────────────────────
// Returns edge_devices list for SCADA device dropdown
exports.showByUser = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT id, edgeDeviceName AS deviceName, deviceTag, macAddress, deviceState
             FROM edge_devices ORDER BY edgeDeviceName ASC`
        );
        return res.status(200).json({ success: true, data: rows, locationId: null });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scada/chartData   body: { deviceId, slaveId, tagId, sortDataType, interval, aggregation } ──
// Line/Bar chart data for a SCADA marker, keyed by deviceId+slaveId+Tag_Id — the
// same triple every other SCADA lookup uses (getLiveValues/showData above), NOT
// machineId. SCADA devices aren't necessarily registered in the AMC module's
// machine_parameter_allocation hierarchy that the HealthDashboard's
// /sensors/ChartData endpoint depends on, so that endpoint silently returns no
// data for SCADA markers whose deviceId doesn't happen to match a machineId row.
exports.getChartData = async (req, res) => {
    try {
        const { deviceId, slaveId, tagId, sortDataType, interval, aggregation } = req.body;

        const HourOffset = { '8hr': 8, '1day': 24, '1week': 168, '15days': 360, '30days': 720 };
        const IntervalInSeconds = { '15min': 900, '30min': 1800, '1hr': 3600, '1day': 86400 };
        const AggregateTypes = {
            min:   { val: 'MIN', col: 'Min' },
            max:   { val: 'MAX', col: 'Max' },
            avg:   { val: 'AVG', col: 'Avg' },
            count: { val: 'SUM', col: 'value' },
        };

        const hourOffset      = HourOffset[sortDataType];
        const intervalSeconds = IntervalInSeconds[interval];
        const aggregate       = AggregateTypes[aggregation];

        if (!deviceId || !tagId || !hourOffset || !intervalSeconds || !aggregate) {
            return res.status(400).json({ success: false, message: 'Invalid request parameters' });
        }

        // Anchor "last N hours" to this tag's own latest reported reading rather
        // than NOW() — if the feed lags or gaps, the chart still shows its last
        // real trend instead of going blank.
        const [anchorRows] = await connection.execute(
            `SELECT MAX(dateTime) AS latest FROM sensor_data
             WHERE deviceId = ? AND slaveId = ? AND Tag_Id = ? AND isAggregate = 1`,
            [deviceId, slaveId || '', tagId]
        );
        const anchorTime = anchorRows[0]?.latest || null;

        const [rows] = await connection.execute(
            `SELECT
                Tag_Id, Tag_Name,
                DATE_FORMAT(dateTime, '%Y-%m-%d %H:%i:00') AS interval_start,
                ${aggregate.val}(${aggregate.col}) AS aggregatedValue
             FROM sensor_data
             WHERE deviceId = ? AND slaveId = ? AND Tag_Id = ?
               AND isAggregate = 1
               AND dateTime >= DATE_SUB(?, INTERVAL ? HOUR)
             GROUP BY Tag_Id, Tag_Name, FLOOR(UNIX_TIMESTAMP(dateTime) / ?)
             ORDER BY interval_start`,
            [deviceId, slaveId || '', tagId, anchorTime, hourOffset, intervalSeconds]
        );

        const tagName = rows[0]?.Tag_Name || '';
        const dataKey = 's0';
        let maxValue = 0;
        const data = rows.map(r => {
            const val = r.aggregatedValue === null ? 0 : Number(r.aggregatedValue);
            if (val > maxValue) maxValue = val + 5;
            return { dateTime: r.interval_start, [dataKey]: val.toFixed(2) };
        });

        return res.status(200).json({
            success: true,
            lines: tagName ? [{ dataKey, name: tagName, stroke: '#2196f3' }] : [],
            maxValue: Math.ceil(maxValue),
            data,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scada/tagsByDevices   body: { deviceIds: [...] } ─────────────────
// Flat, cross-device sensor list for the "Analytics" (combined multi-sensor
// chart) tab in MarkerDialog — each row is self-describing (carries its own
// deviceName/slaveId) so the frontend can group a multi-device checkbox list.
exports.getTagsByDevices = async (req, res) => {
    try {
        const { deviceIds } = req.body;
        if (!Array.isArray(deviceIds) || !deviceIds.length) {
            return res.status(400).json({ success: false, message: 'deviceIds array required' });
        }

        const placeholders = deviceIds.map(() => '?').join(',');
        const [rows] = await connection.execute(
            `SELECT s.Tag_Id AS tagId, s.Tag_Name AS tagName, s.slaveId, s.deviceId,
                    ed.edgeDeviceName AS deviceName
             FROM sensors s
             JOIN edge_devices ed ON ed.id = s.deviceId
             WHERE s.deviceId IN (${placeholders})
             ORDER BY ed.edgeDeviceName ASC, s.slaveId ASC, s.Tag_Name ASC`,
            deviceIds
        );

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

const COMBINED_CHART_COLORS = ['#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#ffc107', '#795548'];
const MAX_COMBINED_SENSORS = 8;

// ── POST /api/scada/combinedChartData   body: { sensors: [{deviceId, slaveId, tagId}, ...], sortDataType, interval, aggregation } ──
// Overlays N sensors (any mix of devices/slaves/tags) into one chart. Unlike
// getChartData above, this MUST use one shared anchor + one canonical SQL-computed
// bucket boundary for every sensor, not a per-sensor anchor / per-row DATE_FORMAT
// pick — sibling tags from different devices poll on independent schedules, so
// "whichever row MySQL picks as representative" for a bucket won't coincide
// across devices the way it happens to for tags on the same device.
exports.getCombinedChartData = async (req, res) => {
    try {
        let { sensors, sortDataType, interval, aggregation } = req.body;

        const HourOffset = { '8hr': 8, '1day': 24, '1week': 168, '15days': 360, '30days': 720 };
        const IntervalInSeconds = { '15min': 900, '30min': 1800, '1hr': 3600, '1day': 86400 };
        const AggregateTypes = {
            min:   { val: 'MIN', col: 'Min' },
            max:   { val: 'MAX', col: 'Max' },
            avg:   { val: 'AVG', col: 'Avg' },
            count: { val: 'SUM', col: 'value' },
        };

        const hourOffset      = HourOffset[sortDataType];
        const intervalSeconds = IntervalInSeconds[interval];
        const aggregate       = AggregateTypes[aggregation];

        if (!Array.isArray(sensors) || !sensors.length || !hourOffset || !intervalSeconds || !aggregate) {
            return res.status(400).json({ success: false, message: 'Invalid request parameters' });
        }
        // Defensive cap, independent of the UI's own 8-item limit — sensors[] is
        // client-supplied and this also keeps every line visually distinct against
        // the fixed 8-color palette.
        sensors = sensors.slice(0, MAX_COMBINED_SENSORS);

        const tuples = sensors.map(s => [s.deviceId, s.slaveId || '', s.tagId]);
        const tuplePlaceholders = tuples.map(() => '(?,?,?)').join(',');
        const tupleParams = tuples.flat();

        const [anchorRows] = await connection.execute(
            `SELECT MAX(dateTime) AS latest FROM sensor_data
             WHERE (deviceId, slaveId, Tag_Id) IN (${tuplePlaceholders}) AND isAggregate = 1`,
            tupleParams
        );
        const anchorTime = anchorRows[0]?.latest || null;

        // None of the selected sensors have ever reported — nothing to compute a
        // meaningful window from.
        if (!anchorTime) {
            return res.status(200).json({ success: true, lines: [], maxValue: 0, data: [] });
        }

        const [rows] = await connection.execute(
            `SELECT deviceId, slaveId, Tag_Id AS tagId, Tag_Name AS tagName,
                    DATE_FORMAT(FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(dateTime) / ?) * ?), '%Y-%m-%d %H:%i:00') AS bucket_start,
                    ${aggregate.val}(${aggregate.col}) AS aggregatedValue
             FROM sensor_data
             WHERE (deviceId, slaveId, Tag_Id) IN (${tuplePlaceholders})
               AND isAggregate = 1
               AND dateTime >= DATE_SUB(?, INTERVAL ? HOUR)
             GROUP BY deviceId, slaveId, Tag_Id, Tag_Name, bucket_start
             ORDER BY bucket_start`,
            [intervalSeconds, intervalSeconds, ...tupleParams, anchorTime, hourOffset]
        );

        // Synthetic, position-based keys (s0, s1, ...) — never a bare device/tag
        // name — so two sensors that happen to share a device name + tag name
        // (or a tag name with characters awkward as an object key) can never
        // silently collide or overwrite each other's values.
        const sensorKey = (s) => `${s.deviceId}|${s.slaveId || ''}|${s.tagId}`;
        const keyByTuple = new Map(sensors.map((s, i) => [sensorKey(s), `s${i}`]));
        const lines = sensors.map((s, i) => ({
            dataKey: `s${i}`,
            name: `${s.deviceName || s.deviceId} / Slave ${s.slaveId || '-'} / ${s.tagName || s.tagId}`,
            stroke: COMBINED_CHART_COLORS[i % COMBINED_CHART_COLORS.length],
        }));

        const byBucket = new Map();
        let maxValue = 0;
        for (const r of rows) {
            const dataKey = keyByTuple.get(`${r.deviceId}|${r.slaveId || ''}|${r.tagId}`);
            if (!dataKey) continue; // defensive — shouldn't happen, tuple came from our own IN list
            const val = r.aggregatedValue === null ? 0 : Number(r.aggregatedValue);
            if (val > maxValue) maxValue = val + 5;
            if (!byBucket.has(r.bucket_start)) byBucket.set(r.bucket_start, { dateTime: r.bucket_start });
            byBucket.get(r.bucket_start)[dataKey] = val.toFixed(2);
        }
        const data = Array.from(byBucket.values()).sort((a, b) => a.dateTime.localeCompare(b.dateTime));

        return res.status(200).json({
            success: true,
            lines,
            maxValue: Math.ceil(maxValue),
            data,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ── POST /api/scada/liveEmit   body: { data: [...] } ──────────────────────────
// Called internally by the cronjob every minute to push live tag values to all
// connected SCADA browser clients via Socket.IO.
exports.liveEmit = (req, res) => {
    const { data } = req.body;
    if (!Array.isArray(data) || !data.length) {
        return res.status(400).json({ success: false, message: 'data array required' });
    }
    if (global.io) {
        global.io.emit('livedata', data);
    }
    return res.status(200).json({ success: true, emitted: data.length });
};
