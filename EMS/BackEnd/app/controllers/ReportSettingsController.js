const { connection } = require('../config/dbSql2');

// Modules that get their own daily/weekly/monthly schedule rows in
// report_settings. Keep in sync with the Configuration screens that read
// this API (Energy Report Email, Water Report Email).
const REPORT_MODULES = ['energy', 'water'];

// The three schedule rows (daily/weekly/monthly) always exist per module —
// seed them if this is the first time a Configuration screen is opened.
exports.show = async (req, res) => {
    try {
        const moduleName = REPORT_MODULES.includes(req.query.module) ? req.query.module : 'energy';

        await connection.execute(
            `INSERT IGNORE INTO report_settings (module, report_type, execution_time, status) VALUES
             (?, 'daily', '07:00:00', 0), (?, 'weekly', '07:00:00', 0), (?, 'monthly', '07:00:00', 0)`,
            [moduleName, moduleName, moduleName]
        );

        const [rows] = await connection.execute(
            `SELECT * FROM report_settings WHERE module = ? ORDER BY FIELD(report_type, 'daily', 'weekly', 'monthly')`,
            [moduleName]
        );

        return res.status(200).json({
            success: true,
            message: "Report settings retrieved successfully.",
            data: rows,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred.' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { executionTime, status, granularity, cycleHours, monthStartDay } = req.body;

        if (!id || !executionTime) {
            return res.status(400).json({ success: false, message: "ID and execution time are required." });
        }

        const [existingRows] = await connection.execute('SELECT * FROM report_settings WHERE id = ?', [id]);
        const existing = existingRows[0];
        if (!existing) {
            return res.status(404).json({ success: false, message: "Report setting not found." });
        }

        // granularity/cycle_hours/month_start_day only apply to certain
        // report types — trust the stored report_type, not the client, to
        // decide which fields are meaningful. Fall back to hard defaults
        // (not just the existing row) in case those columns predate the
        // migration that added them and come back undefined.
        const finalGranularity = existing.report_type === 'monthly'
            ? 'day'
            : ((granularity === 'hour' || granularity === 'day') ? granularity : (existing.granularity || 'day'));

        const finalCycleHours = existing.report_type === 'daily'
            ? (cycleHours ?? existing.cycle_hours ?? 24)
            : (existing.cycle_hours ?? 24);

        if (existing.report_type === 'daily' && 24 % finalCycleHours !== 0) {
            return res.status(400).json({
                success: false,
                message: `Cycle length must evenly divide into 24 hours (1, 2, 3, 4, 6, 8, 12, or 24). Received: ${finalCycleHours}.`,
            });
        }

        const finalMonthStartDay = existing.report_type === 'monthly'
            ? (monthStartDay ?? existing.month_start_day ?? 1)
            : (existing.month_start_day ?? 1);

        if (existing.report_type === 'monthly' && (finalMonthStartDay < 1 || finalMonthStartDay > 28)) {
            return res.status(400).json({ success: false, message: "Month start day must be between 1 and 28." });
        }

        const updateQuery = `
            UPDATE report_settings
            SET execution_time = ?, status = ?, granularity = ?, cycle_hours = ?, month_start_day = ?, updated_at = NOW()
            WHERE id = ?`;
        const [result] = await connection.execute(updateQuery, [
            executionTime,
            status ? 1 : 0,
            finalGranularity,
            finalCycleHours,
            finalMonthStartDay,
            id,
        ]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Report setting updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Report setting not found." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred.' });
    }
};
