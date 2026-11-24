
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        const storeQuery = ` INSERT INTO  amctable (vendor,PeriodFrom, PeriodTo,ServicePattern,Department,Section,AssetType,AssetName) VALUES
        (?,?, ?,?,?,?,?,?)`;
        const values = [c.vendor, c.PeriodFrom, c.PeriodTo, c.ServicePattern, c.Department, c.Section, c.AssetType, c.AssetName];

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



//         if (rows.length > 0) {
//             return res.status(200).json({ success: true, data: rows });
//         } else {
//             return res.status(404).json({ success: false, message: "Data not found" });
//         }

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };

exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT am.*,d.departmentName as dname,m.machine_name as MachineName,s.Section as sname,at.AssetTypeView as aname,v.VendorName   FROM amctable am
        INNER JOIN vendormst v ON v.id=am.vendor
        INNER JOIN departments d ON d.id=am.Department
        INNER JOIN sectiontable s ON s.id=am.Section
        INNER JOIN assettype at ON at.id=am.AssetType
         INNER JOIN assettable ast ON ast.id=am.AssetName
         INNER JOIN machines m on m.id=ast.MachineName`;
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

        const updateQuery = `
            UPDATE amctable
            SET 
                vendor = ?,
                PeriodFrom = ?, 
                PeriodTo = ?, 
                ServicePattern = ?, 
                Department = ?, 
                Section = ?, 
                AssetType = ?, 
                AssetName = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.vendor,
            newData.PeriodFrom,
            newData.PeriodTo,
            newData.ServicePattern,
            newData.Department,
            newData.Section,
            newData.AssetType,
            newData.AssetName,
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

        const deleteQuery = `DELETE FROM amctable WHERE id = ?`;
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



exports.search = async (req, res) => {
    try {
        const { s } = req.query;

        const searchQuery = `
            SELECT * 
            FROM amctable 
            WHERE 
                PeriodFrom LIKE ? OR 
                PeriodTo LIKE ? OR 
                ServicePattern LIKE ? OR 
                Department LIKE ? OR 
                Section LIKE ? OR 
                AssetType LIKE ? OR 
                AssetName LIKE ?
        `;
        const searchTermWildcard = `%${s}%`;
        const values = Array(7).fill(searchTermWildcard);

        const [rows] = await connection.execute(searchQuery, values);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "No records found matching the search criteria" });
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
