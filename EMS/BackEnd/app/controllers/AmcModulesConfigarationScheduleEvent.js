
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        const storeQuery = ` INSERT INTO   scheduleevent (Type ,fromDate,todate,Department ,EventType,Machine) VALUES
        (? ,?,?,? ,?,?)`;
        const values = [c.Type, c.fromDate, c.todate, c.Department, c.EventType, c.Machine];

        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "data addded successfully" });
        } else {
            throw new CustomError("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occured' });
    }
};



exports.show = async (req, res) => {
    try {
        const showQuery = `
            SELECT 
                s.*, 
                d.departmentName as dname, 
                COALESCE(m.machine_name, 'null') as mname 
            FROM 
                scheduleevent s 
            INNER JOIN 
                departments d 
            ON 
                d.id = s.Department
            LEFT JOIN 
                machines m 
            ON 
                m.id = s.Machine
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
        const c = req.body;
        const updateQuery = `
            UPDATE  scheduleevent 
            SET 
                Type = ?, 
                fromDate = ?, 
                todate = ?, 
                Department = ?, 
                EventType = ?, 
                Machine = ?
            WHERE 
                id = ?
        `;
        const values = [
            c.Type,
            c.fromDate,
            c.todate,
            c.Department,
            c.EventType,
            c.Machine,
            id// Assuming machine_id is included in the request body for identifying the record to update
        ];

        const [sRows] = await connection.execute(updateQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            throw new Error("No rows affected, update failed!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM  scheduleevent WHERE id = ?`;
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

