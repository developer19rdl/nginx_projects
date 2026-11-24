import {
    Button, Grid, Checkbox, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { connect } from 'react-redux';
import { addMachine, showCapacityMeasure, showDepartment, editMachine } from '../../../../Actions';
import NotificationBar from './NotificationBar';
import { unitsShowDataService } from '../../../APIservice';
import { FetchDeviceCategoryService } from '../../../../Services/LoginPageService';
// import  from '@mui/material/Checkbox';

const parameterList = [
    { id: 1, parameter: 'Parameter1' },
    { id: 2, parameter: 'Parameter2' },
    { id: 3, parameter: 'Parameter3' },
]

const MachineParameterModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData, capacityMeasureList, departmentList } = props;

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
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [unitList, setUnitList] = useState([]);


    //radio checker
    const [modbusRadioSelector, setModeBusRadioSelector] = useState('');
    const [type, setType] = useState('');
    ///////////////
    const [slaveId, setSlaveId] = useState('');
    const [length, setLength] = useState('');
    const [register, setRegister] = useState('');

    const [statusData, setStatusData] = useState('');
    const [counter, setCounter] = useState('');
    const [jsonKeyTagId, setJsonKeyTagId] = useState('');
    const [categoryList, setCategoryList] = useState([]);

    const [selectedDeviceCategory, setSelectedDeviceCategory] = useState('');

    const [functionName, setFunctionName] = useState([]);


    const [selectedBinaryRadioValue, setSelectedBinaryRadioValue] = useState('')

    const [isProdCapacity, setIsProdCapacity] = useState(false);



    console.log(`Selected Radio is ${type} selectedBinaryRadioValue is ${selectedBinaryRadioValue}`)
    useEffect(() => {
        loadCategory();
    }, []);

    const categoryHandleSuccess = (dataObject) => {
        setCategoryList(dataObject.data);
    };

    const loadCategory = () => {
        FetchDeviceCategoryService(categoryHandleSuccess, handleException);
    };


    useEffect(() => {
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
            props.addMachine(
                {
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

    const handleRadioChange = (event) => {
        setModeBusRadioSelector(event.target.value);
        setSlaveId('');
        setLength('');
        setRegister('');
    };



    const handleTypeSelectChange = (event) => {
        setType(event.target.value);
        setSelectedBinaryRadioValue("")
    };

    //
    const handleStatusDataRadioChange = (event) => {
        setStatusData(event.target.value);
    };

    const handleCounterDataRadioChange = (event) => {
        setCounter(event.target.value);
    };
    //
    const handleRadioChangeApiValue = (event) => {
        setSelectedBinaryRadioValue(event.target.value)
    }


    const [keyValuePairs, setKeyValuePairs] = useState([]);

    const handleAddKeyValuePair = () => {
        setKeyValuePairs([...keyValuePairs, { keyName: '', valueName: '' }]);
        console.log('keyValuePairs', keyValuePairs);
    };

    const handleInputChange = (index, field, value) => {
        const updatedKeyValuePairs = [...keyValuePairs];
        updatedKeyValuePairs[index][field] = value;
        setKeyValuePairs(updatedKeyValuePairs);
        console.log('updatedKeyValuePairs', updatedKeyValuePairs);
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
                                    value={department}
                                    label="Machine"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setDepartment(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                    required
                                >
                                    {departmentList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.departmentName}</MenuItem>
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
                                    value={department}
                                    label=" Device"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setDepartment(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {departmentList.map((data) => (
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
                                    {parameterList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.parameter}</MenuItem>
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

const mapStateToProps = ({ config }) => {
    const { capacityMeasureList, departmentList } = config;
    return { capacityMeasureList, departmentList }
}
export default connect(mapStateToProps, { addMachine, showCapacityMeasure, showDepartment, editMachine })(MachineParameterModal);
