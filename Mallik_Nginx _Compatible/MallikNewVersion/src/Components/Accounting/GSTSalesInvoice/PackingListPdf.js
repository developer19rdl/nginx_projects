import React from "react";
import "./Pdf.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { PDFDocument } from 'pdf-lib';
import { PackingListPrintShow } from "../../../ApiService/LoginPageService";

const PackingListPdf = (props) => {
    const { rowData, disabled } = props;
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

    const numberToWords = (num) => {
        if (!num || num === 0) return 'Zero';
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const g = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

        const convertGroup = (n) => {
            let s = '';
            if (n >= 100) {
                s += a[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                s += b[Math.floor(n / 10)] + ' ';
                n %= 10;
            }
            if (n > 0) {
                s += a[n] + ' ';
            }
            return s.trim();
        };

        let parts = [];
        let str = parseFloat(num).toFixed(2).toString();
        let [integerPart, decimalPart] = str.split('.');

        let nInt = parseInt(integerPart, 10);
        let nDec = parseInt(decimalPart, 10);

        if (nInt === 0) {
            parts.push('Zero');
        } else {
            let groupIdx = 0;
            while (nInt > 0) {
                let rem = nInt % 1000;
                if (rem > 0) {
                    let groupStr = convertGroup(rem);
                    if (g[groupIdx]) {
                        groupStr += ' ' + g[groupIdx];
                    }
                    parts.unshift(groupStr);
                }
                nInt = Math.floor(nInt / 1000);
                groupIdx++;
            }
        }

        let result = parts.join(' ').trim();
        if (nDec > 0) {
            result += ' and cents ' + convertGroup(nDec);
        }
        return result.trim();
    };

    const handlePrintClick = () => {
        if (!rowData) return;
        PackingListPrintShow({ id: rowData }, handlePdfPlSuccess, handePdfPlException);
        setPdfModalOpen(true);
    };

    const handlePdfPlSuccess = async (dataObject) => {
        if (!dataObject?.data) return;
        const blob = handleFileSave(dataObject.data);
        if (blob) {
            const mergedUrl = await mergeJsPdfBlobs([blob]);
            setMergedPdfUrl(mergedUrl);
        }
    }

    const handePdfPlException = (errorStatus, errorMessage) => {
        console.error("Error generating Packing List: ", errorMessage);
    }

    const mergeJsPdfBlobs = async (blobs) => {
        const mergedPdf = await PDFDocument.create();
        for (const blob of blobs) {
            const arrayBuffer = await blob.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach((page) => mergedPdf.addPage(page));
        }
        const mergedPdfBytes = await mergedPdf.save();
        const mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        return URL.createObjectURL(mergedBlob);
    };

    const handleFileSave = (data) => {
        const packingList = data.invoice || data.packingList;
        const companyInfo = data.invoice || data.packingList;
        const items = data.items || [];

        let info = [];
        let totalNetWeight = 0;
        let totalQty = 0;
        let totalAmount = 0;

        items.forEach((element, index) => {
            let nw = parseFloat(element.netWeight) || 0;
            let qty = parseFloat(element.plQty || 0);
            // let rate = parseFloat(element.rate || element.stdRate || element.invRate || 0);
            // let amt = parseFloat(element.amt || element.invAmt || element.amount || (qty * rate) || 0);

            // totalNetWeight += nw;
            // totalQty += qty;
            // totalAmount += amt;

            let noOfBoxStr = element.noOfBox || '';
            let qntyPerBoxStr = element.plQty || '';
            // if (!qntyPerBoxStr && noOfBoxStr && qty > 0) {
            //     let nBox = parseFloat(noOfBoxStr);
            //     if (nBox > 0) qntyPerBoxStr = Math.round(qty / nBox).toString();
            // }

            info.push([
                index + 1,
                element.itemCode || element.partNo || '',
                element.itemName || element.partName || '',
                element.noOfPackages || element.descOfPackage || '',
                element.boxDimension || element.boxDim || packingList?.remrk1 || '',
                nw.toFixed(2),
                element.poNo || '',
                qntyPerBoxStr,
                noOfBoxStr,
                qty
            ]);
        });

        // Fill empty rows dynamically to push footer to the bottom
        function emptyRowsToPush(lineItems) {
            const pageSize = 39, header = 20, footer = 10;
            const content = header + lineItems + footer;
            const totPage = Math.floor(content / pageSize) + 1;
            const totalContentSize = pageSize * totPage;
            const rowToPush = totalContentSize - content;
            return rowToPush;
        }

        const paddingNeeded = emptyRowsToPush(items.length);
        for (let i = 0; i < paddingNeeded; i++) {
            info.push(['', '', '', '', '', '', '', '', '', '']);
        }

        let currLabel = packingList?.currency
            ? packingList.currency.toUpperCase()
            : 'USD';

        // Add Box Size & Aluminium remarks
        // info.push([
        //     {
        //         content: `Box Size: ${packingList?.remrk1 || '790X540X760MM'}`,
        //         colSpan: 3, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
        //     },
        //     {
        //         content: '',
        //         colSpan: 5, styles: { lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
        //     }
        // ]);
        // info.push([
        //     {
        //         content: `${packingList?.remrk3 || 'No Aluminium content'}`,
        //         colSpan: 3, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
        //     },
        //     {
        //         content: '',
        //         colSpan: 5, styles: { lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
        //     }
        // ]);
        info.push([
            {
                content: `HSN CODE: ${items[0]?.hsnCode || packingList?.gstNo || ''}`,
                colSpan: 3, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            },
            {
                content: '',
                colSpan: 5, styles: { lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            }
        ]);
        info.push([
            {
                content: `Description : ${packingList?.remrk2 || 'Sheet Metal Components'}`,
                colSpan: 3, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            },
            {
                content: '',
                colSpan: 5, styles: { lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            }
        ]);


        // Add Total row
        // info.push([
        //     // { content: 'Total', colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
        //     // { content: totalNetWeight.toFixed(2), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
        //     { content: '', styles: { halign: 'center', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
        //     { content: '', styles: { halign: 'center', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
        //     { content: '', styles: { halign: 'center', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
        //     { content: totalQty.toString(), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
        // ]);

        info.push([
            {
                content: `Note:\n${data.invoice?.note || ''} `,
                colSpan: 10, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            }
        ]);

        // Add Total in Words row
        // info.push([
        //     { content: `Total Amount in words : ${currLabel} ${numberToWords(totalAmount)} Only.`, colSpan: 10, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
        // ]);

        const doc = new jsPDF();
        const baseUrl = process.env.REACT_APP_API_URL?.replace("/api", "") || "";
        const logoUrl = companyInfo?.companyImage ? `${baseUrl}/${companyInfo.companyImage}` : '';
        const ISOUrl = require('../../../AllImage/Picture.png');

        const tableOptions = {
            styles: { font: 'times', fontSize: 8, textColor: 'black' },
            didDrawPage: (HookData) => {
                const pageSize = doc.internal.pageSize;
                const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

                if (HookData.pageNumber > 1) {
                    doc.setFontSize(9);
                    doc.setFont('times', 'normal');
                    doc.setTextColor('black');
                    doc.text(
                        `Invoice No : ${packingList?.invNo || ''}     |     Date : ${packingList?.date || ''}`,
                        14,
                        10
                    );
                }

                doc.setFontSize(8);
                doc.setFont('times', 'normal');
                doc.setTextColor(70);
                // doc.text(
                //     `E. & O. E.   |   Subject to Bengaluru Jurisdiction`,
                //     14, pageHeight - 5
                // );
                doc.text(
                    `Page ${HookData.pageNumber}`,
                    pageWidth - 14, pageHeight - 5, { align: 'right' }
                );
            },
        };

        // Draw header logo & company info
        const header1 = [
            [
                { content: '', styles: { halign: 'left', lineWidth: 0, minCellWidth: 35, minCellHeight: 28 } },
                {
                    content: `${companyInfo?.companyName || ''}\n${companyInfo?.companyAdd || ''}\nTel: ${companyInfo?.telNo || ''} | Web: ${companyInfo?.website || ''}\nEmail: ${companyInfo?.email || ''}`,
                    styles: { halign: 'left', valign: 'middle', fontSize: 8, textColor: 'black', lineWidth: 0, fontStyle: 'bold' }
                },
                { content: '', styles: { halign: 'right', lineWidth: 0, minCellWidth: 38, minCellHeight: 28 } },
                {
                    content: `ISO 9001 : 2015\nISO 14001 : 2015\nOHSAS 18001 : 2007`,
                    styles: { halign: 'center', valign: 'bottom', fontSize: 7.5, textColor: 'black', lineWidth: 0, fontStyle: 'bold', minCellWidth: 30 }
                }
            ]
        ];

        doc.autoTable({
            body: header1,
            theme: 'plain',
            startY: 5,
            margin: { left: 10, right: 10, top: 0, bottom: 0 },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,
            styles: { font: 'times', fontSize: 8, textColor: 'black' },
            didDrawCell: (data) => {
                if (data.column.index === 0 && data.row.index === 0 && logoUrl) {
                    try {
                        doc.addImage(logoUrl, 'PNG', data.cell.x + 1, data.cell.y + 2, 28, 22);
                    } catch (e) { }
                }
                if (data.column.index === 3 && data.row.index === 0) {
                    try {
                        doc.addImage(ISOUrl, 'PNG', data.cell.x - 2, data.cell.y + 1, 34, 14);
                    } catch (e) { }
                }
            },
            didDrawPage: tableOptions.didDrawPage,
        });

        // Draw registration details table (header2)
        const header2 = [
            [
                { content: `IEC NUMBER : ${companyInfo?.iecNo || ''}`, styles: { fontSize: 8, fontStyle: 'bold' } },
                { content: `AD CODE NO. : ${companyInfo?.adCode || ''}`, styles: { fontSize: 8, fontStyle: 'bold' } },
                { content: `INVOICE NO: ${packingList?.plNo || ''}`, styles: { fontSize: 8, fontStyle: 'bold' } }
            ],
            [
                { content: `GSTIN : ${companyInfo?.cmpGstNo || ''}`, styles: { fontSize: 8, fontStyle: 'bold' } },
                { content: `PAN : ${companyInfo?.cmpPanNo || ''}`, styles: { fontSize: 8, fontStyle: 'bold' } },
                { content: `Date : ${packingList?.date || ''}`, styles: { fontSize: 8, fontStyle: 'bold' } }
            ]
        ];

        doc.autoTable({
            body: header2,
            theme: 'grid',
            margin: { top: 0, left: 10, right: 10, bottom: 0 },
            startY: doc.lastAutoTable.finalY,
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            columnStyles: {
                0: { cellWidth: 63.3 },
                1: { cellWidth: 63.3 },
                2: { cellWidth: 63.3 }
            },
            bodyStyles: {
                minCellHeight: 7,
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                cellPadding: { top: 2, bottom: 1, left: 3, right: 2 }
            },
            ...tableOptions
        });

        // Banner PACKING LIST
        doc.autoTable({
            body: [[
                {
                    content: 'PACKING LIST',
                    colSpan: 3,
                    styles: {
                        halign: 'center',
                        fontSize: 12,
                        fontStyle: 'bold',
                        textColor: '#FFFFFF',
                        fillColor: '#002D68',
                        lineWidth: 0.1,
                        lineColor: '#000000'
                    }
                }
            ]],
            theme: 'grid',
            margin: { left: 10, right: 10 },
            startY: doc.lastAutoTable.finalY,
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1
        });

        // Exporter / Buyer address details
        const addressDetails = [
            [
                { content: "DRAWER(EXPORTER)", styles: { fontStyle: "bold", fillColor: [245, 245, 245], minCellHeight: 5 } },
                { content: "BUYER (CONSIGNEE)", styles: { fontStyle: "bold", fillColor: [245, 245, 245], minCellHeight: 5 } }
            ],
            [
                {
                    content: `${companyInfo?.companyName || ''}\n${companyInfo?.companyAdd || ''}\nTel: ${companyInfo?.telNo || ''}`,
                    styles: { fontStyle: "normal", minCellHeight: 12 }
                },
                {
                    content: `${packingList?.cName || ''}\n${packingList?.billAdd || ''}`,
                    styles: { fontStyle: "normal", minCellHeight: 12 }
                }
            ],
            [
                { content: "SHIP TO", styles: { fontStyle: "bold", fillColor: [245, 245, 245], minCellHeight: 5 } },
                { content: "NOTIFY PARTY", styles: { fontStyle: "bold", fillColor: [245, 245, 245], minCellHeight: 5 } }
            ],
            [
                {
                    content: `${packingList?.Consignee || packingList?.cName || ''}\n${packingList?.add4 || ''}\n${packingList?.city || ''}`,
                    styles: { fontStyle: "normal", minCellHeight: 10 }
                },
                {
                    content: `Same as Consignee\n\nCustomer Contact details\nName: ${packingList?.cName || ''}\nEmail ID: ${packingList?.custEmails || ''}\nPhone No: ${packingList?.bi_phoneNo || ''}`,
                    styles: { fontStyle: "normal", minCellHeight: 24 }
                }
            ]
        ];

        doc.autoTable({
            body: addressDetails,
            theme: 'grid',
            margin: { top: 0, left: 10, right: 10, bottom: 0 },
            startY: doc.lastAutoTable.finalY,
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,
            columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } },
            bodyStyles: { cellPadding: { top: 1, bottom: 1, left: 2, right: 1 } },
            ...tableOptions
        });

        // Transit details
        const transitDetails = [
            [
                { content: `COUNTRY OF ORIGIN OF GOODS : ${packingList?.countryOriginGoods || ''}`, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } },
                { content: `SHIP VIA : ${packingList?.modelOfDis || packingList?.modeOfDispatch || ''}`, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } },
                { content: `SHIP DATE : ${packingList?.shipDate ? (isNaN(new Date(packingList.shipDate)) ? packingList.shipDate : new Date(packingList.shipDate).toLocaleDateString('en-GB')) : ''}`, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } },
            ],
            // [
            //     { content: `PORT OF DISCHARGE : ${packingList?.portDischarge || ''}`, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } },
            //     { content: `Final Destination : ${packingList?.finalDestination || packingList?.city || ''}`, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } },
            //     { content: `Terms of Delivery & Payment : ${packingList?.termDelPay || ''}`, styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' } }
            // ]
        ];

        doc.autoTable({
            body: transitDetails,
            theme: 'grid',
            margin: { top: 0, left: 10, right: 10, bottom: 0 },
            startY: doc.lastAutoTable.finalY,
            styles: { font: 'times', fontSize: 8, textColor: 'black', lineWidth: 0.3, lineColor: [0, 0, 0] },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.3,
            columnStyles: {
                0: { cellWidth: 63.3 },
                1: { cellWidth: 63.3 },
                2: { cellWidth: 63.3 }
            },
            bodyStyles: {
                minCellHeight: 5,
                cellPadding: { top: 1, bottom: 1, left: 3, right: 2 }
            }
        });

        // Items headers & details table
        const itemHeaders = [
            [
                { content: '#', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'MARKS & NOS./CONTAINER NO./PART NO', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'COMMODITY DESCRIPTION', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'NO OF\nPACKAGES', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Box Dim\n(LxWxH)MM', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Net Weight', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'PO Number', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'QNTY PER\nBOX', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'NO OF BOX', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'TOTAL\nQUANTITY', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } }
            ]
        ];

        doc.autoTable({
            head: itemHeaders,
            body: info,
            theme: 'grid',
            margin: { top: 15, left: 10, right: 10, bottom: 12 },
            startY: doc.lastAutoTable.finalY,
            styles: { font: 'times', fontSize: 7.5, lineColor: '#000000', lineWidth: 0.1, textColor: 'black' },
            headStyles: { fillColor: '#ffffff', textColor: 'black', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', halign: 'center' },
            bodyStyles: { minCellHeight: 5, cellPadding: 1, valign: 'middle', halign: 'center' },
            columnStyles: {
                0: { cellWidth: 7, halign: 'center' },
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 40, halign: 'left' },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 22, halign: 'center' },
                5: { cellWidth: 16, halign: 'center' },
                6: { cellWidth: 20, halign: 'center' },
                7: { cellWidth: 13, halign: 'center' },
                8: { cellWidth: 13, halign: 'center' },
                9: { cellWidth: 14, halign: 'center' }
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,
            didDrawPage: tableOptions.didDrawPage,
        });

        // Declaration & Signatory extraFooter
        const extraFooter = [
            [
                {
                    content: `No. of pcs          ${packingList?.totalQty || 0} No's\nGross Weight      ${packingList?.totGrossWeight || packingList?.grossWeight || 0} KGS\nNet Weight         ${totalNetWeight.toFixed(2)} KGS\n\nAD CODE NO: ${companyInfo?.adCode || ''}`,
                    styles: { halign: 'left', valign: 'top', fontSize: 8, lineWidth: 0.1, lineColor: '#000000', minCellHeight: 28, fontStyle: 'bold' }
                },
                {
                    content: `Declaration: We declare that this invoice shows the actual price\nof goods described and that all particulars are true and correct\n\n\nFor ${companyInfo?.companyName || 'MALLIK ENGINEERING (INDIA) PVT. LTD.'}\n\n\n\n\nAuthorised Signatory`,
                    styles: { halign: 'left', valign: 'top', fontSize: 8, lineWidth: 0.1, lineColor: '#000000', minCellHeight: 28, fontStyle: 'bold' }
                }
            ]
        ];

        doc.autoTable({
            body: extraFooter,
            theme: 'grid',
            margin: { top: 15, left: 10, right: 10, bottom: 12 },
            startY: doc.lastAutoTable.finalY,
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 90 }
            },
            bodyStyles: {
                cellPadding: { top: 2, bottom: 2, left: 3, right: 2 }
            },
            ...tableOptions
        });

        return doc.output('blob');
    };

    return (
        <>
            <Button
                variant="contained"
                style={{
                    width: "100%",
                    background: disabled ? "gray" : "#002D68",
                    color: "white",
                    height: "35px",
                }}
                onClick={handlePrintClick}
                disabled={disabled}
            >
                Print
            </Button>

            <Dialog open={pdfModalOpen} onClose={() => setPdfModalOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    Packing List Print
                </DialogTitle>

                <DialogContent style={{ padding: '2px' }}>
                    {mergedPdfUrl && (
                        <embed src={mergedPdfUrl} type="application/pdf" width="100%" height="600px" />
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => {
                        setPdfModalOpen(false);
                        setMergedPdfUrl(null);
                    }}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PackingListPdf;
