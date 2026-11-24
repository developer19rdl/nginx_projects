const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;

        // Check if section already exists
        const checkQuery = `SELECT COUNT(*) AS count FROM sectiontable WHERE Section = ?`;
        const [checkRows] = await connection.execute(checkQuery, [c.Section]);

        if (checkRows[0].count > 0) {
            return res.status(409).json({ success: false, message: "Section already exists" });
        }

        // If section does not exist, insert the new record
        const storeQuery = `INSERT INTO sectiontable (Section, Department) VALUES (?, ?)`;
        const values = [c.Section, c.Department];

        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data added successfully" });
        } else {
            throw new Error("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.show = async (req, res) => {
    try {
        const viewQuery = `SELECT s.*,d.departmentName as dname FROM sectiontable s 
                           INNER JOIN departments d on d.id=s.Department`;
        const [rows] = await connection.execute(viewQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM sectiontable WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Section deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;

        const updateQuery = `
            UPDATE sectiontable 
            SET 
                Section = ?, 
                Department = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.Section,
            newData.Department,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Section updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.searchBySection = async (req, res) => {
    try {
        const { d } = req.query;

        const searchQuery = `
            SELECT * 
            FROM sectiontable 
            WHERE Section LIKE ?
        `;
        const values = [`%${d}%`];

        const [rows] = await connection.execute(searchQuery, values);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No sectiontables found matching the search criteria" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.showdep = async (req, res) => {
    try {
        const viewQuery = `SELECT * FROM department`;
        const [rows] = await connection.execute(viewQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


