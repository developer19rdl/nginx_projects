
const { connection } = require('../config/dbSql2');

// SMS gateway configuration CRUD — same shape/role as AlertController.js's
// alertSettingApi/alertSettingApiUpdate/alertSettingApiShow (SMTP config), but for
// sms_settings. Consumed at send time by Cronjob/app/config/smsService.js (DB row
// first, .env fallback — same pattern as emailService.js's getMailAccount()).

exports.smsSettingApi = async (req, res) => {
    try {
        const { provider, gatewayUrl, apiKey, senderId, route } = req.body;

        const insertQuery = `
            INSERT INTO sms_settings (provider, gatewayUrl, apiKey, senderId, route)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [provider || null, gatewayUrl, apiKey, senderId || null, route || null];
        const [insertResult] = await connection.execute(insertQuery, values);

        if (insertResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Successfully added' });
        } else {
            throw new Error('Something went wrong!');
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.smsSettingApiUpdate = async (req, res) => {
    try {
        const { provider, gatewayUrl, apiKey, senderId, route } = req.body;
        const { id } = req.params;

        const [existing] = await connection.execute(`SELECT * FROM sms_settings WHERE id = ?`, [id]);
        if (existing.length === 0) {
            throw new Error('SMS settings not found');
        }

        const updateQuery = `
            UPDATE sms_settings
            SET provider = ?, gatewayUrl = ?, apiKey = ?, senderId = ?, route = ?
            WHERE id = ?
        `;
        const values = [provider || null, gatewayUrl, apiKey, senderId || null, route || null, id];
        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'SMS configuration updated successfully' });
        } else {
            throw new Error('Update failed, no rows affected');
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await connection.execute(`DELETE FROM sms_settings WHERE id = ?`, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Deleted Successfully!' });
        } else {
            return res.status(404).json({ success: false, message: 'SMS settings not found' });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.smsSettingApiShow = async (req, res) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM sms_settings ORDER BY id DESC`);
        return res.status(200).json({ success: true, message: 'SMS Setting Api Show Lists', data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
