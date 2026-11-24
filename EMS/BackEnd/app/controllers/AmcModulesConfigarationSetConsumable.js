
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        const storeQuery = ` INSERT INTO  consumable (SelectMachine,ConsumableName,ConsumableType) VALUES
        (?,?,?)`;
        const values = [c.machine_name, c.ConsumableName, c.ConsumableType];

        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "data addded successfully" });
        } else {
            throw new CustomError("Something went wrong!");
        }

    } catch (err) {

        console.log(err)
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occured' });
    }
};



exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT c.*,m.machine_name from   consumable c 
                           INNER JOIN machines m on m.id=c.SelectMachine`;
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



exports.showname = async (req, res) => {
    try {
        const showQuery = `SELECT  id,ConsumableName ,ConsumableType   from  consumable `;
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




exports.showConsubyid = async (req, res) => {
    const { id } = req.params
    try {
        const showQuery = `SELECT * from   consumable where SelectMachine = ?  
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




exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;

        const updateQuery = `
            UPDATE   consumable
            SET 
                SelectMachine = ?, 
                ConsumableName = ?,
                ConsumableType = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.machine_name,
            newData.ConsumableName,
            newData.ConsumableType,
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



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM   consumable WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Record deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

