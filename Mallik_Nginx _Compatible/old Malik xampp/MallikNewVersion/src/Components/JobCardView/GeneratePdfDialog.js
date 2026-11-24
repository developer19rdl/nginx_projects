import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { JobCardView } from '../../ApiService/LoginPageService';

const GeneratePdfDialog = ({
  open,
  handleClose,
  pdfData,
  selectedRowJobCardNo,
  jcId,
  jcDetails: jcDetailsProp,
  bomDetails: bomDetailsProp,
  processDetails: processDetailsProp,
  isChild = true,
  childPartNo
}) => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [jcDetails, setjcDetails] = useState('');
  const [bomDetails, setbomDetails] = useState([]);
  const [processDetails, setprocessDetails] = useState([]);

  useEffect(() => {
    console.log("useEffect triggered", { open, jcId });
    if (open) {
      if (jcDetailsProp || bomDetailsProp || processDetailsProp) {
        setjcDetails(jcDetailsProp || '');
        setbomDetails(bomDetailsProp || []);
        setprocessDetails(processDetailsProp || []);
      } else if (jcId) {
        JobCardView(
          { jcId: jcId },
          handleJobCardViewSuccess,
          handleJobCardViewException
        );
      }
    }
  }, [open, jcId, jcDetailsProp, bomDetailsProp, processDetailsProp]);


  const handleJobCardViewSuccess = (dataObject) => {
    setjcDetails(dataObject?.jcDetails || '');
    setbomDetails(dataObject?.bomDetails || []);
    setprocessDetails(dataObject?.processDetails || []);
  }

  const handleJobCardViewException = () => {
  }
  useEffect(() => {
    if (jcDetails) {
      generatePdf();
    }
  }, [jcDetails, bomDetails, processDetails]);

  const jcDataOut = Array.isArray(jcDetails) ? (jcDetails[0] || {}) : (jcDetails || {});
  const rawGrn = jcDataOut?.grn ?? jcDataOut?.grnNo;
  const fullGrn = (rawGrn && rawGrn !== 'null') ? String(rawGrn) : '';
  const grnList = fullGrn.split(',').map(x => x.trim()).filter(Boolean);

  // Show ONLY ONE GRN in header
  const grnHeaderDisplay = grnList.length > 1 ? `${grnList[0]} ...` : fullGrn;

  // Footer will show ALL GRNs
  const grnFooterDisplay = fullGrn;

  const generatePdf = () => {
    // Use explicit A4 Portrait to avoid browser auto-scaling/shrinking
    const doc = new jsPDF('p', 'mm', 'a4');
    const logoUrl = require('../../AllImage/MallikLogo.png');

    // Group process rows matching UI
    let inHouseRows = [];
    let vendorRows = [];
    let assemblyRows = [];

    let inHouseSummary = null;
    let vendorSummary = null;
    let assemblySummary = null;

    if (Array.isArray(processDetails)) {
      processDetails.forEach(e => {
        const row = [
          e?.sNo ?? '',
          e?.schDate ?? e?.date ?? '',
          e?.shift ?? '',
          e?.process ?? '',
          e?.machineName ?? '',
          e?.producedQty ?? '',
          e?.acptQty ?? '',
          e?.operator ?? '',
          e?.qa ?? '',
          e?.prod_eng ?? e?.prodEng ?? '',
        ];
        if (e.processType === 'inHouse') {
          inHouseRows.push(row);
        } else if (e.processType === 'vendorProcess') {
          vendorRows.push(row);
        } else if (e.processType === 'assembly') {
          assemblyRows.push(row);
        } else {
          inHouseRows.push(row);
        }
      });
    } else if (processDetails && typeof processDetails === 'object') {
      inHouseSummary = processDetails.inHouse;
      vendorSummary = processDetails.vendorProcess;
      assemblySummary = processDetails.assembly;

      const mapRows = (rows) => (rows || []).map(e => [
        e?.sNo ?? '',
        e?.schDate ?? e?.date ?? '',
        e?.shift ?? '',
        e?.process ?? '',
        e?.machineName ?? '',
        e?.producedQty ?? '',
        e?.acptQty ?? '',
        e?.operator ?? '',
        e?.qa ?? '',
        e?.prod_eng ?? e?.prodEng ?? '',
      ]);

      inHouseRows = mapRows(processDetails.inHouse?.rows || processDetails.inHouse);
      vendorRows = mapRows(processDetails.vendorProcess?.rows || processDetails.vendorProcess);
      assemblyRows = mapRows(processDetails.assembly?.rows || processDetails.assembly);
    }

    // BOM rows
    const infobomDetails = (bomDetails || []).map(el => ([
      { content: el?.SITEMCODE ?? el?.itemCode ?? '', colSpan: 2, styles: { halign: 'center' } },
      { content: el?.SITEMNAME ?? el?.itemName ?? '', colSpan: 2, styles: { halign: 'center' } },
      { content: el?.MTHICKNESS ?? el?.materialThickness ?? ' ', colSpan: 2, styles: { halign: 'center' } },
      { content: el?.QTY ?? el?.Qty ?? ' ', colSpan: 1, styles: { halign: 'center' } },
      { content: el?.Child_Produced_Qty ?? el?.preparedQty ?? ' ', colSpan: 1, styles: { halign: 'center' } },
    ]));

    const tableOptions = {};

    const jcData = Array.isArray(jcDetails) ? (jcDetails[0] || {}) : (jcDetails || {});

    // Header block
    const headerBlock = [
      // Row 1: Left logo spans 6 rows, center title, right JC Card No
      [
        { content: '', colSpan: 3, rowSpan: 6, styles: { halign: 'center', valign: 'top' } },
        { content: '', colSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: [0, 0, 0] } },
        { content: 'JC Card No', colSpan: 2, styles: { halign: 'left', valign: 'middle', fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
        { content: `${selectedRowJobCardNo || jcData?.jcNo || jcData?.jcId || ''}`, colSpan: 1, styles: { halign: 'left', valign: 'middle', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
      ],
      // Row 2: Company name centered | JC Issue Date (skip first 3 cols due to rowSpan)
      [
        { content: ``, colSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: [0, 0, 0] } },
        { content: 'JC Issue Date', colSpan: 2, styles: { halign: 'left', valign: 'middle', fontSize: 9, fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
        { content: `${jcData?.issuedDate || jcData?.scheduledDate || ''}`, colSpan: 1, styles: { halign: 'left', valign: 'middle', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
      ],
      // Row 3: center blank | KANBAN Date (skip first 3 cols due to rowSpan)
      [
        // { content: '', colSpan: 3 },
        { content: `JOB CARD`, colSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fontSize: 16, textColor: [0, 0, 0] } },
        { content: 'KANBAN Date', colSpan: 2, styles: { halign: 'left', valign: 'middle', fontSize: 9, fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
        { content: `${jcData?.kanbanDate || ''}`, colSpan: 1, styles: { halign: 'left', valign: 'middle', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },],
      // Row 4: center blank | Schedule Date (skip first 3 cols due to rowSpan)
      [
        { content: '', colSpan: 3 },
        { content: 'Schedule Date', colSpan: 2, styles: { halign: 'left', valign: 'middle', fontSize: 9, fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
        { content: `${jcData?.scheduledDate || ''}`, colSpan: 1, styles: { halign: 'left', valign: 'middle', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
      ],
      // Row 5: center band text | GRN NO (skip first 3 cols due to rowSpan)
      [
        { content: '', colSpan: 3, styles: { halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'bold', textColor: [0, 0, 0] } },
        { content: 'GRN NO', colSpan: 2, styles: { halign: 'left', valign: 'middle', fontSize: 9, fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
        { content: `${grnHeaderDisplay}`, colSpan: 1, styles: { halign: 'left', valign: 'middle', fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
      ],
      // Row 6: center blank | Product Family (skip first 3 cols due to rowSpan)
      [
        { content: 'OTIS Elevator Company (India) ltd', colSpan: 3, styles: { halign: 'center', valign: 'middle', fontSize: 10, fontStyle: 'bold', textColor: [0, 0, 0] } },
        { content: 'Product Family', colSpan: 2, styles: { halign: 'left', valign: 'middle', fontSize: 9, fontStyle: 'bold', fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
        { content: `${jcData?.productFamily || ''}`, colSpan: 1, styles: { halign: 'left', valign: 'middle', fontSize: 10, fillColor: [242, 242, 242], textColor: [0, 0, 0] } },
      ],
    ];

    // Part details
    const partDetailsRowsCount = 6 + ((!isChild && childPartNo) ? 1 : 0);
    const partDetails = [
      [
        { content: 'Part No', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${jcData?.itemCode || ''}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
        { content: `${jcData?.planEngineer || ''}\n\n\nPLANNING ENGINEER SIGN`, colSpan: 3, rowSpan: partDetailsRowsCount, styles: { halign: 'center', valign: 'middle', fontSize: 11, fontStyle: 'bold' } },
      ],
    ];

    if (!isChild && childPartNo) {
      partDetails.push([
        { content: 'Child Part No', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${childPartNo}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
      ]);
    }

    partDetails.push(
      [
        { content: 'Description', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${jcData?.itemName || ''}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
      ],
      [
        { content: 'Material Spec', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${(jcData?.material && jcData?.material !== 'null') ? jcData.material : (jcData?.materialSpec && jcData?.materialSpec !== 'null' ? jcData.materialSpec : '')}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
      ],
      [
        { content: 'Material Thickness', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${jcData?.materialThickness || ''}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
      ],
      [
        { content: 'Planned Qty', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${jcData?.Qty || jcData?.plannedQty || ''}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
      ],
      [
        { content: 'Finishing Details', colSpan: 3, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' } },
        { content: `${jcData?.productFinish || jcData?.finishingDetails || ''}`, colSpan: 3, styles: { halign: 'left', fontSize: 10, } },
      ],
    );

    // Process header row styled blue
    const processHeader = [[
      { content: 'SI NO', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Date', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Shift', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Process', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Machine', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Produced Qty', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Accepted Qty', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Operator', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'QA', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
      { content: 'Prod Eng', styles: { halign: 'center', fontStyle: 'bold', textColor: 'black', } },
    ]];

    // BOM header
    const bomHeader = [[
      { content: 'Item Code', colSpan: 2, styles: { halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: 'black' } },
      { content: 'Item Name', colSpan: 2, styles: { halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: 'black' } },
      { content: 'M Thickness', colSpan: 2, styles: { halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: 'black' } },
      { content: 'Qty', colSpan: 1, styles: { halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: 'black' } },
      { content: 'Produced Qty', colSpan: 1, styles: { halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: 'black' } },
    ]];

    // Footer sections
    const remarks = [[{ content: 'REMARKS:', colSpan: 9, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } }]];
    const actionRemarks = [[{ content: 'ACTION FOR REMARKS :', colSpan: 9, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } }]];
    const accepted = [[{ content: 'ACCEPTED QTY : 0', colSpan: 9, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } }]];
    const reject = [[{ content: 'REJECT/REWORK QTY : 0', colSpan: 9, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } }]];
    const grnNoContinue = [[{ content: `GRN No Continue: ${grnFooterDisplay}`, colSpan: 9, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } }]];
    const fim = [[
      { content: 'FIM STORE 1', colSpan: 3, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold' } },
      { content: 'RECEIVED QTY: 0', colSpan: 3, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold' } },
      { content: 'CELL LEADER SIGN:', colSpan: 3, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold' } },
    ]];
    // const spacer = [[{ content: ' ', colSpan: 9, styles: { cellPadding: { top: 6, bottom: 6 } } }]];

    // 1) Draw top header band (logo/title/right info) and part details box
    // Lock the 9-column widths so all header rows align perfectly
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = { top: 6, right: 10, bottom: 6, left: 10 };
    const estimatedFooterHeight = 36;
    const availWidth = pageWidth - (margins.left + margins.right);
    // Allocate more width to right-side label/value columns (6,7,8)
    const nineColWidths = {
      0: { cellWidth: availWidth * 0.10 },
      1: { cellWidth: availWidth * 0.10 },
      2: { cellWidth: availWidth * 0.10 },
      3: { cellWidth: availWidth * 0.10 },
      4: { cellWidth: availWidth * 0.10 },
      5: { cellWidth: availWidth * 0.10 },
      6: { cellWidth: availWidth * 0.12, cellPadding: { left: 2, right: 2 }, halign: 'left' },
      7: { cellWidth: availWidth * 0.14, cellPadding: { left: 2, right: 2 }, halign: 'left' },
      8: { cellWidth: availWidth * 0.14, cellPadding: { left: 2, right: 2 }, halign: 'left' },
    };
    // Draw logo BEFORE any tables to avoid any chance of overlap
    (function placeLogo() {
      const marginsLocal = { top: 10, right: 10, bottom: 10, left: 10 };
      const availWLocal = pageWidth - (marginsLocal.left + marginsLocal.right);
      const leftBlockWidth = availWLocal * (0.11 * 3);
      // Shrink logo to further reduce header height
      const imgW = 34;
      const imgH = 26;
      const imgX = marginsLocal.left + (leftBlockWidth - imgW) / 2;
      const imgY = 12;
      doc.addImage(logoUrl, 'PNG', imgX, imgY, imgW, imgH);
    })();
    // const doc = new jsPDF('p', 'mm', 'a4');

    const footerText = "FORMAT NO: IMS-ME-PRODN-F-305, REV-'3' 25.06.2025";

    // A) Header only
    doc.autoTable({
      theme: 'grid',
      head: [],
      body: [...headerBlock],
      showHead: 'never',
      startY: margins.top,
      styles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], font: 'times', cellPadding: 0.6, overflow: 'linebreak', minCellHeight: 5 },
      bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: null, fontStyle: 'normal', cellPadding: 0.6 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      tableWidth: availWidth,
      margin: margins,
      columnStyles: nineColWidths,
      // Remove inner grid lines in center band for rows 2-5 (indices 1..4) and columns 3..5
      didParseCell: (data) => {
        if (data.section === 'body') {
          const r = data.row.index; // 0-based within headerBlock
          const c = data.column.index; // 0..8
          if (r >= 0 && r <= 5 && c >= 3 && c <= 5) {
            data.cell.styles.lineWidth = 0; // no borders for internal center cells
            data.cell.styles.lineColor = [255, 255, 255];
          }
          // Trim padding/height on all header rows
          if (r >= 0 && r <= 5) {
            data.cell.styles.minCellHeight = 7.2;
            const cp = data.cell.styles.cellPadding;
            let pad;
            if (cp == null) {
              pad = { top: 0.4, bottom: 0.4, left: 1, right: 1 };
            } else if (typeof cp === 'number') {
              // Convert numeric padding to object form before mutating
              pad = { top: cp, bottom: cp, left: cp, right: cp };
              pad.top = 0.4;
              pad.bottom = 0.4;
              // keep left/right at least 1 for readability
              pad.left = Math.max(1, pad.left);
              pad.right = Math.max(1, pad.right);
            } else {
              pad = cp;
              pad.top = 0.4;
              pad.bottom = 0.4;
              if (pad.left == null) pad.left = 1;
              if (pad.right == null) pad.right = 1;
            }
            data.cell.styles.cellPadding = pad;
          }
        }
      },
      ...tableOptions,
    });

    let cursorY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 4 : margins.top;

    // B) Part details box (separate table so header rowSpans never interfere)
    doc.autoTable({
      theme: 'grid',
      head: [],
      body: [...partDetails],
      showHead: 'never',
      startY: cursorY,
      styles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], font: 'times', cellPadding: 1.5 },
      bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: null, fontStyle: 'normal', cellPadding: 1.5 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      tableWidth: availWidth,
      margin: margins,
      columnStyles: nineColWidths,
    });

    cursorY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 6 : cursorY + 6;

    // 2) Draw Process grids split by processType
    const sections = [
      { title: '[ INHOUSE PROCESSES ]', rows: inHouseRows, summary: inHouseSummary },
      { title: '[ VENDOR PROCESSES ]', rows: vendorRows, summary: vendorSummary },
      { title: '[ ASSEMBLY PROCESSES ]', rows: assemblyRows, summary: assemblySummary }
    ];

    const buildSummaryBox = (title, accepted, rework, rejected, actionLabel, remarksStr, signature) => {
      return [
        [
          { content: title, rowSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [238, 244, 253] } },
          { content: 'Accepted Quantity:', styles: { fontStyle: 'bold', fontSize: 9 } },
          { content: String(accepted), styles: { halign: 'center', valign: 'middle', fontSize: 9 } },
          { content: `${actionLabel}\n${remarksStr}`, rowSpan: 2, styles: { fontStyle: 'bold', valign: 'top', fontSize: 9 } },
        ],
        [
          { content: 'Rework Quantity:', styles: { fontStyle: 'bold', fontSize: 9 } },
          { content: String(rework), styles: { halign: 'center', valign: 'middle', fontSize: 9 } },
        ],
        [
          { content: 'Rejected Quantity:', styles: { fontStyle: 'bold', fontSize: 9 } },
          { content: String(rejected), styles: { halign: 'center', valign: 'middle', fontSize: 9 } },
          { content: `Sign: ${signature}`, styles: { halign: 'right', valign: 'bottom', fontStyle: 'bold', fontSize: 9 } }
        ]
      ];
    };

    const buildSummaryBoxSideBySide = (title, accepted, rework, rejected, actionLabel, remarksStr, signature) => {
      return [
        [
          { content: title, rowSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [238, 244, 253], cellPadding: 1 } },
          { content: 'Acc. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
          { content: String(accepted), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
          { content: `${actionLabel}\n${remarksStr}`, rowSpan: 2, styles: { fontStyle: 'bold', valign: 'top', fontSize: 8, cellPadding: 1 } },
        ],
        [
          { content: 'Rwk. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
          { content: String(rework), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
        ],
        [
          { content: 'Rej. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
          { content: String(rejected), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
          { content: `Sign: ${signature}`, styles: { halign: 'right', valign: 'bottom', fontStyle: 'bold', fontSize: 8, cellPadding: 1 } }
        ]
      ];
    };

    sections.forEach(sec => {
      if (sec.rows.length > 0) {
        // Draw section title
        doc.autoTable({
          theme: 'grid',
          head: [],
          body: [[{ content: sec.title, colSpan: 10, styles: { halign: 'left', fontSize: 10, fontStyle: 'bold', fillColor: [0, 45, 104], textColor: [255, 255, 255] } }]],
          showHead: 'never',
          startY: cursorY,
          styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times' },
          margin: margins,
        });

        cursorY = doc.lastAutoTable.finalY;

        // Draw section grid
        doc.autoTable({
          theme: 'grid',
          head: processHeader,
          body: sec.rows,
          startY: cursorY,
          styles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], font: 'times' },
          headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
          bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: null, fontStyle: 'normal' },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.3,
          margin: margins,
        });

        cursorY = doc.lastAutoTable.finalY + 2;

        // Draw summary block if we have metrics
        if (sec.summary) {
          if (sec.summary.production || sec.summary.inward || sec.summary.quality) {

            // To switch back to stacked design, change this to false
            const useSideBySideSummary = true;

            if (useSideBySideSummary) {
              let startY = cursorY;
              let maxFinalY = cursorY;
              const availWidth = doc.internal.pageSize.width - margins.left - margins.right;
              const halfWidth = (availWidth - 5) / 2;

              const hasLeft = !!(sec.summary.production || sec.summary.inward);
              const hasRight = !!sec.summary.quality;

              if (hasLeft && hasRight) {
                const isProd = !!sec.summary.production;
                const lTitle = isProd ? 'P\nR\nO\nD\n.' : 'I\nN\nW\nA\nR\nD';
                const lActionLabel = isProd ? 'Production Action for Rwk/Rej Qty:' : 'Inward Action for Rwk/Rej Qty:';
                const lObj = isProd ? sec.summary.production : sec.summary.inward;

                const rTitle = 'Q\nA';
                const rActionLabel = 'QA Action for Rwk/Rej Qty:';
                const rObj = sec.summary.quality;

                const actionWidth = halfWidth - 31; // 31 is the sum of columns 0, 1, 2 (8 + 15 + 8)

                const gap = { content: '', rowSpan: 3, styles: { lineWidth: 0, cellWidth: 5, fillColor: false } };
                const body = [
                  [
                    { content: lTitle, rowSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [238, 244, 253], cellPadding: 1 } },
                    { content: 'Acc. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: String(lObj.accepted ?? 0), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
                    { content: `${lActionLabel}\n${lObj.remarks ?? ''}`, rowSpan: 2, styles: { fontStyle: 'bold', valign: 'top', fontSize: 8, cellPadding: 1 } },
                    gap,
                    { content: rTitle, rowSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [238, 244, 253], cellPadding: 1 } },
                    { content: 'Acc. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: String(rObj.accepted ?? 0), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
                    { content: `${rActionLabel}\n${rObj.remarks ?? ''}`, rowSpan: 2, styles: { fontStyle: 'bold', valign: 'top', fontSize: 8, cellPadding: 1 } },
                  ],
                  [
                    { content: 'Rwk. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: String(lObj.rework ?? 0), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
                    { content: 'Rwk. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: String(rObj.rework ?? 0), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
                  ],
                  [
                    { content: 'Rej. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: String(lObj.rejected ?? 0), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
                    { content: `Sign: ${lObj.sign ?? '____________________'}`, styles: { halign: 'right', valign: 'bottom', fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: 'Rej. Qty', styles: { fontStyle: 'bold', fontSize: 8, cellPadding: 1 } },
                    { content: String(rObj.rejected ?? 0), styles: { halign: 'center', valign: 'middle', fontSize: 8, cellPadding: 1 } },
                    { content: `Sign: ${rObj.sign ?? '____________________'}`, styles: { halign: 'right', valign: 'bottom', fontStyle: 'bold', fontSize: 8, cellPadding: 1 } }
                  ]
                ];

                doc.autoTable({
                  theme: 'grid', head: [], body: body, showHead: 'never', startY: startY,
                  styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times', cellPadding: 1.5, textColor: [0, 0, 0] },
                  columnStyles: {
                    0: { cellWidth: 8 }, 1: { cellWidth: 15 }, 2: { cellWidth: 8 }, 3: { cellWidth: actionWidth },
                    4: { cellWidth: 5 },
                    5: { cellWidth: 8 }, 6: { cellWidth: 15 }, 7: { cellWidth: 8 }, 8: { cellWidth: actionWidth }
                  },
                  margin: { left: margins.left, right: margins.right },
                  tableWidth: availWidth,
                  didDrawCell: (data) => {
                    if (data.column.index === 4) {
                      doc.setDrawColor(255, 255, 255);
                      doc.setLineWidth(0.6);
                      // Erase top border of the gap without touching side borders
                      doc.line(data.cell.x + 0.15, data.cell.y, data.cell.x + data.cell.width - 0.15, data.cell.y);
                      // Erase bottom border of the gap without touching side borders
                      doc.line(data.cell.x + 0.15, data.cell.y + data.cell.height, data.cell.x + data.cell.width - 0.15, data.cell.y + data.cell.height);
                    }
                  }
                });
                maxFinalY = Math.max(maxFinalY, doc.lastAutoTable.finalY);
              } else if (hasLeft) {
                const isProd = !!sec.summary.production;
                const title = isProd ? 'P\nR\nO\nD\n.' : 'I\nN\nW\nA\nR\nD';
                const actionLabel = isProd ? 'Production Action for Rwk/Rej Qty:' : 'Inward Action for Rwk/Rej Qty:';
                const summaryObj = isProd ? sec.summary.production : sec.summary.inward;

                const body = buildSummaryBoxSideBySide(
                  title, summaryObj.accepted ?? 0, summaryObj.rework ?? 0, summaryObj.rejected ?? 0,
                  actionLabel, summaryObj.remarks ?? '', summaryObj.sign ?? '____________________'
                );

                doc.autoTable({
                  theme: 'grid', head: [], body: body, showHead: 'never', startY: startY,
                  styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times', cellPadding: 1.5, textColor: [0, 0, 0] },
                  columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 15 }, 2: { cellWidth: 8 } },
                  margin: { left: margins.left, right: margins.right },
                  tableWidth: availWidth,
                });
                maxFinalY = Math.max(maxFinalY, doc.lastAutoTable.finalY);
              } else if (hasRight) {
                const title = 'Q\nA';
                const actionLabel = 'QA Action for Rwk/Rej Qty:';
                const summaryObj = sec.summary.quality;

                const body = buildSummaryBoxSideBySide(
                  title, summaryObj.accepted ?? 0, summaryObj.rework ?? 0, summaryObj.rejected ?? 0,
                  actionLabel, summaryObj.remarks ?? '', summaryObj.sign ?? '____________________'
                );

                doc.autoTable({
                  theme: 'grid', head: [], body: body, showHead: 'never', startY: startY,
                  styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times', cellPadding: 1.5, textColor: [0, 0, 0] },
                  columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 15 }, 2: { cellWidth: 8 } },
                  margin: { left: margins.left, right: margins.right },
                  tableWidth: availWidth,
                });
                maxFinalY = Math.max(maxFinalY, doc.lastAutoTable.finalY);
              }
              cursorY = maxFinalY + 2;

            } else {
              // --- STACKED DESIGN (COMMENTED OUT / false branch) ---
              if (sec.summary.production || sec.summary.inward) {
                const isProd = !!sec.summary.production;
                const title = isProd ? 'P\nR\nO\nD\n.' : 'I\nN\nW\nA\nR\nD';
                const actionLabel = isProd ? 'Production Action for Rwk/Rej Qty:' : 'Inward Action for Rwk/Rej Qty:';
                const summaryObj = isProd ? sec.summary.production : sec.summary.inward;

                const body = buildSummaryBox(
                  title,
                  summaryObj.accepted ?? 0,
                  summaryObj.rework ?? 0,
                  summaryObj.rejected ?? 0,
                  actionLabel,
                  summaryObj.remarks ?? '',
                  summaryObj.sign ?? '____________________'
                );

                doc.autoTable({
                  theme: 'grid',
                  head: [],
                  body: body,
                  showHead: 'never',
                  startY: cursorY,
                  styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times', cellPadding: 1.5, textColor: [0, 0, 0] },
                  columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 20 },
                  },
                  margin: margins,
                });
                cursorY = doc.lastAutoTable.finalY + 2;
              }

              if (sec.summary.quality) {
                const title = 'Q\nA';
                const actionLabel = 'QA Action for Rwk/Rej Qty:';
                const summaryObj = sec.summary.quality;

                const body = buildSummaryBox(
                  title,
                  summaryObj.accepted ?? 0,
                  summaryObj.rework ?? 0,
                  summaryObj.rejected ?? 0,
                  actionLabel,
                  summaryObj.remarks ?? '',
                  summaryObj.sign ?? '____________________'
                );

                doc.autoTable({
                  theme: 'grid',
                  head: [],
                  body: body,
                  showHead: 'never',
                  startY: cursorY,
                  styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times', cellPadding: 1.5, textColor: [0, 0, 0] },
                  columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 20 },
                  },
                  margin: margins,
                });
                cursorY = doc.lastAutoTable.finalY + 2;
              }
            }
            cursorY += 2; // Final spacing after summary blocks
          } else {
            // Fallback for older data format
            const totalAccepted = sec.summary.accepted ?? sec.summary.totalProduced ?? 0;
            const totalRework = sec.summary.rework ?? 0;
            const totalRejected = sec.summary.rejected ?? 0;
            const sign = sec.summary.sign ?? '';

            const summaryText = `TOTAL ACCEPTED: ${totalAccepted}  |  TOTAL REWORK: ${totalRework}  |  TOTAL REJECTED: ${totalRejected}  |  SIGNATURE: ${sign}`;
            doc.autoTable({
              theme: 'grid',
              head: [],
              body: [[{ content: summaryText, colSpan: 10, styles: { halign: 'left', fontSize: 9, fontStyle: 'bold' } }]],
              showHead: 'never',
              startY: cursorY,
              styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times' },
              margin: margins,
            });

            cursorY = doc.lastAutoTable.finalY + 4;
          }
        } else {
          cursorY = cursorY + 2;
        }
      }
    });

    cursorY = cursorY + 2;

    const originalBomCount = bomDetails?.length || 0;

    if (originalBomCount > 0) {
      const pageHeight = doc.internal.pageSize.height;
      const estimatedFooterHeight = 40;

      // If there is very little space left, start BOM on a new page
      if (pageHeight - margins.bottom - cursorY < 60) {
        doc.addPage();
        cursorY = margins.top;
      }

      const rowHeight = 7.5;
      const bomTitleHeight = 12;
      const bomHeaderHeight = 12;

      const spaceForBomPage1 = pageHeight - margins.bottom - cursorY - estimatedFooterHeight - bomTitleHeight - bomHeaderHeight;
      const maxRowsPage1 = Math.max(0, Math.floor(spaceForBomPage1 / rowHeight));

      const spaceForBomNextPage = pageHeight - margins.bottom - margins.top - estimatedFooterHeight - bomHeaderHeight;
      const maxRowsNextPage = Math.max(1, Math.floor(spaceForBomNextPage / rowHeight));

      let targetRowCount = maxRowsPage1;
      if (originalBomCount > maxRowsPage1) {
        const spillover = originalBomCount - maxRowsPage1;
        const spilloverPages = Math.ceil(spillover / maxRowsNextPage);
        targetRowCount = maxRowsPage1 + (spilloverPages * maxRowsNextPage);
      }

      targetRowCount = Math.max(targetRowCount, 5);
      const dummyRowsCount = Math.max(0, targetRowCount - originalBomCount);

      if (dummyRowsCount > 0) {
        for (let i = 0; i < dummyRowsCount; i++) {
          infobomDetails.push([
            { content: ' ', colSpan: 2, styles: { halign: 'center' } },
            { content: ' ', colSpan: 2, styles: { halign: 'center' } },
            { content: ' ', colSpan: 2, styles: { halign: 'center' } },
            { content: ' ', colSpan: 1, styles: { halign: 'center' } },
            { content: ' ', colSpan: 1, styles: { halign: 'center' } },
          ]);
        }
      }

      // 3) BOM title row
      doc.autoTable({
        theme: 'grid',
        head: [],
        body: [[{ content: 'BOM Details for Job Card :', colSpan: 9, styles: { halign: 'left', fontSize: 12, fontStyle: 'bold' } }]],
        showHead: 'never',
        startY: cursorY,
        styles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], font: 'times' },
        bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: null, fontStyle: 'bold' },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.3,
        margin: margins,
      });

      cursorY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : cursorY;

      // 4) BOM grid with header and body
      doc.autoTable({
        theme: 'grid',
        head: bomHeader,
        body: infobomDetails,
        startY: cursorY,
        styles: { lineWidth: 0.3, lineColor: [0, 0, 0], font: 'times' },
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
        bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: null, fontStyle: 'normal' },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.3,
        margin: margins,
        columnStyles: nineColWidths,
      });

      cursorY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 4 : cursorY + 4;
    }

    // 5) Footer sections (remarks etc.)
    const footerBlocks = [
      ...remarks,
      ...actionRemarks,
      ...accepted,
      ...reject,
      ...grnNoContinue,
      ...fim,
      // ...spacer,
    ];

    // If there isn't enough space for the entire footer block, move it to a new page
    const remainingSpace = pageHeight - margins.bottom - cursorY;
    if (remainingSpace < estimatedFooterHeight) {
      doc.addPage();
      cursorY = margins.top;
    }

    doc.autoTable({
      theme: 'grid',
      head: [],
      body: footerBlocks,
      showHead: 'never',
      startY: cursorY,
      styles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], font: 'times', cellPadding: 1.2 },
      bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: null, fontStyle: 'normal', cellPadding: 1.2 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      margin: margins,
    });

    // Optional: pad with dummy space to avoid a large gap after the footer when it starts on a new page
    const afterFooterY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : cursorY;
    const remainingAfterFooter = pageHeight - margins.bottom - afterFooterY;
    if (remainingAfterFooter > 8 && remainingAfterFooter < 40) {
      // Add a small filler block to visually balance the page bottom
      doc.autoTable({
        theme: 'plain',
        head: [],
        body: [[{ content: ' ', colSpan: 9 }]],
        showHead: 'never',
        startY: afterFooterY + 2,
        styles: { cellPadding: { top: remainingAfterFooter - 6, bottom: 0 } },
        margin: margins,
      });
    }

    // Add footer on the last page only (where all data ends)
    const pageCount = doc.internal.getNumberOfPages();
    const pHeight = doc.internal.pageSize.height;
    const pWidth = doc.internal.pageSize.width;
    doc.setPage(pageCount);
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      footerText,
      pWidth / 2,
      pHeight - 5,
      { align: "center" }
    );

    const pdfBlob = doc.output('blob');
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfBlobUrl);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>Job Card Details</DialogTitle>

      <DialogContent style={{ padding: '2px' }}>
        {pdfUrl &&
          <embed src={pdfUrl} type="application/pdf" width="100%" height="600px" />
        }
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneratePdfDialog;
