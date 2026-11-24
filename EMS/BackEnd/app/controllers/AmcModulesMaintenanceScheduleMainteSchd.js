const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');

const utility = require('../utility/utilityFunction');



exports.show = async (req, res) => {
    try {
        const viewQuery = `SELECT id,MachineName FROM assettable`;
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



exports.showUser = async (req, res) => {
    try {
        const viewQuery = `SELECT id,name FROM amcusers`;
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




exports.storeData = async (req, res) => {
    try {
        const {
            machine,
            MaintId,
            Maintype,
            Severity,
            probcate,
            naturecate,
            ProblemNote,
            BrkImages1,
            BrkImages2,
            BrkImages3,
            BrkImages4,
            AffectedMachine,
            AffdManHours,
            type1,
            type2,
            fromdate,
            todate,
            fromtime,
            totime,
            MachineRuntimeDetails,
            manHourdetails,
            users,
            valuesToInsert
        } = req.body;

        const fileName1 = utility.storeFile(BrkImages1, 'npd');
        const fileName2 = utility.storeFile(BrkImages2, 'npd');
        const fileName3 = utility.storeFile(BrkImages3, 'npd');
        const fileName4 = utility.storeFile(BrkImages4, 'npd');

        // Convert AffectedMachine to a string if it is an array
        const affectedMachineStr = Array.isArray(AffectedMachine) ? AffectedMachine.join(',') : AffectedMachine;

        const affectedusers = Array.isArray(users) ? users.join(',') : users;

        // SQL query for insertion into maintcescedue2 table
        const insertQuery1 = `
            INSERT INTO maintcescedue2(machine, MaintId, Maintype, Severity,probcate,naturecate, ProblemNote, BrkImages1, BrkImages2, BrkImages3, BrkImages4, AffectedMachine, AffdManHours, type1, type2, fromdate, todate, fromtime, totime,MachineRuntimeDetails,manHourdetails,users) 
            VALUES (?, ?, ?, ?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
        `;

        // Execute the insertion query for maintcescedue2 table
        const [insertedRow] = await connection.execute(insertQuery1, [
            machine, MaintId, Maintype, Severity, probcate, naturecate, ProblemNote, fileName1, fileName2, fileName3, fileName4, affectedMachineStr, AffdManHours, type1, type2, fromdate, todate, fromtime, totime, MachineRuntimeDetails, manHourdetails, affectedusers
        ]);

        // Get the auto-generated id from the inserted row
        const MSheduleId = insertedRow.insertId;

        // SQL query for insertion into second table referencing maintcescedue2 table
        const insertQuery2 = `
            INSERT INTO maintaintype(Type, Name, Partid, Quantity, UOM, Unitprice, MSheduleId) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // Loop through the array and execute the insertion query for each value
        for (const value of valuesToInsert) {
            await connection.execute(insertQuery2, [
                value.Type, value.Name, value.PartId, value.Quantity, value.UOM, value.Unitprice, MSheduleId
            ]);
        }

        return res.status(200).json({ success: true, message: "Data inserted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.showDataType = async (req, res) => {
    try {
        // SQL query for selecting data
        const selectQuery = `
            SELECT Name,
            Partid,
            Quantity,
            UOM,
            Unitprice 
            FROM maintcescedue2
        `;

        // Execute the selection query
        const [rows] = await connection.execute(selectQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.showDataTypebyId = async (req, res) => {
    try {
        const { id } = req.params;
        // SQL query for selecting data
        const selectQuery = `
            SELECT id,Name,Partid,Quantity,UOM,Unitprice FROM maintaintype where MSheduleId =?
        `;

        // Execute the selection query
        const [rows] = await connection.execute(selectQuery, [id]);

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
        const showQuery = `
            SELECT a.id, a.MachineName, m.machine_name
            FROM assettable a
            INNER JOIN assettype at ON a.AssetType = at.id
            INNER JOIN machines m ON a.id = m.id  -- Adjust the join condition based on your schema
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


exports.showWarrenty = async (req, res) => {
    try {
        const { id } = req.params;
        const { MachineName } = req.body;
        const amcQuery = `SELECT count(*) as total FROM amctable WHERE AssetName = ?`;
        const warrantyQuery = `SELECT COUNT(*) as total, WarType FROM assettable WHERE MachineName = ? GROUP BY WarType`;

        const [amcRows] = await connection.execute(amcQuery, [id]);
        const [warrantyRows] = await connection.execute(warrantyQuery, [MachineName]);

        let amcStatus, warrantyStatus, warrantyType;

        if (amcRows.length > 0) {
            const amcCount = amcRows[0].total;
            amcStatus = amcCount > 0 ? 'AMC Available' : 'No AMC Available';
        } else {
            return res.status(404).json({ success: false, message: "AMC Data not found" });
        }

        if (warrantyRows.length > 0) {
            warrantyStatus = warrantyRows.find(row => row.WarType === 1) ? 'Warranty Available' : 'No Warranty Available';
        } else {
            warrantyStatus = 'No Warranty Available';
        }

        warrantyType = warrantyStatus === 'Warranty Available' ? 'Yes' : 'Na';

        return res.status(200).json({ success: true, data: { "id": 1, "AMCStatus": amcStatus, "WarrantyStatus": warrantyStatus, "WarrantyType": warrantyType } });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.showMaintCalendarData = async (req, res) => {
    try {
        const { id } = req.params;
        const viewQuery = `SELECT id, Maintype, fromdate, todate FROM maintcescedue2 WHERE planed = 1 and machine = ?`;
        const [rows] = await connection.execute(viewQuery,[id]);

        if (rows.length > 0) {
            const events = rows.map(row => ({
                id: row.id,
                title: row.Maintype,
                start: row.fromdate,
                end: row.todate
            }));
            return res.status(200).json({ success: true, data: events });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
