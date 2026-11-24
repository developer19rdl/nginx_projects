
const { connection, CustomError } = require('../config/dbSql2');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const Dept = req.body;
        // Check if the email already exists
        const [DeptRows, DeptFields] = await connection.execute(`SELECT * FROM departments WHERE departmentName = ?`, [Dept.departmentName]);
        if (DeptRows.length > 0) {
            return res.status(400).json({ success: false, message: "Department already exists!" });
        }

        // Modify the query to include the current timestamp
        const storeQuery = 'INSERT INTO departments (departmentName, departmentDescription) VALUES (?, ?)';
        const values = [Dept.departmentName, Dept.departmentDescription];
        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Department added successfully" });
        } else {
            throw new CustomError("Failed to add Department");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const Dept = req.body;
        const [fRows] = await connection.execute(`SELECT * FROM departments WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Department not found!", 404);
        }
        let updateQuery = `UPDATE departments SET departmentName = ?, departmentDescription = ? WHERE id = ?`;
        const values = [Dept.departmentName, Dept.departmentDescription, id];
        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            throw new CustomError("Failed to update Department");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id===============================================", id)
        const [fRows] = await connection.execute(`SELECT * FROM departments WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Department not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE from departments WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
exports.show = async (req, res) => {
    try {
        const query = `SELECT * FROM departments`;
        const [rows] = await connection.execute(query, []);
        if (rows.length > 0) {
            rows.forEach((element, index) => {
                element.sNo = index + 1;
            });
            return res.status(200).json({
                success: true,
                message: "Department list",
                data: rows
            });
        } else {
            return res.status(404).json({ success: false, message: "No Department found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};