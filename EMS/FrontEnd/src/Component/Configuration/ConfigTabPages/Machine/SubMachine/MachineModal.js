import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import NotificationBar from '../../../../../Utility/NotificationBar';
import { CapacityMeasureView, DepartmentList, DepartmentView, Machine, MachineUpdate, UnitAddView } from '../../../../../Services/NodeJsApiServices';
// import { addMachine, showCapacityMeasure, showDepartment, editMachine } from '../../../../../Actions';
// import NotificationBar from './NotificationBar';
// import { unitsShowDataService } from '../../../../APIservice';


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
    const [capacityMeasureType, setCapacityMeasureType] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [capacityMeasuringUnit, setCapacityMeasuringUnit] = useState('');
    const [selectedRadioValue, setSelectedRadioValue] = useState();
    const [selectedHealthRadioValue, setSelectedHealthRadioValue] = useState();
    const [rowId, setRowId] = useState('')
    const [departmentList,setdepartmentList]=useState([])
    const [capacityMeasureList,setcapacityMeasureList]=useState([])
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [unitList, setUnitList] = useState([]);
    const [machineImage, setMachineImage] = useState('')

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
                    // capMeasureTypeId: capacityMeasureType,
                    maxCapacity: maxCapacity,
                    measureUnitId: capacityMeasuringUnit,
                    isDashboardDisplay: selectedRadioValue,
                    isSensorHealth: Number(selectedHealthRadioValue),
                    machineImage: machineImage,
                },
                handleSuccess, handleException)
        } else {
            MachineUpdate({
                id: rowId,
                departmentId: department,
                machineName: machineName,
                machineTag: machineTag,
                // capMeasureTypeId: capacityMeasureType,
                maxCapacity: maxCapacity,
                measureUnitId: capacityMeasuringUnit,
                isDashboardDisplay: selectedRadioValue,
                isSensorHealth: Number(selectedHealthRadioValue),
                machineImage: machineImage,
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
        setCapacityMeasureType(configSetupData?.cap_measure_type_id || '')
        setMaxCapacity(configSetupData?.max_capacity || '')
        setCapacityMeasuringUnit(configSetupData?.measure_unit_id || '')
        setSelectedRadioValue(configSetupData?.is_dashboard_display || '')
        setSelectedHealthRadioValue(configSetupData?.isSensorHealth === 1 ? '1' : '0' || '')
        // setMachineImage(configSetupData?.machineImage || '')
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
        setSelectedRadioValue()
        setSelectedHealthRadioValue('0')
        setMachineImage('')
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
                <DialogTitle>
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

                        {}

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

                        {}

                        <Grid item xs={6}>
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
                                            control={<Radio required />}
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            value="false"
                                            control={<Radio />}
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
                                            control={<Radio required />}
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            value="0"
                                            control={<Radio />}
                                            label="No"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
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
