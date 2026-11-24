import {
    Button, Box, Dialog, Tooltip, DialogContent, DialogTitle, TextField, Grid, DialogActions, InputLabel, Select, MenuItem, FormControl, FormControlLabel, Checkbox, CardContent, Typography, InputAdornment,
    Card,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import { AddHoliday, AddHolidayUpdate, GetJobCardChildDrill, GetJobCardInsideDetails, GetJobCardToolDetails, SobUpdate, } from '../../ApiService/LoginPageService';
import './JobCardViewNewModal.css';
import { DataGrid } from '@mui/x-data-grid';
import GeneratePdfDialog from '../JobCardView/GeneratePdfDialog';
import MallikLogo from '../../AllImage/MallikLogo.png';

const JobCardViewNewModal = ({ open, setOpen, isAddButton, editData, setRefreshData, selectedRowJobCardNo, setSelectedRowJobCardNo, selectedMachine, clickedChildPartNumber, setClickedChildPartNumber }) => {

    const [holiday, setHoliday] = useState('');
    const [holidayOccasion, setHolidayOccasion] = useState('');
    const [Description, setDescription] = useState('');

    const [jobCardDetails, setJobCardDetails] = useState([]);
    const [processDetails, setProcessDetails] = useState({ inHouse: [], vendorProcess: [], assembly: [] });
    const [childParts, setChildParts] = useState([]);
    const [childDrillLists, setChildDrillLists] = useState([]);
    const [childProcessDetails, setChildProcessDetails] = useState({ inHouse: [], vendorProcess: [], assembly: [] });
    const [isParent, setIsParent] = useState(false);
    const [isChild, setIsChild] = useState(false);
    const [isChildItem, setIsChildItem] = useState(false);

    const [rowChildName, setRowChildName] = useState('');
    const [childId, setChildId] = useState('');
    const [acceptedQty, setAcceptedQty] = useState("");
    const [rejectedQty, setRejectedQty] = useState("");
    const [receivedQty, setReceivedQty] = useState("");
    const [location, setLocation] = useState("");
    const [verifiedBy, setVerifiedBy] = useState("");
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [jcId, setJcId] = useState('');
    const [openPdfDialog, setOpenPdfDialog] = useState(false);
    const [pdfData, setPdfData] = useState([]);
    const [openToolDialog, setOpenToolDialog] = useState(false);
    const [toolDetails, setToolDetails] = useState([]);
    const [toolDialogInfo, setToolDialogInfo] = useState({ process: '', machine: '', qty: '' });


    useEffect(() => {
        if (open) {
            console.log("Fetching job card details...");
            GetJobCardInsideDetails(
                { jcNo: selectedRowJobCardNo, machine: selectedMachine },
                handleGetDetailsSuccess,
                handleGetDetailsException
            );
        }
    }, [open]);

    const handleGetDetailsSuccess = (dataObject) => {
        console.log("API Response:", dataObject); // Log full response

        setJobCardDetails(dataObject?.jcDetails || []);
        setAcceptedQty(dataObject?.jcDetails[0]?.approvedQty || 0)
        setRejectedQty(dataObject?.jcDetails[0]?.reworkQty || 0)
        setReceivedQty(dataObject?.jcDetails[0]?.recievedQty || 0)
        setVerifiedBy(dataObject?.jcDetails[0]?.verifiedBy || "")
        setLocation(dataObject?.jcDetails[0]?.location || "")
        setProcessDetails(dataObject?.processDetails || { inHouse: [], vendorProcess: [], assembly: [] });

        const parts = dataObject?.childParts || [];
        setChildParts(parts);
        setIsChild(true);

        if (clickedChildPartNumber) {
            // Find the child part that matches clickedChildPartNumber
            const matchingChild = parts.find(item =>
                item.SITEMCODE && item.SITEMCODE.toString().trim().toUpperCase() === clickedChildPartNumber.toString().trim().toUpperCase()
            );

            if (matchingChild) {
                console.log("Auto-selecting child part for drill down:", matchingChild);
                setRowChildName(matchingChild.SITEMCODE);
                setChildId(matchingChild.id);
                setIsChildItem(true);
                setIsChild(false);

                // Call the child drill API
                const requestData = { jcNo: selectedRowJobCardNo, itemId: matchingChild.id };
                GetJobCardChildDrill(
                    requestData,
                    handleChildDrillSuccess,
                    handleChildDrillException
                );
            }
        }

        if (dataObject?.jcDetails && dataObject.jcDetails.length > 0) {
            const newJcId = dataObject.jcDetails[0].jcId;
            console.log("Extracted jcId:", newJcId); // Log the extracted jcId
            setJcId(newJcId); // Set jcId from the response
        } else {
            console.log("No jcDetails found");
        }
    };

    const handleGetDetailsException = () => { }

    const ClearData = () => {
        setHoliday('');
        setHolidayOccasion('');
        setDescription('');
        setProcessDetails({ inHouse: [], vendorProcess: [], assembly: [] });
        setChildParts([]);
        setChildDrillLists([]);
        setChildProcessDetails({ inHouse: [], vendorProcess: [], assembly: [] });
        setIsChild(false);
        setIsChildItem(false);
        if (setClickedChildPartNumber) {
            setClickedChildPartNumber('');
        }
    }


    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const parent = [
        {
            field: 'id',
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    SI NO
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'date',
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Date
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'shift',
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Shift
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "process",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Process
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "machineName",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Machine / Station</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "producedQty",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Produced</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "acptQty",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Accepted</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        // {
        //     field: "rejectedQty",
        //     headerClassName: "super-app-theme--header",
        //     headerName: (
        //         <span style={{ fontWeight: "bold", fontSize: "16px" }}>Rejected</span>
        //     ),
        //     type: 'string',
        //     sortable: true,
        //     minWidth: 80,
        //     flex: 1,
        //     align: 'center',
        //     headerAlign: 'center',
        //     renderCell: (params) => params.row.rejectedQty || '0',
        // },
        {
            field: "operator",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Operator</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "qa",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>QA</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "prod_eng",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Prod Eng</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "tool",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Tool View</span>
            ),
            width: 80,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <span
                    title="View Tool Details"
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#002D68',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToolIconClick(params.row);
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </span>
            ),
        },
    ];

    const child = [
        {
            field: 'SITEMCODE',
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Item Code
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "SITEMNAME",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Item Name
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "MTHICKNESS",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>M Thickness</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "QTY",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Qty</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "Child_Produced_Qty",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Produced Qty</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        }
        // {
        //     field: "ChildId",
        //     headerClassName: "super-app-theme--header",
        //     headerName: (
        //         <span style={{ fontWeight: "bold", fontSize: "16px" }}>Child Id</span>
        //     ),
        //     type: 'string',
        //     sortable: true,
        //     minWidth: 80,
        //     flex: 1,
        //     align: 'center',
        //     headerAlign: 'center',
        // },
        // {
        //     field: "DisplayStatus",
        //     headerClassName: "super-app-theme--header",
        //     headerName: (
        //         <span style={{ fontWeight: "bold", fontSize: "16px" }}>Display Status</span>
        //     ),
        //     type: 'string',
        //     sortable: true,
        //     minWidth: 80,
        //     flex: 1,
        //     align: 'center',
        //     headerAlign: 'center',
        // }
    ];

    const childDrill = [
        {
            field: 'id',
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    S No
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "process",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    Process
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "machineName",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Machine</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "producedQty",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Produced Qty</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "operator",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Operator</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "qa",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>QA</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: "prod_eng",
            headerClassName: "super-app-theme--header",
            headerName: (
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Prod Eng</span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (params) => params.row.prod_eng || params.row.prodEng || '',
        },
    ];



    const handleCellClick = (params) => {
        console.log("Cell clicked:", params); // Log clicked cell params

        if (isChild) {
            console.log("isChild state:", isChild); // Log the isChild state
            console.log("API call initiated for item ID:", params.row.id); // Log the item ID for the API call

            setRowChildName(params.row.SITEMCODE);
            setChildId(params.row.id);
            setIsChildItem(true);
            setIsChild(false);

            // Call the API and log the request details
            const requestData = { jcNo: selectedRowJobCardNo, itemId: params.row.id };
            console.log("Request Data for API:", requestData); // Log the request data

            GetJobCardChildDrill(
                requestData,
                handleChildDrillSuccess,
                handleChildDrillException
            );
        }
        // }
    };

    const handleChildDrillSuccess = (dataObject) => {
        console.log("API response:", dataObject); // Log API response
        setChildProcessDetails(dataObject?.processDetails || { inHouse: [], vendorProcess: [], assembly: [] });
    };

    const handleChildDrillException = (error) => {
        console.error("API call failed:", error); // Log any API errors
    };

    const handleChildClick = () => {
        setIsChild(true)
        if (isChildItem) {
            setIsChildItem(false);
        }
    }

    const handleToolIconClick = (row) => {
        const itemId = jobCardDetails[0]?.itemId || '';
        const processId = row.processId || row.id;
        setToolDialogInfo({
            process: row.process || '',
            machine: row.machineName || '',
            qty: row.producedQty || '',
        });
        GetJobCardToolDetails(
            { itemId, processId },
            (dataObject) => {
                setToolDetails(dataObject?.data || []);
                setOpenToolDialog(true);
            },
            (errorObject, errorMessage) => {
                setNotification({
                    status: true,
                    type: 'error',
                    message: errorMessage || 'Failed to load tool details',
                });
            }
        );
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="xl"
            open={open}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                Job Card No : {selectedRowJobCardNo}
            </DialogTitle>
            <form /*onSubmit={handleSubmit}*/>
                <DialogContent >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} lg={12} xl={12} style={{ display: 'flex', flexDirection: 'row' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #000000' }}>
                                <img src={MallikLogo} alt="Logo" style={{ width: '190px', height: '110px' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #000000' }}>
                                <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Typography style={{ fontSize: '30px', fontWeight: 'bold' }}>JOB CARD</Typography>
                                </div>
                                <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}>
                                    <Typography style={{ fontWeight: 'bold' }}>OTIS Elevator Company (India) ltd</Typography>
                                </div>
                            </div>
                            <div style={{ flex: 1, border: '1px solid #000000' }}>
                                <table id="jobCard">
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>JC Card No</td>
                                        <td>{selectedRowJobCardNo}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>JC Issue Date</td>
                                        <td>{jobCardDetails[0]?.scheduledDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>KANBAN Date</td>
                                        <td>{jobCardDetails[0]?.kanbanDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Schedule Date</td>
                                        <td>{jobCardDetails[0]?.scheduledDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>GRN NO</td>
                                        {/* <td>{jobCardDetails[0]?.grnNo}</td> */}
                                        <td
                                            title={jobCardDetails[0]?.grnNo}  // Tooltip on hover
                                            style={{
                                                maxWidth: '150px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {jobCardDetails[0]?.grnNo}
                                        </td>

                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Product Family</td>
                                        <td>{jobCardDetails[0]?.productFamily}</td>
                                    </tr>
                                </table>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={12} lg={12} xl={12} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', columnGap: '20px' }}>
                            <div style={{ border: '1px solid #000000', width: '100%' }}>
                                <table id="jobCard">
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Part No</td>
                                        <td>{jobCardDetails[0]?.itemCode}</td>
                                    </tr>
                                    {isChildItem &&
                                        <tr>
                                            <td style={{ fontWeight: 'bold' }}>Child Part No</td>
                                            <td>{rowChildName}</td>
                                        </tr>
                                    }
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Description</td>
                                        <td>{jobCardDetails[0]?.itemName}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Material Spec</td>
                                        <td>{jobCardDetails[0]?.material}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Material Thickness</td>
                                        <td>{jobCardDetails[0]?.materialThickness}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Planned Qty</td>
                                        <td>{jobCardDetails[0]?.Qty}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Finished Details</td>
                                        <td>{jobCardDetails[0]?.productFinish}</td>
                                    </tr>
                                </table>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '400px', border: '1px solid #000000' }}>
                                <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Typography style={{ fontWeight: 'bold' }}>{jobCardDetails[0]?.planEngineer}</Typography>
                                </div>
                                <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Typography style={{ fontWeight: 'bold' }}>PLANNING ENGINEER SIGN:</Typography>
                                </div>
                            </div>
                        </Grid>

                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>

                            {/* PROCESS TABLES — hide when opened via Child Part Number click */}
                            <div style={{ maxHeight: '600px', overflowY: 'scroll', paddingRight: '10px' }}>
                                {!clickedChildPartNumber && (
                                    <>
                                        {/* Helper function to render a process section */}
                                        {[
                                            { title: '[ INHOUSE PROCESSES ]', data: processDetails?.inHouse?.rows || [], summary: processDetails?.inHouse },
                                            { title: '[ VENDOR PROCESSES ]', data: processDetails?.vendorProcess?.rows || [], summary: processDetails?.vendorProcess },
                                            { title: '[ ASSEMBLY PROCESSES ]', data: processDetails?.assembly?.rows || [], summary: processDetails?.assembly },
                                        ]
                                            .filter(section => section.data && section.data.length > 0)
                                            .map((section, idx) => (
                                                <Box key={idx} sx={{ mb: 4 }}>
                                                    <Box sx={{ bgcolor: '#002D68', color: 'white', p: 1, fontWeight: 'bold' }}>
                                                        {section.title}
                                                    </Box>
                                                    <Box sx={{ width: '100%', mb: 1 }}>
                                                        <DataGrid
                                                            rows={section.data}
                                                            columns={parent}
                                                            rowHeight={40}
                                                            autoHeight
                                                            hideFooter
                                                            sx={{
                                                                /* ── Header ── */
                                                                "& .MuiDataGrid-columnHeaders": {
                                                                    minHeight: "40px !important",
                                                                    maxHeight: "40px !important",
                                                                    borderTop: "1px solid #969696",
                                                                    borderBottom: "2px solid #969696",
                                                                },
                                                                "& .MuiDataGrid-columnHeader": {
                                                                    border: "1px solid #969696",
                                                                },
                                                                "& .MuiDataGrid-columnHeaderTitle": {
                                                                    fontSize: "12px",
                                                                    fontWeight: "bold",
                                                                    color: "#000",
                                                                },
                                                                /* ── Cells: bordered like BOM Details ── */
                                                                "& .MuiDataGrid-cell": {
                                                                    border: "1px solid #969696",
                                                                    fontSize: "12px",
                                                                },
                                                                "& .MuiDataGrid-row": {
                                                                    borderBottom: "1px solid #e0e0e0",
                                                                },
                                                                "& .Mui-evenRow": {
                                                                    backgroundColor: "#ffffff",
                                                                },
                                                                "& .Mui-oddRow": {
                                                                    backgroundColor: "#f5f5f5",
                                                                },
                                                                border: "1px solid #969696",
                                                            }}
                                                            getRowClassName={(params) => {
                                                                const rowIndex = section.data.findIndex((row) => row.id === params.row.id);
                                                                return rowIndex % 2 === 0 ? "Mui-evenRow" : "Mui-oddRow";
                                                            }}
                                                            disableRowSelectionOnClick
                                                        />
                                                    </Box>
                                                    {/* Summary Block */}
                                                    {/* Set useStackedDesign to true if you want to revert to the old stacked design */}
                                                    {false && (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, pl: 0.5, pr: 0.5 }}>
                                                            {/* PROD / INWARD Block */}
                                                            {(section.summary?.production || section.summary?.inward) && (
                                                                <Box sx={{ display: 'flex', border: '1px solid black' }}>
                                                                    <Box sx={{ width: '40px', backgroundColor: '#eef4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid black' }}>
                                                                        <Typography sx={{ transform: 'rotate(-90deg)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>
                                                                            {section.summary?.production ? 'PROD' : 'INWARD'}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '200px' }}>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Accepted Quantity:</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Rework Quantity:</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Rejected Quantity:</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '80px' }}>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography>{section.summary?.production?.accepted ?? section.summary?.inward?.accepted ?? ''}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography>{section.summary?.production?.rework ?? section.summary?.inward?.rework ?? ''}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography>{section.summary?.production?.rejected ?? section.summary?.inward?.rejected ?? ''}</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, flexGrow: 1, justifyContent: 'space-between' }}>
                                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: "4px" }}>
                                                                                {section.summary?.production ? 'Production Action for Rework or Rejected Quantity:' : 'Inward Action for Rework or Rejected Quantity:'}
                                                                            </Typography>
                                                                            <Typography sx={{ fontSize: '14px', minHeight: '30px' }}>{section.summary?.production?.remarks ?? section.summary?.inward?.remarks ?? ''}</Typography>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mr: 1 }}>Sign:</Typography>
                                                                                <Box sx={{ borderBottom: '1px solid black', width: '150px' }}>{section.summary?.production?.sign ?? section.summary?.inward?.sign ?? ''}</Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            )}

                                                            {/* QA Block */}
                                                            {section.summary?.quality && (
                                                                <Box sx={{ display: 'flex', border: '1px solid black' }}>
                                                                    <Box sx={{ width: '40px', backgroundColor: '#eef4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid black' }}>
                                                                        <Typography sx={{ transform: 'rotate(-90deg)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>QA</Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '200px' }}>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Accepted Quantity:</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Rework Quantity:</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Rejected Quantity:</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '80px' }}>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography>{section.summary.quality.accepted}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography>{section.summary.quality.rework}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography>{section.summary.quality.rejected}</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, flexGrow: 1, justifyContent: 'space-between' }}>
                                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Quality Action for Rework or Rejected Quantity:</Typography>
                                                                            <Typography sx={{ fontSize: '14px', minHeight: '30px' }}>{section.summary.quality.remarks}</Typography>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mr: 1 }}>Sign:</Typography>
                                                                                <Box sx={{ borderBottom: '1px solid black', width: '150px' }}>{section.summary.quality.sign}</Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {/* New Side-by-Side Summary Block */}
                                                    {true && (
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 2, pl: 0.5, pr: 0.5 }}>
                                                            {/* PROD / INWARD Block */}
                                                            {(section.summary?.production || section.summary?.inward) && (
                                                                <Box sx={{ display: 'flex', border: '1px solid black', flex: 1 }}>
                                                                    <Box sx={{ width: '30px', backgroundColor: '#eef4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid black' }}>
                                                                        <Typography sx={{ transform: 'rotate(-90deg)', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                                                                            {section.summary?.production ? 'PROD' : 'INWARD'}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '80px' }}>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Acc. Qty</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Rwk. Qty</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Rej. Qty</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '40px' }}>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography sx={{ fontSize: '12px' }}>{section.summary?.production?.accepted ?? section.summary?.inward?.accepted ?? ''}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography sx={{ fontSize: '12px' }}>{section.summary?.production?.rework ?? section.summary?.inward?.rework ?? ''}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography sx={{ fontSize: '12px' }}>{section.summary?.production?.rejected ?? section.summary?.inward?.rejected ?? ''}</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, flexGrow: 1, justifyContent: 'space-between' }}>
                                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '12px', textDecoration: 'underline', textUnderlineOffset: "4px" }}>
                                                                                {section.summary?.production ? 'Production Action for Rework or Rejected Quantity:' : 'Inward Action for Rework or Rejected Quantity:'}
                                                                            </Typography>
                                                                            <Typography sx={{ fontSize: '12px', minHeight: '30px', mt: 0.5 }}>{section.summary?.production?.remarks ?? section.summary?.inward?.remarks ?? ''}</Typography>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, alignItems: 'flex-end' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1, whiteSpace: 'nowrap' }}>Sign:</Typography>
                                                                                <Box sx={{ borderBottom: '1px solid black', minWidth: '80px', maxWidth: '200px', wordBreak: 'break-word', pb: '2px', lineHeight: 1.2 }}>{section.summary?.production?.sign ?? section.summary?.inward?.sign ?? ''}</Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            )}

                                                            {/* QA Block */}
                                                            {section.summary?.quality && (
                                                                <Box sx={{ display: 'flex', border: '1px solid black', flex: 1 }}>
                                                                    <Box sx={{ width: '30px', backgroundColor: '#eef4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid black' }}>
                                                                        <Typography sx={{ transform: 'rotate(-90deg)', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px' }}>QA</Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '80px' }}>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Acc. Qty</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', borderBottom: '1px solid black', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Rwk. Qty</Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', p: 1, flex: 1, alignItems: 'center' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px' }}>Rej. Qty</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid black', width: '40px' }}>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography sx={{ fontSize: '12px' }}>{section.summary.quality.accepted}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ borderBottom: '1px solid black', p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography sx={{ fontSize: '12px' }}>{section.summary.quality.rework}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ p: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <Typography sx={{ fontSize: '12px' }}>{section.summary.quality.rejected}</Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, flexGrow: 1, justifyContent: 'space-between' }}>
                                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '12px', textDecoration: 'underline', textUnderlineOffset: "4px" }}>Quality Action for Rework or Rejected Quantity:</Typography>
                                                                            <Typography sx={{ fontSize: '12px', minHeight: '30px', mt: 0.5 }}>{section.summary.quality.remarks}</Typography>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, alignItems: 'flex-end' }}>
                                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1, whiteSpace: 'nowrap' }}>Sign:</Typography>
                                                                                <Box sx={{ borderBottom: '1px solid black', minWidth: '80px', maxWidth: '200px', wordBreak: 'break-word', pb: '2px', lineHeight: 1.2 }}>{section.summary.quality.sign}</Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                    </>
                                )}
                                <Typography style={{ fontWeight: 'bold', textAlign: 'left', marginTop: '10px', marginBottom: '5px' }}>
                                    {clickedChildPartNumber
                                        ? ''
                                        : isChild
                                            ? ' BOM Details for Job Card'
                                            : ' BOM Child Process Details'}
                                </Typography>
                                {isChild ? (
                                    <Box sx={{ width: '100%', mb: 1 }}>
                                        <DataGrid
                                            rows={childParts}
                                            columns={child}
                                            onCellClick={handleCellClick}
                                            autoHeight
                                            hideFooter
                                            sx={{
                                                "& .super-app-theme--header": {
                                                    backgroundColor: "#93bce6",
                                                    color: "#1c1919",
                                                    fontWeight: "bold",
                                                },
                                                "& .MuiDataGrid-columnHeaders": {
                                                    minHeight: "40px !important",
                                                    maxHeight: "40px !important",
                                                    borderTop: "1px solid #969696",
                                                    borderBottom: "2px solid #969696",
                                                },
                                                "& .MuiDataGrid-columnHeader": {
                                                    border: "1px solid #969696",
                                                },
                                                "& .MuiDataGrid-cell": {
                                                    border: "1px solid #969696",
                                                    fontSize: "12px",
                                                },
                                                "& .MuiDataGrid-row": {
                                                    borderBottom: "1px solid #e0e0e0",
                                                },
                                                "& .Mui-evenRow": {
                                                    backgroundColor: "#ffffff",
                                                },
                                                "& .Mui-oddRow": {
                                                    backgroundColor: "#f5f5f5",
                                                },
                                                border: "1px solid #969696",
                                            }}
                                            getRowClassName={(params) => {
                                                const rowIndex = childParts.findIndex((row) => row.id === params.row.id);
                                                return rowIndex % 2 === 0 ? "Mui-evenRow" : "Mui-oddRow";
                                            }}
                                            rowHeight={40}
                                            columnHeaderHeight={40}
                                            disableRowSelectionOnClick
                                        />
                                    </Box>
                                ) : (
                                    <>
                                        {[
                                            { title: '[ CHILD INHOUSE PROCESSES ]', data: childProcessDetails?.inHouse?.rows || [], summary: childProcessDetails?.inHouse },
                                            { title: '[ CHILD VENDOR PROCESSES ]', data: childProcessDetails?.vendorProcess?.rows || [], summary: childProcessDetails?.vendorProcess },
                                            { title: '[ CHILD ASSEMBLY PROCESSES ]', data: childProcessDetails?.assembly?.rows || [], summary: childProcessDetails?.assembly },
                                        ]
                                            .filter(section => section.data && section.data.length > 0)
                                            .map((section, idx) => (
                                                <Box key={idx} sx={{ mb: 4 }}>
                                                    <Box sx={{ bgcolor: '#002D68', color: 'white', p: 1, fontWeight: 'bold', mb: 1 }}>
                                                        {section.title}
                                                    </Box>
                                                    <Box sx={{ width: '100%', mb: 1 }}>
                                                        <DataGrid
                                                            rows={section.data}
                                                            columns={childDrill}
                                                            rowHeight={40}
                                                            autoHeight
                                                            hideFooter
                                                            sx={{
                                                                "& .super-app-theme--header": {
                                                                    backgroundColor: "#93bce6",
                                                                    color: "#1c1919",
                                                                    fontWeight: "bold",
                                                                },
                                                                "& .MuiDataGrid-columnHeaders": {
                                                                    minHeight: "40px !important",
                                                                    maxHeight: "40px !important",
                                                                    borderTop: "1px solid #969696",
                                                                    borderBottom: "2px solid #969696",
                                                                },
                                                                "& .MuiDataGrid-columnHeader": {
                                                                    border: "1px solid #969696",
                                                                },
                                                                "& .MuiDataGrid-cell": {
                                                                    border: "1px solid #969696",
                                                                    fontSize: "12px",
                                                                },
                                                                "& .MuiDataGrid-row": {
                                                                    borderBottom: "1px solid #e0e0e0",
                                                                },
                                                                "& .Mui-evenRow": {
                                                                    backgroundColor: "#ffffff",
                                                                },
                                                                "& .Mui-oddRow": {
                                                                    backgroundColor: "#f5f5f5",
                                                                },
                                                                border: "1px solid #969696",
                                                            }}
                                                            getRowClassName={(params) => {
                                                                const rowIndex = section.data.findIndex((row) => row.id === params.row.id);
                                                                return rowIndex % 2 === 0 ? "Mui-evenRow" : "Mui-oddRow";
                                                            }}
                                                            disableRowSelectionOnClick
                                                        />
                                                    </Box>
                                                    {/* Summary Block */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, pl: 0.5, pr: 0.5 }}>
                                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                                            <Box textAlign="center">
                                                                <Typography variant="caption" fontWeight="bold" color="textSecondary">TOTAL PRODUCED</Typography>
                                                                <Box sx={{ bgcolor: '#e8f0fe', color: '#1967d2', p: 1, borderRadius: 1, minWidth: 80, fontWeight: 'bold', fontSize: '20px' }}>
                                                                    {section.summary?.totalProduced || 0}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ minWidth: '400px' }}>
                                                            <Typography variant="caption" fontWeight="bold">ACTION SIGNATURE</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 2 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>SIGN: </Typography>
                                                                <Box sx={{ borderBottom: '1px solid #000', flexGrow: 1, minHeight: '20px' }}>
                                                                    {section.summary?.sign || ''}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                    </>
                                )}
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <table id="jobCard">
                                <tr>
                                    <td style={{ fontWeight: 'bold' }}>REMARKS:</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold' }}>ACTION FOR REMARKS:</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold' }}>ACCEPTED QTY : {acceptedQty}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold' }}>REJECT/REWORK QTY: {rejectedQty}</td>
                                </tr>
                            </table>

                            <table id="jobCard">
                                <tr>
                                    <td style={{ fontWeight: 'bold' }}>{location}</td>
                                    <td style={{ fontWeight: 'bold' }}>RECEIVED QTY: {receivedQty} </td>
                                    <td style={{ fontWeight: 'bold' }}>CELL LEADER SIGN : {verifiedBy}</td>
                                </tr>
                            </table>
                            <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                                FORMAT NO: IMS-ME-PRODN-F-305, REV-'3' 25.06.2025
                            </div>                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <>
                        <Button
                            variant="contained"
                            style={{ width: '150px', background: '#002D68', color: 'white' }}
                            onClick={() => setOpenPdfDialog(true)}
                        >
                            View PDF
                        </Button>
                        <GeneratePdfDialog
                            open={openPdfDialog}
                            handleClose={() => setOpenPdfDialog(false)}
                            pdfData={pdfData}
                            jcId={jcId}
                            jcDetails={jobCardDetails[0]}
                            bomDetails={childParts}
                            processDetails={isChild ? processDetails : childProcessDetails}
                            isChild={isChild}
                            childPartNo={rowChildName}
                            selectedRowJobCardNo={selectedRowJobCardNo}
                        />
                    </>

                    <Button
                        variant="contained"
                        disabled={isChild}
                        style={{ width: '150px', background: isChild ? 'gray' : '#002D68', color: 'white' }}
                        onClick={handleChildClick}
                    >
                        Child Part
                    </Button>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={(e) => {
                            setOpen(false);
                            setIsChild(false);
                            setIsChildItem(false);
                            ClearData();
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />

            </form>

            {/* TOOL DETAILS DIALOG */}
            <Dialog
                open={openToolDialog}
                onClose={() => setOpenToolDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    style={{
                        background: '#002D68',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        textAlign: 'center',
                        letterSpacing: '1px',
                        padding: '14px 24px',
                    }}
                >
                    🔧 TOOL DETAILS
                </DialogTitle>
                <DialogContent style={{ padding: '20px 24px' }}>
                    {/* Header Info */}
                    {/* <Box
                        sx={{
                            border: '1px solid #002D68',
                            borderRadius: '6px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            background: '#f0f4ff',
                            display: 'flex',
                            gap: '40px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Typography style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            Process : <span style={{ fontWeight: 'normal' }}>{toolDialogInfo.process}</span>
                        </Typography>
                        <Typography style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            Machine : <span style={{ fontWeight: 'normal' }}>{toolDialogInfo.machine}</span>
                        </Typography>
                        <Typography style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            Qty : <span style={{ fontWeight: 'normal' }}>{toolDialogInfo.qty}</span>
                        </Typography>
                    </Box> */}
                    <Box
                        sx={{
                            border: '1px solid #002D68',
                            borderRadius: '6px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            background: '#f0f4ff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            gap: '8px',
                        }}
                    >
                        <Typography
                            style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            Process : <span style={{ fontWeight: 'normal' }}>{toolDialogInfo.process}</span>
                        </Typography>

                        <Typography
                            style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            Machine : <span style={{ fontWeight: 'normal' }}>{toolDialogInfo.machine}</span>
                        </Typography>

                        <Typography
                            style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            Qty : <span style={{ fontWeight: 'normal' }}>{toolDialogInfo.qty}</span>
                        </Typography>
                    </Box>

                    {/* Tool Details Table */}
                    <Box sx={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '14px',
                            }}
                        >
                            <thead>
                                <tr style={{ background: '#93bce6', color: '#1c1919' }}>
                                    {['Tool No', 'Tool Name', 'Count', 'Tool Life', 'Status'].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                border: '1px solid #969696',
                                                padding: '8px 12px',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {toolDetails.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                textAlign: 'center',
                                                padding: '20px',
                                                color: '#888',
                                                border: '1px solid #969696',
                                            }}
                                        >
                                            No tool details found.
                                        </td>
                                    </tr>
                                ) : (
                                    toolDetails.map((tool, idx) => (
                                        <tr
                                            key={tool.id || idx}
                                            style={{
                                                background: idx % 2 === 0 ? '#ffffff' : '#eaf2ff',
                                            }}
                                        >
                                            <td style={{ border: '1px solid #969696', padding: '7px 12px', textAlign: 'center' }}>{tool.toolNo}</td>
                                            <td style={{ border: '1px solid #969696', padding: '7px 12px', textAlign: 'center' }}>{tool.toolName}</td>
                                            <td style={{ border: '1px solid #969696', padding: '7px 12px', textAlign: 'center' }}>{tool.count}</td>
                                            <td style={{ border: '1px solid #969696', padding: '7px 12px', textAlign: 'center' }}>{tool.life}</td>
                                            <td
                                                style={{
                                                    border: '1px solid #969696',
                                                    padding: '7px 12px',
                                                    textAlign: 'center',
                                                    color: tool.status === 'Active' ? '#1a7a1a' : '#c0392b',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {tool.status}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Box>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', paddingBottom: '16px' }}>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={() => setOpenToolDialog(false)}
                    >
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog >
    )
}

export default JobCardViewNewModal
