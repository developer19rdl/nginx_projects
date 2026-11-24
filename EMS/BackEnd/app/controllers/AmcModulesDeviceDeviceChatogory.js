
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');





exports.store = async (req, res) => {
  try {
    const c = req.body;

    const companyCode = req.headers.companycode;
    const storeQuery = `INSERT INTO device_categories (companyCode, deviceCategory, description)
                          VALUES (?, ?, ?)`;
    const values = [companyCode, c.deviceCategory, c.description];

    const [result] = await connection.execute(storeQuery, values);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Data added successfully" });
    } else {
      throw new Error("Something went wrong!");
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};



exports.update = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the ID of the record to be updated is passed in the URL params
    const { deviceCategory, description } = req.body;

    const updateQuery = `UPDATE device_categories SET deviceCategory = ?, description = ? WHERE id = ?`;
    const values = [deviceCategory, description, id];

    const [result] = await connection.execute(updateQuery, values);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Data updated successfully" });
    } else {
      throw new Error("Record not found or no changes made");
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};



exports.delete = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the ID of the record to be deleted is passed in the URL params

    const deleteQuery = `DELETE FROM device_categories WHERE id = ?`;
    const [result] = await connection.execute(deleteQuery, [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Record deleted successfully" });
    } else {
      throw new Error("Record not found");
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};


exports.showAll = async (req, res) => {
  try {
    const selectQuery = `SELECT * FROM device_categories`;
    const [rows] = await connection.execute(selectQuery);

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

