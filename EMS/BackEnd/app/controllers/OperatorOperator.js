const { connection, CustomError } = require('../config/dbSql2.js');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const opt = req.body;

        // Check if the email already exists
        const [optRows, optFields] = await connection.execute(`SELECT * FROM operator WHERE operatorName = ?`, [opt.operatorName]);
        if (optRows.length > 0) {
            return res.status(400).json({ success: false, message: "Operator already exists!" });
        }

        // Ensure opt.password is not empty or null and is a string


        // Hash the password
        const hashedPassword = await bcrypt.hash(opt.password, 10);

        // Modify the query to include the current timestamp
        const storeQuery = 'INSERT INTO operator (operatorName, departmentName, operatorId, Password) VALUES (?, ?, ?, ?)';
        const values = [opt.operatorName, opt.departmentName, opt.operatorId, hashedPassword];
        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Operator added successfully" });
        } else {
            throw new CustomError("Failed to add Operator");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const opt = req.body;
        const [fRows] = await connection.execute(`SELECT * FROM operator WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Operator not found!", 404);
        }
        let updateQuery = `UPDATE operator SET operatorName = ?, departmentName = ? ,operatorId =? WHERE id = ?`;
        const values = [opt.operatorName, opt.departmentName, opt.operatorId, id];
        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            throw new CustomError("Failed to update Operator");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const [fRows] = await connection.execute(`SELECT * FROM operator WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Operator not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE from operator WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
exports.show = async (req, res) => {
    try {
        const query = `SELECT id,operatorName, departmentName, operatorId FROM operator`;
        const [rows] = await connection.execute(query, []);
        if (rows.length > 0) {
            rows.forEach((element, index) => {
                element.sNo = index + 1;
            });
            return res.status(200).json({
                success: true,
                message: "Operator list",
                data: rows
            });
        } else {
            return res.status(404).json({ success: false, message: "No Operator found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};