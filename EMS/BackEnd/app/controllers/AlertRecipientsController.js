
const { connection } = require('../config/dbSql2');

// Alert recipients CRUD — who gets Email/SMS alerts, assignable per meter type.
// Consumed by Cronjob/app/utility/alertNotifier.js (getAlertRecipients).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalize = (body) => {
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').replace(/\D/g, ''); // digits only
    const meterTypes = Array.isArray(body.meterTypes)
        ? [...new Set(body.meterTypes.map((t) => String(t).trim()).filter(Boolean))]
        : [];

    if (!name) throw new Error('Name is required');
    if (!email && !phone) throw new Error('Enter an email, a phone number, or both');
    if (email && !EMAIL_RE.test(email)) throw new Error('Invalid email address');
    if (phone && (phone.length < 10 || phone.length > 15)) throw new Error('Phone number must be 10-15 digits');

    return {
        name,
        email: email || null,
        phone: phone || null,
        emailEnabled: body.emailEnabled === false || body.emailEnabled === 0 ? 0 : 1,
        smsEnabled: body.smsEnabled === false || body.smsEnabled === 0 ? 0 : 1,
        status: body.status === false || body.status === 0 ? 0 : 1,
        meterTypes,
    };
};

const saveMeterTypes = async (recipientId, meterTypes) => {
    await connection.execute(`DELETE FROM alert_recipient_meter_types WHERE recipientId = ?`, [recipientId]);
    for (const meterType of meterTypes) {
        await connection.execute(
            `INSERT INTO alert_recipient_meter_types (recipientId, meterType) VALUES (?, ?)`,
            [recipientId, meterType]
        );
    }
};

exports.show = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT r.*, GROUP_CONCAT(t.meterType ORDER BY t.meterType SEPARATOR ',') AS meterTypes
             FROM alert_recipients r
             LEFT JOIN alert_recipient_meter_types t ON t.recipientId = r.id
             GROUP BY r.id
             ORDER BY r.name`
        );
        const data = rows.map((r) => ({ ...r, meterTypes: r.meterTypes ? r.meterTypes.split(',') : [] }));
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.store = async (req, res) => {
    try {
        const c = normalize(req.body);
        const [result] = await connection.execute(
            `INSERT INTO alert_recipients (name, email, phone, emailEnabled, smsEnabled, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [c.name, c.email, c.phone, c.emailEnabled, c.smsEnabled, c.status]
        );
        await saveMeterTypes(result.insertId, c.meterTypes);
        return res.status(200).json({ success: true, message: 'Recipient added successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const c = normalize(req.body);
        const [result] = await connection.execute(
            `UPDATE alert_recipients
             SET name = ?, email = ?, phone = ?, emailEnabled = ?, smsEnabled = ?, status = ?
             WHERE id = ?`,
            [c.name, c.email, c.phone, c.emailEnabled, c.smsEnabled, c.status, id]
        );
        if (result.affectedRows === 0) throw new Error('Recipient not found');
        await saveMeterTypes(id, c.meterTypes);
        return res.status(200).json({ success: true, message: 'Recipient updated successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await connection.execute(`DELETE FROM alert_recipients WHERE id = ?`, [id]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Deleted Successfully!' });
        }
        return res.status(404).json({ success: false, message: 'Recipient not found' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
