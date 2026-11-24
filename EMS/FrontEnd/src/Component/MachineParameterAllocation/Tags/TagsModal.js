import React, { useEffect, useState } from 'react';
import {
    Button, Checkbox, Dialog, DialogContent, DialogTitle, TextField,
    Grid, DialogActions, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import { FetchDeviceCategoryListService, FetchCategoryDeviceListService, TagEditService, AddTagService } from '../../../Services/LoginPageService.js'
// import NotificationBar from '../../../Component/Notification/NotificationBar.js'
import NotificationBar from '../../../Utility/NotificationBar.js';
import { EdgeDeviceName, EdgeDeviceViewname, MachineDeviceCategoryView, MachineDevicenameview, Machinenameview, TagAddAdd, TagAddViewedit } from '../../../Services/NodeJsApiServices.js';

function TagsModal({ open, setOpen, isAddButton, editData, setRefreshData }) {

    console.log("editData", editData);

    const [id, setId] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [categoryId, setCategoryId] = useState('');

    const [deviceList, setDeviceList] = useState([]);
    const [deviceId, setDeviceId] = useState('');
    const [tagName, setTagName] = useState('');
    const jsonTypeList = [
        { id: 1, outPut: 'DIGITAL' },
        { id: 2, outPut: 'ANALOG' },
        { id: 3, outPut: 'MODBUS' },
        { id: 4, outPut: 'STD' },
    ]
    const [jsonType, setJsonType] = useState('');
    const [criticalMinValue, setCriticalMinValue] = useState('');
    const [criticalMaxValue, setCriticalMaxValue] = useState('');
    const [warningMinValue, setWarningMinValue] = useState('');
    const [warningMaxValue, setWarningMaxValue] = useState('');
    const [outOfRangeMinValue, setOutOfRangeMinValue] = useState('');
    const [outOfRangeMaxValue, setOutOfRangeMaxValue] = useState('');
    const [slaveId, setSlaveId] = useState('');
    const [slaveInformation, setSlaveInformation] = useState('');
    const [resetCountValue, setResetCountValue] = useState('');
    const [alertCount, setAlertCount] = useState('');
    const [isAlert, setIsAlert] = useState(false);
    const [Status, setStatus] = useState(false);
    const [smsAlert, setSmsAlert] = useState(false);
    const [latchAlert, setLatchAlert] = useState(false);


    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loadData();
        open && MachineDeviceCategoryView(handleDeviceCategoryFetchSuccess, handleDeviceCategoryFetchException);
    }, [editData]);

    const handleDeviceCategoryFetchSuccess = (dataObject) => {
        setCategoryList(dataObject.data);
    };

    const handleDeviceCategoryFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    const CategoryChanged = (deviceCategoryId) => {
        setDeviceId('');
        setCategoryId(deviceCategoryId);
        if (deviceCategoryId) {
            // FetchBranchService({ categoryId }, CategoryHandleSuccess, CategoryHandleException);
            EdgeDeviceName({ id: deviceCategoryId }, handleDeviceFetchSuccess, handleDeviceFetchException);
            // setDeviceList([])
        }
    };

    const handleDeviceFetchSuccess = (dataObject) => {
        setDeviceList(dataObject.data);
    };

    const handleDeviceFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    const loadData = () => {
        setId(editData.id || '');
        setCategoryId(editData.deviceCategoryId || '');
        setDeviceId(editData.deviceId || '');
        setTagName(editData.Tag_Name || '');
        setJsonType(editData.jsonType || '');
        setWarningMinValue(editData.warningMin || '');
        setWarningMaxValue(editData.warningMax || '');
        setOutOfRangeMinValue(editData.outOfRangeMin || '');
        setOutOfRangeMaxValue(editData.outOfRangeMax || '');
        setCriticalMinValue(editData.criticalMin || '');
        setCriticalMaxValue(editData.criticalMax || '');
        setSlaveId(editData.slaveId || '');
        setSlaveInformation(editData.slaveInformation || '');
        setIsAlert(Number(editData.alert) || false);
        setAlertCount(editData.alertCount || '')
        setResetCountValue(editData.alertResetCount || '')
        setStatus(Number(editData.emailAlert) || false);
        setSmsAlert(Number(editData.smsAlert) || false);
        setLatchAlert(Number(editData.latchAlert) || false);
        !isAddButton && editData.deviceCategoryId && EdgeDeviceName({ id: editData.deviceCategoryId }, handleDeviceFetchSuccess, handleDeviceFetchException);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // const serviceFunction = isAddButton ? AddTagService : TagEditService;
        // serviceFunction(formData, handleSuccess, handleException);
        if (isAddButton) {
            TagAddAdd(
                {
                    categoryId,
                    deviceId,
                    tagName,
                    jsonType,
                    criticalMinValue,
                    slaveId: slaveId,
                    slaveInformation: slaveInformation,
                    criticalMaxValue,
                    warningMinValue,
                    warningMaxValue,
                    outOfRangeMinValue,
                    outOfRangeMaxValue,
                    alert: isAlert,
                    alertCount: alertCount,
                    alertResetCount: resetCountValue,
                    emailAlert: Status,
                    smsAlert: smsAlert,
                    latchAlert: latchAlert
                },
                handleSuccess, handleException)
        } else {
            TagAddViewedit(
                {
                    id,
                    categoryId,
                    deviceId,
                    tagName,
                    slaveId: slaveId,
                    slaveInformation: slaveInformation,
                    jsonType,
                    criticalMinValue,
                    criticalMaxValue,
                    warningMinValue,
                    warningMaxValue,
                    outOfRangeMinValue,
                    outOfRangeMaxValue,
                    alert: isAlert,
                    alertCount: alertCount,
                    alertResetCount: resetCountValue,
                    emailAlert: Status,
                    smsAlert: smsAlert,
                    latchAlert: latchAlert
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

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setIsAlert(checked);
    };

    const handleSetCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setStatus(checked);
    };

    const handleSmsCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSmsAlert(checked);
    };

    const handleLatchCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setLatchAlert(checked);
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
                    {isAddButton ? 'Add Tag' : 'Edit Tag'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} padding={1}>
                        <Grid item xs={4}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Device Category
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={categoryId}
                                    label="Sensor Category"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        // setCategoryId(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                        CategoryChanged(e.target.value);

                                    }}
                                    required
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
                                    label="Device"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setDeviceId(e.target.value);
                                        // props.getSensorDetailsDropdownList(e.target.value)
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {deviceList.map((data) => (
                                        // <MenuItem key={data.id} value={data.id}>{data.department}</MenuItem>
                                        <MenuItem key={data.id} value={data.id}>{data.edgeDeviceName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                value={tagName}
                                id="outlined-basic"
                                label="Tag Name"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setTagName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Json Type
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={jsonType}
                                    label="Json Type"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setJsonType(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {jsonTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.outPut}>{data.outPut}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={4} style={{ display: 'flex', alignItems: 'center',justifyContent:'center' }}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={isAlert}
                                    onChange={handleCheckboxChange}
                                    name="ALERT"
                                // style={{ transform: 'scale(1.5)' }}
                                />
                                Alert
                            </label>
                        </Grid>
                        <Grid item xs={4} sm={4} md={4}>
                            <TextField
                                label="Slave Id"
                                type="text"
                                value={slaveId}
                                variant="outlined"
                                placeholder="Set Slave Id"
                                required
                                // onBlur={() => validateForNullValue(setSlaveId, 'address')}
                                onChange={(e) => setSlaveId(e.target.value)}
                                autoComplete="off"
                                // error={errorObject?.customerID?.errorStatus}
                                // helperText={errorObject?.customerID?.helperText}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4} sm={4} md={4}>
                            <TextField
                                label="Slave Information"
                                type="text"
                                value={slaveInformation}
                                variant="outlined"
                                placeholder="e.g. Assembly Line 1 Panel"
                                onChange={(e) => setSlaveInformation(e.target.value)}
                                autoComplete="off"
                                fullWidth
                            />
                        </Grid>
                        {isAlert && (
                            <>
                                <Grid item lg={12} md={12} container justifyContent='flex-start'>
                                    <Typography>Warning Alert:</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={warningMinValue}
                                        id="outlined-basic"
                                        label="Min Value"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setWarningMinValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={warningMaxValue}
                                        id="outlined-basic"
                                        label="Max Value"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setWarningMaxValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>

                                <Grid item lg={12} md={12} container justifyContent='flex-start'>
                                    <Typography>Out-of-Range Alert:</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={outOfRangeMinValue}
                                        id="outlined-basic"
                                        label="Min Value"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setOutOfRangeMinValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={outOfRangeMaxValue}
                                        id="outlined-basic"
                                        label="Max Value"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setOutOfRangeMaxValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>
                                <Grid item lg={12} md={12} container justifyContent='flex-start'>
                                    <Typography>Critical Alert:</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={criticalMinValue}
                                        id="outlined-basic"
                                        label="Min Value"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setCriticalMinValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={4}>
                                    <TextField
                                        value={criticalMaxValue}
                                        id="outlined-basic"
                                        label="Max Value"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setCriticalMaxValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>
                                <Grid item lg={12} md={12} container justifyContent='flex-start'>
                                    <Typography> Alert Count:</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={alertCount}
                                        id="outlined-basic"
                                        label="Alert Count:"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setAlertCount(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>
                                <Grid item lg={12} md={12} container justifyContent='flex-start'>
                                    <Typography> Alert Reset Count:</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        value={resetCountValue}
                                        id="outlined-basic"
                                        label="Alert Reset Count:"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setResetCountValue(e.target.value); }}
                                        autoComplete="off"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ fontSize: '1.2rem' }}>
                                        <Checkbox
                                            checked={Status}
                                            onChange={handleSetCheckboxChange}
                                            name="ALERT"
                                        // style={{ transform: 'scale(1.5)' }}
                                        />
                                        Email Alert
                                    </label>
                                </Grid>

                                <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ fontSize: '1.2rem' }}>
                                        <Checkbox
                                            checked={smsAlert}
                                            onChange={handleSmsCheckboxChange}
                                            name="SMS_ALERT"
                                        />
                                        SMS Alert
                                    </label>
                                </Grid>

                                <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ fontSize: '1.2rem' }}>
                                        <Checkbox
                                            checked={latchAlert}
                                            onChange={handleLatchCheckboxChange}
                                            name="ALERT"
                                        // style={{ transform: 'scale(1.5)' }}
                                        />
                                        Latched Alert
                                    </label>
                                </Grid>
                            </>
                        )}
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
                    // onClick={handleSubmit}
                    >
                        {' '}
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </form >
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog >
    );
}

export default TagsModal;
