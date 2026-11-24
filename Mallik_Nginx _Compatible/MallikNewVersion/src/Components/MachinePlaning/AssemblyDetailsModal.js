import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { GetAssemblyFimDetails, GetAssemblyItemDetails } from '../../ApiService/LoginPageService';
import JobCardViewNewModal from '../JobCardViewNew/JobCardViewNewModal';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import MultiFileViewer from '../ProcessInspection/MultiFileViewer';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

const AssemblyDetailsModal = ({ open, onClose, selectedRow, aseemblyType }) => {
    const [loading, setLoading] = useState(false);
    const [childItems, setChildItems] = useState([]);
    const [selectedJcNo, setSelectedJcNo] = useState('');
    const [jobCardModalOpen, setJobCardModalOpen] = useState(false);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [viewItemCode, setViewItemCode] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        if (open && selectedRow) {
            console.log("AssemblyDetailsModal open with selectedRow:", selectedRow);
            const sobId = selectedRow.sobId || selectedRow.id;
            console.log("Resolved sobId:", sobId);
            if (!sobId) {
                setNotification({
                    status: true,
                    type: 'error',
                    message: 'No SOB ID found for this row.',
                });
                return;
            }
            fetchDetails(sobId);
        }
    }, [open, selectedRow]);

    const fetchDetails = (sobId) => {
        setLoading(true);
        setChildItems([]);
        if (aseemblyType == "FIM") {
            GetAssemblyFimDetails(
                sobId,
                (res) => {
                    console.log("GetAssemblyFimDetails API success response:", res);
                    setLoading(false);
                    const items = Array.isArray(res?.data) ? res.data : [];
                    console.log("Parsed childItems rows:", items);
                    setChildItems(items);
                },
                (err, msg) => {
                    console.error("GetAssemblyFimDetails API error:", err, msg);
                    setLoading(false);
                    setNotification({
                        status: true,
                        type: 'error',
                        message: msg || 'Failed to fetch assembly details',
                    });
                }
            )
        }
        else {
            GetAssemblyItemDetails(
                sobId,
                (res) => {
                    console.log("GetAssemblyItemDetails API success response:", res);
                    setLoading(false);
                    const items = Array.isArray(res?.data) ? res.data : [];
                    console.log("Parsed childItems rows:", items);
                    setChildItems(items);
                },
                (err, msg) => {
                    console.error("GetAssemblyItemDetails API error:", err, msg);
                    setLoading(false);
                    setNotification({
                        status: true,
                        type: 'error',
                        message: msg || 'Failed to fetch assembly details',
                    });
                }
            );
        }
    };

    const handleNotificationClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleJcRowClick = (params) => {
        if (params.field === 'jcNo') {
            const jcNo = params.value;
            if (jcNo) {
                setSelectedJcNo(jcNo);
                setJobCardModalOpen(true);
            }
        }
    };

    const childItemsColumns = [
        {
            field: 'sNo',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    S.No
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 70,
            flex: 0.5,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const index = childItems.findIndex((row) => row.id === params.row.id);
                return index !== -1 ? index + 1 : '';
            }
        },
        {
            field: 'itemCode',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    Item Code
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 120,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'jcNo',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    Job Card No
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 130,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const jcNo = params.value;
                if (!jcNo) return '-';
                return (
                    <span
                        style={{
                            color: '#002d68',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {jcNo}
                    </span>
                );
            }
        },
        {
            field: 'category',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    Category
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 120,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'srnQty',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    SRN Qty
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'fim',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    FIM
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'grn',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    GRN
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 150,
            flex: 1.2,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value || '-',
        },
        {
            field: 'issuedQty',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    Issued Qty
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'issueStatus',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    Issue Status
                </span>
            ),
            type: 'string',
            sortable: true,
            minWidth: 130,
            flex: 1.2,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const status = params.value;
                let color = 'inherit';
                if (status === 'Fully Issued') color = '#2e7d32';
                else if (status === 'Not Issued') color = '#d32f2f';
                else if (status === 'Partially Issued') color = '#ed6c02';
                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {status}
                    </span>
                );
            }
        },
        {
            field: 'action',
            headerClassName: 'super-app-theme--header',
            headerName: (
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    Action
                </span>
            ),
            sortable: false,
            minWidth: 80,
            flex: 0.8,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return (
                    <RemoveRedEyeIcon
                        style={{ color: '#002d68', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewItemCode(params.row.itemCode);
                            setPdfOpen(true);
                        }}
                    />
                );
            }
        },
    ];

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle style={{ backgroundColor: '#002d68', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        Assembly Item Details {selectedRow ? `(${selectedRow.itemCode || selectedRow.itemCode1 || ''})` : ''}
                    </Typography>
                    <Button
                        onClick={onClose}
                        style={{ color: 'white', minWidth: 'auto', fontWeight: 'bold', fontSize: '18px' }}
                    >
                        ✕
                    </Button>
                </DialogTitle>
                <DialogContent style={{ padding: '24px', backgroundColor: '#f5f7fa' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#002d68', marginBottom: '12px' }}>
                                        Child Items / Materials
                                    </Typography>
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <DataGrid
                                            rows={childItems}
                                            columns={childItemsColumns}
                                            pageSize={8}
                                            rowsPerPageOptions={[8]}
                                            loading={loading}
                                            disableSelectionOnClick
                                            onCellClick={handleJcRowClick}
                                            sx={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e0e0e0',
                                                '& .super-app-theme--header': {
                                                    backgroundColor: '#93bce6',
                                                    color: '#1c1919',
                                                    fontWeight: 'bold',
                                                },
                                                '& .MuiDataGrid-cell': {
                                                    border: '1px solid #e0e0e0',
                                                },
                                                '& .MuiDataGrid-columnHeader': {
                                                    border: '1px solid #e0e0e0',
                                                },
                                            }}
                                            rowHeight={38}
                                            columnHeaderHeight={38}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions style={{ padding: '12px 24px', backgroundColor: '#f5f7fa', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        style={{ backgroundColor: '#002d68', textTransform: 'none', borderRadius: '4px' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {jobCardModalOpen && (
                <JobCardViewNewModal
                    open={jobCardModalOpen}
                    setOpen={setJobCardModalOpen}
                    selectedRowJobCardNo={selectedJcNo}
                    setSelectedRowJobCardNo={setSelectedJcNo}
                    isAddButton={false}
                />
            )}

            {pdfOpen && (
                <MultiFileViewer
                    pdfOpen={pdfOpen}
                    setPdfOpen={setPdfOpen}
                    selectedRowItemCode={viewItemCode}
                />
            )}
        </>
    );
};

export default AssemblyDetailsModal;
