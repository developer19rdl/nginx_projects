const { connection } = require('../config/dbSql2');

// Single shared row for the whole install — same "shared view, same for every
// user" convention as scada_tabs/scada_tables (see ScadaController.js) — the
// Plant Overview consumption panel has no per-tab/per-user concept, just one
// admin-managed tree + water list.

// POST /api/plantConsumptionConfig/showData
exports.show = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            'SELECT id, configJson FROM plant_consumption_config ORDER BY id DESC LIMIT 1'
        );
        if (!rows.length) {
            return res.status(200).json({ success: true, data: null });
        }
        let config = null;
        try { config = JSON.parse(rows[0].configJson); } catch { config = null; }
        return res.status(200).json({ success: true, data: config, id: rows[0].id });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// POST /api/plantConsumptionConfig/save   body: { userId, config }
exports.save = async (req, res) => {
    try {
        const { userId, config } = req.body;
        const configJson = typeof config === 'string' ? config : JSON.stringify(config);

        const [existing] = await connection.execute(
            'SELECT id FROM plant_consumption_config ORDER BY id DESC LIMIT 1'
        );
        if (existing.length) {
            await connection.execute(
                'UPDATE plant_consumption_config SET configJson = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [configJson, existing[0].id]
            );
            return res.status(200).json({ success: true, message: 'Config updated', id: existing[0].id });
        }
        const [result] = await connection.execute(
            'INSERT INTO plant_consumption_config (userId, configJson) VALUES (?, ?)',
            [userId || null, configJson]
        );
        return res.status(201).json({ success: true, message: 'Config saved', id: result.insertId });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
