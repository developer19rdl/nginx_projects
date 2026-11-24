
const { connection } = require('../config/dbSql2');

// SMS Wallet — purchase ledger (sms_wallet_purchases) + computed balance against the
// send log (sms_log). Balance is never stored/decremented directly; it's always derived
// from these two tables so it can't drift out of sync (see migration_sms_wallet.sql).

exports.addPackage = async (req, res) => {
    try {
        const { smsCount, note, addedBy } = req.body;
        if (!smsCount || Number(smsCount) <= 0) {
            throw new Error('smsCount must be a positive number');
        }

        const [result] = await connection.execute(
            `INSERT INTO sms_wallet_purchases (smsCount, note, addedBy) VALUES (?, ?, ?)`,
            [Number(smsCount), note || null, addedBy || null]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'SMS package added successfully' });
        }
        throw new Error('Something went wrong');
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.purchaseHistory = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT * FROM sms_wallet_purchases ORDER BY addedAt DESC`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.sendLog = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT * FROM sms_log ORDER BY sentAt DESC LIMIT 500`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.summary = async (req, res) => {
    try {
        const [[purchased]] = await connection.query(
            `SELECT COALESCE(SUM(smsCount), 0) AS total FROM sms_wallet_purchases WHERE status = 'Active'`
        );
        const [[sent]] = await connection.query(
            `SELECT COUNT(*) AS total FROM sms_log WHERE status = 'sent'`
        );
        const [[sentToday]] = await connection.query(
            `SELECT COUNT(*) AS total FROM sms_log WHERE status = 'sent' AND DATE(sentAt) = CURDATE()`
        );

        const totalPurchased = purchased.total || 0;
        const totalSent = sent.total || 0;
        const remaining = totalPurchased - totalSent;

        return res.status(200).json({
            success: true,
            data: {
                totalPurchased,
                totalSent,
                remaining,
                sentToday: sentToday.total || 0,
                exhausted: remaining <= 0,
            },
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
