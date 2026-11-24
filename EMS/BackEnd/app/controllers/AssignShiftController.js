const { connection, CustomError } = require('../config/dbSql2');
const excel = require('exceljs');
const moment = require('moment-timezone');


exports.AssignShiftTemplate = async (req, res) => {
    try {
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");

        // Add headers
        const headerRow = worksheet.addRow([
            "Machine Id",
            "Planned Capacity",
        ]);

        // Apply styles to the header row
        headerRow.font = { bold: true }; // Make text bold
        headerRow.alignment = { horizontal: "center" }; // Center align text

        worksheet.columns.forEach((column) => {
            column.width = 20;
        });

        // Set content type and disposition including desired filename
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename = CSL.xlsx");

        // Write the Excel file to the response
        workbook.xlsx
            .write(res)
            .then(() => {
                // End the response stream
                res.end();
            })
            .catch((err) => {
                console.error("Error writing Excel file:", err);
                res.status(500).send("Error generating Excel file");
            });
    } catch (err) {
        return res
            .status(400)
            .json({ success: false, message: err.message || "An error occurred" });
    }
};




exports.importAssignShift = async (req, res) => {
    try {
        if (!req.body.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Parse base64 Excel file data
        const base64URL = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
        const base64Data = req.body.file.replace(base64URL, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Load Excel workbook
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);

        // Get the first worksheet
        const worksheet = workbook.getWorksheet(1);
        const shiftPlans = [];

        // Get all existing machine IDs from the database
        const [machines] = await connection.query('SELECT id FROM machines');
        const machineIds = machines.map(machine => machine.id);

        // Iterate over each row in the worksheet
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) { // Skip header row
                const machineId = row.getCell(1).value;
                if (!machineIds.includes(machineId)) {
                    // console.log(`Skipping row ${rowNumber} due to invalid machineId: ${machineId}`);
                    return; // Skip this row
                }

                const shiftPlan = {
                    machineId,
                    plannedCapacity: row.getCell(2).value,
                    scheduleDate: req.body.scheduleDate, // Assuming scheduleDate is passed in the request body
                    shiftNumber: req.body.shiftNumber, // Assuming shiftNumber is passed in the request body
                    dateTime: moment.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') // Current date and time in Asia/Kolkata timezone
                };
                shiftPlans.push(Object.values(shiftPlan));
            }
        });

        if (shiftPlans.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid shift plans to import' });
        }

        // Insert shift plans into the database
        const insertQuery = `
            INSERT INTO shift_production_planning (machineId, plannedCapacity, scheduleDate, shiftNumber, dateTime) 
            VALUES ?
        `;
        await connection.query(insertQuery, [shiftPlans]);

        return res.status(200).json({ success: true, message: 'Successfully Imported' });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
