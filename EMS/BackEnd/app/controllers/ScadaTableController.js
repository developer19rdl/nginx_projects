const { connection } = require('../config/dbSql2');

// POST /api/scadaTable/save   body: { userId, tabIndex, tableConfig, module? }
// module defaults to 'scada' (SCADA Dashboard); Plant Overview passes
// module: 'plantOverview' so its table configs stay separate.
exports.saveTable = async (req, res) => {
    try {
        const { userId, tabIndex, tableConfig, module } = req.body;
        const mod = module || 'scada';
        const configJson = typeof tableConfig === 'string' ? tableConfig : JSON.stringify(tableConfig);

        const [existing] = await connection.execute(
            'SELECT id FROM scada_tables WHERE tabIndex = ? AND module = ?',
            [tabIndex, mod]
        );
        if (existing.length) {
            await connection.execute(
                'UPDATE scada_tables SET tableConfig = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [configJson, existing[0].id]
            );
            return res.status(200).json({ success: true, message: 'Table config updated', id: existing[0].id });
        }
        const [result] = await connection.execute(
            'INSERT INTO scada_tables (userId, module, tabIndex, tableConfig) VALUES (?, ?, ?, ?)',
            [userId, mod, tabIndex, configJson]
        );
        return res.status(201).json({ success: true, message: 'Table config saved', id: result.insertId });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/scadaTable/showData — shared view, same for every user
// Also returns `liveSnapshot` — the last known value (from live_tag_snapshot) for every
// sensor bound to a table cell, so the table can render real values immediately on open
// instead of blanks, before the first Socket.IO "livedata" push arrives. `liveSnapshotUpdatedAt`
// is a parallel map (same tag_id keys) of when each of those values was actually last written,
// kept separate from `liveSnapshot` so every existing consumer that treats liveSnapshot/liveData
// values as plain scalars keeps working unchanged.
exports.showTables = async (req, res) => {
    try {
        const mod = req.body?.module || 'scada';
        const [rows] = await connection.execute(
            'SELECT id, tabIndex, tableConfig FROM scada_tables WHERE module = ? ORDER BY tabIndex ASC',
            [mod]
        );

        const tagIds = new Set();
        // Pulls tagKey (single-sensor widgets) and combinedSensors (Cycling
        // Badge / Multiple Cards) out of one widget-shaped object — used both
        // for a legacy flat binding (which IS one widget) and for each entry
        // in a current binding's `widgets` list (a cell can stack several).
        const collectWidgetTagIds = (widget) => {
            if (!widget) return;
            if (widget.tagKey !== undefined && widget.tagKey !== null) tagIds.add(widget.tagKey);
            (widget.combinedSensors || []).forEach((s) => {
                if (s?.tagId !== undefined && s.tagId !== null) tagIds.add(s.tagId);
            });
        };
        rows.forEach((row) => {
            try {
                const config = JSON.parse(row.tableConfig);
                Object.values(config?.cellBindings || {}).forEach((binding) => {
                    if (Array.isArray(binding?.widgets)) {
                        binding.widgets.forEach(collectWidgetTagIds);
                    } else {
                        collectWidgetTagIds(binding);
                    }
                });
            } catch {
                // malformed tableConfig JSON — skip, saveTable already validates on write
            }
        });

        let liveSnapshot = {};
        let liveSnapshotUpdatedAt = {};
        if (tagIds.size) {
            const idList = [...tagIds];
            const placeholders = idList.map(() => '?').join(',');
            const [snapRows] = await connection.execute(
                `SELECT tag_id, value, updated_at FROM live_tag_snapshot WHERE tag_id IN (${placeholders})`,
                idList
            );
            snapRows.forEach((r) => {
                liveSnapshot[r.tag_id] = r.value;
                liveSnapshotUpdatedAt[r.tag_id] = r.updated_at;
            });
        }

        return res.status(200).json({ success: true, data: rows, liveSnapshot, liveSnapshotUpdatedAt });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/scadaTable/:id/delete
exports.deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        await connection.execute('DELETE FROM scada_tables WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Table config deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
