import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import {
    addMachine,
    showCapacityMeasure,
    showDepartment,
    editMachine,
    getSensorCategoryDropdownList,
    getSensorDetailsDropdownList,
    deploySensorAdd
} from '../../../../Actions';
import NotificationBar from './NotificationBar';
import { unitsShowDataService } from '../../../APIservice';
import Checkbox from '@mui/material/Checkbox';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { FetchDeviceCategoryService, FetchDeviceListService } from '../../../../Services/LoginPageService';


const sensorOutPut = [
    { id: 1, outPut: 'DIGITAL' },
    { id: 2, outPut: 'ANALOG' },
    { id: 3, outPut: 'MODBUS' },
    { id: 4, outPut: 'STD' },
]



const SensorDeployModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData, capacityMeasureList, departmentList, sensorCategoryDropdownList, sensorDropdownList } = props;
    // console.log("sensorCategoryDropdownList moel page redux", sensorCategoryDropdownList)

    // ----------
    const [sensorOutPutData, setSensorOutPutData] = useState('');

    const [isAlert, setIsAlert] = useState(false);





    const [sensorCategoryName, setSensorCategoryName] = useState('');
    const [sensorName, setSensorName] = useState('');
    const [sensorTag, setSensorTag] = useState('');

    const [sensorOutPutId, setSensorOutPutId] = useState('');
    const [sensorOutPutName, setSensorOutPutName] = useState('');
    // console.log("hdjashdjashdjaskhdkajsdhasdh", sensorOutPut)

    //DIGITAL STATES
    const [sensorType, setSensorType] = useState('');
    const [isCounter, setIsCounter] = useState(false);
    const [openingBalance, setOpeningBalance] = useState('');
    // console.log("isCounter", isCounter)
    const [isStates, setIsStates] = useState(false);
    // console.log("isStates", isStates)
    const [statesAlertType, setStatesAlertType] = useState('');
    const [statesAlertMessage, setStatesAlertMessage] = useState('');

    const [alertType, setAlertType] = useState('');
    const [checked, setChecked] = useState(false);
    const [criticalSensorAlert, setCriticalSensorAlert] = useState('');
    const [criticalMinValue, setCriticalMinValue] = useState('');
    const [criticalMaxValue, setCriticalMaxValue] = useState('');
    const [warningSensorAlert, setWarningSensorAlert] = useState('');
    const [warningMinValue, setWarningMinValue] = useState('');
    const [warningMaxValue, setWarningMaxValue] = useState('');
    const [outOfRangeSensorAlert, setOutOfRangeSensorAlert] = useState('');
    const [outOfRangeMinValue, setOutOfRangeMinValue] = useState('');
    const [outOfRangeMaxValue, setOutOfRangeMaxValue] = useState('');
    const [outPutType, setOutPutType] = useState('');

    // ---------

    const [id, setId] = useState('');
    const [department, setDepartment] = useState('');
    const [machineId, setMachineId] = useState('');
    const [machineName, setMachineName] = useState('');
    const [machineTag, setMachineTag] = useState('');
    const [capacityMeasureType, setCapacityMeasureType] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [capacityMeasuringUnit, setCapacityMeasuringUnit] = useState('');
    const [loadingTime, setLoadingTime] = useState('');
    const [UnloadingTime, setUnloadingTime] = useState('');
    const [maxProductionHour, setMaxProductionHour] = useState('');
    const [selectedRadioValue, setSelectedRadioValue] = useState('');
    const [rowId, setRowId] = useState('')
    const [categoryList, setCategoryList] = useState([]);
    const [selectedDeviceCategory, setSelectedDeviceCategory] = useState('');
    const [selectedDevice, setSelectedDevice] = useState('');

    const [deviceList, setDeviceList] = useState([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [unitList, setUnitList] = useState([]);

    useEffect(() => {
        loadCategory();
    }, []);

    const categoryHandleSuccess = (dataObject) => {
        setCategoryList(dataObject.data);
    };

    const loadCategory = () => {
        FetchDeviceCategoryService(categoryHandleSuccess, handleException);
        FetchDeviceListService(deviceHandleSuccess, handleException);

    };

    const deviceHandleSuccess = (dataObject) => {
        setDeviceList(dataObject.data);
    };

    useEffect(() => {
        open && props.getSensorCategoryDropdownList()
        // open && props.getSensorDetailsDropdownList()
        open && props.showDepartment()
        open && props.showCapacityMeasure()
        open && unitsShowDataService(handleUnitSuccess, handleUnitException);
        setOpen(open);
        loaderData();
    }, [configSetupData]);

    const handleUnitSuccess = (dataObject) => {
        setUnitList(dataObject?.data || []);
    };

    const handleUnitException = (errorObject) => {

    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            props.deploySensorAdd(
                {
                    sensorCategoryId: sensorCategoryName,
                    sensorName: sensorName,
                    sensorTag: sensorTag,
                    sensorOutput: sensorOutPutName,
                    sensorTypeSelected: sensorType,
                    isCounter: isCounter,
                    openBalanceValue: openingBalance,
                    isStatus: isStates,
                    statusAlertType: statesAlertType,
                    statusAlertMessage: statesAlertMessage,
                    OutputTypeValue: "",
                    units: "",
                    maxRatedReading: "",
                    maxRatedReadingChecked: "",
                    maxRatedReadingScale: "",
                    minRatedReading: "",
                    minRatedReadingChecked: "",
                    minRatedReadingScale: "",
                    criticalMinValue: "",
                    criticalMaxValue: "",
                    criticalAlertType: "",
                    criticalLowAlert: "",
                    criticalHighAlert: "",
                    warningMinValue: "",
                    warningMaxValue: "",
                    warningAlertType: "",
                    warningLowAlert: "",
                    warningHighAlert: "",
                    outofrangeMinValue: "",
                    outofrangeMaxValue: "",
                    outofrangeAlertType: "",
                    outofrangeLowAlert: "",
                    outofrangeHighAlert: "",
                    registerId: "",
                    registerType: "",
                    slaveId: "",
                    length: "",
                    isScaling: "",
                    MinValue: "",
                    MaxValue: "",
                    AlertType: "",
                    LowAlert: "",
                    HighAlert: ""
                },
                handleSuccess, handleException)
        } else {
            props.editMachine({
                id: rowId,
                departmentId: department,
                machineName: machineName,
                machineTag: machineTag,
                capMeasureTypeId: capacityMeasureType,
                maxCapacity: maxCapacity,
                measureUnitId: capacityMeasuringUnit,
                loadingTime: loadingTime, // Fixed format: HH:MM:SS
                unloadingTime: UnloadingTime, // Fixed format: HH:MM:SS
                maxProductionPerHour: maxProductionHour,
                isDashboardDisplay: selectedRadioValue
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
        setDepartment(configSetupData?.department_id || '')
        // setMachineId(configSetupData?.machineId || '')
        setMachineName(configSetupData?.machine_name || '')
        setMachineTag(configSetupData?.machine_tag || '')
        setCapacityMeasureType(configSetupData?.cap_measure_type_id || '')
        setMaxCapacity(configSetupData?.max_capacity || '')
        setCapacityMeasuringUnit(configSetupData?.measure_unit_id || '')
        setLoadingTime(configSetupData?.loading_time || '')
        setUnloadingTime(configSetupData?.unloading_time || '')
        setMaxProductionHour(configSetupData?.max_production_per_hour || '')
        setSelectedRadioValue(configSetupData?.is_dashboard_display || '')
    };


    const ClearData = () => {
        setOpen(false);
        setDepartment('')
        setMachineId('')
        setMachineName('')
        setMachineTag('')
        setCapacityMeasureType('')
        setMaxCapacity('')
        setCapacityMeasuringUnit('')
        setLoadingTime('')
        setUnloadingTime('')
        setMaxProductionHour('')
        setSelectedRadioValue('')
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleSensorTypeRadioChange = (event) => {
        setSensorType(event.target.value);
        console.log("handleSensorTypeRadioChange", event.target.value)
        if (event.target.value === "Counter") {
            setIsCounter(true);
            setIsStates(false)
        } else {
            setIsCounter(false);
            setIsStates(true)
        }
    };


    const handleOutPutTypeRadioChange = (event) => {
        setOutPutType(event.target.value);
    };

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setIsAlert(checked);
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
                                    {categoryList.map((data) => (
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
                                    value={selectedDevice}
                                    label="Device"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setSelectedDevice(e.target.value);
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
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Tag Name
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={capacityMeasureType}
                                    label="Parameter"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setCapacityMeasureType(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >

                                    <MenuItem >Tag Name</MenuItem>

                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Json Type
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={sensorOutPutData}
                                    label="Sensor Output"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setSensorOutPutData(e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {sensorOutPut.map((data) => (
                                        <MenuItem key={data.id} value={data.outPut}>{data.outPut}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

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

                        <Grid item xs={12}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={isAlert}
                                    onChange={handleCheckboxChange}
                                    name="ALERT"
                                    style={{ transform: 'scale(1.5)' }}
                                />
                                Alert
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
                            loaderData();
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

const mapStateToProps = ({ config, MachineParaAllocationReducer }) => {
    const { capacityMeasureList, departmentList } = config;
    const { sensorCategoryDropdownList, sensorDropdownList } = MachineParaAllocationReducer;
    return { capacityMeasureList, departmentList, sensorCategoryDropdownList, sensorDropdownList }
}
export default connect(mapStateToProps, { addMachine, showCapacityMeasure, showDepartment, editMachine, getSensorCategoryDropdownList, getSensorDetailsDropdownList, deploySensorAdd })(SensorDeployModal);