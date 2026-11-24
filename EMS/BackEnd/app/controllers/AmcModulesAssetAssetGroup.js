const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;

        // Check if asset group already exists
        const checkQuery = `SELECT COUNT(*) AS count FROM assetgroup WHERE GroupName = ?`;
        const [checkRows] = await connection.execute(checkQuery, [c.GroupName]);

        if (checkRows[0].count > 0) {
            return res.status(409).json({ success: false, message: "Asset group already exists" });
        }

        // If asset group does not exist, insert the new record
        const storeQuery = `INSERT INTO assetgroup (GroupName, Description) VALUES (?, ?)`;
        const values = [c.GroupName, c.Description];

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
        const viewQuery = `SELECT * FROM  assetgroup`;
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

        const deleteQuery = `DELETE FROM  assetgroup WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "GroupName deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "GroupName not found" });
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
            UPDATE  assetgroup 
            SET 
                GroupName = ?, 
                Description = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.GroupName,
            newData.Description,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "GroupName updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "GroupName not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.searchByAssetGroup = async (req, res) => {
    try {
        const { d } = req.query;

        const searchQuery = `
            SELECT * 
            FROM  assetgroup 
            WHERE GroupName LIKE ?
        `;
        const values = [`%${d}%`];

        const [rows] = await connection.execute(searchQuery, values);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No  assetgroups found matching the search criteria" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
