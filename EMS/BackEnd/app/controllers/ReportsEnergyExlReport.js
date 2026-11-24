const excel = require('exceljs');
const moment = require('moment-timezone');
const { getEnergyConsumptionData } = require('./ReportsEnergyConsumReport');
const { connection } = require('../config/dbSql2');


exports.EnergyConsumReportExcel = async (req, res) => {
    try {
        const { meterId, fromDate: fd, toDate: td } = req.query;
        const fromDate = moment(fd, 'YYYY-MM-DD').format('YYYY-MM-DD');
        const toDate = moment(td, 'YYYY-MM-DD').format('YYYY-MM-DD');

        // Get Energy Consumption 
        const { data, total } = await getEnergyConsumptionData(meterId, fromDate, toDate);

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        if (meterId == -1) {    // All machines
            return await allMachineConsumptionReport(res, workbook, worksheet, data, total);

        } else {    // Individual Machine
            const [machineRows] = await connection.execute(`SELECT displayName FROM meters WHERE id = ?`, [meterId]);

            if (machineRows.length === 0) {
                throw new Error('Machine not found!');
            }
            const machineName = machineRows[0].displayName;
            return await machineConsumptionReport(res, workbook, worksheet, data, machineName, fromDate, toDate);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: err });
    }
};


// Machine wise Report
const machineConsumptionReport = async (res, workbook, worksheet, data, machineName, fromDate, toDate) => {
    worksheet.addRow([`Energy Consumption (${machineName})`]);  // Add the title row and merge cells
    worksheet.mergeCells('A1:C2');

    worksheet.addRow([`From  :   ${fromDate}`]);    // Add 'From' and 'To' date rows and merge cells
    worksheet.mergeCells('A3:B3');
    worksheet.addRow([`To      :   ${toDate}`]);
    worksheet.mergeCells('A4:B4');

    applyHeaderStyles(worksheet);

    worksheet.addRow([]);   // Add an empty row before headers

    // headers
    const headerRow = worksheet.addRow([
        "Sl No",
        "Date",
        "Energy Consumption"
    ]);

    // Apply header styles
    headerRow.font = { bold: true, size: 13 };
    headerRow.alignment = { horizontal: "center" };

    // Set column widths
    worksheet.columns = [
        { key: 'id', width: 15, style: { alignment: { horizontal: 'center' } } },
        { key: 'date', width: 26, style: { alignment: { horizontal: 'center' } } },
        { key: 'energyConsum', width: 32, style: { alignment: { horizontal: 'center' } } }
    ];

    // Add data to the worksheet
    data.forEach((row, index) => {
        const updatedRow = [index + 1, row.date, row.energyConsum];
        const addedRow = worksheet.addRow(updatedRow);
        addedRow.eachCell({ includeEmpty: true }, cell => {
            cell.alignment = { horizontal: 'center' };
        });
    });

    return setResponseHeadersAndWriteWorkbook(res, workbook);
};


// All Machines report
const allMachineConsumptionReport = async (res, workbook, worksheet, data, total) => {
    const { data: resultSet, headers } = data;
    const { consumption, input } = headers;

    const headersArray = consumption.concat(input);     // Conacat Two headers

    // 'input' = [...incomer type labels (e.g. Electric Board Incomer, Solar, Generator,
    // Windmill, UPS — whichever are configured), 'Diff/loss']. The merged "INCOMER"
    // title spans every incomer column except the trailing Diff/loss column.
    const consumptionEndColumn = getColumnAlphabet(consumption.length);
    const inputStartColumn = getColumnAlphabet(consumption.length + 1);
    const inputEndColumn = getColumnAlphabet(consumption.length + input.length - 1);

    worksheet.addRow([]);   // Empty row

    worksheet.mergeCells(`A1:${consumptionEndColumn}2`);
    worksheet.getCell('A1').value = 'CONSUMPTION';  // Adding header value to merged cells

    worksheet.mergeCells(`${inputStartColumn}1:${inputEndColumn}2`);
    worksheet.getCell(`${inputStartColumn}1`).value = 'INCOMER';  // Adding header value to merged cells

    // applying cell styles
    applyCellStyles(worksheet, ['A1', `${inputStartColumn}1`], 14)

    worksheet.addRow(headersArray); // pushing headers array to excel row
    applyRowStyles(worksheet, headersArray, consumption.length) // applying row styles

    // Setting column properties — meter columns (between Date and Total) get a
    // narrow, rotated-text width; Date/Total/incomer/Diff-loss columns are wider
    const columns = headersArray.map((header, index) => ({
        key: header,
        width: (index >= 1 && index < consumption.length - 1) ? 8 : 18,
        style: { alignment: { horizontal: 'center' } }
    }));
    worksheet.columns = columns;
    worksheet.getRow(3).height = 80;    // Increasing row height

    // Add data to the worksheet
    resultSet.forEach(row => {
        const addedRow = worksheet.addRow(row);
        addedRow.eachCell({ includeEmpty: true }, cell => {
            cell.alignment = { horizontal: 'center' };
        });
    });

    applyTotals(worksheet, consumption.length, input, resultSet, total); // Apply total

    applyBordersToWorksheet(worksheet); // Apply Borders

    return setResponseHeadersAndWriteWorkbook(res, workbook);
}


// Function to apply HeaderStyles
function applyHeaderStyles(worksheet) {
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A1').font = { bold: true, size: 14 };

    worksheet.getCell('A3').font = { size: 12 };
    worksheet.getCell('A4').font = { size: 12 };
}

// Function to apply cell styles
function applyCellStyles(worksheet, cellRefs, cellSize) {
    cellRefs.forEach(cellRef => {
        const cell = worksheet.getCell(cellRef);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true, size: cellSize };
    });
}

// Custom function to generate column alphabet for large column indices
function getColumnAlphabet(columnIndex) {
    let columnAlphabet = '';

    while (columnIndex > 0) {
        let remainder = (columnIndex - 1) % 26;
        columnAlphabet = String.fromCharCode(65 + remainder) + columnAlphabet;
        columnIndex = Math.floor((columnIndex - 1) / 26);
    }

    return columnAlphabet;
}

// Function to apply row styles
// consumptionLen = number of consumption columns (Date, meters..., Total). Meter
// columns (between Date and Total) get rotated header text; everything else doesn't.
function applyRowStyles(worksheet, headersArray, consumptionLen) {
    const endCol = consumptionLen - 1;

    for (let i = 1; i <= headersArray.length; i++) {
        const col = getColumnAlphabet(i);
        const cell = worksheet.getCell(col + '3');

        if (i > 1 && i <= endCol) {
            cell.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 90 };
            cell.font = { bold: 'lighter', size: 13 };
            // worksheet.getColumn(i).width = 8;
        } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { bold: 'lighter', size: 13 };
        }
    }
}



// Function to apply Totals at the end
// consumptionLen = number of consumption columns; the last one ('Total') gets
// total.totConsumption. Each input column (incomer type labels + 'Diff/loss')
// is looked up from `total` by that exact label, since the report data keys
// its rows the same way.
function applyTotals(worksheet, consumptionLen, input, data, total) {
    const row = data.length + 4; // Assuming your data starts from row 4

    const totalCol = getColumnAlphabet(consumptionLen);
    worksheet.getCell(`${totalCol}${row}`).value = total.totConsumption;

    const cellRefs = [`${totalCol}${row}`];
    input.forEach((label, idx) => {
        const colAlpha = getColumnAlphabet(consumptionLen + 1 + idx);
        const cellRef = `${colAlpha}${row}`;
        worksheet.getCell(cellRef).value = label === 'Diff/loss' ? total.totDiff : total[label];
        cellRefs.push(cellRef);
    });

    applyCellStyles(worksheet, cellRefs, 12);   // applying cell styles for total values
}

// Function to apply borders to the worksheet
function applyBordersToWorksheet(worksheet) {
    const totalRows = worksheet.rowCount;
    for (let i = 1; i <= totalRows; i++) {
        worksheet.getRow(i).eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    }
}

// Function to set response headers and write workbook
function setResponseHeadersAndWriteWorkbook(res, workbook) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Energy Consuption Report.xlsx');

    workbook.xlsx.write(res)
        .then(() => {
            res.end();
        })
        .catch(err => {
            console.error('Error writing Excel file:', err);
            res.status(500).send('Error generating Excel file');
        });
}