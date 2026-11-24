import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Checkbox, FormControl, Grid, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, TextField, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { GetChartData, GetSensorDropdown, UpdateSensorDropdown, UpdateGraphDisplayName, GetMachineHeaderData, GetSlaveIdDropdown, UpdateSlaveIdDropdown } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../Notification/NotificationBar';

export const GraphSettingModal = (props) => {
    const {
        graphSettingOpen,
        setGraphSettingOpen,
        selectedGraph,
        setSelectedDropdown,
        selectedGropdown,
        machineId,
        setChartData,
        setChartTwoData,
        setChartThreeData,
        selectedLast, setSelectedLast, selectedAggregation, setSelectedAggregation, selectedInterval, setSelectedInterval, setRefreshData,
        chartOneName, chartTwoName, chartThreeName,
        chartOneSlaveId, chartTwoSlaveId, chartThreeSlaveId, setHeaderRefreshData,
        setBackDropLoader
    } = props;
    const [selectedCheckBox, setSelectedCheckBox] = React.useState([]);
    const [defaultCheckbox, setDefaultCheckBox] = useState([]);
    const [sensorLists, setSensorLists] = useState([]);
    const [defaultList, setDefaultList] = useState([]);
    const [pageRefresher, setPageRefresher] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [slaveIdList, setSlaveIdList] = useState([]);
    const [selectedSlaveId, setSelectedSlaveId] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [tagDescription, setTagDescription] = useState('')

    useEffect(() => {
        const currentSlaveId = selectedGraph === "First" ? chartOneSlaveId
            : selectedGraph === "Second" ? chartTwoSlaveId
            : chartThreeSlaveId;

        setSelectedSlaveId(currentSlaveId || '');

        selectedGraph === "First" && GetSlaveIdDropdown({ machineId: machineId, chartNo: 1 }, handleSlaveIdSuccess, handleSlaveIdException)
        selectedGraph === "Second" && GetSlaveIdDropdown({ machineId: machineId, chartNo: 2 }, handleSlaveIdSuccess, handleSlaveIdException)
        selectedGraph === "Third" && GetSlaveIdDropdown({ machineId: machineId, chartNo: 3 }, handleSlaveIdSuccess, handleSlaveIdException)

        if (graphSettingOpen && currentSlaveId) {
            selectedGraph === "First" && GetSensorDropdown({ machineId: machineId, field: "default", chartNo: 1, slaveId: currentSlaveId }, handleGetSensorSuccess, handleGetSensorException)
            selectedGraph === "Second" && GetSensorDropdown({ machineId: machineId, field: "default", chartNo: 2, slaveId: currentSlaveId }, handleGetSensorSuccess, handleGetSensorException)
            selectedGraph === "Third" && GetSensorDropdown({ machineId: machineId, field: "default", chartNo: 3, slaveId: currentSlaveId }, handleGetSensorSuccess, handleGetSensorException)
        }
        loderData();
    }, [graphSettingOpen, pageRefresher, chartOneSlaveId, chartTwoSlaveId, chartThreeSlaveId])

    // SLAVE ID API HANDLER
    const handleSlaveIdSuccess = (dataObject) => {
        setSlaveIdList(dataObject?.data || []);
    }
    const handleSlaveIdException = () => { }

    const loderData = () => {
        if (selectedGraph === "First") {
            setDisplayName(chartOneName)
        } else if (selectedGraph === "Second") {
            setDisplayName(chartTwoName)
        } else {
            setDisplayName(chartThreeName)
        }
    }

    const handleGetSensorSuccess = (dataObject) => {
        const data = dataObject?.data || [];
        setTagDescription(dataObject?.tagDescription || '')
        setDefaultList(data)
        setSensorLists(data.map((item) => item.Tag_name));
        setDefaultCheckBox(data.filter(item => item.isDefault === 1).map(item => item.Tag_name));
    }
    const handleGetSensorException = () => { }

    const handleChangeDefault = (event) => {
        setBackDropLoader(true)
        setSelectedDropdown('default')
        const {
            target: { value },
        } = event;

        // Splitting the value if it's a string, otherwise, using it directly
        const selectedValues = typeof value === 'string' ? value.split(',') : value;
        // Extracting IDs from the selected values
        const selectedIds = selectedValues.map(val => {
            const selectedTag = defaultList.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        setDefaultCheckBox(
            typeof value === 'string' ? value.split(',') : value,
        );

        // UPDATE FIRST GRAPH
        selectedGraph === "First" && UpdateSensorDropdown({
            machineId: machineId,
            field: "default",
            selected: typeof value === 'string' ? value.split(',') : value,
            tagId: selectedIds,
            chartNo: 1,
            slaveId: selectedSlaveId
        }, handleDefaultUpdateSuccess, handleDefaultUpdateException)

        // UPDATE SECOND GRAPH
        selectedGraph === "Second" && UpdateSensorDropdown({
            machineId: machineId,
            field: "default",
            selected: typeof value === 'string' ? value.split(',') : value,
            tagId: selectedIds,
            chartNo: 2,
            slaveId: selectedSlaveId
        }, handleDefaultUpdateSuccess, handleDefaultUpdateException)

        // UPDATE THIRD GRAPH
        selectedGraph === "Third" && UpdateSensorDropdown({
            machineId: machineId,
            field: "default",
            selected: typeof value === 'string' ? value.split(',') : value,
            tagId: selectedIds,
            chartNo: 3,
            slaveId: selectedSlaveId
        }, handleDefaultUpdateSuccess, handleDefaultUpdateException)

    };

    const handleDefaultUpdateSuccess = () => {
        setBackDropLoader(false)
        setPageRefresher((oldvalue) => !oldvalue)

        // GRAPH API
        GetChartData({
            machineId: machineId,
            selected: "default",
            aggregation: selectedAggregation,
            interval: selectedInterval,
            sortDataType: selectedLast,
            tagIds: [],
            chartNo: selectedGraph === "First" ? 1 : selectedGraph === "Second" ? 2 : 3,
            slaveId: selectedSlaveId
        }, handleGetChartDataSuccess, handleGetChartDataException)
    }
    const handleDefaultUpdateException = () => { }

    // GRAPH SUCCESS HANDLER
    const handleGetChartDataSuccess = (dataObject) => {
        selectedGraph === "First" && setChartData(dataObject || [])
        selectedGraph === "Second" && setChartTwoData(dataObject || [])
        selectedGraph === "Third" && setChartThreeData(dataObject || [])
    }
    const handleGetChartDataException = () => { }

    // DISPLAY UPDATE
    const handleUpdateClick = () => {
        setBackDropLoader(true)
        selectedGraph === "First" && UpdateGraphDisplayName({ chartNumber: "1", displayName: displayName, machineId: machineId }, handleDisplayUpdateSuccess, handleDisplayUpdateException)
        selectedGraph === "Second" && UpdateGraphDisplayName({ chartNumber: "2", displayName: displayName, machineId: machineId }, handleDisplayUpdateSuccess, handleDisplayUpdateException)
        selectedGraph === "Third" && UpdateGraphDisplayName({ chartNumber: "3", displayName: displayName, machineId: machineId }, handleDisplayUpdateSuccess, handleDisplayUpdateException)
    }

    const handleDisplayUpdateSuccess = (dataObject) => {
        setBackDropLoader(false)
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        // setRefreshData((oldvalue) => !oldvalue);
        setHeaderRefreshData((oldvalue) => !oldvalue)
        setDisplayName('')
        setTimeout(() => {
            handleClose();
        }, 3000);
    }
    const handleDisplayUpdateException = (errorObject, errorMessage) => {
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

    const handleChange = (e) => {
        setBackDropLoader(true)
        const newSlaveId = e.target.value;
        setSelectedSlaveId(newSlaveId);
        const chartNo = selectedGraph === "First" ? 1 : selectedGraph === "Second" ? 2 : 3;
        selectedGraph === "First" && UpdateSlaveIdDropdown({ machineId: machineId, chartNumber: 1, slaveId: newSlaveId }, () => handleUpdateSlaveIdSuccess(newSlaveId, chartNo), handleUpdateSlaveIdException)
        selectedGraph === "Second" && UpdateSlaveIdDropdown({ machineId: machineId, chartNumber: 2, slaveId: newSlaveId }, () => handleUpdateSlaveIdSuccess(newSlaveId, chartNo), handleUpdateSlaveIdException)
        selectedGraph === "Third" && UpdateSlaveIdDropdown({ machineId: machineId, chartNumber: 3, slaveId: newSlaveId }, () => handleUpdateSlaveIdSuccess(newSlaveId, chartNo), handleUpdateSlaveIdException)
    };

    const handleUpdateSlaveIdSuccess = (newSlaveId, chartNo) => {
        setHeaderRefreshData((oldvalue) => !oldvalue)
        setBackDropLoader(false)
        GetSensorDropdown({ machineId: machineId, field: "default", chartNo, slaveId: newSlaveId }, handleGetSensorSuccess, handleGetSensorException)
    }
    const handleUpdateSlaveIdException = () => { }


    return (
        <Dialog
            open={graphSettingOpen}
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="sm"
        >
            {/* <DialogTitle id="alert-dialog-title">
                Header Filter
            </DialogTitle> */}
            <DialogContent>
                <Grid container spacing={2}>

                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Slave Id</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedSlaveId}
                                label="Slave Id"
                                onChange={(e) => handleChange(e)}
                            >
                                {slaveIdList.map((name) => (
                                    <MenuItem key={name.id} value={name.slaveId}>
                                        {name.slaveId}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <TextField fullWidth id="outlined-basic" label="Tag Description" InputLabelProps={{ shrink: true }} variant="outlined" value={tagDescription} />
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-multiple-checkbox-label">Default Sensor</InputLabel>
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={defaultCheckbox}
                                onChange={handleChangeDefault}
                                input={<OutlinedInput label="Default Sensor" />}
                                renderValue={(selected) => selected.join(', ')}
                            // MenuProps={MenuProps}
                            >
                                {sensorLists.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={defaultCheckbox.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Display Name"
                            variant="outlined"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            inputProps={{ maxLength: 20 }}
                        />
                        <Typography style={{ fontSize: '13px', color: '#686D76' }}>Max allowed character length 20</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button variant="contained" onClick={handleUpdateClick} style={{ marginTop: '-12px', backgroundColor: '#212529' }}>Update</Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setGraphSettingOpen(false)}>Close</Button>
                {/* <Button>
                    Agree
                </Button> */}
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
