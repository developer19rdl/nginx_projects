import React from 'react'
import MstrAssetTools from './MstrAssetTools';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
// import NotificationBar from '../../../notification/ServiceNotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
// import { DepartmentShowdata, FetchAssetTypeSec, FetchAsstTypeAsset, FetchassetData } from '../../../../services/LoginServiceNod';
import { useEffect } from 'react';
import { DepartmentShowdata, FetchAssetTypeSec, FetchAsstTypeAsset, FetchassetData } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';

const MstrAssetList = () => {
    const [rows, setRows] = useState('');
    const [department, setDepartment] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [section, setSection] = useState('');
    const [sectionList, setSectionList] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [assetTypeList, setAssetTypeList] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleCloseNotify = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    useEffect(() => {
        setGridLoading(true)
        DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
    }, [])

    const handleDepartmentshow = (dataObject) => {
        setGridLoading(false);
        setDepartmentList(dataObject?.data);
    }

    const handleDepartmentshowException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const columns = [
        {
            field: 'dname',
            headerClassName: 'super-app-theme--header',
            headerName: 'Department',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'Sname',
            headerName: 'Section',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'MachineName',
            headerClassName: 'super-app-theme--header',
            headerName: 'Machine Name',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'Typename',
            headerClassName: 'super-app-theme--header',
            headerName: 'Asset Type',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'Manufacturer',
            headerName: 'Manufacturer',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'AssetModel',
            headerClassName: 'super-app-theme--header',
            headerName: 'Asset Model',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'PODetails',
            headerName: 'PO Details',
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'InvDetails',
            headerClassName: 'super-app-theme--header',
            headerName: 'Invoice Details',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
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
    ];

    const onDepartmentChange = (e) => {
        setDepartment(e.target.value);
        FetchAssetTypeSec({ id: e.target.value }, handleSectionSuccess, handleSectionException);
    }

    const handleSectionSuccess = (dataObject) => {
        console.log('data Branch');
        setSectionList(dataObject.data);
    }

    const handleSectionException = (errorStaus, errorMessage) => {
        console.log(errorMessage);
    }


    const onAssetTypeChange = (e) => {
        setAssetType(e.target.value)
    }

    const onSectionChange = (e) => {
        setSection(e.target.value);
        FetchAsstTypeAsset({ id: e.target.value }, handleAsseTypeSuccess, handleAsseTypeException);
    }

    const handleAsseTypeSuccess = (dataObject) => {
        console.log('data Branch');
        setAssetTypeList(dataObject.data);
    }

    const handleAsseTypeException = (errorStaus, errorMessage) => {
        console.log(errorMessage);
    }

    const handelviewdata = () => {
        FetchassetData({
            Department: department,
            Section: section,
            AssetType: assetType
        }, handelassetData, hanbdelException);
        console.log("hello")
    }

    const handelassetData = (dataObject) => {
        // console.log('data Branch');
        setRows(dataObject.data);

    }

    const hanbdelException = (errorStaus, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        ClearData();
    }

    const ClearData = () => {
        setDepartment('');
        setSection('');
        setAssetType('');
        // setRefreshData(oldValue => !oldValue);
    }


    return (
        <div style={{ height: 400, width: '100%' }}>
            <MstrAssetTools />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                    <FormControl fullWidth >
                        <InputLabel id="demo-simple-select-label">Select Department</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select Department"
                            placeholder='Select Department'
                            required
                            value={department}
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
                <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Select Section</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select Section"
                            placeholder='Select Section'
                            requiredvalue={section}
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

                <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Select Asset Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select Asset Type"
                            placeholder='Select Asset Type'
                            requiredvalue={assetType}
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
                <Grid item style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button variant="contained"
                        style={{ background: '#051622', color: 'white' }}
                        onClick={handelviewdata}>View</Button>
                </Grid>
            </Grid>
            <Grid style={{ marginTop: '20px' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    style={{ backgroundColor: '#ffffff' }}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            color: '#000000', // Header text color
                            fontWeight: 'bold', // Header font weight
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold', // Ensures the header font weight is bold
                        },
                    }}

                    pageSize={10}
                    rowsPerPageOptions={[20]}
                    disableSelectionOnClick
                    loading={isLoading}
                />
            </Grid>
            <NotificationBar
                handleClose={handleCloseNotify}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type} />

        </div>
    )
}

export default MstrAssetList
