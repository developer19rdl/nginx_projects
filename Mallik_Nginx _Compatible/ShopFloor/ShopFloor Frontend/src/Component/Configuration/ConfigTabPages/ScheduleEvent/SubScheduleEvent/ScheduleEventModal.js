import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { AddEventView, DepartmentList, DepartmentView, ScheduleEvent, ScheduleEventUpdate, showMachineView } from '../../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../../Utility/NotificationBar';
// import { connect } from 'react-redux';
// import { addCapacityMeasure, editCapacityMeasure } from '../../../../../Actions';
// import NotificationBar from './NotificationBar';
// import { AddEventView, DepartmentView, ScheduleEvent, ScheduleEventUpdate, showMachineView } from '../../../../../services/LoginServiceNod';

const departmentList = [
    { id: 1, name: 'one' },
    { id: 2, name: 'two' },
    { id: 3, name: 'three' }
]

const ScheduleEventModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;

    const [capacityMeasureType, setCapacityMeasureType] = useState('')
    const [capacityMeasure, setCapacityMeasure] = useState('')
    const [rowId, setRowId] = useState('')
    // new data
    const [selectedRadioValue, setSelectedRadioValue] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [department, setDepartment] = useState('')
    const [machine, setMachine] = useState('')
    const [eventType, setEventType] = useState('')
    const [departmentList, setdepartmentList] = useState([])
    const [MachineList, setMachineList] = useState([])
    const [viewList, setviewList] = useState([])


    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loaderData();
        // DepartmentView(handeldepartment,handeldepartmentexception)
        open && DepartmentList(handeldepartment, handeldepartmentexception)
        open && AddEventView(handelView, handelViewexception)

    }, [configSetupData]);

    const handelView = (dataObject) => {
        setviewList(dataObject.data)
    }
    const handelViewexception = () => {

    }

    const handeldepartment = (dataObject) => {
        setdepartmentList(dataObject.data)
        const departmentId = dataObject.data.id
        console.log("departmentId", departmentId)
        // showMachineView({id:departmentId},handelmachine,handelexceptionMachine)
    }

    const handelmachine = (dataObject) => {
        setMachineList(dataObject.data)

    }


    const handelexceptionMachine = () => {

    }



    const handeldepartmentexception = () => {

    }


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            ScheduleEvent({ Type: selectedRadioValue, fromDate: fromDate, todate: toDate, Department: department, EventType: eventType, Machine: machine }, handleSuccess, handleException)
        } else {
            ScheduleEventUpdate({
                id: rowId, Type: selectedRadioValue, fromDate: fromDate, todate: toDate, Department: department, EventType: eventType, Machine: machine
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
        console.log("configSetupData", configSetupData)
        setRowId(configSetupData?.id || '')
        setFromDate(configSetupData?.fromDate || '')
        setToDate(configSetupData?.todate || '')
        setDepartment(configSetupData?.Department || '')
        setEventType(configSetupData?.EventType || '')
        setMachine(configSetupData?.Machine || '')
        setSelectedRadioValue(configSetupData?.Type || '')
        setCapacityMeasureType(configSetupData?.capacityMeasureType || '');
        setCapacityMeasure(configSetupData?.capacityMeasure || '');
        !isAddButton && showMachineView({ id: configSetupData?.Department }, handelmachine, handelexceptionMachine)
    }

    const ClearData = () => {
        setOpen(false);
        setRowId('');
        setCapacityMeasureType('');
        setCapacityMeasure('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleRadioChange = (event) => {
        setFromDate('');
        setToDate('');
        setDepartment('');
        setMachine('');
        setEventType('');
        setSelectedRadioValue(event.target.value);
    };




    const departmentchange = (value) => {
        showMachineView({ id: value }, handelmachine, handelexceptionMachine)
    }

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <>
                <DialogTitle  sx={{color: '#000000', fontWeight: 'bold' }}>
                    {isAddButton ? 'Schedule Event' : 'Edit Scheduled Event'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} padding={1}>
                        <Grid item lg={12} md={12} container justifyContent="center">
                            <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0px' }}>
                                <RadioGroup
                                    aria-label="options"
                                    name="options"
                                    value={selectedRadioValue}
                                    onChange={handleRadioChange}
                                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                >
                                    <FormControlLabel
                                        value="department"
                                        control={<Radio 
                                            sx={{
                                                color: '#686D76', // unselected color
                                                '&.Mui-checked': {
                                                    color: '#000000', // selected color
                                                }
                                            }}
                        
                                        />}
                                        label="Department"
                                    />
                                    {/* <FormControlLabel
                                        value="all"
                                        control={<Radio />}
                                        label="All"
                                    /> */}
                                    <FormControlLabel
                                        value="individualMachine"
                                        control={<Radio 
                                            sx={{
                                                color: '#686D76', // unselected color
                                                '&.Mui-checked': {
                                                    color: '#000000', // selected color
                                                }
                                            }}
                        
                                        />}
                                        label="Individual Machine"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={fromDate}
                                type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="From Date"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setFromDate(e.target.value); }}
                                autoComplete="off"
                                required
                                InputLabelProps={{
                                    shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={toDate}
                                type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="To Date"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setToDate(e.target.value); }}
                                autoComplete="off"
                                required
                                InputLabelProps={{
                                    shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                }}
                            />
                        </Grid>

                        {selectedRadioValue === 'department' || selectedRadioValue === 'individualMachine' ?
                            <Grid item xs={12}>
                                <FormControl fullWidth /*margin="normal"*/>
                                    <InputLabel id="demo-simple-select-label">
                                        --Department--
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={department}
                                        label="--Department--"
                                        // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                        onChange={(e) => {
                                            setDepartment(e.target.value);
                                            console.log('setDepartment', e.target.value);
                                            departmentchange(e.target.value)

                                        }}
                                    // error={errorObject?.deviceCategory?.errorStatus}
                                    // helperText={errorObject?.deviceCategory?.helperText}
                                    >
                                        {departmentList.map((data) => (
                                            <MenuItem key={data.id} value={data.id}>{data.departmentName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            : null}

                        {selectedRadioValue === 'individualMachine' &&
                            <Grid item xs={12}>
                                <FormControl fullWidth /*margin="normal"*/>
                                    <InputLabel id="demo-simple-select-label">
                                        --Machine--
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={machine}
                                        label="--Department--"
                                        // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                        onChange={(e) => {
                                            setMachine(e.target.value);
                                            console.log('setDepartment', e.target.value);
                                        }}
                                    // error={errorObject?.deviceCategory?.errorStatus}
                                    // helperText={errorObject?.deviceCategory?.helperText}
                                    >
                                        {MachineList.map((data) => (
                                            <MenuItem key={data.id} value={data.id}>{data.machine_name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    --Event Type--
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={eventType}
                                    label="--Event Type--"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setEventType(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {viewList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.eventName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
                            loaderData();
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
                        {isAddButton ? 'Schedule' : 'Update'}
                    </Button>
                </DialogActions>
            </>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog >
    );
}


export default ScheduleEventModal;