import React from "react";
import "./Pdf.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import NoQr from '../../../AllImage/NoQR.png';
import { PDFDocument } from 'pdf-lib';
import { ExportInvEuroPrint, ExportInvInrPrint } from "../../../ApiService/LoginPageService";

const CommercialInvoicePdf = (props) => {
    const { rowData, printType, label } = props; // printType = "EUR" or "INR"
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

    const handlePrintClick = () => {
        if (!rowData) return;
        if (printType === 'EUR') {
            ExportInvEuroPrint({ id: rowData }, handlePdfInvSucess, handePdfInvException);
        } else if (printType === 'INR') {
            ExportInvInrPrint({ id: rowData }, handlePdfInvSucess, handePdfInvException);
        }
        setPdfModalOpen(true);
    };

    const handlePdfInvSucess = async (dataObject) => {
        if (!dataObject?.data) return;
        const blob = handleFileSave(dataObject.data);
        if (blob) {
            const mergedUrl = await mergeJsPdfBlobs([blob]);
            setMergedPdfUrl(mergedUrl);
        }
    }

    const handePdfInvException = (errorStatus, errorMessage) => {
        console.error(errorMessage);
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
        let info = [];
        let totalNetWeight = 0;
        let totalQty = 0;
        let totalAmount = 0;

        data.items.forEach((element, index) => {
            let nw = parseFloat(element.netWeight) || 0;
            let qty = parseFloat(element.invQty || element.Qty) || 0;
            let amt = parseFloat(element.invAmt || element.amt) || 0;
            let rate = parseFloat(element.invRate || element.stdRate) || 0;

            totalNetWeight += nw;
            totalQty += qty;
            totalAmount += amt;

            info.push([
                index + 1,
                element.partNo,
                element.partName,
                element.poLineItem,
                element.noOfPackages,
                nw.toFixed(2),
                element.poNo,
                qty,
                element.uom,
                rate.toFixed(2),
                amt.toFixed(2)
            ]);
        });

        function emptyRowsToPush(lineItems) {
            const pageSize = 39, header = 20, footer = 11;
            const content = header + lineItems + footer;
            const totPage = Math.floor(content / pageSize) + 1;
            const totalContentSize = pageSize * totPage;
            const rowToPush = totalContentSize - content;
            return rowToPush;
        }

        const paddingNeeded = emptyRowsToPush(data.items.length);
        for (let i = 0; i < paddingNeeded; i++) {
            info.push([
                '', '', '', '', '',
                '', '', '', '', '',
                ''
            ]);
        }
        // Use actual currency from invoice first, then fall back to printType
        let currLabel = data.invoice?.currency
            ? data.invoice.currency.toUpperCase()
            : (printType === 'EUR' ? 'EUR' : printType === 'USD' ? 'USD' : 'INR');


        info.push([
            { content: 'Total Invoice Value', colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
            { content: totalNetWeight.toFixed(2), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
            { content: '', styles: { halign: 'center', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
            { content: totalQty.toFixed(2), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
            { content: '', styles: { halign: 'center', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
            { content: '', styles: { halign: 'center', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
            { content: totalAmount.toFixed(2), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
        ]);

        let hasTaxes = false;

        if (parseFloat(String(data.invoice?.CGST || "0").replace(/,/g, '')) > 0) {
            hasTaxes = true;
            info.push([
                { content: `CGST @ ${data.invoice?.CGSTPer} %`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
                { content: Number(String(data.invoice?.CGST || "0").replace(/,/g, '')).toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
            ]);
        }

        if (parseFloat(String(data.invoice?.SGST || "0").replace(/,/g, '')) > 0) {
            hasTaxes = true;
            info.push([
                { content: `SGST @ ${data.invoice?.SGSTPer} %`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
                { content: Number(String(data.invoice?.SGST || "0").replace(/,/g, '')).toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
            ]);
        }

        if (parseFloat(String(data.invoice?.IGST || "0").replace(/,/g, '')) > 0) {
            hasTaxes = true;
            info.push([
                { content: `IGST @ ${data.invoice?.IGSTPer} %`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
                { content: Number(String(data.invoice?.IGST || "0").replace(/,/g, '')).toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
            ]);
        }

        if (parseFloat(String(data.invoice?.UTGST || "0").replace(/,/g, '')) > 0) {
            hasTaxes = true;
            info.push([
                { content: `UTGST @ ${data.invoice?.UTGSTPer} %`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
                { content: Number(String(data.invoice?.UTGST || "0").replace(/,/g, '')).toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
            ]);
        }

        if (parseFloat(String(data.invoice?.roundOff || "0").replace(/,/g, '')) !== 0 && hasTaxes) {
            info.push([
                { content: `Round Off`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
                { content: Number(String(data.invoice?.roundOff || "0").replace(/,/g, '')).toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
            ]);
        }

        if (hasTaxes) {
            info.push([
                { content: `Grand Total`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } },
                { content: Number(String(data.invoice?.invValue || "0").replace(/,/g, '')).toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { halign: 'center', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
            ]);
        }

        info.push([
            { content: `Total Amount In Words : ${currLabel} ${data.invoice?.totalInWords || ''} Only`, colSpan: 11, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' } }
        ]);
        info.push([
            {
                content: `HSN Code : ${data.items[0]?.hsnCode || ''} ${data.items[0]?.itemLedger || ''}`,
                colSpan: 11, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            }
        ]);
        info.push([
            {
                content: `Remarks : ${data.invoice?.remarks || data.invoice?.remrk1 || ''}`,
                colSpan: 11, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            }
        ]);
        const doc = new jsPDF();
        const baseUrl = process.env.REACT_APP_API_URL?.replace("/api", "") || "";
        const logoUrl = data.invoice?.companyImage ? `${baseUrl}/${data.invoice?.companyImage}` : '';
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
                        `Invoice No : ${data.invoice?.invNo || ''}     |     Date : ${data.invoice?.date || ''}`,
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

        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.setTextColor('black');

        // ─── HEADER (Logo + Company + ISO) ──────────────────────────────────────
        // Use 'plain' theme so no inner cell borders appear,
        // but draw the outer box via tableLineWidth.
        const header1 = [
            [
                // col 0: logo placeholder (image drawn in didDrawCell)
                {
                    content: '',
                    styles: { halign: 'left', lineWidth: 0, minCellWidth: 35, minCellHeight: 23 }
                },
                // col 1: company name & address
                {
                    content: `${data.invoice.companyName}\n${data.invoice?.companyAdd}\nTel: ${data.invoice?.telNo} | Web: ${data.invoice?.website}\nEmail: ${data.invoice?.email}`,
                    styles: { halign: 'left', valign: 'middle', fontSize: 7, textColor: 'black', lineWidth: 0, fontStyle: 'bold' }
                },
                // col 2: certification image placeholder (drawn in didDrawCell)
                {
                    content: '',
                    styles: { halign: 'right', lineWidth: 0, minCellWidth: 38, minCellHeight: 23 }
                },
                // col 3: ISO text
                {
                    content: `ISO 9001 : 2015\nISO 14001 : 2015\nOHSAS 18001 : 2007`,
                    styles: { halign: 'center', valign: 'bottom', fontSize: 6.5, textColor: 'black', lineWidth: 0, fontStyle: 'bold', minCellWidth: 30 }
                }
            ]
        ];

        doc.autoTable({
            body: header1,
            theme: 'plain',
            startY: 2,
            margin: { left: 10, right: 10, top: 0, bottom: 0 },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,
            styles: { font: 'times', fontSize: 8, textColor: 'black' },
            didDrawCell: (data) => {
                // Draw logo in first cell (col 0, row 0)
                if (data.column.index === 0 && data.row.index === 0 && logoUrl) {
                    try {
                        doc.addImage(logoUrl, 'PNG',
                            data.cell.x + 1,
                            data.cell.y + 1,
                            25, 18
                        );
                    } catch (e) { }
                }
                // Draw ISO certification image in col 2
                if (data.column.index === 3 && data.row.index === 0) {
                    try {
                        doc.addImage(ISOUrl, 'PNG',
                            data.cell.x - 2,
                            data.cell.y + 0.5,
                            28, 11
                        );
                    } catch (e) { }
                }
            },
            didDrawPage: tableOptions.didDrawPage,
        });

        const header2 = [
            [
                {
                    content: `IEC NUMBER : ${data.invoice?.iecNo || ''}`,
                    styles: { fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `AD CODE NO. : ${data.invoice?.adCode || ''}`,
                    styles: { fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `INVOICE NO. : ${data.invoice?.invNo || ''}`,
                    styles: { fontSize: 8, fontStyle: 'bold' }
                }
            ],
            [
                {
                    content: `GSTIN : ${data.invoice?.cmpGstNo || ''}`,
                    styles: { fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `PAN : ${data.invoice?.cmpPanNo || ''}`,
                    styles: { fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `INVOICE DATE : ${data.invoice?.date || ''}`,
                    styles: { fontSize: 8, fontStyle: 'bold' }
                }
            ]
        ];


        //////old code////
        //         const addressDetails = [
        //             [
        //                 {
        //                     content: "EXPORTER",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 },
        //                 {
        //                     content: "CONSIGNEE (IMPORTER)",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: `${data.invoice.companyName}
        // ${data.invoice.companyAdd}
        // Tel: ${data.invoice.telNo}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 12
        //                     }
        //                 },
        //                 {
        //                     content: `${data.invoice.cName}
        // ${data.invoice.billAdd}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 12
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: "SHIP TO",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 },
        //                 {
        //                     content: "NOTIFY PARTY",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: `${data.invoice.cName}
        // ${data.invoice.shipAdd}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 10
        //                     }
        //                 },
        //                 {
        const addressDetails = [
            [
                {
                    content: "EXPORTER",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 4,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                },
                {
                    content: "CONSIGNEE (IMPORTER)",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 4,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                }
            ],
            [
                {
                    content: `${data.invoice.companyName}\n${data.invoice.companyAdd}\nTel: ${data.invoice.telNo}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 8,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                },
                {
                    content: `${data.invoice.cName}\n${data.invoice.billAdd}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 8,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                }
            ],
            [
                {
                    content: "SHIP TO",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 4,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                },
                {
                    content: "NOTIFY PARTY",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 4,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                }
            ],
            [
                {
                    content: `${data.invoice.cName}\n${data.invoice.shipAdd}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 8,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                },
                {
                    content: `Same as Consignee\n\nCustomer Contact details\nName: ${data.invoice?.cName || ''}\nEmail ID: ${data.invoice?.custEmails || ''}\nPhone No: ${data.invoice?.bi_phoneNo || ''}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 18,
                        cellPadding: { top: 1, bottom: 1, left: 2, right: 1 }
                    }
                }
            ]
        ];
        //         const addressDetails = [
        //             [
        //                 {
        //                     content: "EXPORTER",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 },
        //                 {
        //                     content: "CONSIGNEE (IMPORTER)",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: `${data.invoice.companyName}
        // ${data.invoice.companyAdd}
        // Tel: ${data.invoice.telNo}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 12
        //                     }
        //                 },
        //                 {
        //                     content: `${data.invoice.cName}
        // ${data.invoice.billAdd}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 12
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: "SHIP TO",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 },
        //                 {
        //                     content: "NOTIFY PARTY",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         fillColor: [245, 245, 245],
        //                         minCellHeight: 5
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: `${data.invoice.cName}
        // ${data.invoice.shipAdd}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 10
        //                     }
        //                 },
        //                 {
        //                     content: `Same as Consignee`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 10
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: "",
        //                     styles: {
        //                         lineWidth: 0,
        //                         minCellHeight: 5
        //                     }
        //                 },
        //                 {
        //                     content: "Customer Contact details",
        //                     styles: {
        //                         fontStyle: "bold",
        //                         minCellHeight: 5
        //                     }
        //                 }
        //             ],
        //             [
        //                 {
        //                     content: "",
        //                     styles: {
        //                         lineWidth: 0,
        //                         minCellHeight: 16
        //                     }
        //                 },
        //                 {
        //                     content: `Name: ${data.invoice?.custContactName || ''}
        // Email ID: ${data.invoice?.custEmail1 || ''}
        // ${data.invoice?.custEmail2 ? 'Email ID: ' + data.invoice.custEmail2 + '\n' : ''}Phone No: ${data.invoice?.custPhone || ''}`,
        //                     styles: {
        //                         fontStyle: "normal",
        //                         minCellHeight: 16
        //                     }
        //                 }
        //             ]
        //         ];

        // const transitDetails = [
        //     [
        //         {
        //             content: `Origin : ${data.invoice?.countryOriginGoods || 'India'}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         },
        //         {
        //             content: `Destination : ${data.invoice?.countryFinalDestination || ''}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         },
        //         {
        //             content: `Port of Discharge : ${data.invoice?.portDischarge || ''}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         },
        //         {
        //             content: `Delivery : ${data.invoice?.termDelPay || ''}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         }
        //     ],
        //     [
        //         {
        //             content: `COUNTRY OF ORIGIN OF GOODS : ${data.invoice?.countryOriginGoods || ''}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         },

        //         {
        //             content: `COUNTRY OF FINAL DESTINATION : ${data.invoice?.countryFinalDestination || ''}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         },
        //         {
        //             content: `Payment : ${data?.items[0]?.pay_term || ''}`,
        //             styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
        //         }
        //     ]
        // ];
        const transitDetails = [
            [
                {
                    content: `Pre-Carriage by :${data.invoice?.preCarriageby || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Place of Receipt by Pre-Carrier :${data.invoice?.placeOfReciept || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Terms of Delivery & Payment :\n${data.invoice?.termDelPay || ''}`,
                    rowSpan: 2,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                }
            ],
            [
                {
                    content: `Country of Origin : ${data.invoice?.countryOriginGoods || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Port of Loading :${data.invoice?.portLoading || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                }
            ],
            [
                {
                    content: `Port of Discharge :${data.invoice?.portDischarge || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Final Destination :${data.invoice?.finalDestination || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Country of Final Destination :${data.invoice?.countryFinalDestination || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                }

            ]
            // [
            // {
            //     content: `Port of Discharge :\n${data.invoice?.portDischarge || ''}`,
            //     styles: { halign: 'left', fontSize: 7, fontStyle: 'bold' }
            // }

            // ]
        ];
        const itemHeaders = [
            [
                { content: 'Sl\nNo.', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'MARKS & NOS./CONTAINER NO./PART NO.', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Description of\nGoods', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'CustPO\nLine', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'No. of\nPackages', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Net\nWeight (KG)', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'PO No.', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Qty', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'UOM', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: `Rate\n(${currLabel})`, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: `Amount\n(${currLabel})`, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } }
            ]
        ];

        // const extraFooter = [
        //     [
        //         { content: `NO OF PCS \n${data.invoice?.totalQty || ''} Nos\n\nGROSS WEIGHT \n${data.invoice?.grossWeight || ''} KG\n\nNET WEIGHT \n${totalNetWeight.toFixed(2)} KG`, colSpan: 1, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', minCellHeight: 30 } },
        //         { content: `BANK DETAILS\nBank Name       : State Bank of India\nA/c No.             : 12345678901\nBranch              : Jigani Industrial Area Branch\nIFSC Code        : SBIN0001234\nSwift Code        : SBININBBXXX`, colSpan: 1, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', minCellHeight: 30 } },
        //         { content: `DECLARATION\nWe declare that this invoice shows the actual price of goods described\nand that all particulars are true and correct.\n\n\nFor MALLIK ENGINEERING (INDIA) PVT. LTD.\n\n\n\n\nAuthorised Signatory`, colSpan: 1, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', minCellHeight: 30 } }
        //     ]
        // ];
        const extraFooter = [
            [
                {
                    content: `Note:\n${data.invoice?.note || ''} `,
                    colSpan: 4,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        minCellHeight: 15,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: `NO OF PCS : ${data.invoice?.totalQty || 0} No's\n\nGross Weight : ${data.invoice?.totGrossWeight || data.invoice?.grossWeight || 0} KG\n\nNet Weight : ${totalNetWeight.toFixed(2)} KG`,
                    colSpan: 1,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        fontStyle: 'bold'
                    }
                },
                {
                    content: `Bank Name : ${data.invoice?.bankName || ''}\n\nAccount No : ${data.invoice?.acNo || ''}\n\nBranch : ${data.invoice?.branchName || ''}`,
                    colSpan: 2,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0.1 },
                        lineColor: '#000000',
                        fontStyle: 'bold'
                    }
                },
                {
                    content: `\n\nIFSC Code : ${data.invoice?.ifscCode || ''}\n\nShift Code : ${data.invoice?.shiftCode || ''}`,
                    colSpan: 1,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: { top: 0.1, right: 0.1, bottom: 0.1, left: 0 },
                        lineColor: '#000000',
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: `Declaration :\nWe declare that this invoice shows the actual price of goods described\nand that all particulars are true and correct.`,
                    colSpan: 2,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        minCellHeight: 20,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: `For MALLIK ENGINEERING (INDIA) PVT. LTD.\n\n\n\nAuthorised Signatory`,
                    colSpan: 2,
                    styles: {
                        halign: 'right',
                        valign: 'bottom',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        minCellHeight: 20,
                        fontStyle: 'bold'
                    }
                }
            ]
        ];

        // doc.autoTable({
        //     body: header2,
        //     theme: 'grid',
        //     margin: { top: 0, left: 10, right: 10, bottom: 0 },
        //     startY: doc.lastAutoTable.finalY,
        //     tableLineColor: [0, 0, 0],
        //     tableLineWidth: 0.25,
        //     columnStyles: {
        //         0: { cellWidth: 63.3 },
        //         1: { cellWidth: 63.3 },
        //         2: { cellWidth: 63.3 }
        //     },
        //     bodyStyles: {
        //         minCellHeight: 7,
        //         cellPadding: {
        //             top: 2,
        //             bottom: 1,
        //             left: 3,
        //             right: 2
        //         }
        //     }, ...tableOptions
        // });
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
                cellPadding: {
                    top: 2,
                    bottom: 1,
                    left: 3,
                    right: 2
                }
            },

            ...tableOptions
        });

        doc.autoTable({
            body: [[
                {
                    content: 'COMMERCIAL INVOICE',
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

        // doc.autoTable({
        //     body: transitDetails,
        //     theme: 'grid',
        //     margin: { top: 0, left: 10, right: 10, bottom: 0 },
        //     startY: doc.lastAutoTable.finalY,
        //     styles: { font: 'times', fontSize: 8, lineColor: '#000000', lineWidth: 0.1, textColor: 'black' },
        //     tableLineColor: [0, 0, 0],
        //     tableLineWidth: 0.25,
        //     columnStyles: { 0: { cellWidth: 47.5 }, 1: { cellWidth: 47.5 }, 2: { cellWidth: 47.5 }, 3: { cellWidth: 47.5 } },
        //     bodyStyles: {
        //         minCellHeight: 5,
        //         cellPadding: { top: 1, bottom: 1, left: 3, right: 2 }
        //     }, ...tableOptions
        // });
        doc.autoTable({
            body: transitDetails,
            theme: 'grid',
            margin: { top: 0, left: 10, right: 10, bottom: 0 },
            startY: doc.lastAutoTable.finalY,

            styles: {
                font: 'times',
                fontSize: 8,
                textColor: 'black',
                lineWidth: 0.3,
                lineColor: [0, 0, 0]
            },

            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.3,

            columnStyles: {
                0: { cellWidth: 63.3 },
                1: { cellWidth: 63.3 },
                2: { cellWidth: 63.3 }
            },

            bodyStyles: {
                minCellHeight: 5,
                cellPadding: {
                    top: 1,
                    bottom: 1,
                    left: 3,
                    right: 2
                }
            }
        });

        doc.autoTable({
            head: itemHeaders,
            body: info,
            theme: 'grid',
            margin: { top: 15, left: 10, right: 10, bottom: 12 },
            startY: doc.lastAutoTable.finalY,
            styles: { font: 'times', fontSize: 8, lineColor: '#000000', lineWidth: 0.1, textColor: 'black' },
            headStyles: { fillColor: '#ffffff', textColor: 'black', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', halign: 'center' },
            bodyStyles: { minCellHeight: 5, cellPadding: 1, valign: 'middle', halign: 'center' },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'left' },
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,
            didDrawPage: tableOptions.didDrawPage,
        });

        // doc.autoTable({
        //     body: extraFooter,
        //     theme: 'grid',
        //     margin: { top: 0, left: 10, right: 10, bottom: 0 },
        //     startY: doc.lastAutoTable.finalY,
        //     tableLineColor: [0, 0, 0],
        //     tableLineWidth: 0.25,
        //     columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 70 }, 2: { cellWidth: 75 } },
        //     bodyStyles: { cellPadding: { top: 1, bottom: 1, left: 2, right: 1 } },
        //     ...tableOptions
        // });
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
                0: { cellWidth: 47.5 },
                1: { cellWidth: 47.5 },
                2: { cellWidth: 47.5 },
                3: { cellWidth: 47.5 }
            },
            bodyStyles: {
                cellPadding: {
                    top: 2,
                    bottom: 2,
                    left: 3,
                    right: 2
                }
            },

            ...tableOptions
        });

        return doc.output('blob');
    };

    return (
        <>
            <span style={{ cursor: 'pointer', color: 'inherit' }} onClick={handlePrintClick}>
                {label || (printType === 'EUR' ? 'Comm Print' : 'INR Print')}
            </span>

            <Dialog open={pdfModalOpen} onClose={() => setPdfModalOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    Commercial Invoice ({printType})
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

export default CommercialInvoicePdf;
