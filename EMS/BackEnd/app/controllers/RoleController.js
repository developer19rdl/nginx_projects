const { connection, CustomError } = require('../config/dbSql2.js');

// POST /api/role   body: { roleName, roleDescription }
exports.store = async (req, res) => {
    try {
        const { roleName, roleDescription } = req.body;
        if (!roleName) {
            return res.status(400).json({ success: false, message: 'roleName is required' });
        }

        const [existing] = await connection.execute('SELECT id FROM roles WHERE roleName = ?', [roleName]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Role already exists!' });
        }

        const [result] = await connection.execute(
            'INSERT INTO roles (roleName, roleDescription) VALUES (?, ?)',
            [roleName, roleDescription || null]
        );
        return res.status(201).json({ success: true, message: 'Role added successfully', id: result.insertId });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// PUT /api/role/:id   body: { roleName, roleDescription }
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleName, roleDescription } = req.body;

        const [fRows] = await connection.execute('SELECT id FROM roles WHERE id = ?', [id]);
        if (fRows.length === 0) {
            throw new CustomError('Role not found!', 404);
        }

        const [result] = await connection.execute(
            'UPDATE roles SET roleName = ?, roleDescription = ? WHERE id = ?',
            [roleName, roleDescription || null, id]
        );
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Successfully updated' });
        }
        throw new CustomError('Failed to update role');
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// DELETE /api/role/:id
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const [fRows] = await connection.execute('SELECT id FROM roles WHERE id = ?', [id]);
        if (fRows.length === 0) {
            throw new CustomError('Role not found!', 404);
        }
        // role_module_access row is removed automatically via ON DELETE CASCADE
        await connection.execute('DELETE FROM roles WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Successfully deleted' });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// GET /api/role
exports.show = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            'SELECT id, roleName, roleDescription FROM roles ORDER BY id ASC'
        );
        return res.status(200).json({ success: true, message: 'Role list', data: rows });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
