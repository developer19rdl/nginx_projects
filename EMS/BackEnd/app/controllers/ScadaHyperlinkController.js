const { connection } = require('../config/dbSql2');

// POST /api/scadaHyperlink/save   body: { userId, tabIndex, x1, y1, x2, y2, targetTabIndex, label, module? }
// module defaults to 'scada' (SCADA Dashboard); Plant Overview passes
// module: 'plantOverview' so its hotspot areas stay separate.
exports.saveHyperlink = async (req, res) => {
    try {
        const { userId, tabIndex, x1, y1, x2, y2, targetTabIndex, label, module } = req.body;
        const mod = module || 'scada';
        const [result] = await connection.execute(
            'INSERT INTO scada_hyperlinks (userId, module, tabIndex, x1, y1, x2, y2, targetTabIndex, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, mod, tabIndex, x1, y1, x2, y2, targetTabIndex, label || null]
        );
        return res.status(201).json({ success: true, message: 'Hyperlink saved', id: result.insertId });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/scadaHyperlink/showData — shared view, same for every user
// body: { userId, module? }
exports.showHyperlinks = async (req, res) => {
    try {
        const mod = req.body?.module || 'scada';
        const [rows] = await connection.execute(
            'SELECT id, tabIndex, x1, y1, x2, y2, targetTabIndex, label FROM scada_hyperlinks WHERE module = ? ORDER BY tabIndex ASC, id ASC',
            [mod]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/scadaHyperlink/:id/delete
exports.deleteHyperlink = async (req, res) => {
    try {
        const { id } = req.params;
        await connection.execute('DELETE FROM scada_hyperlinks WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Hyperlink deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
