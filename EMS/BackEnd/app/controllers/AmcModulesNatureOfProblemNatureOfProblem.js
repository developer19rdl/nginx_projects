const { connection, CustomError } = require('../config/dbSql2.js');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const natureprob = req.body;
        const storeQuery = 'INSERT INTO nature_problem (Category_name,Nature_problem,description) VALUES (?, ?,?)';
        const values = [natureprob.Category_name, natureprob.Nature_problem, natureprob.description];
        const [sRows] = await connection.execute(storeQuery, values);
        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Nature Problem  added successfully" });
        } else {
            throw new CustomError("Failed to add Nature Problem ");
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
        const natureprob = req.body;
        const [fRows] = await connection.execute(`SELECT * FROM nature_problem WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Nature Problem  not found!", 404);
        }
        const updateQuery = `UPDATE nature_problem SET Category_name = ?,Nature_problem = ?,description = ? WHERE id = ?`;
        const values = [natureprob.Category_name, natureprob.Nature_problem, natureprob.description, id];
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
        const [fRows] = await connection.execute(`SELECT * FROM nature_problem WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Nature Problem  not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE from nature_problem WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.show = async (req, res) => {
    try {
        const query = `SELECT n.id, n.Category_name, n.Nature_problem, n.description,p.Category_name as CName  FROM nature_problem n
                        INNER JOIN problem_category p on p.id=n.Category_name`;
        const [rows] = await connection.execute(query, []);
        if (rows.length > 0) {
            rows.forEach((element, index) => {
                // Uncomment if you need to add a serial number
                element.sNo = index + 1;
            });
            return res.status(200).json({
                success: true,
                message: "Nature prob list",
                data: rows
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No Nature Problem found"
            });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred'
        });
    }
};



exports.showbyId = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `SELECT n.id, n.Nature_problem  FROM nature_problem n where Category_name =?`;

        const [rows] = await connection.execute(query, [id]);
        if (rows.length > 0) {
            rows.forEach((element, index) => {
                // Uncomment if you need to add a serial number
                element.sNo = index + 1;
            });
            return res.status(200).json({
                success: true,
                message: "Nature prob list",
                data: rows
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No Nature Problem found"
            });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'An error occurred'
        });
    }
};
