import { Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { GetPendingDelNoteData, GSTLoadPendingPO, loadSaleOrderVerfied, SearchDelNote, GetContractReviewItemsByCustomer } from '../../../ApiService/LoginPageService';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

const LoadSalesDelNote = ({ loadPendingModalOpen, setLoadPendingModalOpen, setPendingPOList, customerId, setSelectedItems, customerSelect }) => {
    const [refreshData, setRefreshData] = useState(false);
    const [rows, setRows] = useState('');
    const [custAllAddressList, setCustAllAddressList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemsSelectedSo, setItemsSelectedSo] = useState([]);
    const [formDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [delNoteLists, setDelNoteLists] = useState([]);
    const [selectedDelNote, setSelectedDelNote] = useState('');
    const [tableData, setTableData] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [verifiedLists, setVerifiedLists] = useState([]);

    const columns1 = [
        {
            field: 'crNo',
            headerName: 'CR No',
            type: 'string',
            sortable: true,
            minWidth: 120,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'crDate',
            headerName: 'CR Date',
            type: 'string',
            sortable: true,
            minWidth: 110,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'custPoNo',
            headerName: 'Cust PO No',
            type: 'string',
            sortable: true,
            minWidth: 110,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'custPoDate',
            headerName: 'Cust PO Date',
            type: 'string',
            sortable: true,
            minWidth: 110,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'custPoLine',
            headerName: 'PO Line',
            type: 'string',
            sortable: true,
            minWidth: 90,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'itemCode',
            headerName: 'Item Code',
            type: 'string',
            sortable: true,
            minWidth: 110,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'itemName',
            headerName: 'Item Name',
            type: 'string',
            sortable: true,
            minWidth: 160,
            flex: 1.5,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'uom',
            headerName: 'UOM',
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 0.8,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'crQty',
            headerName: 'CR Qty',
            type: 'number',
            sortable: true,
            minWidth: 90,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'crRate',
            headerName: 'CR Rate',
            type: 'number',
            sortable: true,
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'crAmt',
            headerName: 'CR Amount',
            type: 'number',
            sortable: true,
            minWidth: 110,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'mstPrice',
            headerName: 'Master Price',
            type: 'number',
            sortable: true,
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'moq',
            headerName: 'MOQ',
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 0.8,
            align: 'center',
            headerAlign: 'center',
        },
    ];

    const clearPageData = () => {
        setTableData([]);
        setFromDate('');
        setToDate('');
        setSelectedDelNote('');
    }

    const handleViewClick = () => {
        const targetCustId = customerSelect || customerId;
        if (targetCustId) {
            GetContractReviewItemsByCustomer(targetCustId, handleViewSuccess, handleViewException);
        } else {
            loadSaleOrderVerfied({ from: formDate, to: toDate, customerId: customerSelect }, handleViewSuccess, handleViewException);
        }
    }

    const handleViewSuccess = (dataObject) => {
        const rawData = dataObject?.data || dataObject || [];
        const formattedData = Array.isArray(rawData)
            ? rawData.map((item, index) => ({
                ...item,
                id: item.id ?? item.crMstId ?? `row_${index}`
            }))
            : [];
        setVerifiedLists(formattedData);
    }
    const handleViewException = () => { }

    useEffect(() => {
        if (loadPendingModalOpen) {
            handleViewClick();
        }
    }, [loadPendingModalOpen, customerSelect, customerId]);

    // DATAGRID CHECKBOX SELECTION ROW
    const handleDatagridRowSelection = (selectionModel) => {
        // Find the selected rows based on IDs
        const selectedData = verifiedLists.filter(row => selectionModel.includes(row.id));
        setSelectedRows(selectedData);
    };

    const handleOkClick = () => {
        setSelectedItems(selectedRows);
        setLoadPendingModalOpen(false);
        clearPageData();
    }

    const handleClose = () => {
        setLoadPendingModalOpen(false);
        clearPageData();
    }

    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
                maxWidth="xl"
                open={loadPendingModalOpen}>
                <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                    Select Contract Review Item
                </DialogTitle>
                <form className="mt-2 space-y-6">
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item sm={12} md={6} lg={4} xl={4}>
                                <TextField
                                    id="filled-basic"
                                    label="From Date"
                                    variant="filled"
                                    fullWidth
                                    type='date'
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="From Date"
                                    value={formDate}
                                    onChange={(e) => {
                                        setFromDate(e.target.value)
                                    }}
                                />
                            </Grid>

                            <Grid item sm={12} md={6} lg={4} xl={4}>
                                <TextField
                                    id="filled-basic"
                                    label="To Date"
                                    variant="filled"
                                    fullWidth
                                    type='date'
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="To Date"
                                    value={toDate}
                                    onChange={(e) => {
                                        setToDate(e.target.value)
                                    }}
                                />
                            </Grid>

                            <Grid item sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
                                <Button variant="contained" style={{ width: '150px', background: '#002D68', color: 'white' }} onClick={handleViewClick}>
                                    View
                                </Button>
                            </Grid>
                            <Grid item sm={12} md={12} lg={12} xl={12}>
                                <Card style={{ boxShadow: '0 10px 10px 10px rgba(0, 0, 0, 0.2)', borderRadius: '10px', width: '100%' }}>
                                    <CardContent>
                                        <DataGrid
                                            rows={verifiedLists}
                                            columns={columns1}
                                            pageSize={8}
                                            rowsPerPageOptions={[8]}
                                            style={{ border: 'none' }}
                                            sx={{
                                                overflow: 'auto',
                                                height: '50vh',
                                                // minHeight: '500px',
                                                width: '100%',
                                                '& .MuiDataGrid-columnHeaders': {
                                                    WebkitTextStrokeWidth: '0.6px',
                                                    backgroundColor: '#93bce6',
                                                    color: '#1c1919',
                                                    cursor: 'pointer'
                                                },
                                                '& .MuiDataGrid-columnHeaderTitleContainer': {
                                                    justifyContent: 'center'
                                                },
                                                '& .MuiDataGrid-cell': {
                                                    border: '1px solid #969696',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center'
                                                },
                                                '& .MuiDataGrid-columnHeader': {
                                                    border: '1px solid #969696',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center'
                                                },
                                            }}
                                            rowHeight={40}
                                            columnHeaderHeight={40}
                                            getRowClassName={(params) => {
                                                // Find the index of the row within the rows array
                                                const rowIndex = verifiedLists.findIndex(row => row.id === params.row.id);
                                                // Check if the index is valid
                                                if (rowIndex !== -1) {
                                                    return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                                }
                                                return ''; // Return default class if index is not found
                                            }}
                                            checkboxSelection
                                            disableRowSelectionOnClick
                                            onRowSelectionModelChange={handleDatagridRowSelection}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" style={{ width: '150px', background: '#002D68', color: 'white' }} onClick={handleOkClick}>
                            Submit
                        </Button>
                        <Button variant="contained" style={{ width: '150px', background: '#002D68', color: 'white' }}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div >
    )
}

export default LoadSalesDelNote

