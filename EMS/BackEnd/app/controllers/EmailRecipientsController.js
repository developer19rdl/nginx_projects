const { connection } = require('../config/dbSql2');

exports.store = async (req, res) => {
    try {
        const { reportId, email } = req.body;

        if (!reportId || !email) {
            return res.status(400).json({ success: false, message: "Report ID and email are required." });
        }

        const storeQuery = `
            INSERT INTO email_recipients (report_id, email, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())`;
        const [result] = await connection.execute(storeQuery, [reportId, email]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Email recipient added successfully.", id: result.insertId });
        } else {
            throw new Error("No rows affected. Insertion failed.");
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred.' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required." });
        }

        const deleteQuery = `DELETE FROM email_recipients WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Email recipient deleted successfully." });
        } else {
            return res.status(404).json({ success: false, message: "No record found with the provided ID." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'An unexpected error occurred.' });
    }
};

exports.show = async (req, res) => {
    try {
        const fetchQuery = `
            SELECT er.*, rs.report_type, rs.execution_time, rs.status
            FROM email_recipients er
            INNER JOIN report_settings rs ON er.report_id = rs.id`;

        const [results] = await connection.execute(fetchQuery);

        return res.status(200).json({
            success: true,
            message: "Email recipients retrieved successfully.",
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "An unexpected error occurred."
        });
    }
};
