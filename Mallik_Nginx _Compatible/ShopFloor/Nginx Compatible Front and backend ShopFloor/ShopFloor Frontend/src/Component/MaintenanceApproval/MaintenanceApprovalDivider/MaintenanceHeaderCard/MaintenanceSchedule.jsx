import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Toolbar, Tooltip, useMediaQuery } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import SearchIcon from '@mui/icons-material/Search';
// import { MaintenanceAprovalshow } from '../../../services/LoginServiceNod';
import { useEffect } from 'react';
// import { PendingView } from '../MaintenanceStatus/PendingView';
import { MaintenanceAprovalshow } from '../../../../Services/NodeJsApiServices';
import { PendingView } from '../../PendingView';

const MaintenanceSchedule = ({ count, setCount }) => {
    const [open, setOpen] = useState(false);
    const [rowid, setRowid] = useState([]);
    const [rowdata, setrowdata] = useState(false);

    const [refresh,setRefresh] =useState(false);
    


    const columns = [
        {
            field: 'assetName',
            headerClassName: 'super-app-theme--header',
            headerName: 'Machine Name',
            minWidth: 130, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'Maintype',
            headerClassName: 'super-app-theme--header',
            headerName: 'Maintenance Type',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'AffectedMachine',
            headerClassName: 'super-app-theme--header',
            headerName: 'Affected Machine',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'Severity',
            headerClassName: 'super-app-theme--header',
            headerName: 'Severity',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'ProblemNote',
            headerClassName: 'super-app-theme--header',
            headerName: 'Problem Note',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'fromdate',
            headerClassName: 'super-app-theme--header',
            headerName: 'Scheduled Date',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'fromtime',
            headerClassName: 'super-app-theme--header',
            headerName: 'Scheduled Time',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'WarrantyStatus',
            headerClassName: 'super-app-theme--header',
            headerName: 'Warranty Status',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'AMCStatus',
            headerClassName: 'super-app-theme--header',
            headerName: 'Amc Status',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Action',
            flex: 1,

            getActions: (params) => [
                <ViewTable selectedRow={params.row} />,
            ],
        },
    ];

    function ViewTable({ selectedRow }) {
        return (
            <Tooltip title="Edit Data">
                <RemoveRedEyeIcon onClick={(event) => {
                    event.stopPropagation();
                    setrowdata(selectedRow)
                    setRowid(selectedRow.id)
                    setOpen(true);
                }} />
            </Tooltip>
        )
    }


    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));
    const [row1, setrow1] = useState([])

    useEffect(() => {
        MaintenanceAprovalshow(handelMaintenanceAprovalshow, MaintenanceAprovalshowException)
        console.log("count==", count)
    }, [refresh]);

    const handelMaintenanceAprovalshow = (dataObject) => {
        const data = dataObject.data || [];
        setrow1(data);
        const count = data.length; // Count the data
        console.log("length==", count); // Log the count here
        setCount(count); // Set the count state if needed elsewhere in the component
    };

    const MaintenanceAprovalshowException = () => {

    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '10px', marginTop: '15px' }}>
                <Typography
                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                    variant="h5">
                    Maintenance Approval
                </Typography>
            </div>
            <Grid conatiner spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginTop={1}>
                    <Card style={{ boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)', borderRadius: '10px', width: '100%', height: '100%' }}>
                        <CardContent>
                            {/* <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end',marginBottom:'5px' }}>
                               <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                                <TextField
                                    fullWidth
                                    label="Search"
                                    placeholder='Search'
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                </Grid>
                                 </div> */}

                            <DataGrid
                                rows={row1}
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
                                checkboxSelection
                                disableRowSelectionOnClick
                            />
                            {open && (
                                <PendingView
                                    open={open}
                                    setOpen={setOpen}
                                    rowid={rowid}
                                    setRowid={setRowid}
                                    rowdata={rowdata}
                                    setrowdata={setrowdata}
                                    setRefresh={setRefresh}
                                />
                            )}
                        </CardContent>
                    </Card>


                </Grid>
            </Grid>
        </div>
    )
}
export default MaintenanceSchedule;
