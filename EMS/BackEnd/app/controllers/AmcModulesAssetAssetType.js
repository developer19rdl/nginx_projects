const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;

        // Check if AssetTypeView already exists
        const checkQuery = `SELECT COUNT(*) AS count FROM assettype WHERE AssetTypeView = ?`;
        const [checkRows] = await connection.execute(checkQuery, [c.AssetTypeView]);

        if (checkRows[0].count > 0) {
            return res.status(409).json({ success: false, message: "Asset type view already exists" });
        }

        // If AssetTypeView does not exist, insert the new record
        const storeQuery = `INSERT INTO assettype (Department, Section, AssetTypeView) VALUES (?, ?, ?)`;
        const values = [c.Department, c.Section, c.AssetTypeView];

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
        const showQuery = `SELECT a.Department,a.Section,d.departmentName as dname,s.Section as sname,a.id,a.AssetTypeView FROM assettype a 
        INNER JOIN departments d on d.id=a.Department 
        INNER JOIN sectiontable s on s.id=a.Section `;
        const [rows] = await connection.execute(showQuery);

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

        const deleteQuery = `DELETE FROM assettype WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
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
            UPDATE assettype 
            SET 
                Department = ?, 
                AssetTypeView = ?,
                Section =?
            WHERE 
                id = ?
        `;
        const values = [
            newData.Department,
            newData.AssetTypeView,
            newData.Section,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.search = async (req, res) => {
    try {
        const { d } = req.query;

        let searchQuery = `
            SELECT id, AssetTypeView AS label 
            FROM assettype 
            WHERE Department LIKE ?
        `;
        const values = [`%${d}%`];

        const [rows] = await connection.execute(searchQuery, values);

        return res.status(200).json({ success: true, message: "Asset Types", data: rows });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};


exports.showsection = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `
            SELECT s.id, s.Section 
            FROM sectiontable s 
            INNER JOIN departments d ON d.id = s.Department
            WHERE d.id = ?
        `;
        const [rows] = await connection.execute(showQuery, [id]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

