const ExcelJS = require('exceljs');
const qualityInspectionRepository = require('../repositories/qualityInspection.repository');
const ApiError = require('../utils/ApiError');

const LABEL_FONT = { bold: true, color: { argb: 'FF64748B' } };
const SECTION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
const SECTION_FONT = { bold: true, color: { argb: 'FF0F172A' }, size: 11 };
const TABLE_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
const TABLE_HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };
const THIN_BORDER = { style: 'thin', color: { argb: 'FFCBD5E1' } };
const CELL_BORDER = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER };

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB');
}

function fmtDateTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

/** One "Label: Value" pair per row, two pairs across (4 cells) - mirrors the on-screen header
 * grid's 4-per-row layout (InspectionReport.jsx's own InfoField grid). `sheet.cursor` is a plain
 * mutable row-index tracker passed in by reference (an object, not a number) so every helper below
 * can advance it without the caller re-threading a return value through every call. */
function writeFieldPairs(sheet, cursor, pairs) {
  for (let i = 0; i < pairs.length; i += 2) {
    const row = sheet.getRow(cursor.row);
    const [label1, value1] = pairs[i];
    row.getCell(1).value = label1;
    row.getCell(1).font = LABEL_FONT;
    row.getCell(2).value = value1 ?? '—';
    if (pairs[i + 1]) {
      const [label2, value2] = pairs[i + 1];
      row.getCell(3).value = label2;
      row.getCell(3).font = LABEL_FONT;
      row.getCell(4).value = value2 ?? '—';
    }
    cursor.row += 1;
  }
}

function writeSectionTitle(sheet, cursor, title) {
  cursor.row += 1;
  sheet.mergeCells(cursor.row, 1, cursor.row, 8);
  const cell = sheet.getRow(cursor.row).getCell(1);
  cell.value = title.toUpperCase();
  cell.font = SECTION_FONT;
  cell.fill = SECTION_FILL;
  cell.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(cursor.row).height = 20;
  cursor.row += 1;
}

function writeTable(sheet, cursor, { columns, rows }) {
  const headerRow = sheet.getRow(cursor.row);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.label;
    cell.font = TABLE_HEADER_FONT;
    cell.fill = TABLE_HEADER_FILL;
    cell.border = CELL_BORDER;
  });
  cursor.row += 1;

  rows.forEach((values) => {
    const row = sheet.getRow(cursor.row);
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v ?? '';
      cell.border = CELL_BORDER;
    });
    cursor.row += 1;
  });
}

/**
 * One Quality Inspection Report (header/coil info, decision summary, full parameter results, and
 * any logged defects) as a single Excel sheet - a generic, sortable/filterable companion to the
 * PDF's paper-form replica (qualityInspectionPdf.service.js), not a redraw of the same fixed
 * slit/thickness grid, since that layout only makes sense as a print form.
 */
async function generateInspectionExcel(inspectionId, res) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  const [parameterResults, defects] = await Promise.all([
    qualityInspectionRepository.findParameterResults(inspection.id, inspection.attempt_no),
    qualityInspectionRepository.findDefects(inspection.id, inspection.attempt_no),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tiveni Quality Management';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Inspection Report');
  // Same 8 columns serve both layouts on this sheet: the 4-per-row Label/Value field grid (columns
  // 1-4) and the wider 8-column Parameter Results/Defects tables below it - widths are chosen to
  // read reasonably in both.
  [24, 20, 20, 20, 10, 16, 10, 24].forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  sheet.mergeCells('A1:H1');
  sheet.getCell('A1').value = 'Quality Inspection Report';
  sheet.getCell('A1').font = { bold: true, size: 14 };

  sheet.mergeCells('A2:H2');
  sheet.getCell('A2').value = `${inspection.inspection_no}   ·   Attempt ${inspection.attempt_no}   ·   ${fmtDate(inspection.inspection_datetime)}`;
  sheet.getCell('A2').font = { size: 10, color: { argb: 'FF64748B' } };

  const cursor = { row: 4 };

  writeSectionTitle(sheet, cursor, 'Lot Details');
  writeFieldPairs(sheet, cursor, [
    ['Order No', inspection.order_no],
    ['Lot No', inspection.lot_no],
    ['Item Code', inspection.item_code],
    ['Item Name', inspection.item_name],
    ['Customer', inspection.customer_name],
    ['Machine', inspection.machine_code],
    ['Operator', inspection.operator_name],
    ['Shift', inspection.shift_name],
    ['Inspection Type', inspection.inspection_type],
    ['Sample Size', inspection.sample_size],
  ]);

  if (inspection.coil_no || inspection.grade || inspection.coil_size || inspection.coil_wt != null) {
    writeSectionTitle(sheet, cursor, 'Coil Info');
    writeFieldPairs(sheet, cursor, [
      ['Coil No', inspection.coil_no],
      ['Grade', inspection.grade],
      ['Coil Size', inspection.coil_size],
      ['Coil Wt', inspection.coil_wt],
    ]);
  }

  writeSectionTitle(sheet, cursor, 'Decision');
  writeFieldPairs(sheet, cursor, [
    ['Status', inspection.status.replace(/_/g, ' ')],
    ['Quantity Produced', inspection.quantity_produced],
    ['Quantity Accepted', inspection.quantity_accepted],
    ['Quantity Rejected', inspection.quantity_rejected],
    ['Rejection Reason', inspection.rejection_reason],
    ['Inspector', inspection.inspector_full_name],
    ['Decided At', fmtDateTime(inspection.updated_at)],
    ['Released to Inventory', inspection.released_to_inventory ? `Yes (${fmtDateTime(inspection.released_at)})` : 'No'],
  ]);
  if (inspection.remarks) {
    writeFieldPairs(sheet, cursor, [['Remarks', inspection.remarks]]);
  }

  writeSectionTitle(sheet, cursor, 'Parameter Results');
  writeTable(sheet, cursor, {
    columns: [
      { label: 'Parameter' },
      { label: 'Category' },
      { label: 'Specification' },
      { label: 'Tolerance' },
      { label: 'Unit' },
      { label: 'Actual' },
      { label: 'Result' },
      { label: 'Remarks' },
    ],
    rows: parameterResults.map((p) => [
      p.parameter_name,
      p.parameter_category,
      p.specification,
      p.tolerance,
      p.unit_of_measure,
      p.actual_value,
      p.result,
      p.remarks,
    ]),
  });

  if (defects.length) {
    writeSectionTitle(sheet, cursor, 'Defects');
    writeTable(sheet, cursor, {
      columns: [{ label: 'Defect Code' }, { label: 'Defect Name' }, { label: 'Category' }, { label: 'Qty Rejected' }, { label: 'Notes' }],
      rows: defects.map((d) => [d.defect_code, d.defect_name, d.category, d.quantity_rejected, d.notes]),
    });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${inspection.inspection_no}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateInspectionExcel };
