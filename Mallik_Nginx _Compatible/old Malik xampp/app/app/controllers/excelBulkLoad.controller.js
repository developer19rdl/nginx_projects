const excel = require('exceljs');
const fs = require('fs');
const { connection, handleSuccessResponse, handleErrorResponse } = require('../config/dbSql');
const MASTER_CONFIG = require('../config/masterConfig');
const { resolveForeignKeys } = require('./bulkUpdate.controller');

// Yield the event loop this often while parsing, so a very large upload doesn't hold the
// single Node thread solid for its entire parse and starve every other request on the server
const YIELD_EVERY_N_ROWS = 5000;
const yieldToEventLoop = () => new Promise(resolve => setImmediate(resolve));

/**
 * Loads and parses Excel data for bulk update preview
 * Maps Excel columns to database fields and performs basic validation
 *
 * Reads the uploaded file via ExcelJS's streaming WorkbookReader (row-by-row from disk) instead
 * of Workbook.xlsx.load(), which eagerly parses the entire file into an in-memory model — for a
 * multi-hundred-thousand-row sheet that model can run 5-10x the file size in RAM. Response shape
 * is unchanged: still the full parsed dataset in one JSON payload, same as before.
 */
exports.loadExcel = async (req, res) => {
    const file = req.file;
    try {
        const { type } = req.body;

        if (!file) throw new Error("File is required");

        const config = MASTER_CONFIG[type];
        if (!config) throw new Error(`Unsupported master type: ${type}`);

        const fieldMapping = {};
        const data = [];
        let sawWorksheet = false;

        const workbookReader = new excel.stream.xlsx.WorkbookReader(file.path, {
            entries: 'ignore',
            sharedStrings: 'cache',
            hyperlinks: 'ignore',
            styles: 'ignore',
            worksheets: 'emit'
        });

        for await (const worksheetReader of workbookReader) {
            sawWorksheet = true;
            let rowNumber = 0;

            for await (const row of worksheetReader) {
                rowNumber += 1;

                if (rowNumber === 1) {
                    // 1. Identify Headers and Map to Fields
                    row.eachCell((cell, colNumber) => {
                        const headerText = (cell.text || '').trim();
                        if (!headerText) return;

                        // Normalize header text for comparison
                        const normalizedHeader = headerText.toLowerCase().replace(/[^a-z0-9]/g, '');

                        // a. Direct match against config fields
                        let matchedField = config.fields.find(f => f.toLowerCase() === normalizedHeader);

                        // b. Match against primary key
                        if (!matchedField && config.primaryKey && config.primaryKey.toLowerCase() === normalizedHeader) {
                            matchedField = config.primaryKey;
                        }

                        // c. Match against aliases
                        if (!matchedField && config.excelAliases && config.excelAliases[normalizedHeader]) {
                            matchedField = config.excelAliases[normalizedHeader];
                        }

                        if (matchedField) {
                            fieldMapping[colNumber] = matchedField;
                        }
                    });
                    continue;
                }

                // 2. Extract this data row
                const rowData = { rowNo: rowNumber - 1, status: 'VALID', errors: [] };
                let hasData = false;

                Object.keys(fieldMapping).forEach(colNumber => {
                    const field = fieldMapping[colNumber];
                    const cell = row.getCell(Number(colNumber));

                    let value = cell.text;
                    if (cell.type === excel.ValueType.Formula) value = cell.result;

                    if (value !== undefined && value !== "") {
                        rowData[field] = value.toString().trim();
                        hasData = true;
                    }
                });

                if (hasData) {
                    // Basic Validation
                    if (config.validateRow) {
                        config.validateRow(rowData);
                    } else {
                        if (!rowData.itemCode && !rowData.id) {
                            rowData.status = 'ERROR';
                            rowData.errors.push("itemCode or ID is required");
                        }
                    }

                    data.push(rowData);
                }

                if (rowNumber % YIELD_EVERY_N_ROWS === 0) {
                    await yieldToEventLoop();
                }
            }

            break; // only the first worksheet, matching the previous getWorksheet(1) behavior
        }

        if (!sawWorksheet) throw new Error("Worksheet not found in Excel file");

        // 3. Resolve IDs and Validate Foreign Keys
        if (data.length > 0) {
            await resolveAndValidateData(connection, config, data);
        }

        return res.status(200).json({
            success: true,
            message: "Excel data parsed successfully",
            rowCount: data.length,
            mappedFields: Object.values(fieldMapping),
            data
        });

    } catch (err) {
        return handleErrorResponse(res, err);
    } finally {
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) console.error("Temp upload file deletion error:", err);
            });
        }
    }
};

/**
 * Resolves item IDs from itemCode and validates all Foreign Key names
 */
async function resolveAndValidateData(conn, config, data) {
    const { primaryKey } = config;

    // 1. Resolve Primary Key (ID) if missing
    if (config.resolveId) {
        await config.resolveId(conn, data);
    } else {
        const itemCodes = [...new Set(data
            .filter(row => row.itemCode && !row[primaryKey])
            .map(row => row.itemCode)
        )];

        if (itemCodes.length > 0) {
            const itemRows = [];
            const CHUNK_SIZE = 5000;
            for (let i = 0; i < itemCodes.length; i += CHUNK_SIZE) {
                const chunk = itemCodes.slice(i, i + CHUNK_SIZE);
                const [rows] = await conn.query(
                    `SELECT id, itemCode FROM items WHERE itemCode IN (?)`,
                    [chunk]
                );
                itemRows.push(...rows);
            }

            const codeToIdMap = new Map(itemRows.map(r => [r.itemCode.toUpperCase(), r.id]));

            data.forEach(row => {
                if (row.itemCode && !row[primaryKey]) {
                    const id = codeToIdMap.get(row.itemCode.toUpperCase());
                    if (id) {
                        row[primaryKey] = id;
                    } else {
                        row.status = 'ERROR';
                        row.errors.push(`Item Code "${row.itemCode}" not found in database`);
                    }
                }
            });
        }
    }

    // 2. Resolve and Validate Foreign Keys (itemGroup, uom, location, etc.) — shared with
    // bulkUpdateMaster's write-path resolver (see resolveForeignKeys for why), but flag bad
    // rows individually instead of aborting the whole upload: a preview needs to show every
    // problem row at once so the user can fix them, not stop at the first one.
    // validateOnly: this is a preview, not a write — /master re-resolves everything itself
    // when the data is actually submitted, so writing the resolved id here would only
    // overwrite the human-readable value the user uploaded with a number, for no benefit
    await resolveForeignKeys(conn, config, data, {
        validateOnly: true,
        onUnresolved: (row, field, label, originalValue) => {
            row.status = 'ERROR';
            row.errors.push(`${label} "${originalValue}" not found in master`);
        }
    });
}
