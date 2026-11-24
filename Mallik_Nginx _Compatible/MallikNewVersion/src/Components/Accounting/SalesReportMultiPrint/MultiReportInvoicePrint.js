import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GetExportAllSaleInvoiceList, getExportSaleInvoiceData, getGstAllSaleInvoiceList, getGstSaleInvoiceData, getGstSaleInvoiceList, getGstSaleInvoicePayload, GSTSalesShowData, MultiXmlPrint, StoreGstSaleInvoiceResponse, updateExportStatus, updatePrintedInvoiceStatus } from '../../../ApiService/LoginPageService';
import { Button, Card, CardActions, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, ListItemText, MenuItem, Modal, OutlinedInput, Radio, RadioGroup, Select, TextField, Tooltip, Typography } from '@mui/material';
import NotificationBar from '../../GlobleFiles/ServiceNotificationBar';
import NoQr from '../../../AllImage/NoQR.png'
import { Link, useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const MultiReportInvoicePrint = () => {
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [selectedFilterRadio, setSelectedFilterRadio] = useState('');
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [successResponses, setSuccessResponses] = useState([]); // API SUCCESS SHOWS
    console.log("successResponses", successResponses)
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleCloseModal = () => setOpen(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [pendingOnly, setPendingOnly] = useState(false);
    const [rows, setRows] = useState([]);
    const [payloadData, setPayloadData] = useState([]);
    const [apiStatus, setApiStatus] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [toDate, setTodate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [invoiceHeader, setInvoiceHeader] = useState([])
    const [printingDoc, setPrintingDoc] = useState(false);
    const [docRange, setDocRnage] = useState(false);
    const [docRangeFrom, setDocRangeFrom] = useState('');
    const [docRangeTo, setDocRangeTo] = useState('');
    const [selectionRowIds, setSelectionRowIds] = useState([])
    const [pdfUrl, setPdfUrl] = useState([]);
    const [pdfModalOpen, setPdfModalOpen] = useState(false)
    const [pdfBlobs, setPdfBlobs] = useState([]);
    const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
    const [invoiceFromateChanger, setInvoiceFromateChanger] = useState(false);

    const columns = [
        {
            field: 'invNo',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Inv No
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'custPoNo',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Cust PO No
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'invDate',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Inv Date
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'invValue',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Inv Value
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'custCode',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Cust Code
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'AckNo',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    ACK NO
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'AckDt',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    ACK Date
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'Irn',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    IRN No
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'EwbNo',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    EWB No
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'EwbDt',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    EWB Date
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'EwbStatus',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    EWB Status
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'printedStatus',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Is Print
                </span>
            , width: 70, type: 'string', sortable: true, minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        }
    ];

    useEffect(() => {
        const handleResize = () => {
            setScreenHeight(window.innerHeight);
        };

        // Add event listener to update height on resize
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleGstListSuccess = (dataObject) => {
        setRows(dataObject?.data || [])
    }
    const handleGstInvoiceException = () => { }

    const handleRowSelection = (selectionModel) => {
        setSelectionRowIds(selectionModel);
        // Find the selected rows based on IDs
        const selectedData = rows.filter(row => selectionModel.includes(row.id));
        setSelectedRows(selectedData);
        // GET PAYLOAD DATA ON CHECKBOX SELECTION
        getExportSaleInvoiceData({ invoiceIds: selectionModel }, handleGetPayloadSuccess, handleGetPayloadException)
    };

    const handleGetPayloadSuccess = (dataObject) => {
        setPayloadData(dataObject?.data || []);
    }
    const handleGetPayloadException = () => {
        setPayloadData([]);
    }


    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };


    const handleView = () => {
        GetExportAllSaleInvoiceList({
            from: fromDate,
            to: toDate,
            rangeFrom: docRangeFrom,
            rangeTo: docRangeTo,
            printedDoc: printingDoc
        }, handleGstListSuccess, handleGstInvoiceException)
    }

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setInvoiceHeader(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const names = [
        // 'ORIGINAL FOR RECIPIENT',
        // 'DUPLICATE FOR TRANSPORT',
        // 'TRIPLICATE FOR SUPPLIER',
        // 'EXTRA COPY'
        'ORIGINAL FOR RECIPIENT',
        'DUPLICATE FOR TRANSPORTER(GOODS)/SUPPLIER(SERVICES)',
        'TRIPLICATE FOR SUPPLIER(GOODS)/EXTRA COPY(SERVICES)',
        'EXTRA COPY'
    ];


    const handleMultilpleInvoicePrint = async () => {
        updateExportStatus({ invoiceIds: selectionRowIds }, handlePrintedInvoiceSuccess, handlePrintedInvoiceException);
        const allBlobs = [];
        for (const invoiceData of payloadData) {
            for (const headerName of invoiceHeader) {
                const blob = await handleFileSave(invoiceData, headerName);
                allBlobs.push(blob);
            }
        }
        // Set all at once after loop completes
        setPdfBlobs(allBlobs);
    };

    // ON E-INVOICE BUTTON CLICK
    const handleMultilpleEInvoicePrint = async () => {
        updateExportStatus({ invoiceIds: selectionRowIds }, handlePrintedInvoiceSuccess, handlePrintedInvoiceException)
        const allBlobs = [];
        for (const invoiceData of payloadData) {
            for (const headerName of invoiceHeader) {
                const blob = await handleFileSave(invoiceData, headerName);
                allBlobs.push(blob);
            }
        }
        // Set all at once after loop completes
        setPdfBlobs(allBlobs);


    };

    // NEW: Download each selected invoice as a separate PDF file
    const sanitizeFileName = (name) => (name || '')
        .toString()
        .replace(/[^a-z0-9-_\.]+/gi, '_')
        .substring(0, 150);


    const handleMultiInvoiceSeparateDownload = async () => {
        if (!payloadData?.length || !invoiceHeader?.length) return;

        updatePrintedInvoiceStatus({ invoiceIds: selectionRowIds }, handlePrintedInvoiceSuccess, handlePrintedInvoiceException);

        for (const invoiceData of payloadData) {
            const headerBlobs = [];

            for (const headerName of invoiceHeader) {
                const blob = await handleFileSave(invoiceData, headerName);
                headerBlobs.push(blob);
            }

            const merged = await PDFDocument.create();

            for (const blob of headerBlobs) {
                const srcBytes = await blob.arrayBuffer();
                const srcDoc = await PDFDocument.load(srcBytes);
                const pages = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
                pages.forEach(p => merged.addPage(p));
            }

            const mergedBytes = await merged.save();
            const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });

            const url = URL.createObjectURL(mergedBlob);
            const file = `${sanitizeFileName(invoiceData?.invoice?.invNo)}.pdf`;
            const a = document.createElement('a');
            a.href = url;
            a.download = file;
            document.body.appendChild(a);
            a.click();
            a.remove();

            // *** NEW DELAY ***
            await new Promise(r => setTimeout(r, 400));

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    };

    const handlePrintedInvoiceSuccess = () => { }
    const handlePrintedInvoiceException = () => { }

    const baseUrl = process.env.REACT_APP_API_URL;
    const urlParts = baseUrl.split('api/');


    function emptyRowsToPush(lineItems) {
        const pageSize = 39;   // Max rows per page (depends on layout)
        const header = 10;     // Rows occupied by header
        const footer = 19;     // Rows reserved for footer

        // Total rows including header and footer
        const totalContent = header + lineItems + footer;

        // Total pages required
        const totalPages = Math.ceil(totalContent / pageSize);

        // Capacity available in all pages
        const totalCapacity = pageSize * totalPages;

        // Dummy rows required to perfectly fill the last page
        let rowsToPush = totalCapacity - totalContent;

        // ✅ Keep at least 0 dummy rows unless it's too small
        // if (rowsToPush < 0) rowsToPush = 0;

        // return rowsToPush;
        if (rowsToPush < 0) {
            rowsToPush = 0;
        } else if (rowsToPush > 0) {
            rowsToPush -= 1;  // <-- prevent accidental overflow
        }

        return rowsToPush;
    }

    // GENERATE INVOICE
    const handleFileSave = async (data, headerName) => {
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
                element.hsnCode,
                element.noOfPackages,
                nw.toFixed(2),
                element.poNo,
                qty,
                element.uom,
                rate.toFixed(2),
                amt.toFixed(2)
            ]);
        });

        // Fill empty rows
        const displayRows =
            data.items.length <= 5 ? 14 :
                data.items.length <= 10 ? 18 :
                    data.items.length;
        while (info.length < displayRows) {
            info.push([
                '', '', '', '', '',
                '', '', '', '', '',
                ''
            ]);
        }
        // Use actual currency from invoice first, then fall back to printType
        let currLabel = data.invoice?.currency
        // ? data.invoice.currency.toUpperCase()
        // : (printType === 'EUR' ? 'EUR' : printType === 'USD' ? 'USD' : 'INR');

        info.push([
            {
                content: `HSN Code : ${data.items[0]?.hsnCode}`,
                colSpan: 11, styles: { halign: 'left', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', fillColor: '#ffffff' }
            }
        ]);
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

                doc.setFontSize(8);
                doc.setFont('times', 'normal');
                doc.setTextColor(70);
                doc.text(
                    `E. & O. E.   |   Subject to Bengaluru Jurisdiction`,
                    14, pageHeight - 5
                );
                doc.text(
                    `Page ${HookData.pageNumber}`,
                    pageWidth - 14, pageHeight - 5, { align: 'right' }
                );
            },
        };

        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.setTextColor('black');
        doc.text(headerName, 200, 8, { align: 'right' }); // Adjust X and Y coordinates as needed

        // ─── HEADER (Logo + Company + ISO) ──────────────────────────────────────
        // Use 'plain' theme so no inner cell borders appear,
        // but draw the outer box via tableLineWidth.
        const header1 = [
            [
                // col 0: logo placeholder (image drawn in didDrawCell)
                {
                    content: '',
                    styles: { halign: 'left', lineWidth: 0, minCellWidth: 35, minCellHeight: 28 }
                },
                // col 1: company name & address
                {
                    content: `${data.invoice.companyName}\n${data.invoice?.companyAdd}\nTel: ${data.invoice?.telNo} | Web: ${data.invoice?.website}\nEmail: ${data.invoice?.email}`,
                    styles: { halign: 'left', valign: 'middle', fontSize: 8, textColor: 'black', lineWidth: 0, fontStyle: 'bold' }
                },
                // col 2: certification image placeholder (drawn in didDrawCell)
                {
                    content: '',
                    styles: { halign: 'right', lineWidth: 0, minCellWidth: 38, minCellHeight: 28 }
                },
                // col 3: ISO text
                {
                    content: `ISO 9001 : 2015\nISO 14001 : 2015\nOHSAS 18001 : 2007`,
                    styles: { halign: 'center', valign: 'bottom', fontSize: 7.5, textColor: 'black', lineWidth: 0, fontStyle: 'bold', minCellWidth: 30 }
                }
            ]
        ];

        doc.autoTable({
            body: header1,
            theme: 'plain',
            startY: 10,
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
                            data.cell.y + 2,
                            28, 22
                        );
                    } catch (e) { }
                }
                // Draw ISO certification image in col 2
                if (data.column.index === 3 && data.row.index === 0) {
                    try {
                        doc.addImage(ISOUrl, 'PNG',
                            data.cell.x - 2,
                            data.cell.y + 1,
                            34, 14
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


        const addressDetails = [
            [
                {
                    content: "EXPORTER",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 5
                    }
                },
                {
                    content: "CONSIGNEE (IMPORTER)",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 5
                    }
                }
            ],
            [
                {
                    content: `${data.invoice.companyName}
   ${data.invoice.companyAdd}
   Tel: ${data.invoice.telNo}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 12
                    }
                },
                {
                    content: `${data.invoice.cName}
   ${data.invoice.billAdd}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 12
                    }
                }
            ],
            [
                {
                    content: "SHIP TO",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 5
                    }
                },
                {
                    content: "NOTIFY PARTY",
                    styles: {
                        fontStyle: "bold",
                        fillColor: [245, 245, 245],
                        minCellHeight: 5
                    }
                }
            ],
            [
                {
                    content: `${data.invoice.cName}
   ${data.invoice.shipAdd}`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 10
                    }
                },
                {
                    content: `Same as Consignee`,
                    styles: {
                        fontStyle: "normal",
                        minCellHeight: 10
                    }
                }
            ]
        ];
        const transitDetails = [
            [

                {
                    content: `COUNTRY OF ORIGIN OF GOODS : ${data.invoice?.countryOriginGoods || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `COUNTRY OF FINAL DESTINATION : ${data.invoice?.countryFinalDestination || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `PORT OF LOADING : ${data.invoice?.portLoading || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
            ],
            [

                {
                    content: `PORT OF DISCHARGE : ${data.invoice?.portDischarge || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Final Destination : ${data.invoice?.finalDestination || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                },
                {
                    content: `Payment : ${data?.items[0]?.pay_term || ''}`,
                    styles: { halign: 'left', fontSize: 8, fontStyle: 'bold' }
                }
            ]
        ];
        const itemHeaders = [
            [
                { content: 'Sl\nNo.', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Part No.', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Description of\nGoods', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'HSN\nCode', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'No. of\nPackages', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Net\nWeight (KG)', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'PO No.', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'Qty', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: 'UOM', styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: `Rate\n(${currLabel})`, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } },
                { content: `Amount\n(${currLabel})`, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000', textColor: 'black' } }
            ]
        ];


        const extraFooter = [
            [
                {
                    content:
                        `PACKING DETAILS

No. Of PCS : ${data.invoice?.totalQty || 0} Nos

Gross Weight : ${data.invoice?.grossWeight || 0} KG

Net Weight : ${totalNetWeight.toFixed(2)} KG`,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        minCellHeight: 28,
                        fontStyle: 'bold'
                    }
                },

                {
                    content:
                        `BANK DETAILS

Bank Name : ${data.invoice?.bankName || ''}

A/C No : ${data.invoice?.acNo || ''}

Branch : ${data.invoice?.branchName || ''}

IFSC Code : ${data.invoice?.ifscCode || ''}

Shift Code : ${data.invoice?.shiftCode || ''}`,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        minCellHeight: 28,
                        fontStyle: 'bold'
                    }
                },

                {
                    content:
                        `DECLARATION

We declare that this invoice shows the actual price of goods described and that all particulars are true and correct.



For MALLIK ENGINEERING (INDIA) PVT. LTD.



Authorised Signatory`,
                    styles: {
                        halign: 'left',
                        valign: 'top',
                        fontSize: 8,
                        lineWidth: 0.1,
                        lineColor: '#000000',
                        minCellHeight: 28,
                        fontStyle: 'bold'
                    }
                }
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
            margin: { top: 0, left: 10, right: 10, bottom: 0 },
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


        doc.autoTable({
            body: extraFooter,
            theme: 'grid',
            margin: { top: 0, left: 10, right: 10, bottom: 0 },
            startY: doc.lastAutoTable.finalY,

            pageBreak: 'avoid',
            rowPageBreak: 'avoid',

            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.25,

            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 65 },
                2: { cellWidth: 75 }
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

    // GENERATING EINVOICE

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

    useEffect(() => {
        const generateMergedPdf = async () => {
            if (pdfBlobs.length > 0) {
                const mergedUrl = await mergeJsPdfBlobs(pdfBlobs);
                setMergedPdfUrl(mergedUrl);
            }
        };

        generateMergedPdf();
    }, [pdfBlobs]);


    return (
        <Box sx={{ height: 400, width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '20px' }}>
                <Link to='/ViewExportInvoice' style={{ textDecoration: 'none' }}>
                    <Typography
                        sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                        variant="h5"
                    >
                        {`View Export Sales Invoice>>`}
                    </Typography>
                </Link>
                <Typography style={{ textAlign: 'left', fontSize: '18px', fontWeight: 'bold' }}>Multi Invoice Sales Report</Typography>
            </div>
            <Grid container alignItems={'center'} spacing={2}>

                <Grid item xs={12} sm={12} md={3} lg={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        type="date"
                        label="From"
                        variant="outlined"
                        style={{ marginRight: '10px' }}
                        InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                        size="small"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} sm={12} md={3} lg={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        type="date"
                        label="To"
                        variant="outlined"
                        style={{ marginRight: '10px' }}
                        InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                        size="small"
                        value={toDate}
                        onChange={(e) => setTodate(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-multiple-checkbox-label">Invoice Header</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={invoiceHeader}
                            onChange={handleChange}
                            input={<OutlinedInput label="Invoice Header" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                            size='small'
                        >
                            {names.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={invoiceHeader.includes(name)} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2} sm={12} md={3} lg={3}>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox checked={printingDoc} onChange={(e) => setPrintingDoc(e.target.checked)} />} label="Include Printed Docs Also" />
                    </FormGroup>
                </Grid>
                <Grid item xs={2} sm={12} md={5} lg={5} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', columnGap: '5px', alignItems: 'center' }}>
                    <FormGroup style={{ whiteSpace: 'nowrap' }}>
                        <FormControlLabel control={<Checkbox checked={docRange} onChange={(e) => setDocRnage(e.target.checked)} />} label="Doc Range" />
                    </FormGroup>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Doc Number Range From"
                        variant="outlined"
                        style={{ marginRight: '10px' }}
                        InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                        size="small"
                        value={docRangeFrom}
                        onChange={(e) => setDocRangeFrom(e.target.value)}
                        disabled={!docRange}
                    />
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Doc Number Range To"
                        variant="outlined"
                        style={{ marginRight: '10px' }}
                        InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                        size="small"
                        value={docRangeTo}
                        onChange={(e) => setDocRangeTo(e.target.value)}
                        disabled={!docRange}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={1} lg={1}>
                    <Button fullWidth variant="contained" style={{ backgroundColor: '#002D68', marginRight: '15px', marginTop: '2px' }} onClick={handleView}>View</Button>
                </Grid>
            </Grid>

            <Card style={{ boxShadow: '0 10px 10px 2px rgba(0, 0, 0, 0.2)', marginTop: '20px', borderRadius: '10px', width: '100%', height: screenHeight - 370 }}>
                <CardContent style={{ padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        checkboxSelection
                        disableRowSelectionOnClick
                        onRowSelectionModelChange={handleRowSelection}
                        sx={{
                            overflow: 'auto',
                            height: '60vh',
                            width: '100%',
                            '& .super-app-theme--header': {
                                WebkitTextStrokeWidth: '0.6px',
                                backgroundColor: '#93bce6',
                                color: '#1c1919'
                            },
                            '& .MuiDataGrid-cell': {
                                border: '1px solid #969696',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                border: '1px solid #969696', // Add border to column headers
                            },
                        }}
                        getRowClassName={(params) => {
                            const rowIndex = rows.findIndex(row => row.id === params.row.id);
                            if (rowIndex !== -1) {
                                return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                            }
                            return ''; // Return default class if index is not found
                        }}
                        rowHeight={40}
                        columnHeaderHeight={40}
                    />
                    <div style={{ width: '100%', columnGap: '10px', display: 'flex', flexDirection: 'row' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2, backgroundColor: '#002D68' }}
                            onClick={() => {
                                handleMultilpleEInvoicePrint()
                                setPdfModalOpen(true);
                            }}
                            disabled={invoiceHeader.length < 1 || payloadData.length < 1}
                        >
                            Print E-Invoice
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2, backgroundColor: '#002D68' }}
                            onClick={() => {
                                handleMultilpleInvoicePrint()
                                setPdfModalOpen(true);
                            }}
                            disabled={invoiceHeader.length < 1 || payloadData.length < 1}
                        >
                            Invoice Print
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2, backgroundColor: '#002D68' }}
                            onClick={handleMultiInvoiceSeparateDownload}
                            disabled={invoiceHeader.length < 1 || payloadData.length < 1}
                        >
                            Multi Invoice Print
                        </Button>

                    </div>
                </CardContent>
            </Card>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <Dialog open={pdfModalOpen} onClose={() => setPdfModalOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    Tax Invoice
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
                        setPdfBlobs([]);
                    }}
                    >Close</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default MultiReportInvoicePrint;
