import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import { addLoadSchedule, getLoadScheduleMachineList, editLoadSchedule, editCapacityMeasure, reSchedule } from '../../../Actions';
import NotificationBar from './NotificationBar';

const ResheduleModal = (props) => {
    const { dailogOpen, setDailogOpen, isAddButton, setRefreshData, configSetupData, loadScheduleLoader, loadScheduleList } = props;
    console.log('configSetupData', configSetupData)

    const [rowId, setRowId] = useState('')
    const [machine, setMachine] = useState('');
    const [date, setDate] = useState('');
    const [rescheduledDate, setreScheduledDate] = useState('');
    // loadCapacity is plannedCapacity
    const [loadCapacity, setLoadCapacity] = useState('');
    const [remarks, setRemarks] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('')
    const [units, setUnits] = useState('');
    const [machineMaxCapacity, setMachineMaxCapacity] = useState('');  //Validation
    const [error, setError] = useState(false); //Validation

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        loaderData();
    }, [configSetupData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (loadCapacity.trim() >= machineMaxCapacity) {  //Validation
            setError(true);
        } else {
            props.reSchedule({
                id: rowId,
                reScheduleDate: rescheduledDate,
                loadCapacity: loadCapacity,
                remark: remarks,
            }, handleSuccess, handleException)
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
        setMachine(configSetupData?.machine_name || '')
        setDate(configSetupData?.scheduleDate || '');
        setLoadCapacity(configSetupData?.loadCapacity || '');
        setMaxCapacity(configSetupData?.maxCapacity || '');
        setUnits(configSetupData?.unitName || '');
        setMachineMaxCapacity(configSetupData?.maxCapacity || '') //Validation
    }

    const ClearData = () => {
        setError(false);  //Validation 
        setMachineMaxCapacity('') //Validation
        setDailogOpen(false);
        setRowId('');
        setMachine('');
        setDate('');
        setLoadCapacity('');
        setMaxCapacity('');
        setUnits('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // Format the date as "YYYY-MM-DD" for the input field
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={dailogOpen}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    Reschedule
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} padding={1}>
                        <Grid item xs={6}>
                            <TextField
                                disabled
                                value={machine}
                                // type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="Machine Name"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setMachine(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                disabled
                                value={date}
                                // type='datetime-local'
                                type='date'
                                // margin="dense"
                                id="outlined-basic"
                                label="Scheduled Date"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setDate(e.target.value); }}
                                autoComplete="off"
                                required
                                InputLabelProps={{
                                    shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                disabled
                                value={maxCapacity}
                                // type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="Max Capacity"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setMaxCapacity(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                disabled
                                value={units}
                                // type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="Units"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setUnits(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={loadCapacity}
                                // type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="Planned Capacity"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setLoadCapacity(e.target.value); }}
                                autoComplete="off"
                                required
                                error={error}                                                                   //Validation
                                helperText={error ? 'Planned capacity must be lesser than max capacity' : ''}   //Validation
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={rescheduledDate}
                                // type='datetime-local'
                                type='date'
                                // margin="dense"
                                id="outlined-basic"
                                label="Reschedule Date"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setreScheduledDate(e.target.value); }}
                                autoComplete="off"
                                required
                                InputLabelProps={{
                                    shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                }}
                                inputProps={{ min: tomorrowFormatted }} // Set the minimum date
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={remarks}
                                // type='datetime-local'
                                // margin="dense"
                                id="outlined-basic"
                                label="Remarks"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setRemarks(e.target.value); }}
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
                            setDailogOpen(false);
                            loaderData();
                            setError(false); //Validation
                            setMachineMaxCapacity('') //Validation
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
                        Update
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

const mapStateToProps = ({ LoadSchedule }) => {
    const { loadScheduleLoader, loadScheduleList } = LoadSchedule;
    return { loadScheduleLoader, loadScheduleList }
}
export default connect(mapStateToProps, { addLoadSchedule, getLoadScheduleMachineList, editLoadSchedule, editCapacityMeasure, reSchedule })(ResheduleModal);