
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
        const showQuery = `SELECT a.id,at.AssetName as MachineName FROM assettable a INNER JOIN machines m ON a.MachineName = m.id
        WHERE m.id  = ? `;
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



exports.showDatabydate = async (req, res) => {
    try {
        const { Department, Section, AssetType, } = req.body;
        let { fromDate, toDate } = req.body;

        if (!fromDate) fromDate = null;
        if (!toDate) toDate = null;

        // Get today's date
        const currentDate = new Date().toISOString().split('T')[0];

        // Calculate 10 days from today
        const tenDaysFromNow = new Date();
        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
        const tenDaysFromNowStr = tenDaysFromNow.toISOString().split('T')[0];

        let showQuery;
        let values;


        if (Department && Section && AssetType && fromDate && toDate) {
            // If both fromDate and toDate are provided, filter by the provided date range
            showQuery = `
            SELECT am.vendor,v.VendorName, am.id, am.PeriodFrom, am.PeriodTo, am.ServicePattern, am.Department, am.Section, am.AssetType, am.AssetName,m.machine_name as MName
              FROM amctable am 
              INNER JOIN vendormst v on v.id=am.vendor
              INNER JOIN assettable ast on ast.id=am.AssetName
              INNER JOIN machines m on m.id=am.AssetName
              WHERE (am.Department=? OR am.Section=? OR am.AssetType=?) 
                AND am.PeriodFrom <= ?  
                AND am.PeriodTo >= ?      
                AND am.PeriodTo <= ?      
                AND am.PeriodFrom >= ?  
                AND am.PeriodTo <= ?     
            `;
            values = [Department, Section, AssetType, currentDate, currentDate, tenDaysFromNowStr, fromDate, toDate];
        } else {
            // If either fromDate or toDate is not provided, only consider the current date range
            showQuery = `
            SELECT am.vendor,v.VendorName, am.id, am.PeriodFrom, am.PeriodTo, am.ServicePattern, am.Department, am.Section, am.AssetType, am.AssetName,m.machine_name as MName
            FROM amctable am 
            INNER JOIN vendormst v on v.id=am.vendor
            INNER JOIN assettable ast on ast.id=am.AssetName
            INNER JOIN machines m on m.id=am.AssetName
            WHERE
             am.PeriodFrom <= ? 
                AND am.PeriodTo >= ?     
                AND am.PeriodTo <= ?      
            `;
            values = [currentDate, currentDate, tenDaysFromNowStr];
        }



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





exports.showRenewalData = async (req, res) => {
    try {

        const showQuery = `
            SELECT  am.id, am.PeriodFrom, am.PeriodTo, am.ServicePattern, am.Department,d.departmentName as dname, am.Section, am.AssetType, am.AssetName,ast.MachineName,ast.MachineName FROM amctable am,m.machine_name as Mname
            INNER JOIN departments d on d.id=am.Department
             INNER JOIN departments d on d.id=am.Department
            INNER JOIN machines m on m.id=am.AssetName`;

        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            // Check for assets that need renewal
            const renewalData = rows.filter(asset => new Date(asset.PeriodTo) <= new Date());

            if (renewalData.length > 0) {
                return res.status(200).json({ success: true, data: renewalData });
            } else {
                return res.status(404).json({ success: false, message: "No assets need renewal" });
            }
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.showRenewalDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = `
            SELECT vendor, id, PeriodFrom, PeriodTo, ServicePattern, Department, Section, AssetType, AssetName FROM amctable  where id=?`;

        const [rows] = await connection.execute(showQuery, [id]);

        if (rows.length > 0) {
            // Check for assets that need renewal
            const renewalData = rows.filter(asset => new Date(asset.PeriodTo) <= new Date());

            if (renewalData.length > 0) {
                return res.status(200).json({ success: true, data: renewalData });
            } else {
                return res.status(404).json({ success: false, message: "No assets need renewal" });
            }
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.updateRenewalDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPeriodFrom, newPeriodTo } = req.body;

        // Validate newPeriodFrom and newPeriodTo, assuming they are valid date strings
        if (!newPeriodFrom || !newPeriodTo) {
            return res.status(400).json({ success: false, message: "New PeriodFrom and PeriodTo dates are required" });
        }

        const updateQuery = `
            UPDATE amctable 
            SET PeriodFrom = ?, PeriodTo = ?
            WHERE id = ?
        `;
        const values = [newPeriodFrom, newPeriodTo, id];
        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Renewal data updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
