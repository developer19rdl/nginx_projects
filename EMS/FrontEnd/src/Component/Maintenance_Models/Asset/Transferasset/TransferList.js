import { Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select } from '@mui/material';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { AssetTransferData, DepartmentShowdata, FetchAssetTypeSec, FetchAsstNameAsset, FetchAsstTypeAsset } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar'
// import { AssetTransferData, DepartmentShowdata, FetchAssetTypeSec, FetchAsstNameAsset, FetchAsstTypeAsset } from '../../../../services/LoginServiceNod';

const TransferList = () => {
    const [department, setDepartment] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [section, setSection] = useState('');
    const [sectionList, setSectionList] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [assetTypeList, setAssetTypeList] = useState([]);
    const [assetName, setAssetName] = useState('');
    const [assetNameList, setAssetNameList] = useState([]);
    const [departmentTo, setDepartmentTo] = useState('');
    const [departmentToList, setDepartmentToList] = useState([]);
    const [sectionTo, setSectionTo] = useState('');
    const [sectionToList, setSectionToList] = useState([]);
    const [assetTypeTo, setAssetTypeTo] = useState('');
    const [assetTypeToList, setAssetTypeToList] = useState([]);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
        DepartmentShowdata(handleDepartmentToshow, handleDepartmentToshowException);
    }, [])

    const handleDepartmentshow = (dataObject) => {
        setDepartmentList(dataObject?.data);

        console.log(dataObject?.data);
    }

    const handleDepartmentshowException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const handleDepartmentToshow = (dataObject) => {
        setDepartmentToList(dataObject?.data);
        console.log(dataObject?.data);
    }

    const handleDepartmentToshowException = (error, errorMessage) => {
        console.log(errorMessage);
    }


    const onDepartmentChange = (e) => {
        setDepartment(e.target.value);
        FetchAssetTypeSec({ id: e.target.value }, handleSectionSuccess, handleSectionException);
    }

    const handleSectionSuccess = (dataObject) => {
        setSectionList(dataObject?.data);
        console.log(dataObject?.data);
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
        console.log(dataObject?.data);
    }

    const handleAsseTypeException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onAssetTypeChange = (e) => {
        setAssetType(e.target.value);
        FetchAsstNameAsset({ id: e.target.value }, handleAsstNameSuccess, handleAsstNameException);
    }

    const handleAsstNameSuccess = (dataObject) => {
        setAssetNameList(dataObject?.data);
        console.log(dataObject?.data);
    }

    const handleAsstNameException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onAssetNameChange = (e) => {
        setAssetName(e.target.value);
    }

    const onDepartmentToChange = (e) => {
        setDepartmentTo(e.target.value);
        FetchAssetTypeSec({ id: e.target.value }, handleSectionToSuccess, handleSectionToException);
    }

    const handleSectionToSuccess = (dataObject) => {
        setSectionToList(dataObject?.data);
        console.log(dataObject?.data);
    }

    const handleSectionToException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onSectionToChange = (e) => {
        setSectionTo(e.target.value);
        FetchAsstTypeAsset({ id: e.target.value }, handleAsseTypeToSuccess, handleAsseTypeToException);
    }

    const handleAsseTypeToException = (error, errorMessage) => {
        console.log(errorMessage);
    }


    const handleAsseTypeToSuccess = (dataObject) => {
        setAssetTypeToList(dataObject?.data);
        console.log(dataObject?.data);
    }


    const onAssetTypeToChange = (e) => {
        setAssetTypeTo(e.target.value);
    }

    const onTransferMove = () => {
        AssetTransferData({
            oldDepartment: department,
            oldSection: section,
            oldAssetType: assetType,
            oldAssetName: assetName,
            newDepartment: departmentTo,
            newSection: sectionTo,
            newAssetType: assetTypeTo,
        }, handleAssetTransferReport, handleAssetTransferReportException)
    }

    const handleAssetTransferReport = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
            clearForm();
        }, 2000);
    }

    const handleAssetTransferReportException = (errorStaus, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }

    const clearForm = () => {
        setDepartment('');
        setSection('');
        setAssetType('');
        setAssetName('');
        setDepartmentTo('');
        setSectionTo('');
        setAssetTypeTo('');
        // setRefreshData(oldValue => !oldValue);
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
            <Grid container spacing={2} style={{ marginTop: '5px' }}>
                <Grid item xs={12} sm={12} md={6} lg={6} lx={6} >
                    <Paper elevation={3} style={{ height: '430px' }}>
                        {/* <h1 style={{ marginTop: '15px', marginBottom: '10px', textAlign: 'center', fontSize: '25px' }}>From</h1>
                        <hr /> */}
                        <Grid container
                            direction="row-reverse"
                            justifyContent="center"
                            alignItems="center" spacing={2} style={{ marginTop: '5px' }}>
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <h1 style={{ marginTop: '15px', marginBottom: '10px', textAlign: 'center', fontSize: '25px' }}>From</h1>
                                <hr />
                            </Grid>
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
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
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
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
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Asset Type"
                                        placeholder='Asset Type'
                                        value={assetType}
                                        required
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
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Asset Name</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Asset Name"
                                        placeholder='Asset Name'
                                        value={assetName}
                                        required
                                        onChange={(e) => onAssetNameChange(e)}>
                                        {
                                            assetNameList.length !== 0 ? (

                                                <MenuItem value="" key={0}>
                                                    <em>Select Asset Name</em>
                                                </MenuItem>
                                            )
                                                :
                                                (<MenuItem value="" key={0}>
                                                    <em>Select Asset Type </em>
                                                </MenuItem>
                                                )}
                                        {
                                            assetNameList?.map((data, index) => {
                                                return (
                                                    <MenuItem value={data.id} key={index}>{data.MachineName}</MenuItem>
                                                )
                                            })

                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} lx={12} style={{ marginBottom: '10px', marginRight: '5px' }}>
                                {/* <Button  variant="contained" style={{float:'right'}}>Move</Button> */}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} lx={6}>
                    <Paper elevation={3} style={{ height: '430px' }}>
                        {/* <h1 style={{ marginTop: '15px', marginBottom: '10px', textAlign: 'center', fontSize: '25px' }}>To</h1>
                        <hr /> */}
                        <Grid container
                            direction="row-reverse"
                            justifyContent="center"
                            alignItems="center" spacing={2} style={{ marginTop: '5px', marginBottom: '10px' }}>
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <h1 style={{ marginTop: '15px', marginBottom: '10px', textAlign: 'center', fontSize: '25px' }}>To</h1>
                                <hr />
                            </Grid>
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Department</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Department"
                                        placeholder='Department'
                                        value={departmentTo}
                                        required
                                        onChange={(e) => onDepartmentToChange(e)}>
                                        {
                                            departmentToList?.map((data, index) => {
                                                return (
                                                    <MenuItem value={data.id} key={index}>{data.departmentName}</MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Section</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Section"
                                        placeholder='Section'
                                        value={sectionTo}
                                        required
                                        onChange={(e) => onSectionToChange(e)}>
                                        {
                                            sectionToList.length !== 0 ? (

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
                                            sectionToList?.map((data, index) => {
                                                return (
                                                    <MenuItem value={data.id} key={index}>{data.Section}</MenuItem>
                                                )
                                            })

                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={11} md={11} lg={11} xl={11}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Asset Type"
                                        placeholder='Asset Type'
                                        value={assetTypeTo}
                                        required
                                        onChange={(e) => onAssetTypeToChange(e)}>
                                        {
                                            assetTypeToList.length !== 0 ? (

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
                                            assetTypeToList?.map((data, index) => {
                                                return (
                                                    <MenuItem value={data.id} key={index}>{data.AssetTypeView}</MenuItem>
                                                )
                                            })

                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid
                                item
                                xs={12} sm={12} md={12} lg={12} xl={12}
                                style={{
                                    // marginBottom: '10px',
                                    marginRight: '37px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end' // Change this to flex-end to align items to the right
                                }}
                            >
                                <Button
                                    variant="contained"
                                    style={{ background: '#051622', color: 'white' }} // No need for float: right
                                    onClick={onTransferMove}
                                >
                                    Move
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    )
}

export default TransferList
