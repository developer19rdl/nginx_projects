import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Divider from '@mui/material/Divider';
import {/* GetHeaderDropdown,*/ UpdateMachineHeaderData, GetMachineHeaderData, GetSlaveIdDropdown, GetHeaderSlaveIdDropdown, GetHeaderDropdown1, GetHeaderDropdown2, GetHeaderDropdown3 } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../Notification/NotificationBar';

export const HeaderSettingModal = (props) => {
    const { headerSettingOpen, setHeaderSettingOpen, machineId, setRefreshData, setHeaderRefreshData } = props;
    const [parameterList1, setParameterList1] = useState([])
    const [parameterList2, setParameterList2] = useState([])
    const [parameterList3, setParameterList3] = useState([])
    const [slaveIdList, setSlaveIdList] = useState([]);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        // headerSettingOpen && GetHeaderDropdown({ machineId: machineId, field: "selectall", }, handleGetSensorSuccess, handleGetSensorException)
        headerSettingOpen && GetMachineHeaderData({ machineId: machineId }, handleHeaderSuccess, handleHeaderException)
        headerSettingOpen && GetHeaderSlaveIdDropdown({ machineId: machineId }, handleSlaveIdSuccess, handleSlaveIdException)
    }, [headerSettingOpen])

    // SLAVE ID API HANDLER
    const handleSlaveIdSuccess = (dataObject) => {
        setSlaveIdList(dataObject?.data || []);

    }
    const handleSlaveIdException = () => { }

    // ONE
    const handleGetSensorSuccess1 = (dataObject) => {
        setParameterList1(dataObject?.data || [])
    }
    const handleGetSensorException1 = () => { }

    // TWO
    const handleGetSensorSuccess2 = (dataObject) => {
        setParameterList2(dataObject?.data || [])
    }
    const handleGetSensorException2 = () => { }

    // THREE
    const handleGetSensorSuccess3 = (dataObject) => {
        setParameterList3(dataObject?.data || [])
    }
    const handleGetSensorException3 = () => { }
    //////

    const handleHeaderSuccess = (dataObject) => {
        setDisplayLineOneName(dataObject?.data[0].Parameter1_labelname || '')
        setSelectedLineOneParameter(dataObject?.data[0].Parameter1 || '')
        setSetLineOneName(dataObject?.data[0].Parameter1_setname || '')
        setSetLineOneValue(dataObject?.data[0].Parameter1_setvalue || '')

        setDisplayLineTwoName(dataObject?.data[0].Parameter2_labelname || '')
        setSelectedLineTwoParameter(dataObject?.data[0].Parameter2 || '')
        setSetLinTwoName(dataObject?.data[0].Parameter2_setname || '')
        setSetLinTwoValue(dataObject?.data[0].Parameter2_setvalue || '')

        setDisplayLineThreeName(dataObject?.data[0].Parameter3_labelname || '')
        setSelectedLineThreeParameter(dataObject?.data[0].Parameter3 || '')

        setSelectedSlaveIdOne(dataObject?.data[0].parameterSlaveId1 || '')
        setSelectedSlaveIdTwo(dataObject?.data[0].parameterSlaveId2 || '')
        setSelectedSlaveIdThree(dataObject?.data[0].parameterSlaveId3 || '')

        // LINE ONE
        GetHeaderDropdown1({ machineId: machineId, field: dataObject?.data[0].parameterSlaveId1 || '', }, handleGetSensorSuccess1, handleGetSensorException1)
        GetHeaderDropdown2({ machineId: machineId, field: dataObject?.data[0].parameterSlaveId2 || '', }, handleGetSensorSuccess2, handleGetSensorException2)
        GetHeaderDropdown3({ machineId: machineId, field: dataObject?.data[0].parameterSlaveId3 || '', }, handleGetSensorSuccess3, handleGetSensorException3)
    }

    const handleHeaderException = () => { }


    const [displayLineOneName, setDisplayLineOneName] = useState('');
    const [selectedLineOneParameter, setSelectedLineOneParameter] = useState('');
    const [setLineOneName, setSetLineOneName] = useState('');
    const [setLineOneValue, setSetLineOneValue] = useState('');

    const [displayLineTwoName, setDisplayLineTwoName] = useState('');
    const [selectedLineTwoParameter, setSelectedLineTwoParameter] = useState('');
    const [setLinTwoName, setSetLinTwoName] = useState('');
    const [setLinTwoValue, setSetLinTwoValue] = useState('');

    const [displayLineThreeName, setDisplayLineThreeName] = useState('');
    const [selectedLineThreeParameter, setSelectedLineThreeParameter] = useState('');

    const [selectedSlaveIdOne, setSelectedSlaveIdOne] = useState('');
    const [selectedSlaveIdTwo, setSelectedSlaveIdTwo] = useState('');
    const [selectedSlaveIdThree, setSelectedSlaveIdThree] = useState('');

    const handleSubmitForm = () => {
        UpdateMachineHeaderData({
            machineId: machineId,
            Parameter1: selectedLineOneParameter,
            Parameter1_setvalue: setLineOneValue,
            Parameter1_labelname: displayLineOneName,
            Parameter1_setname: setLineOneName,
            parameterSlaveId1: selectedSlaveIdOne,
            Parameter2: selectedLineTwoParameter,
            Parameter2_setvalue: setLinTwoValue,
            Parameter2_labelname: displayLineTwoName,
            Parameter2_setname: setLinTwoName,
            parameterSlaveId2: selectedSlaveIdTwo,
            Parameter3: selectedLineThreeParameter,
            Parameter3_labelname: displayLineThreeName,
            parameterSlaveId3: selectedSlaveIdThree,
        }, handleUpdateSuccess, handleUpdateException)
    }

    const handleUpdateSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        // setRefreshData((oldvalue) => !oldvalue);
        setHeaderRefreshData((oldvalue) => !oldvalue)
        setTimeout(() => {
            handleClose();
            setHeaderSettingOpen(false)
        }, 3000);
    }
    const handleUpdateException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleClose();
        }, 3000);
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
            open={headerSettingOpen}
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="md"
        >
            {/* <DialogTitle id="alert-dialog-title">
                Header Filter
            </DialogTitle> */}
            <DialogContent>
                <Grid container spacing={2}>
                    {/* ===================TEMP==================== */}
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Display Name"
                            variant="outlined"
                            value={displayLineOneName}
                            onChange={(e) => setDisplayLineOneName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Slave Id</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedSlaveIdOne}
                                label="Slave Id"
                                onChange={(e) => {
                                    setSelectedSlaveIdOne(e.target.value)
                                    GetHeaderDropdown1({ machineId: machineId, field: e.target.value, }, handleGetSensorSuccess1, handleGetSensorException1)

                                }}
                            >
                                {slaveIdList.map((name) => (
                                    <MenuItem key={name.id} value={name.slaveId}>
                                        {name.slaveId}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Parameter</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedLineOneParameter}
                                label="Parameter"
                                onChange={(e) => setSelectedLineOneParameter(e.target.value)}
                            >
                                {parameterList1.map((name) => (
                                    <MenuItem key={name.Id} value={name.Id}>
                                        {name.Tag_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Set Name"
                            variant="outlined"
                            value={setLineOneName}
                            onChange={(e) => setSetLineOneName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Set Value"
                            variant="outlined"
                            value={setLineOneValue}
                            onChange={(e) => setSetLineOneValue(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Divider />
                    </Grid>

                    {/* ====================VIBRATION====================== */}
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Display Name"
                            variant="outlined"
                            value={displayLineTwoName}
                            onChange={(e) => setDisplayLineTwoName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Slave Id</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedSlaveIdTwo}
                                label="Slave Id"
                                onChange={(e) => {
                                    setSelectedSlaveIdTwo(e.target.value)
                                    GetHeaderDropdown2({ machineId: machineId, field: e.target.value, }, handleGetSensorSuccess2, handleGetSensorException2)

                                }}
                            >
                                {slaveIdList.map((name) => (
                                    <MenuItem key={name.id} value={name.slaveId}>
                                        {name.slaveId}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Parameter</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedLineTwoParameter}
                                label="Parameter"
                                onChange={(e) => setSelectedLineTwoParameter(e.target.value)}
                            >
                                {parameterList2.map((name) => (
                                    <MenuItem key={name.Id} value={name.Id}>
                                        {name.Tag_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Set Name"
                            variant="outlined"
                            value={setLinTwoName}
                            onChange={(e) => setSetLinTwoName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Set Value"
                            variant="outlined"
                            value={setLinTwoValue}
                            onChange={(e) => setSetLinTwoValue(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Divider />
                    </Grid>
                    {/* =======================ENERGY========================== */}
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <TextField
                            id="outlined-basic"
                            label="Display Name"
                            variant="outlined"
                            value={displayLineThreeName}
                            onChange={(e) => setDisplayLineThreeName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Slave Id</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedSlaveIdThree}
                                label="Slave Id"
                                onChange={(e) => {
                                    setSelectedSlaveIdThree(e.target.value)
                                    GetHeaderDropdown3({ machineId: machineId, field: e.target.value, }, handleGetSensorSuccess3, handleGetSensorException3)
                                }}
                            >
                                {slaveIdList.map((name) => (
                                    <MenuItem key={name.id} value={name.slaveId}>
                                        {name.slaveId}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Parameter</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedLineThreeParameter}
                                label="Parameter"
                                onChange={(e) => setSelectedLineThreeParameter(e.target.value)}
                            >
                                {parameterList3.map((name) => (
                                    <MenuItem key={name.Id} value={name.Id}>
                                        {name.Tag_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setHeaderSettingOpen(false)}>Close</Button>
                <Button onClick={handleSubmitForm}>
                    Update
                </Button>
            </DialogActions>
            <NotificationBar
                // handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    )
}
