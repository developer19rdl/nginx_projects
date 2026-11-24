const excel = require('exceljs');
const fs = require('fs');
const path = require('path');
const { connection, handleSuccessResponse, handleErrorResponse, CustomError } = require('../config/dbSql');
const { getUser } = require('../utility/utilityFunction');

const MASTER_CONFIG = require('../config/masterConfig');
const asyncHandler = require('../utility/asyncHandler');

const BATCH_SIZE = 500;
// Pause the DB row stream once the export file's internal write buffer grows past this size,
// so a slow disk can't let unbounded rows queue up in memory ahead of it
const EXPORT_BACKPRESSURE_BYTES = 16 * 1024 * 1024;

const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toCamelCase = (str) => str ? (str.charAt(0).toLowerCase() + str.slice(1)) : '';

const selectExpr = (config, field) => {
    const expr = (config.columnMap && config.columnMap[field]) || `\`${field}\``;
    return `${expr} AS \`${field}\``;
};

exports.getMasterFields = asyncHandler(async (req, res) => {
    const { type } = req.query;

    if (!type) {
        throw new CustomError('Type is required', 400);
    }

    const normalizedType = toCamelCase(type);
    const config = MASTER_CONFIG[normalizedType];
    if (!config) {
        throw new CustomError(`Unsupported master type: ${type}`, 400);
    }
    const fields = config.displayFields || config.fields;
    const pascalFields = fields.map(toPascalCase);
    return handleSuccessResponse(res, "Master fields", pascalFields);
});

exports.listMasters = asyncHandler(async (req, res) => {
    const list = Object.keys(MASTER_CONFIG).map(key => ({
        type: key,
        displayName: toPascalCase(key),
        tableName: MASTER_CONFIG[key].tableName
    }));
    return handleSuccessResponse(res, "List of all masters", list);
});

exports.getMasterData = asyncHandler(async (req, res) => {
    const { type, columns } = req.query;

    if (!type) {
        throw new CustomError('Type is required', 400);
    }
    if (!columns) {
        throw new CustomError('Columns are required', 400);
    }

    const normalizedType = toCamelCase(type);
    const config = MASTER_CONFIG[normalizedType];
    if (!config) {
        throw new CustomError(`Unsupported master type: ${type}`, 400);
    }

    const { tableName, primaryKey, fromClause } = config;
    const fields = config.displayFields || config.fields;

    // Parse requested columns
    const requestedCols = (Array.isArray(columns) ? columns : columns.split(','))
        .map(col => col.trim())
        .filter(Boolean);

    const validDbColumns = [];

    // Always include the primary key in the SELECT query (mandatory for updates)
    validDbColumns.push(selectExpr(config, primaryKey));

    requestedCols.forEach(col => {
        // Find matching field case-insensitively from MASTER_CONFIG fields
        const matchedField = fields.find(f => f.toLowerCase() === col.toLowerCase());
        if (matchedField && matchedField.toLowerCase() !== primaryKey.toLowerCase()) {
            validDbColumns.push(selectExpr(config, matchedField));
        }
    });

    if (validDbColumns.length === 1 && requestedCols.length > 0) {
        throw new CustomError('None of the requested columns are valid fields', 400);
    }

    // Build unique column list and execute query
    const uniqueDbColumns = [...new Set(validDbColumns)];
    const sql = `SELECT ${uniqueDbColumns.join(', ')} FROM ${fromClause || tableName}`;

    const [rows] = await connection.execute(sql);

    return handleSuccessResponse(res, `${type} data retrieved`, rows);
});

/**
 * Optimized Dynamic Bulk Update API
 */
exports.bulkUpdateMaster = async (req, res) => {
    const conn = await connection.getConnection();
    try {
        const { type, data } = req.body;
        const username = await getUser(req);

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ success: false, message: "No data provided" });
        }

        const normalizedType = toCamelCase(type);
        const config = MASTER_CONFIG[normalizedType];
        if (!config) {
            return res.status(400).json({ success: false, message: `Unsupported master type: ${type}` });
        }

        // Normalize data keys to match MASTER_CONFIG fields exactly (case-insensitive lookup),
        // since some fields (e.g. bom's `Qty`) don't start lowercase like plain toCamelCase output
        const fieldLookup = new Map(config.fields.map(f => [f.toLowerCase(), f]));
        fieldLookup.set(config.primaryKey.toLowerCase(), config.primaryKey);

        const normalizedData = data.map(row => {
            const newRow = {};
            for (const key of Object.keys(row)) {
                const matchedField = fieldLookup.get(key.toLowerCase()) || toCamelCase(key);
                newRow[matchedField] = row[key];
            }
            return newRow;
        });

        await conn.beginTransaction();

        // Resolve Foreign Key names to IDs if strings are provided
        await resolveForeignKeys(conn, config, normalizedData);

        const updatedCount = await executeBulkUpdate(conn, config, normalizedData, username);

        await conn.commit();

        if (config.postUpdate) {
            try {
                await config.postUpdate(conn);
            } catch (postErr) {
                console.error(`postUpdate hook failed for master type "${type}" (data was already committed):`, postErr);
            }
        }

        return handleSuccessResponse(res, `${type} bulk update completed`, { updatedCount });
    } catch (err) {
        await conn.rollback();
        console.error("Bulk update error:", err);
        return handleErrorResponse(res, err);
    } finally {
        conn.release();
    }
};

const FK_RESOLVE_CHUNK_SIZE = 5000;

async function resolveForeignKeys(conn, config, data, { onUnresolved, validateOnly = false } = {}) {
    const { fkMappings } = config;
    if (!fkMappings) return;

    for (const field of Object.keys(fkMappings)) {
        const { table, column = 'name', targetField = field, alwaysResolve = false, strict = false, label = field } = fkMappings[field];

        const isResolvable = (val) => typeof val === 'string' && val.trim() !== '' && (alwaysResolve || isNaN(val));
        const rowsToResolve = data.filter(row => row.hasOwnProperty(field) && isResolvable(row[field]));
        if (rowsToResolve.length === 0) continue;

        // Collect unique values to resolve
        const uniqueValues = [...new Set(rowsToResolve.map(row => row[field].toString().trim()))];

        // Fetch matching IDs in chunks to avoid overly large IN (?) clauses
        const valueToIdMap = new Map();
        for (let i = 0; i < uniqueValues.length; i += FK_RESOLVE_CHUNK_SIZE) {
            const chunk = uniqueValues.slice(i, i + FK_RESOLVE_CHUNK_SIZE);
            const [rows] = await conn.query(
                `SELECT id, \`${column}\` AS value FROM ${table} WHERE \`${column}\` IN (?)`,
                [chunk]
            );
            rows.forEach(r => valueToIdMap.set(r.value.toString().toUpperCase().trim(), r.id));
        }

        // Write resolved ids into targetField; track anything that didn't match.
        const unresolved = new Set();
        rowsToResolve.forEach(row => {
            const originalValue = row[field];
            const key = originalValue.toString().toUpperCase().trim();
            const id = valueToIdMap.get(key);
            if (id) {
                if (!validateOnly) row[targetField] = id;
            } else {
                if (!validateOnly) row[targetField] = null;
                unresolved.add(originalValue);
                if (onUnresolved) onUnresolved(row, field, label, originalValue);
            }
        });

        if (!onUnresolved && strict && unresolved.size > 0) {
            const preview = [...unresolved].slice(0, 20).join(', ');
            throw new CustomError(`${label} not found: ${preview}${unresolved.size > 20 ? '…' : ''}`, 400);
        }
    }
}

exports.resolveForeignKeys = resolveForeignKeys;

/**
 * High-performance bulk update using UPDATE with JSON lookup
 */
async function executeBulkUpdate(conn, config, data, username) {
    const { tableName, primaryKey, fields, booleanFields } = config;

    const chunks = chunkArray(data, BATCH_SIZE);
    let totalAffected = 0;

    for (const chunk of chunks) {
        const validRows = chunk.filter(row => row[primaryKey]);
        if (validRows.length === 0) continue;

        const queryParams = [];
        const selectSegments = validRows.map(row => {
            const segmentParams = [row[primaryKey]];
            const segmentPlaceholders = ['? AS id'];

            if (config.trackUpdates !== false) {
                segmentParams.push(username);
                segmentPlaceholders.push('? AS updatedBy');
            }

            fields.forEach(field => {
                const idField = `${field}_id`;
                let val = row.hasOwnProperty(idField) && row[idField] !== null ? row[idField] : row[field];

                // Handle Boolean conversions
                if (booleanFields && booleanFields.includes(field)) {
                    if (val === 'Y') val = 1;
                    else if (val === 'N') val = 0;
                }

                if (val === '' || val === undefined) val = null;

                segmentParams.push(val);
                segmentPlaceholders.push(`? AS \`${field}\``);
            });

            queryParams.push(...segmentParams);
            return `SELECT ${segmentPlaceholders.join(', ')}`;
        }).join(' UNION ALL ');

        let setClausesStr = fields.map(field => {
            return `i.\`${field}\` = COALESCE(tmp.\`${field}\`, i.\`${field}\`)`;
        }).join(', ');

        if (config.trackUpdates !== false) {
            setClausesStr += `,
                i.updatedBy = tmp.updatedBy,
                i.updated_at = NOW()`;
        }

        const sql = `
            UPDATE ${tableName} i
            JOIN (${selectSegments}) AS tmp ON i.\`${primaryKey}\` = tmp.id
            SET ${setClausesStr}
        `;

        const [result] = await conn.query(sql, queryParams);
        totalAffected += result.affectedRows;
    }

    return totalAffected;
}

function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

exports.exportMasterData = asyncHandler(async (req, res) => {
    const { type, columns } = req.query;

    if (!type) {
        throw new CustomError('Type is required', 400);
    }

    const normalizedType = toCamelCase(type);
    const config = MASTER_CONFIG[normalizedType];
    if (!config) {
        throw new CustomError(`Unsupported master type: ${type}`, 400);
    }

    const { tableName, primaryKey, fromClause } = config;
    const fields = config.displayFields || config.fields;

    const columnsToQuery = [];
    const headers = [];
    const fieldNames = [];
    const seenFields = new Set();

    const addField = (field) => {
        if (seenFields.has(field)) return;
        seenFields.add(field);
        columnsToQuery.push(selectExpr(config, field));
        headers.push(toPascalCase(field));
        fieldNames.push(field);
    };

    // Always include the primary key as the first column/header
    addField(primaryKey);

    if (columns) {
        // Parse requested columns
        const requestedCols = (Array.isArray(columns) ? columns : columns.split(','))
            .map(col => col.trim())
            .filter(Boolean);

        requestedCols.forEach(col => {
            const matchedField = fields.find(f => f.toLowerCase() === col.toLowerCase());
            if (matchedField && matchedField.toLowerCase() !== primaryKey.toLowerCase()) {
                addField(matchedField);
            }
        });

        if (fieldNames.length === 1 && requestedCols.length > 0) {
            throw new CustomError('None of the requested columns are valid fields', 400);
        }
    } else {
        // If columns are not specified, export all fields configured for this master
        fields.forEach(field => {
            if (field.toLowerCase() !== primaryKey.toLowerCase()) {
                addField(field);
            }
        });
    }

    const sql = `SELECT ${columnsToQuery.join(', ')} FROM ${fromClause || tableName}`;

    // Create a temporary file path
    const tempDir = path.join(process.cwd(), 'cache');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, `export_${type}_${Date.now()}.xlsx`);
    const fileStream = fs.createWriteStream(tempFilePath);

    const workbook = new excel.stream.xlsx.WorkbookWriter({
        stream: fileStream,
        useStyles: true,
        useSharedStrings: false
    });
   
    const worksheet = workbook.addWorksheet(toPascalCase(type), {
        views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    worksheet.columns = headers.map((header, idx) => {
        const fieldName = fieldNames[idx];
        const isIdCol = idx === 0;
        return {
            header: header,
            key: fieldName,
            width: isIdCol ? undefined : 20,
            style: {
                protection: { locked: isIdCol }
            }
        };
    });

    // Style the header row and lock every cell so column names can't be edited
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell((cell) => {
        cell.protection = { locked: true };
    });
    headerRow.commit();

    // Enable worksheet protection so locked settings are enforced
    worksheet.protect('', {
        selectLockedCells: true,
        selectUnlockedCells: true
    });

    const conn = await connection.getConnection();
    let dbStream;
    let connectionReleased = false;

    const cleanup = () => {
        if (!connectionReleased) {
            if (dbStream) dbStream.destroy();
            conn.release();
            connectionReleased = true;
        }
    };

    try {
        dbStream = conn.connection.query(sql).stream();

        await new Promise((resolve, reject) => {
            dbStream.on('data', (row) => {
                try {
                    const rowData = fieldNames.map(fieldName => {
                        const val = row[fieldName];
                        return val === null || val === undefined ? '' : val;
                    });
                    const sheetRow = worksheet.addRow(rowData);
                    // Explicitly set cell-level protection in streaming mode to override Excel's default "locked" behavior
                    sheetRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const isIdCol = colNumber === 1;
                        cell.protection = { locked: isIdCol };
                    });
                    sheetRow.commit();

                    if (fileStream.writableLength > EXPORT_BACKPRESSURE_BYTES) {
                        dbStream.pause();
                        fileStream.once('drain', () => dbStream.resume());
                    }
                } catch (err) {
                    dbStream.destroy(err);
                }
            });

            dbStream.on('error', (err) => {
                reject(err);
            });

            dbStream.on('end', () => {
                resolve();
            });
        });

        cleanup();

        worksheet.commit();

        const fileFinished = new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });

        await workbook.commit();
        await fileFinished;

        // Send the fully generated file
        res.download(tempFilePath, `${toPascalCase(type)}_Export.xlsx`, (err) => {
            // Clean up the temp file after sending
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error("Temp file deletion error:", unlinkErr);
            });
            if (err && !res.headersSent) {
                console.error("Download error:", err);
            }
        });
    } catch (err) {
        cleanup();
        fileStream.destroy();
        fs.unlink(tempFilePath, () => {});
        throw err;
    }
});
