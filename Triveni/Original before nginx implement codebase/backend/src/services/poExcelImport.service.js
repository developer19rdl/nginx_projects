const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { mkdirp } = require('mkdirp');
const { withTransaction } = require('../config/database');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const excelColumnMappingRepository = require('../repositories/excelColumnMapping.repository');
const poOrderRepository = require('../repositories/poOrder.repository');
const poDetailRepository = require('../repositories/poDetail.repository');
const machineRepository = require('../repositories/machine.repository');
const shiftRepository = require('../repositories/shift.repository');
const itemRepository = require('../repositories/item.repository');

const { generateOrderNo, generateNextPriority } = require('../utils/productionOrderNoGenerator');
const { normalizeHeader, parseQuantity } = require('../validators/productionPlanImport.validator');
const auditService = require('./audit.service');

const STAGED_DIR = path.join(process.cwd(), 'uploads', 'staged');
const INSERT_BATCH_SIZE = 500;

// Excel imports are not tracked in the database at all - a "pending" import lives only as a
// staged JSON file (validated rows + row-level errors) on disk between validate and confirm.
// Nothing here persists an import record, so an abandoned validation (never confirmed) simply
// leaves an orphaned file rather than a dangling DB row; nothing reads it again either way.

function stagedPathFor(importId) {
  // importId comes from req.params - reject anything that isn't the uuid we generated to
  // avoid it being used as a path traversal payload.
  if (!/^[0-9a-f-]{36}$/i.test(importId)) throw ApiError.badRequest('Invalid import id');
  return path.join(STAGED_DIR, `po-${importId}.json`);
}

function readStaged(importId) {
  const stagedPath = stagedPathFor(importId);
  if (!fs.existsSync(stagedPath)) {
    throw ApiError.notFound('This import was not found or has already been confirmed');
  }
  return { stagedPath, staged: JSON.parse(fs.readFileSync(stagedPath, 'utf8')) };
}

async function readHeaderAndRows(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw ApiError.badRequest('The uploaded file has no worksheets');

  const headerRow = worksheet.getRow(1);
  const headerIndex = new Map();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headerIndex.set(normalizeHeader(cell.value), colNumber);
  });

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const isBlank = row.cellCount === 0 || row.values.every((v) => v == null || String(v).trim() === '');
    if (isBlank) return;
    rows.push({ rowNumber, row });
  });

  return { headerIndex, rows, totalRows: rows.length };
}

function cellValue(row, headerIndex, fieldKey, columnHeaderByField) {
  const header = columnHeaderByField.get(fieldKey);
  if (!header) return undefined;
  const colIndex = headerIndex.get(normalizeHeader(header));
  if (!colIndex) return undefined;
  const cell = row.getCell(colIndex);
  return cell.value && typeof cell.value === 'object' && 'text' in cell.value ? cell.value.text : cell.value;
}

/**
 * Validation pipeline for the "machine plan" Production Order template:
 * Machine, Operator, Priority, Customer, Item, Size, Qty, Lot No, Div. Priority is a free-text row
 * priority code (P1, P2, ...) stored as-is, same as Item. The Item column is free text - it's stored
 * on the row as-is and never checked against any item master. Operator is likewise free text -
 * there's a separate Operators master table, but it's empty/unmanaged from any screen right now,
 * so requiring a match against it would block every upload; whatever name is typed is stored as-is.
 * Machine is the opposite: an
 * unrecognized Machine code fails the whole upload (see the unknownMachineRows check below)
 * rather than being reported as a soft per-row error - there's no sensible partial import when
 * the row's target machine doesn't exist. Every valid row resolves to a real machine, so it's
 * created already assigned (see confirmImport) instead of waiting for a later manual assignment.
 * Valid rows + row errors are staged to a JSON file keyed by a generated importId; nothing is
 * written to the database until confirmImport().
 */
async function validateExcel(filePath, originalName) {
  const importId = crypto.randomUUID();

  try {
    const mapping = await excelColumnMappingRepository.findActiveMapping('PRODUCTION_PLAN');
    if (!mapping.length) throw ApiError.internal('Excel column mapping is not configured');

    const columnHeaderByField = new Map(mapping.map((m) => [m.field_key, m.column_header]));
    const requiredFields = mapping.filter((m) => m.is_required).map((m) => m.field_key);

    const { headerIndex, rows, totalRows } = await readHeaderAndRows(filePath);

    const missingColumns = mapping
      .filter((m) => !headerIndex.has(normalizeHeader(m.column_header)))
      .map((m) => m.column_header);
    if (missingColumns.length) {
      const errors = missingColumns.map((col) => ({
        row_no: 1,
        column_name: col,
        error_message: `Required column "${col}" was not found in the uploaded file`,
        raw_data: null,
      }));
      await stageResult(importId, { fileName: originalName, validRows: [], errors });
      return { importId, status: 'ValidationFailed', totalRows, validRows: 0, invalidRows: totalRows };
    }

    const parsedRows = [];
    const machineCodes = new Set();
    for (const { rowNumber, row } of rows) {
      const raw = {};
      for (const field of columnHeaderByField.keys()) {
        raw[field] = cellValue(row, headerIndex, field, columnHeaderByField);
      }
      parsedRows.push({ rowNumber, raw });
      if (raw.machine_code) machineCodes.add(String(raw.machine_code).trim());
    }

    const machineMap = await machineRepository.findCodesMap([...machineCodes]);

    const unknownMachineRows = parsedRows
      .filter(({ raw }) => raw.machine_code && !machineMap.has(String(raw.machine_code).trim()))
      .map(({ rowNumber, raw }) => `row ${rowNumber} ("${String(raw.machine_code).trim()}")`);
    if (unknownMachineRows.length) {
      throw ApiError.badRequest(
        `Unknown machine code(s): ${unknownMachineRows.join(', ')}. Add the machine in Machine Master or correct the Excel, then re-upload.`
      );
    }

    const errors = [];
    const validRows = [];

    for (const { rowNumber, raw } of parsedRows) {
      const rowErrors = [];

      for (const field of requiredFields) {
        const v = raw[field];
        if (v == null || String(v).trim() === '') {
          rowErrors.push({
            rowNo: rowNumber,
            columnName: columnHeaderByField.get(field),
            message: `${columnHeaderByField.get(field)} is required`,
          });
        }
      }

      const itemCode = raw.item_code ? String(raw.item_code).trim() : null;

      const machineCode = raw.machine_code ? String(raw.machine_code).trim() : null;
      const machine = machineCode ? machineMap.get(machineCode) : null;

      const quantity = parseQuantity(raw.quantity);
      if (raw.quantity != null && String(raw.quantity).trim() !== '' && (quantity == null || quantity <= 0)) {
        rowErrors.push({ rowNo: rowNumber, columnName: 'Qty', message: 'Qty must be a positive number' });
      }

      const customerName = raw.customer_name ? String(raw.customer_name).trim() : null;
      const priority = raw.priority ? String(raw.priority).trim() : null;

      if (rowErrors.length) {
        errors.push(
          ...rowErrors.map((e) => ({ row_no: e.rowNo, column_name: e.columnName, error_message: e.message, raw_data: raw }))
        );
        continue;
      }

      validRows.push({
        customerName,
        priority,
        itemCode,
        machineId: machine.id,
        machineCode: machine.machine_code,
        operatorName: raw.operator_name ? String(raw.operator_name).trim() : null,
        division: raw.division ? String(raw.division).trim() : null,
        size: raw.size ? String(raw.size).trim() : null,
        lotNo: raw.lot_no ? String(raw.lot_no).trim() : null,
        quantity,
        sourceRowNo: rowNumber,
      });
    }

    await stageResult(importId, { fileName: originalName, validRows, errors });

    const status = validRows.length > 0 ? 'Validated' : 'ValidationFailed';
    return { importId, status, totalRows, validRows: validRows.length, invalidRows: errors.length };
  } catch (err) {
    logger.error('Production order Excel validation failed', { error: err.message, importId });
    throw err;
  } finally {
    fs.unlink(filePath, () => {});
  }
}

async function stageResult(importId, payload) {
  await mkdirp(STAGED_DIR);
  fs.writeFileSync(stagedPathFor(importId), JSON.stringify(payload));
}

async function getImportErrors(importId) {
  const { staged } = readStaged(importId);
  return staged.errors || [];
}

async function buildErrorWorkbookBuffer(importId) {
  const { staged } = readStaged(importId);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Errors');
  sheet.columns = [
    { header: 'Row No', key: 'row_no', width: 10 },
    { header: 'Column', key: 'column_name', width: 25 },
    { header: 'Error', key: 'error_message', width: 60 },
    { header: 'Raw Data', key: 'raw_data', width: 60 },
  ];
  (staged.errors || []).forEach((e) => {
    sheet.addRow({ row_no: e.row_no, column_name: e.column_name, error_message: e.error_message, raw_data: JSON.stringify(e.raw_data) });
  });
  return workbook.xlsx.writeBuffer();
}

/** Builds a blank .xlsx with the currently configured column headers (in display_order) for the
 * Production Order import template, so the download always matches whatever's configured in
 * excel_column_mappings rather than duplicating the header list in code. */
async function buildTemplateWorkbookBuffer() {
  const mapping = await excelColumnMappingRepository.findActiveMapping('PRODUCTION_PLAN');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Production Order');
  sheet.columns = mapping.map((m) => ({ header: m.column_header, key: m.field_key, width: 18 }));
  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

/**
 * Confirms a previously validated import: creates one Production_Order (master), auto-generating
 * Order No and priority (previous priority + 1), using the manually supplied Schedule Date +
 * Shift. Every valid row becomes a Machine_Planning detail row already assigned to the machine
 * its Excel row named AND scheduled onto that same Date + Shift - the order's status is
 * recomputed straight to Assigned, the plan is complete the moment it's imported, no manual
 * assignment step needed. The staged file is deleted once the order is created - there is no
 * lasting database record of the import itself.
 */
async function confirmImport(importId, { orderDate, shiftId }, userId, req) {
  if (!orderDate) throw ApiError.badRequest('Schedule Date is required');
  if (!shiftId) throw ApiError.badRequest('Shift is required');

  const shift = await shiftRepository.findById(shiftId);
  if (!shift) throw ApiError.badRequest('Invalid shift');

  const { stagedPath, staged } = readStaged(importId);
  const validRows = staged.validRows;
  if (!validRows.length) throw ApiError.badRequest('There are no valid rows to import');

  const result = await withTransaction(async (connection) => {
    const orderNo = await generateOrderNo(connection);
    const priority = await generateNextPriority(connection);
    const totalQuantity = validRows.reduce((sum, r) => sum + r.quantity, 0);

    const order = await poOrderRepository.create(
      {
        orderNo,
        orderDate,
        priority,
        sourceFileName: staged.fileName,
        totalRows: validRows.length,
        totalQuantity,
        createdBy: userId,
      },
      connection
    );

    for (let i = 0; i < validRows.length; i += INSERT_BATCH_SIZE) {
      const batch = validRows
        .slice(i, i + INSERT_BATCH_SIZE)
        .map((r) => ({ ...r, orderId: order.id, scheduleDate: orderDate, shiftId }));
      await poDetailRepository.bulkInsert(batch, connection);
    }

    // Keep the Items master in sync with what's actually being produced - one row per unique
    // (Item, Size) combination seen in this upload, skipping any combination that already exists
    // rather than creating a duplicate (see item.repository.js#ensureExist).
    const itemsSeen = new Map();
    for (const r of validRows) {
      const key = JSON.stringify([r.itemCode, r.size || '']);
      if (!itemsSeen.has(key)) itemsSeen.set(key, { itemCode: r.itemCode, size: r.size });
    }
    await itemRepository.ensureExist([...itemsSeen.values()], connection);

    // Every row was created with its machine already resolved, so the order is fully planned -
    // flip its status from the default "Imported" to reflect that immediately.
    await poOrderRepository.recomputeStatus(order.id, connection);

    return poOrderRepository.findById(order.id, connection);
  });

  await auditService.fromRequest(req, {
    action: 'IMPORT',
    module: 'production_order',
    recordId: result.id,
    newValue: { orderNo: result.order_no, priority: result.priority, totalRows: result.total_rows },
    remarks: `Imported from ${staged.fileName}`,
  });

  fs.unlink(stagedPath, () => {});

  return result;
}

module.exports = { validateExcel, confirmImport, getImportErrors, buildErrorWorkbookBuffer, buildTemplateWorkbookBuffer };
