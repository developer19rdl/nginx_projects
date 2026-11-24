const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');
const { request } = require('express');




exports.show = async (req, res) => {
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
        const showQuery = `SELECT m.id,m.machine_name as MachineName FROM assettable a
        INNER JOIN assettype at ON a.AssetType = at.id
        INNER JOIN machines m ON m.id=a.MachineName
        WHERE a.AssetType = ?`;
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


exports.moveAsset = async (req, res) => {
    try {
        const { oldDepartment, oldSection, oldAssetType, oldAssetName, newDepartment, newSection, newAssetType } = req.body;

        // console.log("data", req.body)
        // Update query
        const updateQuery = `
            UPDATE assettable 
            SET Department = ?, Section = ?, AssetType = ? 
            WHERE Department = ? AND Section = ? AND AssetType = ? AND MachineName = ?
        `;

        const [result] = await connection.execute(updateQuery, [newDepartment, newSection, newAssetType, oldDepartment, oldSection, oldAssetType, oldAssetName]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Asset moved successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Asset not found or update failed" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




