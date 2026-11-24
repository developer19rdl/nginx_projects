const { Console } = require('winston/lib/winston/transports');
const { connection, CustomError } = require('../config/dbSql2');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');
const excel = require('exceljs');
const moment = require('moment');
exports.assigndownloadtemp = async (req, res) => {
    try {

        const [machineRows] = await connection.execute(`
            SELECT DISTINCT m.id as MachineId, m.machine_name as MachineName
            FROM machines as m
            INNER JOIN machine_parameter_allocation as mpa ON m.id = mpa.machineId
            WHERE mpa.isProdCapacity = 1
        `, []);

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Machine Details');

        worksheet.columns = [
            { header: 'MachineName', key: 'MachineName', width: 28, style: { alignment: { horizontal: 'center' } } },
            { header: 'MachineId', key: 'MachineId', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'From Date', key: 'FromDate', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'To Date', key: 'ToDate', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: '', width: 20, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: '', width: 20, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: '', width: 20, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: '', width: 20, style: { alignment: { horizontal: 'center' } } }
        ];


        worksheet.getCell('A1').value = 'From Date';
        worksheet.getCell('C1').value = 'To Date';
        worksheet.getCell('A1').font = { bold: true, size: 13 };
        worksheet.getCell('C1').font = { bold: true, size: 13 };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('C1').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.getCell('B1').value = '';
        worksheet.getCell('D1').value = '';


        worksheet.getCell('A3').value = 'MachineName';
        worksheet.getCell('B3').value = 'MachineId';
        worksheet.getCell('C3').value = 'Shift 1';
        worksheet.getCell('D3').value = 'Shift 2';
        worksheet.getCell('E3').value = 'Shift 3';
        worksheet.getCell('F3').value = 'General Shift';

        const headerRow = worksheet.getRow(3);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 13 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });


        machineRows.forEach(row => {
            worksheet.addRow(row);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Assignshift-details.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
const parseDate = (dateText) => {
    let date = moment(dateText, 'YYYY-MM-DD', true);
    if (!date.isValid()) date = moment(dateText, 'DD-MM-YYYY', true);
    if (!date.isValid()) date = moment(dateText, 'DD/MM/YYYY', true);
    if (!date.isValid()) date = moment(dateText, 'MM-DD-YYYY', true);
    if (!date.isValid()) date = moment(dateText, 'MM/DD/YYYY', true);
    if (!date.isValid()) {
        console.error(`Invalid date format for date text: ${dateText}`);
    }
    return date;
};



// Function to delete schedules
const deleteSchedule = async (dates, machines) => {
    try {
        const placeholders = machines.map(() => '?').join(',');
        for (const date of dates) {
            await connection.execute(`DELETE FROM shift_production_planning WHERE scheduleDate = ? AND machineId IN (${placeholders})`, [date, ...machines]);
        }
        console.log('Deletion successful.');
        return true;
    } catch (err) {
        throw err;
    }
};

// Function to bulk insert schedules
const reSchedule = async (data) => {
    try {
        if (!data || data.length === 0) {
            throw new Error('No data provided for bulk insert.');
        }
        const insertQuery = `INSERT INTO shift_production_planning (scheduleDate, shiftNumber, machineId) VALUES ${data.map(() => '(?, ?, ?)').join(',')}`;
        const values = data.flatMap(entry => [entry[0], entry[1], entry[2]]);
        await connection.execute(insertQuery, values);
        console.log('Bulk insert successful.');
        return true;
    } catch (err) {
        throw err;
    }
};
exports.mstImport = async (req, res) => {
    try {
        if (!req.body.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const base64URL = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
        const base64Data = req.body.file.replace(base64URL, "");
        const buffer = Buffer.from(base64Data, "base64");
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        // Parse the "From Date" and "To Date"
        const fromDateText = worksheet.getCell('B1').value;
        const toDateText = worksheet.getCell('D1').value;
        // console.log('From Date Text:', fromDateText);
        // console.log('To Date Text:', toDateText);
        const fromDate = parseDate(fromDateText);
        const toDate = parseDate(toDateText);
        console.log(`parsedDate: ${fromDate}  ${toDate}`)
        if (!fromDate.isValid() || !toDate.isValid()) {
            throw new Error('Invalid date format in From Date or To Date.');
        }
        const items = {};
        const set = [];
        const machines = [];
        const dates = [];
        let processDate = fromDate.clone();
        while (processDate.isSameOrBefore(toDate)) {
            const currentDateString = processDate.format('YYYY-MM-DD');
            dates.push(currentDateString);
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 3) {
                    const machineId = row.getCell(2).value;
                    if (!machines.includes(machineId)) {
                        machines.push(machineId);
                    }
                    for (let shiftNumber = 1; shiftNumber <= 4; shiftNumber++) {
                        const shiftColumnIndex = 2 + shiftNumber;
                        const shiftValue = row.getCell(shiftColumnIndex).text;
                      
                        if (shiftValue === 'Y') {
                            set.push([currentDateString, shiftNumber, machineId]);
                        }
                    }
                }
            });
            processDate.add(1, 'day');
        }
        await deleteSchedule(dates, machines);
        await reSchedule(set);
        return res.status(200).json({ success: true, message: "Successfully Imported" });
    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};



exports.Importreschedule = async (req, res) => {
    try {
        if (!req.body.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const base64URL = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
        const base64Data = req.body.file.replace(base64URL, "");
        const buffer = Buffer.from(base64Data, "base64");
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        // Parse the "From Date" and "To Date"
        const fromDateText = worksheet.getCell('B1').value;
        const toDateText = worksheet.getCell('D1').value;
        // console.log('From Date Text:', fromDateText);
        // console.log('To Date Text:', toDateText);
        const fromDate = parseDate(fromDateText);
        const toDate = parseDate(toDateText);
        console.log(`parsedDate: ${fromDate}  ${toDate}`)
        if (!fromDate.isValid() || !toDate.isValid()) {
            throw new Error('Invalid date format in From Date or To Date.');
        }
        const currentDate = moment().startOf('day');
        if (fromDate.isSameOrBefore(currentDate)) {
            throw new Error('From Date must be greater than the current date.');
        }
        const items = {};
        const set = [];
        const machines = [];
        const dates = [];
        let processDate = fromDate.clone();
        while (processDate.isSameOrBefore(toDate)) {
            const currentDateString = processDate.format('YYYY-MM-DD');
            dates.push(currentDateString);
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 3) {
                    const machineId = row.getCell(2).value;
                    if (!machines.includes(machineId)) {
                        machines.push(machineId);
                    }
                    for (let shiftNumber = 1; shiftNumber <= 4; shiftNumber++) {
                        const shiftColumnIndex = 2 + shiftNumber;
                        const shiftValue = row.getCell(shiftColumnIndex).text;
                        if (shiftValue === 'Y' ) {
                            set.push([currentDateString, shiftNumber, machineId]);
                        }
                        
                    }
                }
            });
            processDate.add(1, 'day');
        }
        await deleteSchedule(dates, machines);
        await reSchedule(set);
        return res.status(200).json({ success: true, message: "Successfully Imported" });
    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};



exports.editreschedule = async (req, res) => {
    try {
        const id = req.params.id;
        const category = req.body;

        // Check if the category exists
        const [fRows] = await connection.execute(`SELECT * FROM shift_production_planning WHERE id = ?`, [id]);
        if (fRows.length === 0) {
            throw new CustomError("Shift Production Planning not found for the given ID", 404);
        }

        // Validate scheduleDate is greater than current date
        const currentDate = moment().format('YYYY-MM-DD'); // Current date in YYYY-MM-DD format
        if (!moment(category.scheduleDate, 'YYYY-MM-DD').isAfter(currentDate)) {
            throw new CustomError("Scheduled date must be greater than the current date", 400);
        }

        // Retrieve machine ID based on machine_name
        const machineQuery = `SELECT id FROM machines WHERE machine_name = ?`;
        const [machineRows] = await connection.execute(machineQuery, [category.machine_name]);

        if (machineRows.length === 0) {
            throw new CustomError(`Machine not found for name: ${category.machine_name}`, 404);
        }

        const machineId = machineRows[0].id;

        // Update query to update schedule details
        const updateQuery = `UPDATE shift_production_planning SET scheduleDate = ?, shiftNumber = ?, machineId = ? WHERE id = ?`;
        const values = [category.scheduleDate, category.shiftNumber, machineId, id];
        const [uRows] = await connection.execute(updateQuery, values);

        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            throw new CustomError("Failed to update Shift Production Planning");
        }
    } catch (err) {
        // Handle errors
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.show = async (req, res) => {
    try {
        const query = `
            SELECT
             sp.id,
            DATE_FORMAT(sp.scheduleDate, '%Y-%m-%d') AS scheduleDate,
                sp.shiftNumber,
                sp.machineId,
                m.machine_name
            FROM
                shift_production_planning as sp
            INNER JOIN
                machines as m
            ON
                sp.machineId = m.id
        `;
        const [rows] = await connection.execute(query, []);
        if (rows.length > 0) {
            rows.forEach((element, index) => {
                // element.sNo = index + 1;
            });
            return res.status(200).json({
                success: true,
                message: "AssignShift list",
                data: rows
            });
        } else {
            return res.status(404).json({ success: false, message: "No AssignShift found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
exports.rescheduledownloadtemp = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const [machineRows] = await connection.execute(`
            SELECT sp.id as planningId, DATE_FORMAT(sp.scheduleDate, '%Y-%m-%d') as scheduleDate, sp.shiftNumber,
                   sp.machineId, m.machine_name as MachineName
            FROM shift_production_planning as sp
            INNER JOIN machines as m ON sp.machineId = m.id
            WHERE sp.scheduleDate BETWEEN ? AND ?
        `, [fromDate, toDate]);
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Machine Details');
        worksheet.columns = [
            { header: 'MachineName', key: 'MachineName', width: 28, style: { alignment: { horizontal: 'center' } } },
            { header: 'MachineId', key: 'MachineId', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: 'Shift 1', width: 20, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: 'Shift 2', width: 20, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: 'Shift 3', width: 20, style: { alignment: { horizontal: 'center' } } },
            { header: '', key: 'General Shift', width: 20, style: { alignment: { horizontal: 'center' } } }
        ];
        // Format the dates to dd/mm/yyyy
        const formatDate = (dateStr) => {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        };
        worksheet.getCell('B1').value = formatDate(fromDate);
        worksheet.getCell('D1').value = formatDate(toDate);
        worksheet.getCell('B1').font = { size: 12 };
        worksheet.getCell('D1').font = { size: 12 };
        worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A1').value = 'From Date';
        worksheet.getCell('C1').value = 'To Date';
        worksheet.getCell('A1').font = { bold: true, size: 13 };
        worksheet.getCell('C1').font = { bold: true, size: 13 };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('C1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A3').value = 'MachineName';
        worksheet.getCell('B3').value = 'MachineId';
        worksheet.getCell('C3').value = 'Shift 1';
        worksheet.getCell('D3').value = 'Shift 2';
        worksheet.getCell('E3').value = 'Shift 3';
        worksheet.getCell('F3').value = 'General Shift'; 
        // Add styling to the header row
        const headerRow = worksheet.getRow(3);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 13 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        // Process the data to fill in the worksheet
        const machines = {};
        machineRows.forEach(row => {
            const key = row.machineId;
            if (!machines[key]) {
                machines[key] = {
                    MachineName: row.MachineName,
                    MachineId: row.machineId,
                    'Shift 1': '',
                    'Shift 2': '',
                    'Shift 3': '',
                    'General Shift': ''
                };
            }
            switch (row.shiftNumber) {
                case 1:
                    machines[key]['Shift 1'] = 'Y';
                    break;
                case 2:
                    machines[key]['Shift 2'] = 'Y';
                    break;
                case 3:
                    machines[key]['Shift 3'] = 'Y';
                    break;
                case 4:
                    machines[key]['General Shift'] = 'Y';
                    break;
            }
        });
        Object.values(machines).forEach(machine => {
            worksheet.addRow(machine);
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reschedule-details.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};


exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const [fRows] = await connection.execute(`SELECT * FROM shift_production_planning WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("Shifts not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE FROM shift_production_planning WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};