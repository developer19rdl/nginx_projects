
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');




exports.showdep = async (req, res) => {
    try {
        const viewQuery = `SELECT * FROM departments`;
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






exports.showSection = async (req, res) => {
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





exports.showAssetType = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `SELECT a.id,a.AssetTypeView FROM assettype a INNER JOIN sectiontable s ON s.id = a.Section 
        WHERE s.id = ? `;
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



exports.showAssetName = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `SELECT a.id,a.MachineName FROM assettable a INNER JOIN assettype at ON a.AssetType = at.id 
        WHERE at.id = ? `;
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




exports.showData = async (req, res) => {
    try {
        const newData = req.body;
        const showQuery = `SELECT * FROM amctable WHERE Department=? OR Section=? OR AssetType=? OR AssetName=?`;

        const values = [
            newData.Department,
            newData.Section,
            newData.AssetType,
            newData.AssetName
        ];
        const [rows] = await connection.execute(showQuery, values);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
}; 