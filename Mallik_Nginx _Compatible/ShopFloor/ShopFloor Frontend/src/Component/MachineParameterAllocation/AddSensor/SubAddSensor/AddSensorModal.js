import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { connect } from 'react-redux';
// import { AddSensorAdd, AddSensorViewedit } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import { AddSensorAdd, AddSensorViewedit, AddSensorViewname } from '../../../../Services/NodeJsApiServices';
// import { addSensor, showCapacityMeasure, showDepartment, editSensor, getSensorCategory } from '../../../../Actions';
// import NotificationBar from './NotificationBar';

const sensorOutPut = [
    { id: 1, outPut: 'digital' },
    { id: 2, outPut: 'analog' },
    { id: 3, outPut: 'modbus' },
    { id: 4, outPut: 'other' },
]

const AddSensorModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData, sensorCategoryDropLoader } = props;

    const [sensorCategoryList, setSensorCategoryList] = useState('');
    const [sensorName, setSensorName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [modelNo, setModelNo] = useState('');
    const [sensorOutPutData, setSensorOutPutData] = useState('');
    const [sensorCategory, setsensorCategory] = useState([]);
    const [rowId, setRowId] = useState('')
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loaderData();
        open && AddSensorViewname(handelsensorview, handelexception)
    }, [configSetupData]);

    const handelsensorview = (dataObject) => {
        setsensorCategory(dataObject.data)
    }

    const handelexception = () => {

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            AddSensorAdd(
                {
                    sensorCategoryId: sensorCategoryList,
                    sensorName: sensorName,
                    manufacture: manufacturer,
                    modelNumber: modelNo,
                    sensorOutput: sensorOutPutData
                },
                handleSuccess, handleException)
        } else {
            AddSensorViewedit({
                id: rowId,
                sensorCategoryId: sensorCategoryList,
                sensorName: sensorName,
                manufacture: manufacturer,
                modelNumber: modelNo,
                sensorOutput: sensorOutPutData
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
        setSensorCategoryList(configSetupData?.sensorCategoryId || '')
        setSensorName(configSetupData?.sensorName || '')
        setManufacturer(configSetupData?.manufacture || '')
        setModelNo(configSetupData?.modelNumber || '')
        setSensorOutPutData(configSetupData?.sensorOutput || '')
    };


    const ClearData = () => {
        setOpen(false);
        setRowId('');
        setSensorCategoryList('');
        setSensorName('');
        setManufacturer('');
        setModelNo('');
        setSensorOutPutData('');
        setRefreshData(oldvalue => !oldvalue);
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
            maxWidth="lg"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{  color: '#000000', fontWeight: 'bold' }}>
                    {isAddButton ? 'Add Sensor' : 'Edit Sensor'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Sensor Category
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={sensorCategoryList}
                                    label="Sensor Category"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setSensorCategoryList(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {sensorCategory.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.sensorCategoryName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={sensorName}
                                id="outlined-basic"
                                label="Name of the sensor"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setSensorName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={manufacturer}
                                id="outlined-basic"
                                label="Manufacturer"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setManufacturer(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={modelNo}
                                id="outlined-basic"
                                label="Model Number"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setModelNo(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                    Sensor Output
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

const mapStateToProps = ({ config, MachineParaAllocationReducer }) => {
    const { capacityMeasureList, departmentList } = config;
    const { sensorCategoryDropLoader, sensorCategory } = MachineParaAllocationReducer;
    return { capacityMeasureList, departmentList, sensorCategoryDropLoader, sensorCategory }
}

export default AddSensorModal;