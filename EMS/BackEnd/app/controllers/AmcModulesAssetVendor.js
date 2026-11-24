const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');



exports.store = async (req, res) => {
    try {
        const c = req.body;

        // Check if the combination of VendorName and Email already exists
        const checkQuery = `SELECT COUNT(*) AS count FROM vendormst WHERE VendorName = ? AND Email = ?`;
        const [checkRows] = await connection.execute(checkQuery, [c.VendorName, c.Email]);

        if (checkRows[0].count > 0) {
            return res.status(409).json({ success: false, message: "Vendor with this name and email already exists" });
        }

        // If the combination does not exist, insert the new record
        const storeQuery = `INSERT INTO vendormst (VendorName, Address, Email, ContactNo, ContactPerson) VALUES (?, ?, ?, ?, ?)`;
        const values = [c.VendorName, c.Address, c.Email, c.ContactNo, c.ContactPerson];

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

exports.showAllVendors = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM vendormst`;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No vendors found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.deleteVendorById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM vendormst WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Vendor deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.updateVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;

        const updateQuery = `
            UPDATE vendormst 
            SET 
                VendorName = ?, 
                Address = ?, 
                Email = ?, 
                ContactNo = ?, 
                ContactPerson = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.VendorName,
            newData.Address,
            newData.Email,
            newData.ContactNo,
            newData.ContactPerson,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Vendor updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.searchVendorsByName = async (req, res) => {
    try {
        const { n } = req.query;

        const searchQuery = `
            SELECT * 
            FROM vendormst 
            WHERE VendorName LIKE ?
        `;
        const values = [`%${n}%`];

        const [rows] = await connection.execute(searchQuery, values);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No vendors found matching the search criteria" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
