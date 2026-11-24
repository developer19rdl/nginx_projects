import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { useState } from 'react';
import { AmcAdd, AmcUpdate, DepartmentShowdata, FetchAssetTypeSec, FetchAsstNameAsset, FetchAsstTypeAsset, VendorShowdata } from '../../../../services/LoginServiceNod';
import { useEffect } from 'react';

const AmcServiceModel = ({ open, setOpen, isAddButton, editAmcService, setNotification, setRefreshData }) => {
    const [vendor, setVendor] = useState('');
    const [vendorList, setVendorList] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [amcDoc, setAmcDoc] = useState('');
    const [servicePattern, setServicePattern] = useState('');
    const [servicePatternList, setServicePatternList] = useState([]);
    const [department, setDepartment] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [section, setSection] = useState('');
    const [sectionList, setSectionList] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [assetTypeList, setAssetTypeList] = useState([]);
    const [assetName, setAssetName] = useState('');
    const [assetNameList, setAssetNameList] = useState([]);

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        VendorShowdata(handleVendorshow, handleVendorshowException);
        DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
        console.log("editAmcService==", editAmcService)
        setVendor(editAmcService?.vendor || '');
        setFromDate(editAmcService?.PeriodFrom || '');
        setToDate(editAmcService?.PeriodTo || '');
        setServicePattern(editAmcService?.ServicePattern || '');
        setDepartment(editAmcService?.Department || '');
        setSection(editAmcService?.Section || '');
        setAssetType(editAmcService?.AssetType || '');
        setAssetName(editAmcService?.AssetName || '');

    }, [editAmcService])

    const handleVendorshow = (dataObject) => {
        setVendorList(dataObject?.data);
        console.log("vendoerlist==", dataObject?.data)
    }


    const handleVendorshowException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onVendorChange = (e) => {
        setVendor(e.target.value);
    }

    const handleDepartmentshow = (dataObject) => {
        setDepartmentList(dataObject?.data);
        console.log(dataObject?.data);
        if(editAmcService?.Department)
        {
            FetchAssetTypeSec({id:editAmcService?.Department}, handleSectionSuccess, handleSectionException)
        }
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
        console.log(dataObject?.data);
        if(editAmcService?.Section)
        {
            FetchAsstTypeAsset({id:editAmcService?.Section}, handleAsseTypeSuccess, handleAsseTypeException);
        }
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
        if(editAmcService?.AssetType)
        {
            FetchAsstNameAsset({id:editAmcService?.AssetType}, handleAsstNameSuccess, handleAsstNameException);
        }
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

    const onServicePatternChange = (e) => {
        setServicePattern(e.target.value);
    }

    const ClearData = () => {
        setVendor("")
        setFromDate("")
        setToDate("")
        setServicePattern("")
        setDepartment("")
        setSection("")
        setAssetType("")
        setAssetName("")

    }

    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
            (
                AmcAdd({
                    vendor: vendor,
                    PeriodFrom: fromDate,
                    PeriodTo: toDate,
                    ServicePattern: servicePattern,
                    Department: department,
                    Section: section,
                    AssetType: assetType,
                    AssetName: assetName,
                }, handleSuccess, handleException)
            ) : (
                AmcUpdate({
                    id: editAmcService.id,
                    vendor: vendor,
                    PeriodFrom: fromDate,
                    PeriodTo: toDate,
                    ServicePattern: servicePattern,
                    Department: department,
                    Section: section,
                    AssetType: assetType,
                    AssetName: assetName,
                }, handleSuccess, handleException)
            );
    }


    const handleSuccess = (dataObject) => {
        console.log(dataObject);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            setOpen(false);
        }, 2000);

        setRefreshData(oldValue => !oldValue);
        ClearData();
    }

    const handleException = (errorObject, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        ClearData();
    }

    console.log("sectionsectionsection",section)

    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle style={{background:'#051622',color:'white'}}>
                        {isAddButton === true ? 'Add ' : 'Update '}Service Details
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '20px' }}>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Vendor Name</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Vendor Name"
                                        placeholder='Vendor Name'
                                        value={vendor}
                                        required
                                        onChange={(e) => onVendorChange(e)}>
                                        {
                                            vendorList?.map((data, index) => {
                                                return (
                                                    <MenuItem value={data.id} key={index}>{data.VendorName}</MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                <TextField
                                    fullWidth
                                    label="Period From Date"
                                    placeholder='Period From Date'
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
                                    label="To Date"
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
                            {}
                            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Service Pattern</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Service Pattern"
                                        placeholder='Service Pattern'
                                        value={servicePattern}
                                        onChange={(e) => onServicePatternChange(e)}>
                                        <MenuItem value={"Service 1"}>Service 1</MenuItem>
                                        <MenuItem value={"Service 2"}>Service 2</MenuItem>
                                        <MenuItem value={"Service 3"}>Service 3</MenuItem>
                                        <MenuItem value={"Service 4"}>Service 4</MenuItem>
                                        <MenuItem value={"Service 5"}>Service 5</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
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
                                                    <MenuItem value={data.id} key={index}>{data.Department}</MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
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
                            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
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
                            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Asset Name</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Asset Name"
                                        placeholder='Asset Name'
                                        value={assetName}
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
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button 
                        type="submit"
                        variant="contained"
                        style={{ width: '130px', background: '#051622', color: 'white' }}
                        >
                        {isAddButton ? "Add" : "Update"}
                        </Button>
                        <Button 
                        onClick={handleClose}
                        variant="contained"
                        style={{ width: '150px', background: '#051622', color: 'white' }}
                        >
                        Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default AmcServiceModel
