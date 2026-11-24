
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        const storeQuery = ` INSERT INTO insurencetable (vendor, PFrom, PTo, PremiumCost, InsuranceDoc,Department, Section, AssetType, AssetName)
        VALUES (?, ?, ?, ?, ?,?, ?, ?, ?)`;
        const values = [c.vendor, c.PFrom, c.PTo, c.PremiumCost, c.InsuranceDoc, c.Department, c.Section, c.AssetType, c.AssetName];

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
            SELECT *
            FROM insurencetable
        `;

        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No data found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};





exports.update = async (req, res) => {
    try {
        // Extract data from the request body
        const { id } = req.params;
        const { vendor, PFrom, PTo, PremiumCost, InsuranceDoc, Department, Section, AssetType, AssetName } = req.body;

        // Construct the SQL query to update the data in the database
        const updateQuery = `
            UPDATE insurencetable 
            SET vendor = ?, PFrom = ?, PTo = ?, PremiumCost = ?, InsuranceDoc = ?, Department = ?, Section = ?, AssetType = ?, AssetName = ?
            WHERE id = ?
        `;

        // Execute the update query with the provided data
        const [result] = await connection.execute(updateQuery, [vendor, PFrom, PTo, PremiumCost, InsuranceDoc, Department, Section, AssetType, AssetName, id]);

        // Check if any rows were affected by the update
        if (result.affectedRows > 0) {
            // If the update was successful, return a success message
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            // If no rows were affected, it means the data with the provided ID was not found
            return res.status(404).json({ success: false, message: "Data not found or no changes made" });
        }
    } catch (err) {
        // Handle any errors that occur during the process
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




exports.delete = async (req, res) => {
    try {
        const { id } = req.params; // Assuming the ID is passed as a URL parameter

        const deleteQuery = `
            DELETE FROM insurencetable
            WHERE id = ?
        `;

        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "No data found with the given ID" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


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
            INNER JOIN Departments d ON d.id = s.Department
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
        const showQuery = `SELECT a.id,a.MachineName FROM assettable a INNER JOIN assettype at ON a.AssetType = at.id 
        WHERE at.id = ? `;
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
        const { Department, Section, AssetType, AssetName, fromDate, toDate } = req.body;
        const showQuery = `
            SELECT *
            FROM insurencetable   
            WHERE (Department=? OR Section=? OR AssetType=? OR AssetName=?) 
                AND (CertiDate <= ? AND ExpDate >= ?)
        `;
        const values = [Department, Section, AssetType, AssetName, toDate, fromDate];
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
            SELECT * FROM insurencetable  `;

        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            // Check for assets that need renewal
            const renewalData = rows.filter(asset => new Date(asset.PTo) <= new Date());

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



// exports.showRenewalDataById = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const showQuery = `
//             SELECT * FROM insurencetable  where id=?`;

//         const [rows] = await connection.execute(showQuery,[id]);

//         if (rows.length > 0) {
//             // Check for assets that need renewal

//                 return res.status(200).json({ success: true, data: rows });

//         } else {
//             return res.status(404).json({ success: false, message: "Data not found" });
//         }

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };


exports.showRenewalDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const showQuery = ` SELECT * FROM insurencetable  where id=? `;
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



exports.updateRenewalDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPeriodFrom, newPeriodTo } = req.body;

        // Validate newPeriodFrom and newPeriodTo, assuming they are valid date strings
        if (!newPeriodFrom || !newPeriodTo) {
            return res.status(400).json({ success: false, message: "New PeriodFrom and PeriodTo dates are required" });
        }

        const updateQuery = `
            UPDATE insurencetable 
            SET PFrom = ?, PTo = ?
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

