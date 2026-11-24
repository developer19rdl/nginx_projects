const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');
const excel = require("exceljs");
const utility = require('../utility/utilityFunction');
const moment = require("moment")
// exports.store = (req, res) => {
//     try {
//       const c = req.body;

//       const store =
//       `INSERT INTO assettable (Department, Section,MachineName,FinancialAssetId,Vendor,AssetType,Manufacturer,AssetModel,PODetails,InvDetails,WarStartDate,WarEndDate,WarRunHours,WarType,Description,AssetImage) VALUES
//       (?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//       sql.query(store, [c.Department, c.Section,c.MachineName,c.FinancialAssetId,c.Vendor,c.AssetType,c.Manufacturer,c.AssetModel,c.PODetails,c.InvDetails,c.WarStartDate,c.WarEndDate,c.WarRunHours,c.WarType,c.Description,c.AssetImage], (err, result) => {
//         if (err) res.status(400).json({ success: false, message: err.message });




exports.store = async (req, res) => {
    try {
        const c = req.body;
        const fileName1 = utility.storeFile(c.AssetImage, 'npd');

        const storeQuery = ` INSERT INTO assettable (Department, Section,MachineName,FinancialAssetId,Vendor,AssetType,Manufacturer,AssetModel,PODetails,InvDetails,WarStartDate,WarEndDate,WarRunHours,WarType,Description,AssetImage) VALUES
        (?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const values = [c.Department, c.Section, c.MachineName, c.FinancialAssetId, c.Vendor, c.AssetType, c.Manufacturer, c.AssetModel, c.PODetails, c.InvDetails, c.WarStartDate, c.WarEndDate, c.WarRunHours, c.WarType, c.Description, fileName1];

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

exports.downloadTemplate = (req, res) => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Template');
  
    const headers = [ 'AssetName','Department', 'Section','FinancialAssetId','Vendor','AssetType','Manufacturer','AssetModel','PODetails','InvDetails','WarType','WarStartDate','WarEndDate','WarRunHours','Description'];
  
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
  
    const columnSize = 17;
    worksheet.columns.forEach((column) => {
        column.width = columnSize;
    });
  
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Template.xlsx');
  
    workbook.xlsx.write(res)
      .then(() => {
        res.status(200).end();
      })
      .catch(error => {
        console.error('Error generating template Excel file:', error);
        res.status(500).json({ success: false, message: 'Error generating template Excel file' });
      });
  };
  exports.importAssetTable = async (req, res) => {
    try {
        const base64URL = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
        const base64Data = req.body.file.replace(base64URL, "");
        const buffer = Buffer.from(base64Data, "base64");
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        
        const dataArray = [];

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
            if (rowNumber > 1) { // Assuming the first row is headers
                const rowData = {
                    assetName: row.getCell(1).value,
                    department: row.getCell(2).value,
                    section: row.getCell(3).value,
                    financialAssetId: row.getCell(4).value,
                    vendor: row.getCell(5).value,
                    assetType: row.getCell(6).value,
                    manufacturer: row.getCell(7).value,
                    assetModel: row.getCell(8).value,
                    poDetails: row.getCell(9).value,
                    invDetails: row.getCell(10).value,
                    warStartDate: row.getCell(11).value,
                    warEndDate: row.getCell(12).value,
                    warRunHours: row.getCell(13).value,
                    warType: row.getCell(14).value,
                    description: row.getCell(15).value
                };
                dataArray.push(rowData);
            }
        });

        if (dataArray.length > 0) {
            for (const item of dataArray) {
                // Fetch departmentId from departments table
                const [departmentRows] = await connection.execute('SELECT id FROM departments WHERE departmentName = ?', [item.department]);

                if (departmentRows.length === 0) {
                    throw new Error(`Department not found for name: ${item.department}`);
                }
                const departmentId = departmentRows[0].id;

                // Fetch sectionId from sectiontable
                const [sectionRows] = await connection.execute('SELECT id FROM sectiontable WHERE Section = ?', [item.section]);

                if (sectionRows.length === 0) {
                    throw new Error(`Section not found for name: ${item.section}`);
                }
                const sectionId = sectionRows[0].id;

                // Fetch machineId from machines table
                const [machineRows] = await connection.execute('SELECT id FROM machines WHERE machine_name = ?', [item.assetName]);

                if (machineRows.length === 0) {
                    throw new Error(`Machine not found for name: ${item.assetName}`);
                }
                const machineId = machineRows[0].id;

                // Fetch vendorId from vendormst table
                const [vendorRows] = await connection.execute('SELECT id FROM vendormst WHERE VendorName = ?', [item.vendor]);

                if (vendorRows.length === 0) {
                    throw new Error(`Vendor not found for name: ${item.vendor}`);
                }
                const vendorId = vendorRows[0].id;

                // Fetch assetTypeId from assettype table
                const [assetTypeRows] = await connection.execute('SELECT id FROM assettype WHERE AssetTypeView = ?', [item.assetType]);

                if (assetTypeRows.length === 0) {
                    throw new Error(`Asset type not found for name: ${item.assetType}`);
                }
                const assetTypeId = assetTypeRows[0].id;

                // // Check for warranty validity
                if (item.warType === 'Warranty') {
                    if (!item.warStartDate || !item.warEndDate) {
                        return res.status(400).json({ success: false, message: 'WarStartDate and WarEndDate are required for Warranty type' });
                    }
                }

                // Convert WarType to 1 or 0
                const warType = item.warType === 'Warranty' ? 1 : 0;

                // Insert data into assettable
                const insertQuery = `
                    INSERT INTO assettable (MachineName, Department, Section, FinancialAssetId, Vendor, AssetType, Manufacturer, AssetModel, PODetails, InvDetails, WarStartDate, WarEndDate, WarRunHours, WarType, Description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const values = [
                    machineId,
                    departmentId,
                    sectionId,
                    item.financialAssetId,
                    vendorId,
                    assetTypeId,
                    item.manufacturer,
                    item.assetModel,
                    item.poDetails,
                    item.invDetails,
                    item.warStartDate,
                    item.warEndDate,
                    item.warRunHours,
                    item.warType,
                    item.description
                ];

                const [result] = await connection.execute(insertQuery, values);

                if (result.affectedRows === 0) {
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
  
//   exports.importAssetTable = async (req, res) => {
//       try {
//           if (!req.body.file) {
//               return res.status(400).json({ success: false, message: 'No file uploaded' });
//           }
  
//           const base64URL = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
//           const base64Data = req.body.file.replace(base64URL, '');
  
//           const buffer = Buffer.from(base64Data, 'base64');
  
//           const workbook = new excel.Workbook();
//           await workbook.xlsx.load(buffer);
  
//           const worksheet = workbook.getWorksheet(1);
//           const customers = [];
  
  
//                   // Check if WarType is 'Warranty' and validate dates
//                   if (cust.warType === 'Warranty') {
//                       if (!cust.warStartDate || !cust.warEndDate) {
//                           return res.status(400).json({ success: false, message: 'WarStartDate and WarEndDate are required for Warranty type' });
//                       }
//                   }
  
//                   // Convert WarType to 1 or 0
//                   cust.warType = cust.warType === 'Warranty' ? 1 : 0;
  
//                   customers.push(cust);
//               }
//           });
  
//           try {
//               const insertQuery = `
//                   INSERT INTO assettable (MachineName, Department, Section, FinancialAssetId, Vendor, AssetType, Manufacturer, AssetModel, PODetails, InvDetails, WarStartDate, WarEndDate, WarRunHours, WarType, Description)
//                   VALUES ?`;
  
  
  
  

exports.show = async (req, res) => {
    try {
        const showQuery = `
            SELECT 
                ast.id,
                m.machine_name as MachineName,
                ast.Manufacturer,
                ast.PODetails,
                ast.InvDetails,
                DATE_FORMAT(ast.WarStartDate, '%Y-%m-%d') as WarStartDate,
                DATE_FORMAT(ast.WarEndDate, '%Y-%m-%d') as WarEndDate,
                d.departmentName as dname,
                s.Section as sname,
                at.AssetTypeView as aname 
            FROM assettable ast
            INNER JOIN departments d ON d.id=ast.Department
            INNER JOIN sectiontable s ON s.id=ast.Section
            INNER JOIN assettype at ON at.id=ast.AssetType
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






exports.showcount = async (req, res) => {
    try {
        const showQuery = `SELECT COUNT(*) AS count FROM assettable`;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, count: rows[0].count });
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

        const deleteQuery = `DELETE FROM assettable WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data deleted successfully" });
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
            UPDATE assettable 
            SET 
                Department = ?, 
                Section = ?, 
                MachineName = ?, 
                FinancialAssetId = ?, 
                Vendor = ?, 
                AssetType = ?, 
                Manufacturer = ?, 
                AssetModel = ?, 
                PODetails = ?, 
                InvDetails = ?, 
                WarStartDate = ?, 
                WarEndDate = ?, 
                WarRunHours = ?, 
                WarType = ?, 
                Description = ?, 
                AssetImage = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.Department,
            newData.Section,
            newData.MachineName,
            newData.FinancialAssetId,
            newData.Vendor,
            newData.AssetType,
            newData.Manufacturer,
            newData.AssetModel,
            newData.PODetails,
            newData.InvDetails,
            newData.WarStartDate,
            newData.WarEndDate,
            newData.WarRunHours,
            newData.WarType,
            newData.Description,
            newData.AssetImage,
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



exports.search = async (req, res) => {
    try {
        const { q } = req.query;

        let searchQuery = `
            SELECT id, FinancialAssetId AS label 
            FROM assettable 
            WHERE FinancialAssetId LIKE ?
        `;
        const values = [`%${q}%`];

        const [rows] = await connection.execute(searchQuery, values);

        return res.status(200).json({ success: true, message: "Asset IDs", data: rows });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};
