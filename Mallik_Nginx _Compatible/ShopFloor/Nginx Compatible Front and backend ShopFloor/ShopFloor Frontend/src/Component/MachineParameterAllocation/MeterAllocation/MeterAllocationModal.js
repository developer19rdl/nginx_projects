import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogContent, DialogTitle, TextField,
    Grid, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

import { MeterAddService, MeterEditService, FetchMeterService, FetchCompanyService, FetchDeviceListService } from '../../../Services/LoginPageService.js'



import { AddCustomerValidate } from '../../../Pages/validation/formValidation.js'
import NotificationBar from '../../../Component/Notification/NotificationBar.js'
import { EdgeDevicename, MeterAllocationAdd, MeterAllocationViewedit, allocMachinesList, getDeviceSlaveId } from '../../../Services/NodeJsApiServices.js';

function MeterAllocationModal({ open, setOpen, isAddButton, meterData, setRefreshData }) {
    const [id, setId] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [slaveId, setSlaveId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [meterTypeName, setMeterTypeName] = useState('');
    const [machineSlaveList, setMachineSlaveList] = useState([])

    const [deviceList, setDeviceList] = useState([]);
    const [errorObject, setErrorObject] = useState({});



    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loadData();
        open && EdgeDevicename(handleFetchSuccess, handleFetchException);
    }, [meterData]);

    const handleFetchSuccess = (dataObject) => {
        setDeviceList(dataObject.data);
    };

    const handleFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    const loadData = () => {
        setId(meterData.id || '');
        setDeviceId(meterData.deviceId || '');
        setSlaveId(meterData.slaveId || '');
        setDisplayName(meterData.displayName || '');
        setMeterTypeName(meterData.meterType || '');
        !isAddButton && getDeviceSlaveId({ deviceId: meterData.deviceId }, handleGetSlaveSucess, handleGetSlaveException)
    };

    //SLAVEID HANDLER
    const handleGetSlaveSucess = (dataObject) => {
        setMachineSlaveList(dataObject.data);
    }
    const handleGetSlaveException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }

    const validateForNullValue = (value, type) => {
        AddCustomerValidate(value, type, setErrorObject);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            id,
            deviceId: deviceId,
            slaveId: slaveId,
            displayName: displayName,
            meterType: meterTypeName
        };

        const serviceFunction = isAddButton ? MeterAllocationAdd : MeterAllocationViewedit;
        serviceFunction(formData, handleSuccess, handleException);
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

    const MeterTypeList = [
        { id: 1, MeterType: 'Electric board (incomer)' },
        { id: 2, MeterType: 'Solar' },
        { id: 3, MeterType: 'Generator' },
        { id: 4, MeterType: 'Asset' },
        { id: 5, MeterType: 'Circuit' },
    ]

    return (
        <Dialog open={open}>
            <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }} >{isAddButton ? 'Allocate Meter' : 'Edit Allocate'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={12}>
                            <FormControl fullWidth margin="normal" sx={{ marginTop: 0 }}>
                                <InputLabel id="demo-simple-select-label">Device</InputLabel>
                                <Select
                                    sx={{ minWidth: 250 }}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={deviceId}
                                    required
                                    fullWidth
                                    label="Device Id"
                                    onChange={(e) => {
                                        setDeviceId(e.target.value)
                                        getDeviceSlaveId({ deviceId: e.target.value }, handleGetSlaveSucess, handleGetSlaveException)
                                    }}
                                >
                                    {deviceList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>
                                            {data.edgeDeviceName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Slave Id
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={slaveId}
                                    label=" Device"
                                    onChange={(e) => {
                                        setSlaveId(e.target.value)
                                    }}
                                    required
                                >
                                    {machineSlaveList.map((data) => (
                                        <MenuItem key={data.id} value={data.slaveId}>{data.slaveId}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>


                        <Grid item xs={12} sm={12} md={12}>
                            <TextField
                                label="Display Name"
                                type="text"
                                value={displayName}
                                variant="outlined"
                                placeholder="displayName"
                                required
                                onBlur={() => validateForNullValue(displayName, 'address')}
                                onChange={(e) => setDisplayName(e.target.value)}
                                autoComplete="off"
                                error={errorObject?.customerID?.errorStatus}
                                helperText={errorObject?.customerID?.helperText}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Meter Type
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={meterTypeName}
                                    label="Sensor Output"
                                    onChange={(e) => {
                                        setMeterTypeName(e.target.value);
                                    }}
                                    required
                                >
                                    {MeterTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.MeterType}>{data.MeterType}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button  onClick={() => {
                        setOpen(false);
                        setErrorObject({});
                        loadData();

                    }}>
                        Cancel
                    </Button>
                    <Button type="submit" >{isAddButton ? 'Add' : 'Update'}</Button>
                </DialogActions>
            </form>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    );
}

export default MeterAllocationModal;
