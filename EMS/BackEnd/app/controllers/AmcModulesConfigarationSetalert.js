
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        console.log("c=====", c)
        const storeQuery = ` INSERT INTO  setalert (SelectMachine,SensorCModule,Units,FilterType,min,max,AlertMessage,ConsumName,ConsumType,DateFrom,Dateto,RunHours) VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?)`;
        const values = [c.SelectMachine, c.SensorCModule, c.Units, c.FilterType, c.min, c.max, c.AlertMessage, c.ConsumName, c.ConsumType, c.DateFrom, c.Dateto, c.RunHours];

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
        const showQuery = `
            SELECT sa.*, m.machine_name
            FROM setalert sa
            INNER JOIN machines m ON sa.SelectMachine = m.id
        `;
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


exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;
        // console.log("newData=", newData)

        const updateQuery = `
            UPDATE   setalert
            SET SelectMachine = ?,SensorCModule = ?,Units = ?,FilterType = ?,min= ?,max=?,AlertMessage = ?,ConsumName = ?,ConsumType = ?,DateFrom = ?,Dateto = ?,RunHours = ?  WHERE id = ?
        `;
        const values = [
            newData.SelectMachine, newData.SensorCModule, newData.Units, newData.FilterType, newData.min, newData.max, newData.AlertMessage, newData.ConsumName, newData.ConsumType, newData.DateFrom, newData.Dateto, newData.RunHours,
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

        const deleteQuery = `DELETE FROM   setalert WHERE id = ?`;
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




exports.showsensor = async (req, res) => {
    try {
        const showQuery = `SELECT * from  addsensor`;
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
