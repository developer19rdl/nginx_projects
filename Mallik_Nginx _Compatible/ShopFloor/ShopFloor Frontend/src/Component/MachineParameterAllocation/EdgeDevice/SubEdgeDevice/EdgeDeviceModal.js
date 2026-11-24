import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { connect } from 'react-redux';
import { addMachine, showCapacityMeasure, showDepartment, editMachine, showDeviceCategory, addEdgeDevice, editEdgeDevices } from '../../../../Actions';
import NotificationBar from './NotificationBar';
import { EdgeDeviceAdd, EdgeDeviceViewedit, MachineDeviceCategoryView, showmachine } from '../../../../Services/NodeJsApiServices';

const EdgeDeviceModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData, capacityMeasureList, departmentList } = props;

    const [selectedDeviceCategory, setSelectedDeviceCategory] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [deviceTag, setDeviceTag] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [firmwareVersion, setFirmwareVersion] = useState('');
    const [hardwareVersion, setHardwareVersion] = useState('');
    const [fileBase64, setFileBase64] = useState('');
    const [rowId, setRowId] = useState('')
    const [deviceCategoryList, setdeviceCategoryList] = useState([])
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        // open && props.showDeviceCategory()
        setOpen(open);
        loaderData();
        open && MachineDeviceCategoryView(handelshowmachine, handelexceptionmachine)
    }, [configSetupData]);

    const handelshowmachine = (dataObject) => {
        setdeviceCategoryList(dataObject.data)

    }
    const handelexceptionmachine = () => {

    }


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            EdgeDeviceAdd(
                {
                    deviceCategoryId: selectedDeviceCategory,
                    edgeDeviceName: deviceName,
                    deviceTag: deviceTag,
                    macAddress: macAddress,
                    firmwareVersion: firmwareVersion,
                    hardwareModelVersion: hardwareVersion,
                    firmwareBinFile: fileBase64
                },
                handleSuccess, handleException)
        } else {
            EdgeDeviceViewedit({
                id: rowId,
                deviceCategoryId: selectedDeviceCategory,
                edgeDeviceName: deviceName,
                deviceTag: deviceTag,
                macAddress: macAddress,
                firmwareVersion: firmwareVersion,
                hardwareModelVersion: hardwareVersion,
                firmwareBinFile: fileBase64
            }, handleSuccess, handleException);
        }
    }

    const handleSuccess = (dataObject) => {
        console.log("the dataObject ", dataObject);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };


    const handleException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };

    const loaderData = () => {
        setRowId(configSetupData?.id || '')
        setSelectedDeviceCategory(configSetupData?.deviceCategoryId || '')
        setDeviceName(configSetupData?.edgeDeviceName || '')
        setDeviceTag(configSetupData?.deviceTag || '')
        setMacAddress(configSetupData?.macAddress || '')
        setFirmwareVersion(configSetupData?.firmwareVersion || '')
        setHardwareVersion(configSetupData?.hardwareModelVersion || '')
    };


    const ClearData = () => {
        setOpen(false);
        setRowId('')
        setSelectedDeviceCategory('')
        setDeviceName('')
        setDeviceTag('')
        setMacAddress('')
        setFirmwareVersion('')
        setHardwareVersion('')
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result;
                console.log("FileReader result: ", result);

                setFileBase64(result);  // Save the entire data URL
            };

            reader.onerror = (error) => {
                console.error("File reading error: ", error);
            };

            reader.readAsDataURL(file);
        }
    };


    return (
        <Dialog
            fullWidth
            maxWidth="lg"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }}>
                    {isAddButton ? 'Add Edge Device' : 'Edit Edge Device'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Device Category
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedDeviceCategory}
                                    label="Sensor Category"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setSelectedDeviceCategory(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {deviceCategoryList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.deviceCategory}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={deviceName}
                                id="outlined-basic"
                                label="Name of the device"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setDeviceName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={deviceTag}
                                id="outlined-basic"
                                label="Device Tag"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setDeviceTag(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={macAddress}
                                id="outlined-basic"
                                label="Mac Address"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setMacAddress(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={firmwareVersion}
                                id="outlined-basic"
                                label="Firmware Version"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setFirmwareVersion(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={hardwareVersion}
                                id="outlined-basic"
                                label="Hardware Version"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setHardwareVersion(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                // value={fileBase64}
                                type='file'
                                id="outlined-basic"
                                variant="outlined"
                                fullWidth
                                onChange={handleFileChange}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                    </Grid>

                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
                            // setErrorObject({});
                            loaderData();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="submit"
                    >
                        {' '}
                        {isAddButton ? 'Add' : 'Update'}
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


export default EdgeDeviceModal;