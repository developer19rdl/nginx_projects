import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
    LinearProgress,
    Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import { addLoadSchedule, getLoadScheduleMachineList, editLoadSchedule, editCapacityMeasure } from '../../../Actions';
import NotificationBar from './NotificationBar';
import { DownloadRescheduleTemplate, DownloadScheduleTemplate } from '../../../Services/DownloadCsvReportsService'
import { AddLaodSheduling, ImportReScheduleList, UpdateLoadSchedule } from '../../../Services/NodeJsApiServices';
import UploadIcon from '@mui/icons-material/Upload';

const AddScheduleModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData, loadScheduleLoader, loadScheduleList } = props;

    // const [rowId, setRowId] = useState('')
    const [selectedRadioValue, setSelectedRadioValue] = useState('add');
    const [machine, setMachine] = useState('');
    const [date, setDate] = useState('');
    const [loadCapacity, setLoadCapacity] = useState('');
    const [machineMaxCapacity, setMachineMaxCapacity] = useState('');  //Validation
    const [error, setError] = useState(false); //Validation

    // upload
    const [uploadDate, setUploadDate] = useState('');
    // NEW STATE
    const [Id, setId] = useState('')
    const [uploadFile, setUploadFile] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedShift, setSelectedShift] = useState('');
    const [selectedFromDate, setSelectedFromDate] = useState('');
    const [selectedToDate, setSelectedToDate] = useState('');
    const [uploadLoader, setUploadLoader] = useState(false);
    //EDIT
    const [machineName, setMachineName] = useState('');
    const [machineNameId, setMachineNameId] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [asignShift, setAsignShift] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        //to get the dropdown machine list
        // props.getLoadScheduleMachineList();
        setOpen(open);
        loaderData();
    }, [configSetupData]);

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     console.log('success');
    //     if (isAddButton) {
    //         if (loadCapacity.trim() >= machineMaxCapacity) {  //Validation
    //             setError(true);
    //         } else {
    //             props.addLoadSchedule({ machineId: machine, scheduleDate: date, loadCapacity: loadCapacity }, handleSuccess, handleException)
    //         }
    //     } else {
    //         if (loadCapacity.trim() >= machineMaxCapacity) {  //Validation
    //             setError(true);
    //         } else {
    //             props.editLoadSchedule({
    //                 id: rowId,
    //                 machineId: machine,
    //                 scheduleDate: date,
    //                 loadCapacity: loadCapacity
    //             }, handleSuccess, handleException);
    //         }
    //     }
    // };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            AddLaodSheduling({
                scheduleDate: selectedDate,
                shiftNumber: selectedShift,
                file: uploadFile,

            }, handleSuccess, handleException);
        } else {
            UpdateLoadSchedule({
                id: Id,
                scheduleDate: scheduleDate,
                shiftNumber: asignShift,
                machine_name: machineName
            }, handleSuccess, handleException);
        }
    };

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
            // ClearData();
            handleClose();
        }, 2000);
    };

    const loaderData = () => {
        console.log("configSetupData", configSetupData)
        setMachineName(configSetupData?.machine_name || '');
        setMachineNameId(configSetupData?.machineId || '');
        setId(configSetupData?.id || '');
        setScheduleDate(configSetupData?.scheduleDate || '');
        setAsignShift(configSetupData?.shiftNumber || '')
        // setMachine(configSetupData?.machineId || '')
        // setDate(configSetupData?.scheduleDate || '');
        // setLoadCapacity(configSetupData?.loadCapacity || '');
        // setMachineMaxCapacity(configSetupData?.maxCapacity || '') //Validation
    }
    // const ClearData = () => {
    //     setError(false);  //Validation 
    //     setMachineMaxCapacity('') //Validation
    //     setOpen(false);
    //     setRowId('');
    //     setMachine('');
    //     setDate('');
    //     setLoadCapacity('');
    //     setRefreshData(oldvalue => !oldvalue);
    // }

    // const loaderData = () => {
    //     setId(configSetupData?.id || '')
    //     setSelectedDate(configSetupData?.machineId || '')
    //     setSelectedShift(configSetupData?.scheduleDate || '');
    //     setUploadFile(configSetupData?.loadCapacity || '');
    // };
    const ClearData = () => {
        setOpen(false);
        setSelectedFromDate('');
        setSelectedToDate('');
        setMachineName('');
        setMachineNameId('');
        setScheduleDate('');
        setAsignShift('');
        setRefreshData(oldvalue => !oldvalue);
    }

    // const handleRadioChange = (event) => {
    //     setRowId('');
    //     setMachine('');
    //     setDate('');
    //     setLoadCapacity('');
    //     setSelectedRadioValue(event.target.value);
    // };

    // Get tomorrow's date
    const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // Format the date as "YYYY-MM-DD" for the input field
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = btoa(
                    new Uint8Array(e.target.result)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                // Now you have the file as a Base64-encoded string
                console.log("Base64 String:", base64String);
                // setExcelBase64File(base64String);
                setUploadFile(base64String)
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleTemplateDownload = () => {
        DownloadRescheduleTemplate({ fromDate: selectedFromDate, toDate: selectedToDate }, handleTemplateSuccess, handleTemplateFailure)
    }
    const handleTemplateSuccess = () => { }
    const handleTemplateFailure = () => { }

    const handleRescheduleImportSucess = (dataObject) => {
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
    }
    const handleRescheduleImportException = (errorObject, errorMessage) => {
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
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                {uploadLoader &&
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
                <DialogTitle style={{ fontFamily: 'Roboto Slab' }}>
                    Reschedule
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} padding={1}>
                        {isAddButton ? <>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                                <TextField
                                    value={selectedFromDate}
                                    type='date'
                                    id="outlined-basic"
                                    label="From Date"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => { setSelectedFromDate(e.target.value); }}
                                    autoComplete="off"
                                    required
                                    InputLabelProps={{
                                        shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                                <TextField
                                    value={selectedToDate}
                                    type='date'
                                    id="outlined-basic"
                                    label="To Date"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => { setSelectedToDate(e.target.value); }}
                                    autoComplete="off"
                                    required
                                    InputLabelProps={{
                                        shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
                                <Button variant="contained" onClick={handleTemplateDownload} style={{ backgroundColor: '#051622', marginRight: '15px' }}>Download</Button>
                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: '#051622', marginRight: '15px' }}
                                    endIcon={<UploadIcon />}
                                    component="label"
                                    htmlFor="reimport"
                                >
                                    Import
                                </Button>
                                <input
                                    id="reimport"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                if (reader.readyState === 2) {
                                                    setUploadLoader(true)
                                                    ImportReScheduleList({
                                                        file: reader.result,
                                                    }, handleRescheduleImportSucess, handleRescheduleImportException);
                                                }
                                            };
                                            reader.readAsDataURL(e.target.files[0]);
                                        }
                                    }}

                                />
                            </Grid>
                        </>
                            :
                            <>
                                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
                                    <TextField
                                        value={machineName}
                                        id="outlined-basic"
                                        label="Machine Name"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setMachineName(e.target.value) }}
                                        autoComplete="off"
                                        required
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
                                    <TextField
                                        value={scheduleDate}
                                        type='date'
                                        id="outlined-basic"
                                        label="From Date"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) => { setScheduleDate(e.target.value) }}
                                        autoComplete="off"
                                        required
                                        InputLabelProps={{
                                            shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Age</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={asignShift}
                                            label="Age"
                                            onChange={(e) => { setAsignShift(e.target.value) }}
                                        >
                                            <MenuItem value={1}>1</MenuItem>
                                            <MenuItem value={2}>2</MenuItem>
                                            <MenuItem value={3}>3</MenuItem>
                                            <MenuItem value={4}>4</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        }

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
                            loaderData();
                            setSelectedFromDate('');
                            setSelectedToDate('');
                            setError(false); //Validation
                            // setMachineMaxCapacity('') //Validation
                        }}
                    >
                        Cancel
                    </Button>
                    {
                        !isAddButton &&
                        <Button
                            size="large"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            Update
                        </Button>
                    }
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
export default connect(mapStateToProps, { addLoadSchedule, getLoadScheduleMachineList, editLoadSchedule, editCapacityMeasure })(AddScheduleModal);