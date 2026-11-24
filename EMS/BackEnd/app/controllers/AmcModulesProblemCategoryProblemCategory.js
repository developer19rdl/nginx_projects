const { connection, CustomError } = require('../config/dbSql2.js');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const category = req.body;
        // Check if the email already exists
        const [categoryRows, categoryFields] = await connection.execute(`SELECT * FROM problem_category WHERE Category_name = ?`, [category.Category_name]);
        if (categoryRows.length > 0) {
            return res.status(400).json({ success: false, message: "Category Name already exists!" });
        }
        // Modify the query to include the current timestamp
        const storeQuery = 'INSERT INTO problem_category (Category_name, description) VALUES (?, ?)';
        const values = [category.Category_name, category.description];
        const [sRows] = await connection.execute(storeQuery, values);
        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Category Name  added successfully" });
        } else {
            throw new CustomError("Failed to add Category Name ");
        }
    }
    catch (err) {
        console.error("Error in try-catch block:", err);
        return res.status(500).json({ success: false, message: err.message || "An error occurred" });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const category = req.body;
        const [fRows] = await connection.execute(`SELECT * FROM problem_category WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Category Name not found!", 404);
        }
        const updateQuery = `UPDATE problem_category SET Category_name = ?,description = ? WHERE id = ?`;
        const values = [category.Category_name, category.description, id];
        const [uRows] = await connection.execute(updateQuery, values);
        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            throw new CustomError("Failed to update Category");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const [fRows] = await connection.execute(`SELECT * FROM problem_category WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Category not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE from problem_category WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.show = async (req, res) => {
    try {
        const query = `SELECT id,Category_name, description FROM problem_category`;
        const [rows] = await connection.execute(query, []);
        if (rows.length > 0) {
            rows.forEach((element, index) => {
                // element.sNo = index + 1;
            });
            return res.status(200).json({
                success: true,
                message: "Category list",
                data: rows
            });
        } else {
            return res.status(404).json({ success: false, message: "No Operator found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};