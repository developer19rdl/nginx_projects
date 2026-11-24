import {
    Button, Grid, Checkbox, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import NotificationBar from './NotificationBar';
import { FetchMachineListService } from '../../../../Services/LoginPageService';
// import  from '@mui/material/Checkbox';

const parameterList = [
    { id: 1, parameter: 'Parameter1' },
    { id: 2, parameter: 'Parameter2' },
    { id: 3, parameter: 'Parameter3' },
]

const MachineParameterModal1 = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData, machineAllocationData, capacityMeasureList, departmentList } = props;
    const [machineList, setMachineList] = useState([]);
    const [machineId, setMachineId] = useState('');
    const [deviceCategoryList, setDeviceCategoryList] = useState([]);
    const [deviceCategoryId, setDeviceCategoryId] = useState('');
    const [deviceList, setDeviceList] = useState([]);
    const [deviceId, setDeviceId] = useState('');
    const [tagList, setTagList] = useState([]);
    const [tagId, setTagId] = useState('');
    const [functionName, setFunctionName] = useState('');
    const [isProdCapacity, setIsProdCapacity] = useState('');

    const [rowId, setRowId] = useState('')
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loadData();
        FetchMachineListService(handleMachineFetchSuccess, handleMachineFetchException);
        FetchMachineListService(handleMachineFetchSuccess, handleMachineFetchException);

    }, [machineAllocationData]);


    const handleMachineFetchSuccess = (dataObject) => {
        setMachineList(dataObject.data);
    };

    const handleMachineFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            props.addMachine(
                {

                },
                handleSuccess, handleException)
        } else {
            props.editMachine({
                id: rowId,

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

    const loadData = () => {
        setRowId(machineAllocationData?.id || '')
        setMachineId(machineAllocationData?.department_id || '')
        deviceCategoryId(machineAllocationData?.machineId || '')
        setDeviceId(machineAllocationData?.machine_name || '')
        setTagId(machineAllocationData?.machine_tag || '')

    };


    const ClearData = () => {
        setOpen(false);
        setMachineId('')
        setDeviceCategoryId('')
        setDeviceId('')
        setFunctionName('')
        setIsProdCapacity('')
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };







    const TypefunctionList = [
        { id: 1, FunctionType: 'Latest' },
        { id: 2, FunctionType: 'All Records' },
        { id: 3, FunctionType: 'Some Of All Row' },
        { id: 4, FunctionType: 'Last Read Record - Latest Record' },
        { id: 5, FunctionType: 'Latest Record Data ' },
        { id: 6, FunctionType: 'Latest Data With Min /Max / AVG' },
    ]



    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setIsProdCapacity(checked);
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
                                        <MenuItem key={data.id} value={data.id}>{data.machineName}</MenuItem>
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
                                        console.log('setDepartment', e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {deviceCategoryList.map((data) => (
                                        <MenuItem value={data.id}>{data.categoryName}</MenuItem>
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

                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {deviceList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.departmentName}</MenuItem>
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
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setTagId(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {tagList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.Tag_Name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>



                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Function
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={functionName}
                                    label="Sensor Output"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setFunctionName(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {TypefunctionList.map((data) => (
                                        <MenuItem key={data.id} value={data.FunctionType}>{data.FunctionType}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

                        <Grid item xs={12}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={isProdCapacity}
                                    onChange={handleCheckboxChange}
                                    name="ALERT"
                                    style={{ transform: 'scale(1.5)' }}
                                />
                                Production/Capacity
                            </label>
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

export default MachineParameterModal1;


