import React, { useState } from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import { MachineBreakDownTrend } from '../../Services/NodeJsApiServices';
import { DownloadMachineBreakDownTrendXl } from '../../Services/DownloadCsvReportsService';

const MachineBreakdownTrend = () => {

    const [row2, setrow2] = useState([])

    const [selectFromDate, setSelectFromDate] = useState('');
    const [selectedTodate, setSelectedTodate] = useState('');

    const [dOpen, setDopen] = useState(false);

    const columns = [
        {
            field: 'id',
            headerClassName: 'super-app-theme--header',
            headerName: 'SLNO',
            minWidth: 50, align: 'center', headerAlign: 'center'
        },
        {
            field: 'MaintenanceCompletedAt',
            headerClassName: 'super-app-theme--header',
            headerName: 'Date',
            minWidth: 80, align: 'center', headerAlign: 'center'
        },
        {
            field: 'MachineTag',
            headerClassName: 'super-app-theme--header',
            headerName: 'M/C Code',
            minWidth: 70, headerAlign: 'center'
        },
        {
            field: 'MachineName',
            headerClassName: 'super-app-theme--header',
            headerName: 'Machine Name',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'ProblemNote',
            headerClassName: 'super-app-theme--header',
            headerName: 'BREAKDOWN DETAILS',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'correction',
            headerClassName: 'super-app-theme--header',
            headerName: 'IMMEDIATE ACTION TAKEN',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'DateTimeOfFailure',
            headerClassName: 'super-app-theme--header',
            headerName: 'TIME OF FAILURE',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'DateTimeOfCompletion',
            headerClassName: 'super-app-theme--header',
            headerName: 'TIME OF COMPLETION',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },

        {
            field: 'DurationOfBreakdownInMins',
            headerClassName: 'super-app-theme--header',
            headerName: 'DURATION OF BREAK DOWN (In Hrs)',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'cause',
            headerClassName: 'super-app-theme--header',
            headerName: 'CAUSE',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'correctiveAction',
            headerClassName: 'super-app-theme--header',
            headerName: 'CORRECTIVE ACTION',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'attendedBy',
            headerClassName: 'super-app-theme--header',
            headerName: 'ATTENDED BY',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
    ];



    const handleSubmit = (e) => {
        e.preventDefault();
        MachineBreakDownTrend({

            fromDate: selectFromDate,
            toDate: selectedTodate,
        }, handelMachineBreakDownTrend, MachineBreakDownTrendException)
    };




    const handelMachineBreakDownTrend = (dataObject) => {
        setrow2(dataObject.data || [])
        setDopen(true)
    }

    const MachineBreakDownTrendException = () => {
    }

    const handleDownload = () => {
        DownloadMachineBreakDownTrendXl({
            fromDate: selectFromDate,
            toDate: selectedTodate,
        }, handelMachineBreakSuccess, MachineBreakDownTrendExlException);  // Success and Error callbacks are not needed for just download
    };


    const handelMachineBreakSuccess = () => { };
    const MachineBreakDownTrendExlException = () => { };


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '10px', marginTop: '10px' }}>
                <Typography
                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold', color: '#000000' }}
                    variant="h5">
                    Breakdown Maintenance Record
                </Typography>
            </div>

            <div className="operator_bottomContainer">
                <div className="operator_bottm_date_containet">
                    <Grid container spacing={5} paddingLeft={'10px'} paddingRight={'10px'}>
                        <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                id="outlined-basic"
                                label=" From Date"
                                type="date"
                                variant="outlined"
                                value={selectFromDate}
                                onChange={(e) => setSelectFromDate(e.target.value)}
                                InputLabelProps={
                                    {
                                        shrink: true
                                    }
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                id="outlined-basic"
                                label=" To Date"
                                type="date"
                                variant="outlined"
                                value={selectedTodate}
                                onChange={(e) => setSelectedTodate(e.target.value)}
                                InputLabelProps={
                                    {
                                        shrink: true
                                    }
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={1.4} lg={1.4} xl={1.4} display={'flex'} alignItems={'center'} >
                            <div className="operator_button_container" >
                                <Button variant="contained" size="small"
                                    sx={{
                                        backgroundColor: 'black',

                                    }}
                                    onClick={handleSubmit} >Search</Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </div>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginTop={2}>
                    <Card style={{ boxShadow: '0 1px 1px 1px rgba(0, 0, 0, 0.2)', borderRadius: '10px', width: '100%', height: '100%' }}>
                        {/* <CardContent>
                            <DataGrid
                                rows={row2}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                        color: '#000000', // Header text color
                                        fontWeight: 'bold', // Header font weight
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 'bold', // Ensures the header font weight is bold
                                    },
                                }}
                                pageSizeOptions={[5]}

                                disableRowSelectionOnClick
                            />
                        </CardContent> */}
                        <CardContent style={{ overflowX: 'auto' }}>
                            <DataGrid
                                rows={row2}
                                columns={columns}
                                autoHeight
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                        color: '#000000',
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    },
                                }}
                                pageSizeOptions={[5]}
                                disableRowSelectionOnClick
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {dOpen &&
                <Grid container spacing={2} mt={2} justifyContent={"center"}>
                    <Grid item>
                        <Button onClick={handleDownload} variant="contained">Download CSV</Button>
                    </Grid>
                </Grid>}
        </div>

    )
}
export default MachineBreakdownTrend;
