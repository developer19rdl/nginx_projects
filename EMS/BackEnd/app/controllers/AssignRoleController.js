const { connection, CustomError } = require('../config/dbSql2.js');

// POST /api/assignRole   body: { roleId, moduleList: [...] }
// One row per role — upserts if the role already has an assignment.
exports.store = async (req, res) => {
    try {
        const { roleId, moduleList } = req.body;
        if (!roleId || !Array.isArray(moduleList)) {
            return res.status(400).json({ success: false, message: 'roleId and moduleList are required' });
        }

        const moduleListJson = JSON.stringify(moduleList);

        const [existing] = await connection.execute('SELECT id FROM role_module_access WHERE roleId = ?', [roleId]);
        if (existing.length > 0) {
            await connection.execute(
                'UPDATE role_module_access SET moduleList = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [moduleListJson, existing[0].id]
            );
            return res.status(200).json({ success: true, message: 'Assign role updated', id: existing[0].id });
        }

        const [result] = await connection.execute(
            'INSERT INTO role_module_access (roleId, moduleList) VALUES (?, ?)',
            [roleId, moduleListJson]
        );
        return res.status(201).json({ success: true, message: 'Assign role created', id: result.insertId });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// PUT /api/assignRole/:id   body: { roleId, moduleList: [...] }
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleId, moduleList } = req.body;
        if (!roleId || !Array.isArray(moduleList)) {
            return res.status(400).json({ success: false, message: 'roleId and moduleList are required' });
        }

        const [fRows] = await connection.execute('SELECT id FROM role_module_access WHERE id = ?', [id]);
        if (fRows.length === 0) {
            throw new CustomError('Assign role not found!', 404);
        }

        const [result] = await connection.execute(
            'UPDATE role_module_access SET roleId = ?, moduleList = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [roleId, JSON.stringify(moduleList), id]
        );
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Successfully updated' });
        }
        throw new CustomError('Failed to update assign role');
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// DELETE /api/assignRole/:id
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const [fRows] = await connection.execute('SELECT id FROM role_module_access WHERE id = ?', [id]);
        if (fRows.length === 0) {
            throw new CustomError('Assign role not found!', 404);
        }
        await connection.execute('DELETE FROM role_module_access WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Successfully deleted' });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// GET /api/assignRole — list every role's assignment, joined with role name
exports.show = async (req, res) => {
    try {
        const showQuery = `
            SELECT rma.id, rma.roleId, r.roleName, rma.moduleList
            FROM role_module_access rma
            INNER JOIN roles r ON r.id = rma.roleId
            ORDER BY rma.id ASC
        `;
        const [rows] = await connection.execute(showQuery);
        const data = rows.map((row) => ({
            ...row,
            moduleList: JSON.parse(row.moduleList || '[]'),
        }));
        return res.status(200).json({ success: true, message: 'Assign role list', data });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

// GET /api/assignRole/byRole/:roleName — module list for one role.
// Used by the sidebar to decide which menu items the logged-in user's role can see.
exports.showByRole = async (req, res) => {
    try {
        const { roleName } = req.params;
        const [rows] = await connection.execute(
            `SELECT rma.moduleList
             FROM role_module_access rma
             INNER JOIN roles r ON r.id = rma.roleId
             WHERE r.roleName = ?`,
            [roleName]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No module access assigned for this role', data: [] });
        }
        return res.status(200).json({ success: true, data: JSON.parse(rows[0].moduleList || '[]') });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
