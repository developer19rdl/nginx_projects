import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
    Checkbox,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import NotificationBar from '../../../../../Utility/NotificationBar';
import { CapacityMeasureView, DepartmentList, DepartmentView, Machine, MachineUpdate, UnitAddView } from '../../../../../Services/NodeJsApiServices';
import Configuration from '../../../Configuration';

const assetTypeList = [
    { id: 1, department: 'One' },
    { id: 2, department: 'Two' },
    { id: 3, department: 'Three' },
]

const MachineModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData,  } = props;

    const [id, setId] = useState('');
    const [department, setDepartment] = useState('');
    const [machineId, setMachineId] = useState('');
    const [machineName, setMachineName] = useState('');
    const [machineTag, setMachineTag] = useState('');
    const [dateOfInstall, setDateOfInstall] = useState('');
    const [capacityMeasureType, setCapacityMeasureType] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [machineHourRatePerShift, setMachineHourRatePerShift] = useState('');
    const [capacityMeasuringUnit, setCapacityMeasuringUnit] = useState('');
    const [loadingTime, setLoadingTime] = useState('');
    const [UnloadingTime, setUnloadingTime] = useState('');
    const [maxProductionHour, setMaxProductionHour] = useState('');
      
    const [operatorCost, setOperatorCost] = useState('');
    const [helperCost, setHelperCost] = useState('');
    
        const [selectedRadioValue, setSelectedRadioValue] = useState();
    const [hmiRadioValue, sethmiRadioValue] = useState();

    const [selectedHealthRadioValue, setSelectedHealthRadioValue] = useState();
    const [Productionenergy, setProductionEnergy] = useState(false);
    const [productionCount, setProductionCount] = useState(false);
    const [rowId, setRowId] = useState('')
    const [departmentList,setdepartmentList]=useState([])
    const [capacityMeasureList,setcapacityMeasureList]=useState([])
    const [powerconsumtion, setPowerConsumtion] = useState('')
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [unitList, setUnitList] = useState([]);
    const [machineImage, setMachineImage] = useState('');
    const [productionCycleTime, setProductionCycleTime] = useState('')
    const [ idleTimeConsideration   , setIdleTimeConsideration] = useState('')


    useEffect(() => {
        // open && DepartmentView(handeldepartment,handeldepexception)
        open && DepartmentList(handeldepartment,handeldepexception)
        open &&  CapacityMeasureView(handelcapacityMesure,handelexceptionCapacity)
        open && UnitAddView(handleUnitSuccess, handleUnitException);
        setOpen(open);
        loaderData();
    }, [configSetupData]);

    const handelcapacityMesure=(dataObject)=>{
        setcapacityMeasureList(dataObject.data)
    }

    const handelexceptionCapacity=()=>{
    }

    const handeldepartment=(dataObject)=>{
        setdepartmentList(dataObject.data)
    }

    const handeldepexception=()=>{  
    }

    const handleUnitSuccess = (dataObject) => {
        setUnitList(dataObject?.data || []);
    };

    const handleUnitException = (errorObject) => {

    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            Machine(
                {
                    departmentId: department,
                    machineName: machineName,
                    machineTag: machineTag,
                    dateOfInstall:dateOfInstall,
                    capMeasureTypeId: capacityMeasureType,
                    maxCapacity: maxCapacity,
                    measureUnitId: capacityMeasuringUnit,
                    loadingTime: loadingTime, // Fixed format: HH:MM:SS
                    unloadingTime: UnloadingTime, // Fixed format: HH:MM:SS
                    maxProductionPerHour: maxProductionHour,
                    helperCost: helperCost,
                    operatorCost:operatorCost,
                    isDashboardDisplay: selectedRadioValue,
                    isSensorHealth: Number(selectedHealthRadioValue),
                    isHmiModule: Number(hmiRadioValue),
                    idleTimeProdCnt: productionCount,
                    idleTimeEnergyCnt: Productionenergy,
                    idlePowerTresh: powerconsumtion,
                    machineImage: machineImage,
                    prodCycleTime: productionCycleTime,
                    idleTimeConsideration:idleTimeConsideration,
                    machineHrRate :machineHourRatePerShift
                },
                handleSuccess, handleException)
        } else {
            MachineUpdate({
                id: rowId,
                departmentId: department,
                machineName: machineName,
                machineTag: machineTag,
                dateOfInstall:dateOfInstall,
                capMeasureTypeId: capacityMeasureType,
                maxCapacity: maxCapacity,
                measureUnitId: capacityMeasuringUnit,
                loadingTime: loadingTime, // Fixed format: HH:MM:SS
                unloadingTime: UnloadingTime, // Fixed format: HH:MM:SS
                maxProductionPerHour: maxProductionHour,

                helperCost: helperCost,
                operatorCost:operatorCost,
                isDashboardDisplay: selectedRadioValue,
                isSensorHealth: Number(selectedHealthRadioValue),
                isHmiModule: Number(hmiRadioValue),
                idleTimeProdCnt: productionCount,
                idleTimeEnergyCnt: Productionenergy,
                idlePowerTresh: powerconsumtion,
                machineImage: machineImage,
                prodCycleTime: productionCycleTime,
                idleTimeConsideration:idleTimeConsideration,
                machineHrRate :machineHourRatePerShift
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
            // ClearData();
            handleClose();
        }, 2000);
    };

    const loaderData = () => {
        setRowId(configSetupData?.id || '')
        setDepartment(configSetupData?.department_id || '')
        // setMachineId(configSetupData?.machineId || '')
        setMachineName(configSetupData?.machine_name || '')
        setMachineTag(configSetupData?.machine_tag || '')
        // setDateOfInstall(configSetupData?.dateOfInstall || '')

         // ⭐ FIX FOR DATE
        if (configSetupData?.dateOfInstall) {
            const formattedDate = new Date(configSetupData.dateOfInstall)
                    .toISOString()
                .split('T')[0];   // <-- VERY IMPORTANT

            setDateOfInstall(formattedDate);
        } else {
            setDateOfInstall('');
        }

        setCapacityMeasureType(configSetupData?.cap_measure_type_id || '')
        setMaxCapacity(configSetupData?.max_capacity || '')
        setCapacityMeasuringUnit(configSetupData?.measure_unit_id || '')
        setLoadingTime(configSetupData?.loading_time || '')
        setUnloadingTime(configSetupData?.unloading_time || '')
        setMaxProductionHour(configSetupData?.max_production_per_hour || '')

        setOperatorCost(configSetupData?.operatorCost ||'');
        setHelperCost(configSetupData?.helperCost ||'');

        setSelectedRadioValue(configSetupData?.is_dashboard_display || '')
        setSelectedHealthRadioValue(configSetupData?.isSensorHealth === 1 ? '1' : '0' || '')
        sethmiRadioValue(configSetupData?.isHmiModule === 1 ? '1' : '0' || '')

        // isHmiModule: Number(hmiRadioValue),
        setProductionCount(configSetupData?.idleTimeProdCnt || '')
        setProductionEnergy(configSetupData?.idleTimeEnergyCnt || '')
        setPowerConsumtion(configSetupData?.idlePowerTresh || '')
        // setMachineImage(configSetupData?.machineImage || '')
        setProductionCycleTime(configSetupData?.cycleTime || '')
        setIdleTimeConsideration(configSetupData?.idleTimeConsideration || '')
        setMachineHourRatePerShift(configSetupData?.machineHrRate || '')
        
    };


    const ClearData = () => {
        setOpen(false);
        setDepartment('')
        setMachineId('')
        setMachineName('')
        setMachineTag('')
        setDateOfInstall('')
        setCapacityMeasureType('')
        setMaxCapacity('')
        setCapacityMeasuringUnit('')
        setLoadingTime('')
        setUnloadingTime('')
        setMaxProductionHour('')
        setOperatorCost('');
        setHelperCost('');
        setSelectedRadioValue('')
        setSelectedHealthRadioValue('0')
        sethmiRadioValue('0')
        setProductionCount(false)
        setProductionEnergy(false)
        setPowerConsumtion('')
        setMachineImage('')
        setProductionCycleTime('')
        setIdleTimeConsideration('')
        setMachineHourRatePerShift('')
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
        // setSelectedRadioValue(event.target.value);
        if (event.target.value === 'true') {
            setSelectedRadioValue("true")
        } else {
            setSelectedRadioValue("false")
        }
    };

    const handleHmiRadioChange = (event) => {
        // setSelectedRadioValue(event.target.value);
        if (event.target.value === '1') {
            sethmiRadioValue(1)
        } else {
            sethmiRadioValue(0)
        }
    };
    const handleCheckboxChange = (e) => {
        setProductionEnergy(e.target.checked)
    };
    const clickProductChange = (e) => {
        setProductionCount(e.target.checked)
    };

    const handleHealthRadioChange = (event) => {
        if (event.target.value === '1') {
            setSelectedHealthRadioValue(1)
        } else {
            setSelectedHealthRadioValue(0)
        }
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        // Check if the selected file meets the dimensions criteria (225x225)
        if (selectedFile) {
            const img = new Image();
            img.src = URL.createObjectURL(selectedFile);

            img.onload = () => {
                // if (img.width === 225 && img.height === 225) {
                // setFile(selectedFile);

                // Convert the selected file to base64
                const reader = new FileReader();

                reader.onloadend = () => {
                    setMachineImage(reader.result);
                    console.log(reader.result);
                };

                reader.readAsDataURL(selectedFile);
                // } else {
                //     // Display an error message or handle accordingly
                //     alert('Please upload an image with dimensions 225x225.');
                // }
            };
        }
    };

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle  sx={{ color: '#000000', fontWeight: 'bold' }}>
                    {isAddButton ? 'Add' : 'Update'} Machine
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Department
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={department}
                                    label="Department"
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
                                        // <MenuItem key={data.id} value={data.id}>{data.Department}</MenuItem> 
                                        <MenuItem key={data.id} value={data.id}>{data.departmentName}</MenuItem> 
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* <Grid item xs={6}>
                            <TextField
                                value={machineId}
                                // margin="dense"
                                id="outlined-basic"
                                label="Machine ID"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setMachineId(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid> */}

                        <Grid item xs={6}>
                            <TextField
                                value={machineName}
                                id="outlined-basic"
                                label="Machine Name"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setMachineName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={machineTag}
                                id="outlined-basic"
                                label="Machine Tag"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setMachineTag(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                         <Grid item xs={6}>
                            <TextField
                             type='date'
                                value={dateOfInstall}
                                id="outlined-basic"
                                label="Date of Installation"
                                variant="outlined"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => { setDateOfInstall(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Production Type
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={capacityMeasureType}
                                    label="Production Type"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setCapacityMeasureType(e.target.value);
                                    }}
                                // required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {capacityMeasureList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.capacityMeasureType}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={maxCapacity}
                                type='number'
                                id="outlined-basic"
                                label="Max Capacity"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setMaxCapacity(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={machineHourRatePerShift}
                                type='number'
                                id="outlined-basic"
                                label="Machine Hour Rate / Shift"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setMachineHourRatePerShift(e.target.value); }}
                                autoComplete="off"
                                // required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth >
                                <InputLabel id="demo-simple-select-label">
                                    Capacity Measuring Unit
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={capacityMeasuringUnit}
                                    label="Capacity Measuring Unit"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setCapacityMeasuringUnit(e.target.value);
                                    }}
                                // required
                                >
                                    {unitList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.unitName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={loadingTime}
                                type='number'
                                id="outlined-basic"
                                label="Loading Time Seconds"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setLoadingTime(e.target.value); }}
                                autoComplete="off"

                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={UnloadingTime}
                                type='number'
                                id="outlined-basic"
                                label="Unloading Time Seconds"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setUnloadingTime(e.target.value); }}
                                autoComplete="off"

                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={productionCycleTime}
                                type='number'
                                id="outlined-basic"
                                label="Production Cycle Time"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setProductionCycleTime(e.target.value); }}
                                autoComplete="off"

                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={maxProductionHour}
                                type='number'
                                id="outlined-basic"
                                label="Max Production Per Hour"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setMaxProductionHour(e.target.value); }}
                                autoComplete="off"
                                // required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={operatorCost}
                                type='number'
                                id="outlined-basic"
                                label="Operator Cost"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setOperatorCost(e.target.value); }}
                                autoComplete="off"
                                // required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={helperCost}
                                type='number'
                                id="outlined-basic"
                                label="Helper Cost"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => {setHelperCost(e.target.value); }}
                                autoComplete="off"
                                // required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                type="file"
                                id="outlined-basic"
                                variant="outlined"
                                fullWidth
                                onChange={handleFileChange}
                                autoComplete="off"
                                // InputProps={{
                                //     inputProps: {
                                //         // accept: 'image/*',
                                //         accept: '.png', // Restrict to PNG images
                                //     },
                                // }}
                            />
                        </Grid>
                        <Grid container justifyContent="space-between" alignItems="center" marginTop={1.5}>
                            <Grid item lg={6} md={6} container justifyContent="flex-start">
                                <Typography style={{ marginLeft: '30px' }}>Dashboard Display</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0px' }}>
                                    <RadioGroup
                                        aria-label="options"
                                        name="options"
                                        value={selectedRadioValue}
                                        onChange={handleRadioChange}
                                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                    >
                                        <FormControlLabel
                                            value="true"
                                            control={<Radio  
                                                sx={{
                                                    color: '#686D76', // unselected color
                                                    '&.Mui-checked': {
                                                        color: '#000000', // selected color
                                                    }
                                                }}
                            
                                            />}
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            value="false"
                                            control={<Radio 
                                                sx={{
                                                    color: '#686D76', // unselected color
                                                    '&.Mui-checked': {
                                                        color: '#000000', // selected color
                                                    }
                                                }}
                            
                                            />}
                                            label="No"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent="space-between" alignItems="center" marginTop={1.5}>
                            <Grid item lg={6} md={6} container justifyContent="flex-start">
                                <Typography style={{ marginLeft: '30px' }}>Health Dashboard Display</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0px' }}>
                                    <RadioGroup
                                        aria-label="options"
                                        name="options"
                                        value={selectedHealthRadioValue}
                                        onChange={handleHealthRadioChange}
                                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                    >
                                        <FormControlLabel
                                            value="1"
                                            control={<Radio required 
                                                sx={{
                                                    color: '#686D76', // unselected color
                                                    '&.Mui-checked': {
                                                        color: '#000000', // selected color
                                                    }
                                                }}
                            
                                            />}
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            value="0"
                                            control={<Radio 
                                                sx={{
                                                    color: '#686D76', // unselected color
                                                    '&.Mui-checked': {
                                                        color: '#000000', // selected color
                                                    }
                                                }}
                            
                                            />}
                                            label="No"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent="space-between" alignItems="center" marginTop={1.5}>
                            <Grid item lg={6} md={6} container justifyContent="flex-start">
                                <Typography style={{ marginLeft: '30px' }}>HMI MODULE</Typography>
                            </Grid>
                            <Grid item lg={6} md={6} container justifyContent="center">
                                <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0px' }}>
                                    <RadioGroup
                                        aria-label="options"
                                        name="options"
                                        value={hmiRadioValue}
                                        onChange={handleHmiRadioChange}
                                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                    >
                                        <FormControlLabel
                                            value="1"
                                            control={<Radio required 
                                                sx={{
                                                    color: '#686D76', // unselected color
                                                    '&.Mui-checked': {
                                                        color: '#000000', // selected color
                                                    }
                                                }}
                            
                                            />}
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            value="0"
                                            control={<Radio 
                                                sx={{
                                                    color: '#686D76', // unselected color
                                                    '&.Mui-checked': {
                                                        color: '#000000', // selected color
                                                    }
                                                }}
                            
                                            />}
                                            label="No"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={productionCount}
                                    onChange={clickProductChange}
                                    name="ALERT"
                                // style={{ transform: 'scale(1.5)' }}
                                />
                                Idle time detection based production count
                            </label>
                        </Grid>
                        <Grid item xs={12}>
                            <label style={{ fontSize: '1.2rem' }}>
                                <Checkbox
                                    checked={Productionenergy}
                                    onChange={handleCheckboxChange}
                                    name="ALERT"
                                // style={{ transform: 'scale(1.5)' }}
                                />
                                Idle time detection based Energy[kw]
                            </label>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={idleTimeConsideration}
                                type='number'
                                id="outlined-basic"
                                label="Idle Time Consideration "
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setIdleTimeConsideration(e.target.value); }}
                                autoComplete="off"
                            />
                        </Grid>

                
                    </Grid>
                    {Productionenergy && <Grid item xs={12}>
                        <TextField
                            value={powerconsumtion}
                            type='text'
                            id="outlined-basic"
                            label="Machine idle power Consumtion"
                            variant="outlined"
                            fullWidth
                            onChange={(e) => { setPowerConsumtion(e.target.value); }}
                            autoComplete="off"
                        />
                    </Grid>}

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


export default MachineModal;