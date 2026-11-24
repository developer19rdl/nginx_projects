const { connection } = require('../config/dbSql2');

// ─── Energy Waste Detection ──────────────────────────────────────────────────

exports.wasteStore = async (req, res) => {
    try {
        const { detection_type, asset_name, meter_name, description, detected_value, threshold_value, detection_date, status } = req.body;
        const query = `INSERT INTO energy_waste_detection
            (detection_type, asset_name, meter_name, description, detected_value, threshold_value, detection_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(query, [
            detection_type, asset_name || null, meter_name || null, description || null,
            detected_value || null, threshold_value || null, detection_date || null, status || 'OPEN'
        ]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Energy waste record added successfully' });
        }
        throw new Error('Something went wrong');
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.wasteShow = async (req, res) => {
    try {
        const query = `SELECT id, detection_type, asset_name, meter_name, description,
            detected_value, threshold_value,
            DATE_FORMAT(detection_date, '%Y-%m-%d') AS detection_date,
            status, created_at
            FROM energy_waste_detection ORDER BY created_at DESC`;
        const [rows] = await connection.execute(query);
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.wasteUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { detection_type, asset_name, meter_name, description, detected_value, threshold_value, detection_date, status } = req.body;
        const query = `UPDATE energy_waste_detection SET
            detection_type=?, asset_name=?, meter_name=?, description=?,
            detected_value=?, threshold_value=?, detection_date=?, status=?
            WHERE id=?`;
        const [result] = await connection.execute(query, [
            detection_type, asset_name || null, meter_name || null, description || null,
            detected_value || null, threshold_value || null, detection_date || null, status || 'OPEN', id
        ]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Energy waste record updated successfully' });
        }
        return res.status(404).json({ success: false, message: 'Record not found' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.wasteDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM energy_waste_detection WHERE id=?', [id]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Energy waste record deleted successfully' });
        }
        return res.status(404).json({ success: false, message: 'Record not found' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// ─── Corrective Action Recommendations ──────────────────────────────────────

exports.corrStore = async (req, res) => {
    try {
        const { condition_type, condition_description, recommended_action, asset_name, device_name, priority, status, assigned_to, action_date, energy_saved } = req.body;
        const query = `INSERT INTO energy_saving_corrective_action
            (condition_type, condition_description, recommended_action, asset_name, device_name, priority, status, assigned_to, action_date, energy_saved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(query, [
            condition_type, condition_description || null, recommended_action,
            asset_name || null, device_name || null, priority || 'MEDIUM',
            status || 'PENDING', assigned_to || null, action_date || null, energy_saved || null
        ]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Corrective action added successfully' });
        }
        throw new Error('Something went wrong');
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.corrShow = async (req, res) => {
    try {
        const query = `SELECT id, condition_type, condition_description, recommended_action,
            asset_name, device_name, priority, status, assigned_to,
            DATE_FORMAT(action_date, '%Y-%m-%d') AS action_date,
            energy_saved, created_at
            FROM energy_saving_corrective_action ORDER BY created_at DESC`;
        const [rows] = await connection.execute(query);
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.corrUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { condition_type, condition_description, recommended_action, asset_name, device_name, priority, status, assigned_to, action_date, energy_saved } = req.body;
        const query = `UPDATE energy_saving_corrective_action SET
            condition_type=?, condition_description=?, recommended_action=?,
            asset_name=?, device_name=?, priority=?, status=?, assigned_to=?, action_date=?, energy_saved=?
            WHERE id=?`;
        const [result] = await connection.execute(query, [
            condition_type, condition_description || null, recommended_action,
            asset_name || null, device_name || null, priority || 'MEDIUM',
            status || 'PENDING', assigned_to || null, action_date || null, energy_saved || null, id
        ]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Corrective action updated successfully' });
        }
        return res.status(404).json({ success: false, message: 'Record not found' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.corrDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM energy_saving_corrective_action WHERE id=?', [id]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Corrective action deleted successfully' });
        }
        return res.status(404).json({ success: false, message: 'Record not found' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
