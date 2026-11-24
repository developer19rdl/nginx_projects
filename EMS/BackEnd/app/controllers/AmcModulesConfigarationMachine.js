
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');
const utility = require('../utility/utilityFunction');



const fs = require('fs');
const path = require('path');

const executionTimeDir = path.join('app/Images');


exports.store = async (req, res) => {
    try {
        const c = req.body;

        const imagePath = utility.storeFile(c.machineImage, 'Images');

        const storeQuery = `
            INSERT INTO machines (
                department_id, machine_name, machine_tag, max_capacity,
                measure_unit_id, is_dashboard_display, isSensorHealth, machineImage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            c.departmentId, 
            c.machineName, 
            c.machineTag, 
            c.maxCapacity || 0,
            c.measureUnitId || null, 
            c.isDashboardDisplay || 'false', 
            c.isSensorHealth || 0, 
            imagePath
        ];

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
        const showQuery = `SELECT m.*, d.departmentName, cm.capacityMeasureType, u.unit FROM machines m
                           LEFT JOIN departments d ON d.id = m.department_id
                           LEFT JOIN capacity_measures cm ON cm.id = m.cap_measure_type_id
                           LEFT JOIN units u ON u.id = m.measure_unit_id
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


exports.showmachine = async (req, res) => {
    const { id } = req.params
    try {
        const showQuery = `SELECT machine_name,id from machines where department_id =?
                          
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



exports.showmachine = async (req, res) => {
    const { id } = req.params
    try {
        const showQuery = `SELECT machine_name,id from machines where department_id =?
                          
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



exports.showmachinename = async (req, res) => {
    const { id } = req.params
    try {
        const showQuery = `SELECT machine_name,id from machines 
                          
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
        const c = req.body;
        const machineId = c.id; // Assuming the machine ID is provided in the request body

        let imagePath;
        if (c.machineImage && c.machineImage !== "") {
            imagePath = utility.storeFile(c.machineImage, 'Images');
        }

        // Prepare the update query
        let updateQuery = `
            UPDATE machines SET 
                department_id = ?, machine_name = ?, machine_tag = ?, cap_measure_type_id = ?, max_capacity = ?, 
                measure_unit_id = ?, loading_time = ?, unloading_time = ?, max_production_per_hour = ?, 
                is_dashboard_display = ?, idleTimeProdCnt = ?, idleTimeEnergyCnt = ?, idlePowerTresh = ?, 
                isSensorHealth = ?, cycleTime = ?
        `;

        const values = [
            c.departmentId, 
            c.machineName, 
            c.machineTag, 
            c.capMeasureTypeId || null, 
            c.maxCapacity || 0,
            c.measureUnitId || null, 
            c.loadingTime || null, 
            c.unloadingTime || null, 
            c.maxProductionPerHour || 0,
            c.isDashboardDisplay || 'false', 
            c.idleTimeProdCnt || null, 
            c.idleTimeEnergyCnt || null, 
            c.idlePowerTresh || null,
            c.isSensorHealth || 0, 
            c.prodCycleTime || null
        ];

        if (imagePath) {
            updateQuery += `, machineImage = ? `;
            values.push(imagePath);
        }

        updateQuery += `WHERE id = ?`;
        values.push(machineId);

        const [sRows] = await connection.execute(updateQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            throw new Error("No rows affected, update failed!");
        }

    } catch (err) {
        console.error(err); // Log the error for debugging purposes
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM machines WHERE id = ?`;
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
