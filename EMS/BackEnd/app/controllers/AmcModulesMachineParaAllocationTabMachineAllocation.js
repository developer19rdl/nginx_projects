
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');
const excel = require('exceljs');
const utility = require('../utility/utilityFunction');


exports.store = async (req, res) => {
    try {
        const c = req.body;

        // Check if the machine parameter allocation already exists
        const checkQuery = `
            SELECT * FROM machine_parameter_allocation
            WHERE machineId = ? AND deviceId = ? AND slaveId = ? AND Tag_Id = ?
        `;
        const [machineAllocation] = await connection.execute(checkQuery, [c.machineId, c.deviceId, c.slaveId, c.Tag_Id]);

        if (machineAllocation.length > 0) {
            throw new Error(`${c.tagId} Tag Id is already deployed for device`);
        }

        // Insert new machine parameter allocation
        const storeQuery = `
            INSERT INTO machine_parameter_allocation (
                machineId, deviceCategoryId, deviceId, slaveId, Tag_Id, Tag_Name, functionName,
                function, isProdCapacity, isSensor, chartNumber, tagDescription
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            c.machineId, c.deviceCategoryId, c.deviceId, c.slaveId, c.Tag_Id, c.Tag_Name,
            c.functionName, c.function, c.isProdCapacity, c.displaySensorHistory, c.chartNo, c.tagDescription
        ];

        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Machine Parameter Allocation successfully" });
        } else {
            throw new Error("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const c = req.body;

        // Find the existing machine allocation record
        const findQuery = `
            SELECT * FROM machine_parameter_allocation WHERE id = ?
        `;
        const [machineAllocation] = await connection.execute(findQuery, [id]);

        if (machineAllocation.length === 0) {
            throw new Error("Data not found");
        }

        // Check if the requested allocation already exists
        const checkQuery = `
            SELECT * FROM machine_parameter_allocation
            WHERE machineId = ? AND deviceCategoryId = ? AND deviceId = ? AND Tag_Id = ? AND slaveId = ? AND id <> ?
        `;
        const [existingAllocation] = await connection.execute(checkQuery, [c.machineId, c.deviceCategoryId, c.deviceId, c.Tag_Id, c.slaveId, id]);

        if (existingAllocation.length > 0) {
            throw new Error(`${c.Tag_Id} is already allocated to another machine`);
        }

        // Update the machine allocation
        const updateQuery = `
            UPDATE machine_parameter_allocation 
            SET 
                deviceCategoryId = ?, slaveId = ?, Tag_Id = ?, Tag_Name = ?, function = ?, functionName = ?, 
                isProdCapacity = ?, isSensor = ?, chartNumber = ?, machineId = ?, deviceId = ?, tagDescription = ?
            WHERE id = ?
        `;
        const values = [
            c.deviceCategoryId, c.slaveId, c.Tag_Id, c.Tag_Name, c.function, c.functionName,
            c.isProdCapacity, c.displaySensorHistory, c.chartNo, c.machineId, c.deviceId, c.tagDescription, id
        ];

        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Machine Allocation updated successfully" });
        } else {
            throw new Error("Update failed, no rows affected");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM machine_parameter_allocation WHERE id = ?`;
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




exports.show = async (req, res) => {
    try {
        const showQuery = `
            SELECT mpa.*, ed.edgeDeviceName, dc.deviceCategory, m.machine_Name, s.Tag_Name 
            FROM machine_parameter_allocation mpa
            INNER JOIN edge_devices ed ON ed.id = mpa.deviceId
            INNER JOIN device_categories dc ON dc.id = mpa.deviceCategoryId
            INNER JOIN machines m ON m.id = mpa.machineId
            INNER JOIN sensors s ON s.Tag_Id = mpa.Tag_Id
        `;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "Allocated Machine Lists", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Machine Allocations not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.showName = async (req, res) => {
    try {
        const showQuery = `SELECT id,MachineName FROM assettable`;
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


exports.showdeviceNameby = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `SELECT id,edgeDeviceName FROM edge_devices where deviceCategoryId=?`;
        const [rows] = await connection.execute(showQuery, [id]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No Device  found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }

};


exports.showslaveId = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `SELECT slaveId, MAX(slaveInformation) AS slaveInformation FROM sensors
                            WHERE deviceId = ? AND slaveId IS NOT NULL GROUP BY slaveId ORDER BY slaveId`;
        const [rows] = await connection.execute(showQuery, [id]);

        return res.status(200).json({ success: true, data: rows });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }

};


exports.showTagNameby = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `SELECT id,Tag_Name FROM tagadd where deviceId =?`;
        const [rows] = await connection.execute(showQuery, [id]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No vendors found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }

};




// exports.storeexceldata = async (req, res) => {
//     try {
//         const dataArray = req.body.file;

//         if (Array.isArray(dataArray) && dataArray.length > 0) {
//             for (const item of dataArray) {
//                 const storeQuery = `INSERT INTO machine_parameter_allocation (machineId   ,deviceCategoryId  , deviceId  ,slaveId,Tag_Id,functionName,isProdCapacity) 
//                 VALUES (? ,?  , ?  ,?,?,?,?)`;
//                 const values = [item.machineId, item.deviceCategoryId, item.deviceId, item.slaveId, item.Tag_Id, item.functionName, item.isProdCapacity];

//                 const [sRows] = await connection.execute(storeQuery, values);

//                 if (sRows.affectedRows === 0) {
//                     throw new Error("Something went wrong while inserting data!");
//                 }
//             }


exports.storeexceldata = async (req, res) => {
    try {
        const base64URL = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
        const base64Data = req.body.file.replace(base64URL, "");
        const buffer = Buffer.from(base64Data, "base64");
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);

        const dataArray = [];

        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            if (rowNumber > 1) { // Assuming the first row is headers
                const rowData = {
                    machine_name: row.getCell(1).value,
                    categoryName: row.getCell(2).value,
                    edgeDeviceName: row.getCell(3).value,
                    Tag_Name: row.getCell(4).value,
                    functionName: row.getCell(5).value,
                    isProdCapacity: row.getCell(6).value
                };
                dataArray.push(rowData);
            }
        });

        if (Array.isArray(dataArray) && dataArray.length > 0) {
            for (const item of dataArray) {
                // Fetch deviceCategoryId from device_categories table
                const categoryQuery = `SELECT id FROM device_categories WHERE categoryName = ?`;
                const [categoryRows] = await connection.execute(categoryQuery, [item.categoryName]);

                if (categoryRows.length === 0) {
                    throw new Error(`Category not found for name: ${item.categoryName}`);
                }

                const deviceCategoryId = categoryRows[0].id;

                // Fetch machineId from machines table
                const machineQuery = `SELECT id FROM machines WHERE machine_name = ?`;
                const [machineRows] = await connection.execute(machineQuery, [item.machine_name]);

                if (machineRows.length === 0) {
                    throw new Error(`Machine not found for name: ${item.machine_name}`);
                }

                const machineId = machineRows[0].id;

                // Fetch deviceId from edge_devices table
                const deviceQuery = `SELECT id FROM edge_devices WHERE edgeDeviceName = ?`;
                const [deviceRows] = await connection.execute(deviceQuery, [item.edgeDeviceName]);

                if (deviceRows.length === 0) {
                    throw new Error(`Device not found for name: ${item.edgeDeviceName}`);
                }

                const deviceId = deviceRows[0].id;

                // Fetch Tag_Id from sensors table
                const tagQuery = `SELECT Tag_Id, Tag_Name FROM sensors WHERE Tag_Name = ?`;
                const [tagRows] = await connection.execute(tagQuery, [item.Tag_Name]);

                if (tagRows.length === 0) {
                    throw new Error(`Tag not found for name: ${item.Tag_Name}`);
                }

                const Tag_Id = tagRows[0].Tag_Id;

                // Set isProdCapacity value based on item.isProdCapacity
                const isProdCapacityValue = item.isProdCapacity === 'Y' ? 1 : item.isProdCapacity === 'N' ? 0 : null;

                if (isProdCapacityValue === null) {
                    throw new Error(`Invalid isProdCapacity value for item: ${item.Tag_Name}`);
                }

                const storeQuery = `INSERT INTO machine_parameter_allocation (machineId, deviceCategoryId, deviceId, Tag_Id, Tag_Name, functionName, isProdCapacity) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const values = [machineId, deviceCategoryId, deviceId, Tag_Id, item.Tag_Name, item.functionName, isProdCapacityValue];

                const [sRows] = await connection.execute(storeQuery, values);

                if (sRows.affectedRows === 0) {
                    throw new Error("Something went wrong while inserting data!");
                }
            }

            return res.status(200).json({ success: true, message: "All data added successfully" });
        } else {
            throw new Error("Invalid data format");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
