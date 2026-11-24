
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');


exports.store = async (req, res) => {
    try {
        const c = req.body;
        const storeQuery = ` INSERT INTO certificatetable (vendor, CertiDate, ExpDate,InspPatt, Department, Section, AssetType, AssetName)
        VALUES (?, ?, ?,?, ?, ?, ?, ?)`;
        const values = [c.vendor, c.PeriodFrom, c.PeriodTo, c.InspectionPattern, c.Department, c.Section, c.AssetType, c.AssetName];

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
            SELECT c.id, c.vendor,v.VendorName,d.departmentName as dname,s.Section as sname,ast.AssetTypeView as astName ,at.MachineName, c.CertiDate, c.ExpDate, c.PreCost, c.CertDoc, c.InspPatt, c.Department, c.Section, c.AssetType, c.AssetName,m.machine_name as MName
            FROM certificatetable c
            INNER JOIN  vendormst v on v.id=c.vendor
            INNER JOIN  departments d on d.id=c.Department
            INNER JOIN  sectiontable s on s.id=c.Section
            INNER JOIN  assettype ast on ast.id=c.AssetType
            INNER JOIN  assettable at on at.id=c.AssetName
            INNER JOIN  machines m on m.id=c.AssetName
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
        const { id } = req.params; // Assuming the ID is passed as a URL parameter
        const { vendor,
            PeriodFrom,
            PeriodTo,
            InspectionPattern,
            Department,
            Section,
            AssetType,
            AssetName } = req.body;

        const updateQuery = `
            UPDATE certificatetable
            SET vendor = ?, CertiDate = ?, ExpDate = ?, InspPatt = ?, Department = ?, Section = ?, AssetType = ?, AssetName = ?
            WHERE id = ?
        `;

        const values = [vendor,
            PeriodFrom,
            PeriodTo,
            InspectionPattern,
            Department,
            Section,
            AssetType,
            AssetName, id];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "No data found with the given ID" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params; // Assuming the ID is passed as a URL parameter

        const deleteQuery = `
            DELETE FROM certificatetable
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




exports.showData = async (req, res) => {
    try {
        const newData = req.body;
        const showQuery = `SELECT * FROM certificatetable WHERE Department=? OR Section=? OR AssetType=? OR AssetName=?`;

        const values = [
            newData.Department,
            newData.Section,
            newData.AssetType,
            newData.AssetName
        ];
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





//         if (rows.length > 0) {
//             return res.status(200).json({ success: true, data: rows });
//         } else {
//             return res.status(404).json({ success: false, message: "Data not found" });
//         }

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };




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


        if (fromDate && toDate) {
            // If both fromDate and toDate are provided, filter by the provided date range
            showQuery = `
            SELECT am.vendor,v.VendorName, am.id, am.CertiDate, am.ExpDate,ast.MachineName,m.machine_name as Mname
              FROM certificatetable am 
              INNER JOIN vendormst v on v.id=am.vendor
              INNER JOIN assettable ast on ast.id=am.AssetName
              INNER JOIN  machines m on m.id=am.AssetName
              WHERE (am.Department=? OR am.Section=? OR am.AssetType=?) 
                AND am.CertiDate <= ?  
                AND am.ExpDate >= ?      
                AND am.ExpDate <= ?      
                AND am.CertiDate >= ?  
                AND am.ExpDate <= ?     
            `;
            values = [Department, Section, AssetType, currentDate, currentDate, tenDaysFromNowStr, fromDate, toDate];
        } else {
            // If either fromDate or toDate is not provided, only consider the current date range
            showQuery = `
            SELECT am.vendor,v.VendorName, am.id, am.CertiDate, am.ExpDate,ast.MachineName,m.machine_name as Mname
              FROM certificatetable am 
            INNER JOIN vendormst v on v.id=am.vendor
            INNER JOIN assettable ast on ast.id=am.AssetName
             INNER JOIN  machines m on m.id=am.AssetName
            WHERE
             am.CertiDate <= ? 
                AND am.ExpDate >= ?     
                AND am.ExpDate <= ?      
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
        SELECT c.*,d.departmentName as dname,m.machine_name
        FROM certificatetable c
            INNER JOIN departments d on d.id=c.Department
            INNER JOIN assettable ast on ast.id=c.AssetName
            INNER JOIN machines m on m.id=c.AssetName`;

        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            // Check for assets that need renewal
            const renewalData = rows.filter(asset => new Date(asset.ExpDate) <= new Date());

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
