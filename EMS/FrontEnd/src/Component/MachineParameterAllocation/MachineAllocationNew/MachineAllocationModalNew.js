import React, { useEffect, useState } from 'react';
import {
    Button, Grid, DialogActions, Checkbox, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';

import { MeterAddService, MeterEditService, FetchDeviceListService, getMachinesList, getCategory, getDeviceList, getTagList, mapMachineAllocation, MachineAllocationUpdate } from '../../../Services/LoginPageService.js'
import NotificationBar from '../../Notification/NotificationBar.js'
import { EdgeDeviceName, MachineAllocationAdd, MachineAllocationViewedit, MachineDeviceCategoryView, TagName, allocMachinesList, slaveId as fetchSlaveIdList } from '../../../Services/NodeJsApiServices.js';

function MachineAllocationModalNew(props) {
    const { open, setOpen, isAddButton, setRefreshData, editData } = props;
    const [machineList, setMachineList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [deviceList, setDeviceList] = useState([]);
    const [tagList, setTagList] = useState([]);
    const [tagId, setTagId] = useState('');
    const [tagName, setTagName] = useState('')
    const [functionId, setFunctionId] = useState('')
    const [functionName, setFunctionName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [machineId, setMachineId] = useState('');
    const [deviceCategoryId, setDeviceCategoryId] = useState('');
    const [isProdCapacity, setIsProdCapacity] = useState(false);
    const [id, setId] = useState('');
    const [slaveId, setSlaveId] = useState('');
    const [slaveIdList, setSlaveIdList] = useState([]);
    // const [tagLabel, setTagLabel] = useState('');
    const [selectedChart, setSelectedChart] = useState('')
    const [tagDescription, setTagDescription] = useState('');

    const [deviceCategoryList, setDeviceCategoryList] = useState([]);
    // const [deviceList, setDeviceList] = useState([]);

    const [rowId, setRowId] = useState('')
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [errorObject, setErrorObject] = useState({});
    const [sensorHistory, setSensorHistory] = useState(false);
    const [defaultChart, setDefaultChart] = useState(false);

    useEffect(() => {
        setOpen(open);
        loadData();
        open && allocMachinesList(handleMachineListSuccess, handleMachineListException);
        open && MachineDeviceCategoryView(handleCategorySuccess, handleCategoryException);
    }, [editData]);

    // MACHINE LIST HANDLER
    const handleMachineListSuccess = (dataObject) => {
        setMachineList(dataObject.data);
    };
    const handleMachineListException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    //CATEGORY HANDLER
    const handleCategorySuccess = (dataObject) => {
        setCategoryList(dataObject.data);
    };
    const handleCategoryException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    //DEVICE LIST-DEPENDENCY
    const hanldeDeviceListSucess = (dataObject) => {
        setDeviceList(dataObject.data);
    }
    const hanldeDeviceListException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }

    //TAGLIST HANDLER
    const handleTagListSucess = (dataObject) => {
        setTagList(dataObject.data);
    }
    const handleTagListException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }

    //SLAVEID LIST HANDLER
    const handleSlaveIdListSuccess = (dataObject) => {
        setSlaveIdList(dataObject.data);
    };
    const handleSlaveIdListException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    const loadData = () => {
        setId(editData.id || '');
        setMachineId(editData.machineId || '');
        setDeviceCategoryId(editData.deviceCategoryId || '');
        setDeviceId(editData.deviceId || '');
        setSlaveId(editData.slaveId || '')
        setTagId(editData.Tag_Id || '');
        setTagName(editData.Tag_Name || '');
        setTagDescription(editData.tagDescription || '');
        setFunctionId(editData.function || '');
        setFunctionName(editData.functionName || '')
        setIsProdCapacity(editData.isProdCapacity === "0" ? false : true || false);
        setSensorHistory(editData.isSensor || false);
        setSelectedChart(editData.chartNo || '');
        // setTagLabel(editData.tagLabel || '')
        !isAddButton && EdgeDeviceName({ id: editData.deviceCategoryId }, handleDeviceFetchSuccess, handleDeviceFetchException);
        !isAddButton && editData.deviceId && fetchSlaveIdList({ id: editData.deviceId }, handleSlaveIdListSuccess, handleSlaveIdListException);
        !isAddButton && editData.deviceId && TagName({ id: editData.deviceId, slaveId: editData.slaveId }, handleTagListSucess, handleTagListException);


    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            MachineAllocationAdd(
                {
                    machineId: machineId,
                    deviceCategoryId: deviceCategoryId,
                    deviceId: deviceId,
                    slaveId: slaveId,
                    Tag_Id: tagId,
                    Tag_Name: tagName,
                    function: functionId,
                    functionName: functionName,
                    isProdCapacity: isProdCapacity,
                    chartNo: selectedChart,
                    displaySensorHistory: sensorHistory,
                    tagDescription: tagDescription
                    // tagLabel:tagLabel
                },
                handleSuccess, handleException)
        } else {
            MachineAllocationViewedit(
                {
                    id: id,
                    machineId: machineId,
                    deviceCategoryId: deviceCategoryId,
                    deviceId: deviceId,
                    slaveId: slaveId,
                    Tag_Id: tagId,
                    Tag_Name: tagName,
                    function: functionId,
                    functionName: functionName,
                    isProdCapacity: isProdCapacity,
                    chartNo: selectedChart,
                    displaySensorHistory: sensorHistory,
                    tagDescription: tagDescription
                    // tagLabel:tagLabel
                },
                handleSuccess, handleException)
        }
    };

    const handleSuccess = (dataObject) => {
        setRefreshData((oldvalue) => !oldvalue);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 2000);
    };

    const handleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleClose();
        }, 5000);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const TypefunctionList = [
        { id: 1, FunctionType: 'Status(DI) - Latest Record' },
        { id: 2, FunctionType: 'Status(DI) - All Record' },
        { id: 3, FunctionType: 'Counter (DI) - Sum Of All Row' },
        { id: 4, FunctionType: 'Counter (DI) - Latest Record - Last Record' },
        { id: 5, FunctionType: 'Sensor (AI) - Latest Record Data' },
        { id: 6, FunctionType: 'Sensor(AI) - Latest Data With Min Max Avg' },
    ]

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setIsProdCapacity(checked);
    };

    const handleSensorHistoryCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSensorHistory(checked);
        setDefaultChart(false);
    };

    const handleDefaultChartCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setDefaultChart(checked);
    };



    const CategoryChanged = (deviceCategoryId) => {
        setDeviceId('');
        setDeviceList([]);
        setSlaveId('');
        setSlaveIdList([]);
        setTagId('');
        setTagName('');
        setTagList([]);
        if (deviceCategoryId) {
            EdgeDeviceName({ id: deviceCategoryId }, handleDeviceFetchSuccess, handleDeviceFetchException);
        }
    };



    const handleDeviceFetchSuccess = (dataObject) => {
        setDeviceList(dataObject.data);
    };

    const handleDeviceFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };


    return (
        <Dialog
            fullWidth
            maxWidth="lg"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >

            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isAddButton ? 'Machine Allocation' : 'Edit Machine Allocation'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={4}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Machine
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={machineId}
                                    label="Machine"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setMachineId(e.target.value);
                                    }}
                                    required
                                >
                                    {machineList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.machine_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Device Category
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={deviceCategoryId}
                                    label="Sensor Category"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setDeviceCategoryId(e.target.value);
                                        CategoryChanged(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {categoryList.map((data) => (
                                        <MenuItem value={data.id}>{data.deviceCategory}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>


                        <Grid item xs={4}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Device
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={deviceId}
                                    label=" Device"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setDeviceId(e.target.value);
                                        setSlaveId('');
                                        setSlaveIdList([]);
                                        setTagList([]);
                                        setTagId('');
                                        setTagName('');
                                        fetchSlaveIdList({ id: e.target.value }, handleSlaveIdListSuccess, handleSlaveIdListException);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {deviceList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.edgeDeviceName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="slave-id-select-label">Slave Id</InputLabel>
                                <Select
                                    labelId="slave-id-select-label"
                                    id="slave-id-select"
                                    value={slaveId}
                                    label="Slave Id"
                                    required
                                    onChange={(e) => {
                                        setSlaveId(e.target.value);
                                        setTagId('');
                                        setTagName('');
                                        setTagList([]);
                                        TagName({ id: deviceId, slaveId: e.target.value }, handleTagListSucess, handleTagListException);
                                    }}
                                >
                                    {slaveIdList.map((data) => (
                                        <MenuItem key={data.slaveId} value={data.slaveId}>{data.slaveId}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>



                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Tag Name
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={tagId}
                                    label="Parameter"
                                    onChange={(e) => {
                                        const selectedTag = tagList.find((data) => data.Tag_Id === e.target.value);
                                        if (selectedTag) {
                                            setTagId(selectedTag.Tag_Id);
                                            setTagName(selectedTag.Tag_Name);
                                        }
                                    }}
                                    required
                                >
                                    {tagList.map((data) => (
                                        <MenuItem key={data.Tag_Id} value={data.Tag_Id}>{data.Tag_Name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                label="Tag Description"
                                type="text"
                                value={tagDescription}
                                variant="outlined"
                                placeholder="Tag Description"
                                required
                                // onBlur={() => validateForNullValue(slaveId, 'address')}
                                onChange={(e) => setTagDescription(e.target.value)}
                                autoComplete="off"
                                // error={errorObject?.customerID?.errorStatus}
                                // helperText={errorObject?.customerID?.helperText}
                                fullWidth
                            />
                        </Grid>




                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Function
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={functionId}
                                    label="Function"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        const selectedFunction = TypefunctionList.find((data) => data.id === e.target.value);
                                        if (selectedFunction) {
                                            setFunctionId(selectedFunction.id);
                                            setFunctionName(selectedFunction.FunctionType);
                                        }
                                        // setFunctionName(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {TypefunctionList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.FunctionType}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

                        <Grid item xs={4}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={isProdCapacity}
                                    onChange={handleCheckboxChange}
                                    name="ALERT"
                                // style={{ transform: 'scale(1.5)' }}
                                />
                                Production/Capacity
                            </label>
                        </Grid>
                        <Grid item xs={4}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={sensorHistory}
                                    onChange={handleSensorHistoryCheckboxChange}
                                    name="ALERT"
                                // style={{ transform: 'scale(1.5)' }}
                                />
                                Display Sensor History
                            </label>
                        </Grid>
                        {}
                        {}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
                            // setErrorObject({});
                            loadData();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        {' '}
                        {isAddButton ? 'Map' : 'Update'}
                    </Button>
                </DialogActions>
            </form>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog >
    );
}

export default MachineAllocationModalNew;
