import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import React from 'react'
import { useState } from 'react';
// import { CertificateDueView, DepartmentShowdata, FetchAssetTypeSec, FetchAsstNameAsset, FetchAsstTypeAsset, ServiceDueView } from '../../../../services/LoginServiceNod';
import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { CertificateDueView, DepartmentShowdata, FetchAssetTypeSec, FetchAsstNameAsset, FetchAsstTypeAsset } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Utility/NotificationBar';
// import NotificationBar from '../../../notification/ServiceNotificationBar';
// import { CertificateDueView, DepartmentShowdata, FetchAssetTypeSec, FetchAsstNameAsset, FetchAsstTypeAsset, ServiceDueView } from '../../../services/LoginServiceNod';
// import NotificationBar from '../../notification/ServiceNotificationBar';

const CertificateDue = ({ setcertCount } = {}) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [department, setDepartment] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [section, setSection] = useState('');
    const [sectionList, setSectionList] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [assetTypeList, setAssetTypeList] = useState([]);
    const [rows, setRows] = useState([]);
    const [Crows, setCRows] = useState(null);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const columns = [
        {
            field: 'VendorName',
            headerClassName: 'super-app-theme--header',
            headerName: 'Name',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },

        {
            field: 'Mname',
            headerName: 'Asset Name',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'ExpDate',
            headerName: 'Service Due Date',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
    
    ];

    useEffect(() => {
        const fetchData = async () => {
          try {
            await DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException)
            await CertificateDueView({
            fromDate: fromDate,
            toDate: toDate,
            Department: department,
            Section: section,
            AssetType: assetType,
        }, handleServiceDueView2, handleServiceDueViewException2)
    } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);



    const handleServiceDueView2 = (dataObject) => {
        const data = dataObject.data || [];
        setRows(data);
        setcertCount && setcertCount(data.length);
    }

    const handleServiceDueViewException2 = (errorStaus, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }


    const handleDepartmentshow = (dataObject) => {
        setDepartmentList(dataObject?.data);

    }

    const handleDepartmentshowException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onDepartmentChange = (e) => {
        setDepartment(e.target.value);
        FetchAssetTypeSec({ id: e.target.value }, handleSectionSuccess, handleSectionException);
    }

    const handleSectionSuccess = (dataObject) => {
        setSectionList(dataObject?.data);

    }

    const handleSectionException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onSectionChange = (e) => {
        setSection(e.target.value);
        FetchAsstTypeAsset({ id: e.target.value }, handleAsseTypeSuccess, handleAsseTypeException);
    }

    const handleAsseTypeSuccess = (dataObject) => {
        setAssetTypeList(dataObject?.data);

    }

    const handleAsseTypeException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onAssetTypeChange = (e) => {
        setAssetType(e.target.value);
        FetchAsstNameAsset({ id: e.target.value }, handleAsstNameSuccess, handleAsstNameException);
    }

    const handleAsstNameSuccess = (dataObject) => {
        // setAssetNameList(dataObject?.data);

    }

    const handleAsstNameException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onServiceDueReport = () => {
        CertificateDueView({
            fromDate: fromDate,
            toDate: toDate,
            Department: department,
            Section: section,
            AssetType: assetType,
        }, handleServiceDueView, handleServiceDueViewException)
    }

    const handleServiceDueView = (dataObject) => {
        const data = dataObject.data || [];
        setCRows(data);
        setcertCount && setcertCount(data.length);
    }

    const handleServiceDueViewException = (errorStaus, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };


    return (
        <div>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
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
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
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
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Department</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Department"
                            placeholder='Department'
                            value={department}
                            required
                            onChange={(e) => onDepartmentChange(e)}>
                            {
                                departmentList?.map((data, index) => {
                                    return (
                                        <MenuItem value={data.id} key={index}>{data.departmentName}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Section</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Section"
                            placeholder='Section'
                            value={section}
                            required
                            onChange={(e) => onSectionChange(e)}>
                            {
                                sectionList.length !== 0 ? (

                                    <MenuItem value="" key={0}>
                                        <em>Select Section</em>
                                    </MenuItem>
                                )
                                    :
                                    (<MenuItem value="" key={0}>
                                        <em>Select Department </em>
                                    </MenuItem>
                                    )}
                            {
                                sectionList?.map((data, index) => {
                                    return (
                                        <MenuItem value={data.id} key={index}>{data.Section}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Asset Type"
                            placeholder='Asset Type'
                            value={assetType}
                            onChange={(e) => onAssetTypeChange(e)}>
                            {
                                assetTypeList.length !== 0 ? (

                                    <MenuItem value="" key={0}>
                                        <em>Select Asset Type</em>
                                    </MenuItem>
                                )
                                    :
                                    (<MenuItem value="" key={0}>
                                        <em>Select Section </em>
                                    </MenuItem>
                                    )}
                            {
                                assetTypeList?.map((data, index) => {
                                    return (
                                        <MenuItem value={data.id} key={index}>{data.AssetTypeView}</MenuItem>
                                    )
                                })

                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Button variant="contained"
                        style={{ width: '130px', background: '#051622', color: 'white' }}
                        onClick={onServiceDueReport}>View</Button>

                </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '18px' }}>
                <Grid item xs={12} md={12} style={{ height: 300, width: '100%' }}>
                    <Typography
                        variant="h5"
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
                        INSPECTION  DUE DATES
                    </Typography>
                    {
                        <DataGrid
                                rows={Array.isArray(Crows) && Crows.length > 0 ? Crows : rows}
                                columns={columns}
                                pageSize={8}
                                rowsPerPageOptions={[8]}
                                disableSelectionOnClick
                                getRowId={(row) => row.id ?? row.AMC_ID ?? row.ServiceId}
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                        color: '#000000',
                                        fontWeight: 'bold',
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 'bold',
                                    },
                                }}
                            />
                    }

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

export default CertificateDue
