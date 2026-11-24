import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, IconButton, Card, CardContent, Grid, FormControl, Autocomplete, CircularProgress, Checkbox, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { GetContractReport, GetFimDetails, SearchContractNo, CSLContractImport, GetConsolidatedContractReport } from '../../../ApiService/LoginPageService';
import { DownloadCSLContractTemplate } from '../../../ApiService/DownloadCsvReportsService';
import NotificationBar from '../../GlobleFiles/ServiceNotificationBar';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const getStatusBadgeStyles = (status) => {
    switch (status) {
        case 'P':
            return { backgroundColor: '#e6f4ea', color: '#1e8e3e' };
        case 'P/R':
            return { backgroundColor: '#fef7e0', color: '#f29900' };
        case 'P/R/D':
            return { backgroundColor: '#fce8e6', color: '#d93025' };
        default:
            return { backgroundColor: '#f1f3f4', color: '#5f6368' };
    }
};

const StatusBadge = ({ status }) => {
    const styles = getStatusBadgeStyles(status);
    return (
        <span style={{
            ...styles,
            padding: '4px 12px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '12px',
            display: 'inline-block'
        }}>
            {status}
        </span>
    );
};

// Custom hook for clean debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const ContractReport = () => {
    const [selectedContracts, setSelectedContracts] = useState([]);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const debouncedSearchTerm = useDebounce(inputValue, 300);
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [fimDetails, setFimDetails] = useState([]);
    const [summary, setSummary] = useState({ total: 0, p: 0, pr: 0, prd: 0 });
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const [consolidatedModalOpen, setConsolidatedModalOpen] = useState(false);
    const [consolidatedData, setConsolidatedData] = useState({ columns: [], rows: [], summary: {} });
    const [consolidatedLoading, setConsolidatedLoading] = useState(false);

    const handleCloseNotification = () => {
        setNotification({ status: false, type: '', message: '' });
    };

    const showNotification = (type, message) => {
        setNotification({ status: true, type, message });
    };

    const handleCSLImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setTableLoading(true);

        CSLContractImport(
            formData,
            (res) => {
                if (res.success && res.data) {
                    const dataWithIds = res.data.map((item, index) => ({
                        id: index + 1,
                        ...item
                    }));
                    setContracts(dataWithIds);
                } else {
                    setContracts([]);
                }
                showNotification('success', res?.message || 'CSL File imported successfully!');
                setTableLoading(false);
                e.target.value = '';
            },
            (err, msg) => {
                showNotification('error', msg || 'CSL File import failed.');
                setContracts([]);
                setTableLoading(false);
                e.target.value = '';
            }
        );
    };
    useEffect(() => {
        let active = true;

        if (debouncedSearchTerm === '') {
            setOptions(selectedContracts ? [...selectedContracts] : []);
            return undefined;
        }

        setLoading(true);

        SearchContractNo({ q: debouncedSearchTerm }, (result) => {
            if (active) {
                if (result.success && result.data) {
                    setOptions(result.data);
                } else {
                    setOptions([]);
                }
                setLoading(false);
            }
        }, (error) => {
            if (active) {
                setLoading(false);
                setOptions([]);
            }
        });

        return () => {
            active = false;
        };
    }, [debouncedSearchTerm, selectedContracts]);

    const handleSubmit = () => {
        setTableLoading(true);
        const contractNos = selectedContracts.map(c => c.contractNo).join(',');
        GetContractReport({ contractNos }, (result) => {
            if (result.success && result.data) {
                const dataWithIds = result.data.map((item, index) => ({
                    id: index + 1,
                    ...item
                }));
                setContracts(dataWithIds);
            } else {
                setContracts([]);
            }
            setTableLoading(false);
        }, (error, errorMessage) => {
            console.error("Error fetching contracts:", errorMessage);
            setContracts([]);
            setTableLoading(false);
        });
    };

    const handleConsolidatedReport = () => {
        const contractNos = contracts.map(c => c.contractNo).join(',');
        if (!contractNos) {
            showNotification('error', 'No contracts available in the table.');
            return;
        }
        setConsolidatedModalOpen(true);
        setConsolidatedLoading(true);

        GetConsolidatedContractReport({ contractNos }, (result) => {
            if (result.success && result.data) {
                const dataWithIds = (result.data.rows || []).map((item, index) => ({
                    id: index + 1,
                    ...item
                }));
                setConsolidatedData({
                    columns: result.data.columns || [],
                    rows: dataWithIds,
                    summary: result.data.summary || {}
                });
            } else {
                setConsolidatedData({ columns: [], rows: [], summary: {} });
            }
            setConsolidatedLoading(false);
        }, (error, errorMessage) => {
            console.error("Error fetching consolidated report:", errorMessage);
            setConsolidatedData({ columns: [], rows: [], summary: {} });
            setConsolidatedLoading(false);
        });
    };

    const handleRowClick = (params) => {
        const contractNo = params.row.contractNo;
        setSelectedContract(params.row);
        setFimDetails([]);
        setSummary({ total: 0, p: 0, pr: 0, prd: 0 });
        setModalLoading(true);

        GetFimDetails({ contractNo }, (result) => {
            if (result.success && result.data) {
                const dataWithIds = (result.data.fimRecords || []).map((item, index) => ({
                    id: index + 1,
                    ...item
                }));
                setFimDetails(dataWithIds);
                setSummary({
                    total: result.data.totalFIM || 0,
                    p: result.data.summary?.['P'] || 0,
                    pr: result.data.summary?.['P/R'] || 0,
                    prd: result.data.summary?.['P/R/D'] || 0
                });
            }
            setModalLoading(false);
        }, (error, errorMessage) => {
            console.error("Error fetching FIM details:", errorMessage);
            setModalLoading(false);
        });
    };

    const handleCloseModal = () => {
        setSelectedContract(null);
        setFimDetails([]);
        setSummary({ total: 0, p: 0, pr: 0, prd: 0 });
    };

    const contractColumns = [
        {
            field: 'contractNo',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Contract No</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <span style={{ color: '#1a73e8', cursor: 'pointer', fontWeight: '500', }} onClick={() => handleRowClick(params)}>
                    {params.value}
                </span>
            ),
        },
        {
            field: 'totalFIM',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total FIM</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'status',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Status</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <StatusBadge status={params.value} />
        }
    ];

    const fimColumns = [
        {
            field: 'fimNo',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>FIM No</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <span style={{ color: '#1a73e8', cursor: 'pointer', fontWeight: '500' }}>
                    {params.value || '-'}
                </span>
            )
        },
        {
            field: 'status',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Status</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <StatusBadge status={params.value} />
        },
        {
            field: 'invoiceNo',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Invoice No</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <span style={{ color: params.value && params.value !== '-' ? '#1a73e8' : 'inherit', cursor: params.value && params.value !== '-' ? 'pointer' : 'default', fontWeight: params.value && params.value !== '-' ? '500' : 'normal' }}>
                    {params.value || '-'}
                </span>
            )
        },
        {
            field: 'invoiceDate',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Invoice Date</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value || '-'
        },
        {
            field: 'dispatchedOn',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Dispatched On</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value || '-'
        },
    ];

    const handleDownloadConsolidatedCSV = () => {
        if (!consolidatedData.rows.length) return;

        let headers = ['Contract No', ...consolidatedData.columns, 'Status', 'Invoice No', 'Invoice Date', 'Dispatched On'];
        let csvContent = headers.join(',') + '\n';

        consolidatedData.rows.forEach(row => {
            let rowData = [
                row.contractNo || '',
                ...consolidatedData.columns.map(col => row[col] || ''),
                row.status || '',
                row.invoiceNo || '',
                row.invoiceDate || '',
                row.dispatchedOn || ''
            ];
            csvContent += rowData.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Consolidated_Contract_Report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const baseConsolidatedColumns = [
        {
            field: 'contractNo',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Contract No</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            minWidth: 150,
            renderCell: (params) => (
                <span style={{ color: '#1a73e8', fontWeight: '500' }}>
                    {params.value}
                </span>
            ),
        }
    ];

    const dynamicColumns = consolidatedData.columns.map(colName => ({
        field: colName,
        headerClassName: 'super-app-theme--header',
        headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{colName}</span>,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        minWidth: 120,
        renderCell: (params) => {
            if (['P', 'P/R', 'P/R/D'].includes(params.value)) {
                return <StatusBadge status={params.value} />
            }
            return params.value || '-';
        }
    }));

    const endConsolidatedColumns = [
        {
            field: 'status',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Status</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            minWidth: 100,
            renderCell: (params) => <StatusBadge status={params.value} />
        },
        {
            field: 'invoiceNo',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Invoice No</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            minWidth: 150,
            renderCell: (params) => params.value || '-'
        },
        {
            field: 'invoiceDate',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Invoice Date</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            minWidth: 150,
            renderCell: (params) => params.value || '-'
        },
        {
            field: 'dispatchedOn',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Dispatched On</span>,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            minWidth: 150,
            renderCell: (params) => params.value || '-'
        }
    ];

    const consolidatedColumns = [...baseConsolidatedColumns, ...dynamicColumns, ...endConsolidatedColumns];

    return (
        <div style={{ height: '70vh', width: '98%', justifyContent: 'space-around', marginLeft: '15px' }}>


            <Grid container spacing={2} alignItems={'center'} style={{ paddingTop: '20px', justifyContent: 'space-between' }} >
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Contracts report</Typography>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={9}
                    lg={9}
                    xl={9}
                    style={{
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => {
                            DownloadCSLContractTemplate(
                                {},
                                () => { showNotification('success', 'CSL Template downloaded successfully'); },
                                (err, msg) => { showNotification('error', msg || 'Failed to download CSL template'); }
                            );
                        }}
                        style={{
                            minWidth: '150px',
                            backgroundColor: '#ffffff',
                            whiteSpace: 'nowrap',
                            color: '#002868',
                            border: '1px solid #002868',
                            fontWeight: 'bold'
                        }}
                    >
                        Template
                    </Button>
                    <Button
                        variant="contained"
                        component="label"
                        style={{
                            minWidth: '120px',
                            backgroundColor: '#002868',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Load Excel
                        <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleCSLImportFile} />
                    </Button>

                    <FormControl style={{ flexGrow: 1, maxWidth: '400px' }}>
                        <Autocomplete
                            multiple
                            size="small"
                            id="contract-search"
                            options={options}
                            disableCloseOnSelect
                            loading={loading}
                            limitTags={3}

                            value={selectedContracts}
                            inputValue={inputValue}

                            getOptionLabel={(option) =>
                                option?.contractNo || ''
                            }

                            isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                            }

                            // SEARCH INPUT HANDLE
                            onInputChange={(event, newInputValue, reason) => {
                                // Prevent input from clearing when a checkbox is clicked
                                if (reason !== 'reset') {
                                    setInputValue(newInputValue);
                                }
                            }}

                            // SELECT HANDLE
                            onChange={(event, newValue) => {
                                setSelectedContracts(newValue);
                            }}

                            // CLEAR INPUT ON CLOSE
                            onClose={(event, reason) => {
                                setInputValue('');
                            }}

                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    minHeight: '44px',
                                    maxHeight: '44px',
                                    padding: '4px 8px',
                                },
                                '& .MuiAutocomplete-inputRoot': {
                                    alignItems: 'center',
                                    flexWrap: 'nowrap',
                                },
                                '& .MuiAutocomplete-input': {
                                    minWidth: '120px !important',
                                    width: 'auto !important',
                                },
                            }}

                            renderTags={(value, getTagProps) => {
                                const numTags = value.length;
                                const limit = 1;

                                return (
                                    <>
                                        {value.slice(0, limit).map((option, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={index}
                                                label={option?.contractNo || ''}
                                                size="small"
                                                style={{ margin: '2px', maxWidth: '120px' }}
                                            />
                                        ))}
                                        {numTags > limit && (
                                            <span style={{ fontSize: '13px', marginLeft: '4px', whiteSpace: 'nowrap', color: '#666', fontWeight: 500 }}>
                                                +{numTags - limit}
                                            </span>
                                        )}
                                    </>
                                );
                            }}

                            renderOption={(
                                props,
                                option,
                                { selected }
                            ) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        checked={selected}
                                        style={{ marginRight: 8 }}
                                    />

                                    {option.contractNo}
                                </li>
                            )}

                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search By Contract Nos"

                                    InputProps={{
                                        ...params.InputProps,

                                        endAdornment: (
                                            <>
                                                {loading ? (
                                                    <CircularProgress
                                                        color="inherit"
                                                        size={20}
                                                    />
                                                ) : null}

                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        style={{
                            minWidth: '100px',
                            backgroundColor: '#002868',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Submit
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConsolidatedReport}
                        disabled={contracts.length === 0}
                        style={
                            contracts.length === 0
                                ? { minWidth: '150px' }
                                : { minWidth: '150px', backgroundColor: '#002868' }
                        }
                    >
                        Consolidated Report
                    </Button>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card style={{ boxShadow: '0 10px 10px 10px rgba(0, 0, 0, 0.2)', marginTop: "-10px", borderRadius: '10px', width: '100%', height: '100%' }}>
                        <CardContent>
                            <DataGrid
                                rows={contracts}
                                columns={contractColumns}
                                pageSize={8}
                                rowsPerPageOptions={[8]}
                                loading={tableLoading}
                                disableSelectionOnClick
                                style={{ border: 'none' }}
                                sx={{
                                    overflow: 'auto',
                                    height: '50vh',
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
                                        border: '1px solid #969696',
                                    },
                                }}
                                getRowClassName={(params) => {
                                    const rowIndex = contracts.findIndex(row => row.id === params.row.id);
                                    if (rowIndex !== -1) {
                                        return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                    }
                                    return '';
                                }}
                                rowHeight={40}
                                columnHeaderHeight={40}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* FIM Details Modal */}
            <Dialog
                open={Boolean(selectedContract)}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%', borderRadius: '10px' } }}
            >
                <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        FIM Details for Contract: {selectedContract?.contractNo}
                    </Typography>
                    <IconButton onClick={handleCloseModal} style={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent style={{ padding: '20px 24px' }}>
                    {/* Summary Cards */}
                    <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                        <Grid item xs={3}>
                            <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: '#e8f0fe', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '14px', color: '#5f6368', fontWeight: 'bold' }}>Total FIM</Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold', color: '#202124' }}>{summary.total}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={3}>
                            <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: '#e6f4ea', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '14px', color: '#1e8e3e', fontWeight: 'bold' }}>P</Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold', color: '#202124' }}>{summary.p}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={3}>
                            <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: '#fef7e0', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '14px', color: '#f29900', fontWeight: 'bold' }}>P/R</Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold', color: '#202124' }}>{summary.pr}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={3}>
                            <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: '#fce8e6', borderRadius: '8px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '14px', color: '#d93025', fontWeight: 'bold' }}>P/R/D</Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold', color: '#202124' }}>{summary.prd}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* FIM Details Table */}
                    <Card style={{ boxShadow: '0 10px 10px 10px rgba(0, 0, 0, 0.2)', borderRadius: '10px', width: '100%' }}>
                        <CardContent>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <DataGrid
                                    rows={fimDetails}
                                    columns={fimColumns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    loading={modalLoading}
                                    disableSelectionOnClick
                                    hideFooterPagination={fimDetails.length <= 5}
                                    style={{ border: 'none' }}
                                    sx={{
                                        overflow: 'auto',
                                        '& .super-app-theme--header': {
                                            WebkitTextStrokeWidth: '0.6px',
                                            backgroundColor: '#93bce6',
                                            color: '#1c1919'
                                        },
                                        '& .MuiDataGrid-cell': {
                                            border: '1px solid #969696',
                                        },
                                        '& .MuiDataGrid-columnHeader': {
                                            border: '1px solid #969696',
                                        },
                                    }}
                                    getRowClassName={(params) => {
                                        const rowIndex = fimDetails.findIndex(row => row.id === params.row.id);
                                        if (rowIndex !== -1) {
                                            return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                        }
                                        return '';
                                    }}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>

            {/* Consolidated Report Modal */}
            <Dialog open={consolidatedModalOpen} onClose={() => setConsolidatedModalOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle style={{ backgroundColor: '#002868', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        Consolidated Contract Report
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownloadConsolidatedCSV}
                            style={{ backgroundColor: '#ffffff', color: '#002868', fontWeight: 'bold' }}
                            size="small"
                        >
                            Download CSV
                        </Button>
                        <IconButton onClick={() => setConsolidatedModalOpen(false)} style={{ color: '#fff' }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                    {/* Summary Cards */}
                    <Grid container spacing={2} sx={{ mb: 2, mt: 0 }}>
                        {Object.entries(consolidatedData.summary).map(([key, val], idx) => {
                            const colors = [
                                { bg: '#e6f4ea', text: '#1e8e3e' }, // Green for P
                                { bg: '#fef7e0', text: '#f29900' }, // Yellow for P/R
                                { bg: '#fce8e6', text: '#d93025' }, // Red for P/R/D
                                { bg: '#e8f0fe', text: '#1a73e8' }  // Blue for others
                            ];
                            let colorTheme;
                            if (key === 'P') colorTheme = colors[0];
                            else if (key === 'P/R') colorTheme = colors[1];
                            else if (key === 'P/R/D') colorTheme = colors[2];
                            else colorTheme = colors[idx % colors.length];

                            return (
                                <Grid item xs={12} sm={4} md={4} key={idx}>
                                    <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: colorTheme.bg, borderRadius: '8px' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '14px', color: colorTheme.text, fontWeight: 'bold' }}>{key}</Typography>
                                            <Typography sx={{ fontSize: '24px', fontWeight: 'bold', color: '#202124' }}>{val}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
                        <CardContent style={{ padding: 0 }}>
                            <Box sx={{ height: '55vh', width: '100%' }}>
                                <DataGrid
                                    rows={consolidatedData.rows}
                                    columns={consolidatedColumns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 20, 50]}
                                    loading={consolidatedLoading}
                                    disableSelectionOnClick
                                    style={{ border: 'none' }}
                                    sx={{
                                        overflow: 'auto',
                                        '& .super-app-theme--header': {
                                            WebkitTextStrokeWidth: '0.6px',
                                            backgroundColor: '#93bce6',
                                            color: '#1c1919'
                                        },
                                        '& .MuiDataGrid-cell': {
                                            border: '1px solid #969696',
                                        },
                                        '& .MuiDataGrid-columnHeader': {
                                            border: '1px solid #969696',
                                        },
                                    }}
                                    getRowClassName={(params) => {
                                        const rowIndex = consolidatedData.rows.findIndex(row => row.id === params.row.id);
                                        if (rowIndex !== -1) {
                                            return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                        }
                                        return '';
                                    }}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>

            <NotificationBar
                handleClose={handleCloseNotification}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    );
};
export default ContractReport;
