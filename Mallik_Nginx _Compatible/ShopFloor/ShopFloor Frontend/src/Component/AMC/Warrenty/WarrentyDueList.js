import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Warrentyview } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Utility/NotificationBar';
// import NotificationBar from '../../notification/ServiceNotificationBar';
// import { Warrentyview } from '../../../services/LoginServiceNod';


const WarrentyDueList = ({ setwCount, rows, setRows }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [Rows, SetRows] = useState([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    const columns = [
        {
            field: 'Vendor',
            headerClassName: 'super-app-theme--header',
            headerName: 'Department',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },

        {
            field: 'Mname',
            headerName: 'Machine',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'WarStartDate',
            headerName: 'Warranty Start Date',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'WarEndDate',
            headerName: 'Warranty End Date',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        // {
        //     field: 'actions',
        //     type: 'actions',
        //     headerName: 'Actions',
        //     headerClassName: 'super-app-theme--header',
        //     width: 250,
        //     cellClassName: 'actions',
        //     disableClickEventBubbling: true,
        //     getActions: (params) => [
        //         <EditData selectedRow={params.row} />,
        //         <DeleteData selectedRow={params.row} />,

        //     ],
        // },
    ];

    // function EditData(props) {
    //     return (
    //         <Tooltip title="Edit">
    //             <EditIcon style={{ cursor: 'pointer' }}
    //                 onClick={(event) => {
    //                     event.stopPropagation();
    //                     setIsAddButton(false);
    //                     setEditVendor(props.selectedRow);
    //                     setOpen(true);
    //                 }}
    //             />
    //         </Tooltip>
    //     );
    // }

    // function DeleteData(props) {
    //     return (
    //         <Tooltip title="Delete">
    //             <DeleteIcon style={{ color: '#012738', cursor: 'pointer' }}
    //                 onClick={() => {
    //                     setDeleteId(props.selectedRow.id);
    //                     console.log(props.selectedRow.id);
    //                     setDeleteDailogOpen(true);
    //                 }} />
    //         </Tooltip>
    //     );
    // }

    useEffect(() => {
        Warrentyview({ fromDate, toDate }, handleDepartmentshow3, handleDepartmentshowException3);
    }, [])


    const handleDepartmentshow3 = (dataObject) => {
        SetRows(dataObject?.data);

    }

    const handleDepartmentshowException3 = (error, errorMessage) => {
        console.log(errorMessage);
    }


    // const onDepartmentChange = (e) => {
    //     setDepartment(e.target.value);
    //     FetchAssetTypeSec({ id: e.target.value }, handleSectionSuccess, handleSectionException);
    // }

    // const handleSectionSuccess = (dataObject) => {
    //     setSectionList(dataObject?.data);
    //     console.log(dataObject?.data);
    // }

    // const handleSectionException = (error, errorMessage) => {
    //     console.log(errorMessage);
    // }

    // const onSectionChange = (e) => {
    //     setSection(e.target.value);
    //     FetchAsstTypeAsset({ id: e.target.value }, handleAsseTypeSuccess, handleAsseTypeException);
    // }

    // const handleAsseTypeSuccess = (dataObject) => {
    //     setAssetTypeList(dataObject?.data);
    //     console.log(dataObject?.data);
    // }

    // const handleAsseTypeException = (error, errorMessage) => {
    //     console.log(errorMessage);
    // }

    // const onAssetTypeChange = (e) => {
    //     setAssetType(e.target.value);
    //     FetchAsstNameAsset({ id: e.target.value }, handleAsstNameSuccess, handleAsstNameException);
    // }

    // const handleAsstNameSuccess = (dataObject) => {
    //     setAssetNameList(dataObject?.data);
    //     console.log(dataObject?.data);
    // }

    // const handleAsstNameException = (error, errorMessage) => {
    //     console.log(errorMessage);
    // }



    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };



    const handelviewdata = () => {
        Warrentyview({ fromDate, toDate }, handleDepartmentshow2, handleDepartmentshowException2);
    }

    // const handleDepartmentshow = (dataObject) => {
    //     const data = dataObject.data || [];
    //     setRows(dataObject?.data);
    //     const count = data.length; // Count the data
    //     console.log("length==", count); // Log the count here
    //     setwCount(count); // Set the count state if needed elsewhere in the component
    //     // console.log(dataObject?.data);
    // }

    // const handleDepartmentshowException = (error, errorMessage) => {
    //     console.log(errorMessage);
    // }

    const handleDepartmentshow2 = (dataObject) => {
        setRows(dataObject?.data);

    }

    const handleDepartmentshowException2 = (error, errorMessage) => {
        console.log(errorMessage);
    }



    return (
        <div style={{ marginLeft: '10px', marginRight: '10px' }}>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
                <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                    <TextField
                        fullWidth
                        label="From Date "
                        placeholder='From Date'
                        variant="outlined"
                        required
                        type='date'
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        InputLabelProps={
                            {
                                shrink: true
                            }
                        } />
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                    <TextField
                        fullWidth
                        label="To Date "
                        placeholder='To Date'
                        variant="outlined"
                        required
                        type='date'
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        InputLabelProps={
                            {
                                shrink: true
                            }
                        } />
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button variant="contained"
                        style={{ width: '130px', background: '#051622', color: 'white' }}
                        onClick={handelviewdata}>View</Button>

                </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                <Grid item xs={12} md={12} style={{ height: 250, width: '100%' }}>
                    <Typography
                        variant="h6"
                        component="h2"
                        align="left"
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            backgroundColor: '#f8f8ff',
                            padding: '15px',
                            border: '1px solid #e0e0e0',
                             color: '#000000', fontWeight: 'bold'
                        }}>
                        VIEW WARRANTY
                    </Typography>
                    <DataGrid
                                rows={Array.isArray(rows) && rows.length > 0 ? rows : Rows}
                                columns={columns}
                                pageSize={8}
                                rowsPerPageOptions={[8]}
                                disableSelectionOnClick
                                getRowId={(row) => row.id ?? row.AMC_ID}
                                sx={{
                                    height: '480px',
                                    width: '100%',
                                    backgroundColor: '#ffffff',
                                    '& .super-app-theme--header': {
                                        WebkitTextStrokeWidth: '0.6px',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        color: '#000000',
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 'bold',
                                    },
                                }}
                            />

                </Grid>
                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />

            </Grid>

        </div>
    )
}

export default WarrentyDueList

