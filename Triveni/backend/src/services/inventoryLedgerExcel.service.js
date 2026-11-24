const ExcelJS = require('exceljs');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const ApiError = require('../utils/ApiError');

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };
const THIN_BORDER = { style: 'thin', color: { argb: 'FFCBD5E1' } };
const CELL_BORDER = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER };

const TYPE_LABELS = {
  QUALITY_ACCEPTANCE: 'Quality Acceptance',
  DISPATCH: 'Dispatch',
  TRANSFER_OUT: 'Transfer Out',
  TRANSFER_IN: 'Transfer In',
  ADJUSTMENT_IN: 'Adjustment In',
  ADJUSTMENT_OUT: 'Adjustment Out',
  HOLD: 'Hold',
  RELEASE: 'Hold Release',
};

function fmtDateTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

const COLUMNS = [
  { header: 'Date', width: 18, value: (r) => fmtDateTime(r.created_at) },
  { header: 'Transaction', width: 20, value: (r) => TYPE_LABELS[r.transaction_type] || r.transaction_type },
  { header: 'Reference', width: 22, value: (r) => r.inspection_no || r.transaction_no },
  { header: 'Order No', width: 22, value: (r) => r.order_no || '' },
  { header: 'Lot No', width: 16, value: (r) => r.lot_no || '' },
  // Coil identity as it stood at inspection time (quality_inspections' own denormalized snapshot -
  // see the Inventory Transaction dialog's Coil Info section) - only ever populated on a
  // QUALITY_ACCEPTANCE row, blank for every other transaction type.
  { header: 'Coil No', width: 16, value: (r) => r.coil_no || '' },
  { header: 'Coil Grade', width: 14, value: (r) => r.grade || '' },
  { header: 'Coil Size', width: 14, value: (r) => r.coil_size || '' },
  { header: 'Coil Wt', width: 12, value: (r) => (r.coil_wt != null ? Number(r.coil_wt) : null) },
  { header: 'Location', width: 22, value: (r) => `${r.warehouse_code} / ${r.location_code}` },
  { header: 'In', width: 12, value: (r) => (Number(r.qty_in) > 0 ? Number(r.qty_in) : null) },
  { header: 'Out', width: 12, value: (r) => (Number(r.qty_out) > 0 ? Number(r.qty_out) : null) },
  { header: 'Balance', width: 14, value: (r) => Number(r.running_balance) },
];

/**
 * The full Inventory Ledger (running on-hand balance) for one item(+size/+lot), same filters and
 * same row shape LedgerPage.jsx renders on screen - exported as a single sheet so it can be
 * shared/archived outside the app rather than only viewed live.
 */
async function generateLedgerExcel(filters, res) {
  if (!filters.itemCode) throw ApiError.badRequest('An Item Code is required to export a ledger');
  const rows = await inventoryTransactionRepository.getLedger(filters);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tiveni Inventory';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Inventory Ledger');

  sheet.mergeCells('A1:M1');
  sheet.getCell('A1').value = 'Inventory Ledger';
  sheet.getCell('A1').font = { bold: true, size: 14 };

  const filterParts = [`Item: ${filters.itemCode}`];
  if (filters.size) filterParts.push(`Size: ${filters.size}`);
  if (filters.lotNo) filterParts.push(`Lot No: ${filters.lotNo}`);
  if (filters.dateFrom) filterParts.push(`From: ${filters.dateFrom}`);
  if (filters.dateTo) filterParts.push(`To: ${filters.dateTo}`);
  sheet.mergeCells('A2:M2');
  sheet.getCell('A2').value = filterParts.join('   ·   ');
  sheet.getCell('A2').font = { size: 10, color: { argb: 'FF64748B' } };

  const headerRowIdx = 4;
  const headerRow = sheet.getRow(headerRowIdx);
  COLUMNS.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width;
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.border = CELL_BORDER;
    cell.alignment = { vertical: 'middle' };
  });
  headerRow.height = 20;

  rows.forEach((r, rowIdx) => {
    const row = sheet.getRow(headerRowIdx + 1 + rowIdx);
    COLUMNS.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = col.value(r);
      cell.border = CELL_BORDER;
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="ledger-${filters.itemCode}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateLedgerExcel };
