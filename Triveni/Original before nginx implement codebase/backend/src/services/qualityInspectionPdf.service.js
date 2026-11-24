const PDFDocument = require('pdfkit');
const qualityInspectionRepository = require('../repositories/qualityInspection.repository');
const ApiError = require('../utils/ApiError');

// Mirrors the client's own paper form (SLITTING LINE PRODUCTION CUM INSPECTION REPORT) closely
// enough that the printed PDF is a drop-in replacement for it - same header, same coil-info
// block, the same per-slit Width/Act.Width/Weight table, the same Thickness W.S./Center/D.S. x
// Start/End grid, and the same OK/NG visual checks - while staying one coil/lot per document
// (the paper form's "4 coils per sheet" is just how they batch printing, not a reason to merge
// four separate lots into one record - see the earlier gap-analysis note).
//
// The two paper signatures (Quality Check, then a separate GM approval) are intentionally left
// as blank lines to be signed by hand after printing - per the confirmed decision, that approval
// stays a physical-paper formality and never becomes a digital workflow step.

const PAGE_MARGIN = 40;
const INK = '#161B33';
const MUTED = '#5B6584';
const LINE = '#C7CEDD';
const ACCENT = '#2F5CDE';

const SLIT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const THICKNESS_POINTS = ['W.S.', 'Center', 'D.S.'];
const VISUAL_CHECKS = ['Rust', 'Waviness', 'Winding', 'Camber', 'Burr on Cut Edges'];

function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY, matches the paper form's own date style
}

function fmtDateTime(d) {
  if (!d) return '—';
  const date = new Date(d);
  return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function findParam(results, name) {
  return results.find((r) => r.parameter_name.toLowerCase() === name.toLowerCase());
}

function paramValue(results, name) {
  const p = findParam(results, name);
  return p?.actual_value ? String(p.actual_value) : '';
}

function paramOkNg(results, name) {
  const p = findParam(results, name);
  if (!p || !p.result) return '';
  return p.result === 'PASS' ? 'OK' : 'NG';
}

/** A label/value grid, N columns wide, auto-wrapping to the next row - the coil-info block and
 * the decision summary both use this. */
function drawFieldGrid(doc, fields, { columns = 2, colWidth } = {}) {
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const width = colWidth || usableWidth / columns;
  let col = 0;
  let rowStartY = doc.y;
  let maxRowHeight = 0;

  fields.forEach(([label, value], i) => {
    const x = PAGE_MARGIN + col * width;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text(label.toUpperCase(), x, rowStartY, { width: width - 10 });
    doc
      .font('Helvetica')
      .fontSize(10.5)
      .fillColor(INK)
      .text(value ?? '—', x, rowStartY + 11, { width: width - 10 });
    maxRowHeight = Math.max(maxRowHeight, doc.heightOfString(value ?? '—', { width: width - 10 }) + 11);
    col += 1;
    if (col >= columns) {
      col = 0;
      rowStartY += maxRowHeight + 12;
      maxRowHeight = 0;
    }
  });
  doc.y = col === 0 ? rowStartY : rowStartY + maxRowHeight + 12;
  doc.x = PAGE_MARGIN;
}

/** A simple bordered table: header row (shaded) + data rows, column widths given as fractions
 * of the usable page width. */
function drawTable(doc, { columns, rows, rowHeight = 18 }) {
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const widths = columns.map((c) => c.width * usableWidth);
  const startX = PAGE_MARGIN;
  let y = doc.y;

  const drawRow = (cells, { header = false } = {}) => {
    if (y + rowHeight > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    let x = startX;
    if (header) {
      doc.rect(startX, y, usableWidth, rowHeight).fill('#EEF1F9');
    }
    cells.forEach((text, i) => {
      doc
        .font(header ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(8.5)
        .fillColor(header ? MUTED : INK)
        .text(String(text ?? ''), x + 4, y + rowHeight / 2 - 4.5, { width: widths[i] - 8, align: columns[i].align || 'left' });
      x += widths[i];
    });
    doc
      .rect(startX, y, usableWidth, rowHeight)
      .strokeColor(LINE)
      .lineWidth(0.5)
      .stroke();
    let xLine = startX;
    columns.forEach((c, i) => {
      if (i > 0) doc.moveTo(xLine, y).lineTo(xLine, y + rowHeight).strokeColor(LINE).lineWidth(0.5).stroke();
      xLine += widths[i];
    });
    y += rowHeight;
  };

  drawRow(columns.map((c) => c.label), { header: true });
  rows.forEach((r) => drawRow(r));
  doc.y = y + 8;
  doc.x = PAGE_MARGIN;
}

function sectionTitle(doc, text) {
  if (doc.y > doc.page.height - PAGE_MARGIN - 40) doc.addPage();
  doc.moveDown(0.3);
  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(ACCENT)
    .text(text.toUpperCase(), PAGE_MARGIN, doc.y, { characterSpacing: 0.4 });
  const lineY = doc.y + 2;
  doc.moveTo(PAGE_MARGIN, lineY).lineTo(doc.page.width - PAGE_MARGIN, lineY).strokeColor(LINE).lineWidth(0.75).stroke();
  doc.moveDown(0.6);
}

async function generateInspectionPdf(inspectionId, res) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  const [parameterResults, lot] = await Promise.all([
    qualityInspectionRepository.findParameterResults(inspection.id, inspection.attempt_no),
    qualityInspectionRepository.findMachinePlanningRow(inspection.machine_planning_id),
  ]);

  const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN, bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${inspection.inspection_no}.pdf"`);
  doc.pipe(res);

  // ---------- Letterhead ----------
  doc.font('Helvetica-Bold').fontSize(19).fillColor(INK).text('Triveni Enterprises', PAGE_MARGIN, PAGE_MARGIN);
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(MUTED)
    .text('Steel  •  Power  •  Services   —   Steel Service Centre', PAGE_MARGIN, doc.y + 1);
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(MUTED).text('(An ISO 9001:2015 Company)', PAGE_MARGIN, doc.y + 1);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(INK)
    .text(inspection.inspection_no, PAGE_MARGIN, PAGE_MARGIN, { width: doc.page.width - PAGE_MARGIN * 2, align: 'right' });
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(`Date: ${fmtDate(inspection.inspection_datetime)}`, { width: doc.page.width - PAGE_MARGIN * 2, align: 'right' });
  doc.text(`Attempt: ${inspection.attempt_no}`, { width: doc.page.width - PAGE_MARGIN * 2, align: 'right' });

  doc.moveDown(1.2);
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(INK)
    .text('SLITTING LINE PRODUCTION CUM INSPECTION REPORT', PAGE_MARGIN, doc.y, {
      width: doc.page.width - PAGE_MARGIN * 2,
      align: 'center',
    });
  doc.moveDown(0.4);
  doc
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
    .strokeColor(ACCENT)
    .lineWidth(1.5)
    .stroke();
  doc.moveDown(0.8);
  doc.x = PAGE_MARGIN;

  // ---------- Coil / lot info ----------
  sectionTitle(doc, 'Coil & Lot Information');
  drawFieldGrid(
    doc,
    [
      ['Machine No.', inspection.machine_code],
      ['Operator Name', inspection.operator_name],
      ['Customer Name', inspection.customer_name],
      ['Coil No.', inspection.coil_no],
      ['Grade', inspection.grade],
      ['Coil Size', inspection.coil_size],
      ['Coil Wt (T)', inspection.coil_wt != null ? `${inspection.coil_wt}` : null],
      ['Lot No.', inspection.lot_no],
      ['Item Code', inspection.item_code],
      ['Shift', inspection.shift_name],
      ['Coil - Start Time', lot ? fmtTime(lot.production_start_at) : null],
      ['Coil - End Time', lot ? fmtTime(lot.production_end_at) : null],
    ],
    { columns: 3 }
  );

  // ---------- Slit table (only positions with a recorded value) ----------
  const slitRows = SLIT_LETTERS.map((letter, i) => {
    const width = paramValue(parameterResults, `Slit ${letter} - Width`);
    const weight = paramValue(parameterResults, `Slit ${letter} - Weight`);
    if (!width && !weight) return null;
    return [i + 1, letter, width || '—', weight || '—'];
  }).filter(Boolean);

  if (slitRows.length) {
    sectionTitle(doc, 'Slit-wise Width & Weight');
    drawTable(doc, {
      columns: [
        { label: 'Sr. No.', width: 0.12, align: 'center' },
        { label: 'Slit No.', width: 0.18, align: 'center' },
        { label: 'Width (mm)', width: 0.35, align: 'center' },
        { label: 'Weight (Kgs)', width: 0.35, align: 'center' },
      ],
      rows: slitRows,
    });
  }

  // ---------- Thickness grid ----------
  sectionTitle(doc, 'Thickness (mm)');
  drawTable(doc, {
    columns: [
      { label: 'Reading', width: 0.25 },
      ...THICKNESS_POINTS.map((p) => ({ label: p, width: 0.25, align: 'center' })),
    ],
    rows: ['Start', 'End'].map((phase) => [
      phase,
      ...THICKNESS_POINTS.map((p) => paramValue(parameterResults, `Thickness - ${p} - ${phase}`) || '—'),
    ]),
  });

  const inputWidth = paramValue(parameterResults, 'Actual Width of Input Coil');
  if (inputWidth) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text('ACTUAL WIDTH OF INPUT COIL', PAGE_MARGIN, doc.y);
    doc.font('Helvetica').fontSize(10.5).fillColor(INK).text(`${inputWidth} mm`, PAGE_MARGIN, doc.y + 2);
    doc.moveDown(0.8);
  }

  // ---------- Visual quality checks ----------
  sectionTitle(doc, 'Quality Checks');
  drawTable(doc, {
    columns: [
      { label: 'Check', width: 0.6 },
      { label: 'Result', width: 0.4, align: 'center' },
    ],
    rows: VISUAL_CHECKS.map((c) => [c, paramOkNg(parameterResults, c) || '—']),
  });

  // ---------- Any other recorded parameters (keeps the PDF useful for a non-slitting plan too) ----------
  const consumedNames = new Set([
    'Actual Width of Input Coil',
    ...THICKNESS_POINTS.flatMap((p) => [`Thickness - ${p} - Start`, `Thickness - ${p} - End`]),
    ...SLIT_LETTERS.flatMap((l) => [`Slit ${l} - Width`, `Slit ${l} - Weight`]),
    ...VISUAL_CHECKS.map((c) => c.toLowerCase()),
  ]);
  const otherParams = parameterResults.filter((r) => !consumedNames.has(r.parameter_name) && !consumedNames.has(r.parameter_name.toLowerCase()));
  if (otherParams.length) {
    sectionTitle(doc, 'Other Parameters');
    drawTable(doc, {
      columns: [
        { label: 'Parameter', width: 0.32 },
        { label: 'Specification', width: 0.22 },
        { label: 'Actual', width: 0.18, align: 'center' },
        { label: 'Result', width: 0.14, align: 'center' },
        { label: 'Remarks', width: 0.14 },
      ],
      rows: otherParams.map((r) => [r.parameter_name, r.specification || '—', r.actual_value || '—', r.result || '—', r.remarks || '']),
    });
  }

  // ---------- Decision summary ----------
  sectionTitle(doc, 'Inspection Decision');
  drawFieldGrid(
    doc,
    [
      ['Status', inspection.status.replace(/_/g, ' ')],
      ['Quantity Produced', inspection.quantity_produced],
      ['Quantity Accepted', inspection.quantity_accepted ?? '—'],
      ['Quantity Rejected', inspection.quantity_rejected ?? '—'],
      ['Rejection Reason', inspection.rejection_reason || '—'],
      ['Inspector', inspection.inspector_full_name || '—'],
      ['Decided At', fmtDateTime(inspection.updated_at)],
      ['Released to Inventory', inspection.released_to_inventory ? `Yes (${fmtDateTime(inspection.released_at)})` : 'No'],
    ],
    { columns: 2 }
  );
  if (inspection.remarks) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text('OTHER OBSERVATIONS', PAGE_MARGIN, doc.y);
    doc.font('Helvetica').fontSize(10).fillColor(INK).text(inspection.remarks, PAGE_MARGIN, doc.y + 2, { width: doc.page.width - PAGE_MARGIN * 2 });
    doc.moveDown(0.6);
  }

  // ---------- Signatures (left blank for physical sign-off - see file header note) ----------
  if (doc.y > doc.page.height - PAGE_MARGIN - 90) doc.addPage();
  doc.moveDown(1.5);
  const sigY = doc.y;
  const sigWidth = (doc.page.width - PAGE_MARGIN * 2 - 30) / 2;
  [
    ['Quality Check', PAGE_MARGIN],
    ['Approved By (GM)', PAGE_MARGIN + sigWidth + 30],
  ].forEach(([label, x]) => {
    doc.moveTo(x, sigY + 30).lineTo(x + sigWidth, sigY + 30).strokeColor(LINE).lineWidth(0.75).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(label, x, sigY + 34);
  });

  // ---------- Footer on every page ----------
  // Writing this close to the bottom edge is inside pdfkit's own bottom margin, so a plain
  // .text() call here reads as "content overflowed the page" and silently starts a new one -
  // zeroing the bottom margin for just this call keeps the footer from spawning extra blank
  // pages after the real content.
  const pageRange = doc.bufferedPageRange();
  const originalBottomMargin = doc.page.margins.bottom;
  for (let i = 0; i < pageRange.count; i += 1) {
    doc.switchToPage(pageRange.start + i);
    doc.page.margins.bottom = 0;
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        `Generated ${fmtDateTime(new Date())} — Tiveni Quality Management`,
        PAGE_MARGIN,
        doc.page.height - 26,
        { width: doc.page.width - PAGE_MARGIN * 2 - 60, align: 'left', lineBreak: false }
      );
    doc.text(`Page ${i + 1} of ${pageRange.count}`, doc.page.width - PAGE_MARGIN - 100, doc.page.height - 26, {
      width: 100,
      align: 'right',
      lineBreak: false,
    });
    doc.page.margins.bottom = originalBottomMargin;
  }

  doc.end();
}

module.exports = { generateInspectionPdf };
