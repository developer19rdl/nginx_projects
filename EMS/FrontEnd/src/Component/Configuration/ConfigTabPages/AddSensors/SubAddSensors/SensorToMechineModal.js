import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
//   import { AssetAddService, AssetEditService, AssetTypeFetchService } from '../../../../services/LoginPageService';
// import { AddVendorValidate } from '../../../../validation/locationValidation';
//   import NotificationBar from '../../../notification/ServiceNotificationBar';
/* eslint-disable-next-line */

const SensorToMachineModal = ({
    secondDailogOpen, setSecondDailogOpen, configSetupData, setRefreshData, handleClose, openNotification, setNotification
}) => {
    const [id, setId] = useState('');
    const [sensorClassModule, setSensorClassModule] = useState('');
    const [selectMachines, setSelectMachines] = useState('');

    // AccessPoint inputs
    // const [assetName, setAssetName] = useState('');
    // const [assetType, setAssetType] = useState('');
    // const [areaName, setAreaName] = useState('');


    // FTP inputs
    // const [motorDetails, setMotorDetails] = useState('');
    // const [rpsv, setRpsv] = useState('');
    // const [ratedCurrent, setRatedCurrent] = useState('');
    // const [motorTypeVariableSpeed, setMotorTypeVariableSpeed] = useState('');
    // const [lineFrequency, setLineFrequency] = useState('');
    // const [efficiency, setEfficiency] = useState('');

    // const [assetTypeId, setAssetTypeId] = useState('');
    // const [assetTypeList, setAssetTypeList] = useState([]);



    useEffect(() => {
        setSecondDailogOpen(secondDailogOpen);
        loadData();
        // AssetTypeFetchService(categoryHandleSuccess, handleAssetTypeException);
    }, [configSetupData]);

    // useEffect(() => {
    //   AssetTypeFetchService(categoryHandleSuccess, handleAssetTypeException);
    // }, []);


    const categoryHandleSuccess = (dataObject) => {
        // setAssetTypeList(dataObject.data);
        // console.log(dataObject.data);
    };
    const handleAssetTypeException = (dataObject) => {

    };


    const loadData = () => {
        setSensorClassModule(configSetupData.id || '')
        setSelectMachines(configSetupData.toolName || '')

        // setId(configSetupData.id || '');

        // setAssetName(configSetupData.assetName || '');
        // setAssetType(configSetupData.assetType || '');
        // setAreaName(configSetupData.areaName || '');

        // setMotorDetails(configSetupData.motorDetails || '');
        // setRpsv(configSetupData.rpsv || '');
        // setRatedCurrent(configSetupData.ratedCurrent || '');
        // setMotorTypeVariableSpeed(configSetupData.motorTypeVariableSpeed || '');
        // setLineFrequency(configSetupData.lineFrequency || '');
        // setEfficiency(configSetupData.efficiency || '');

        // if (Array.isArray(configSetupData)) {
        //   setAssetTypeList(configSetupData);
        // } else {
        //   setAssetTypeList([]);
        // }

        // setAssetTypeId(configSetupData.assetTypeId || '');

    };


    const clearForm = () => {
        setSensorClassModule('')
        setSelectMachines('')

        // setId('');

        // setAssetName('');
        // setAssetType('');
        // setAreaName('');

        // setMotorDetails('');
        // setRpsv('');
        // setRatedCurrent('');
        // setMotorTypeVariableSpeed('');
        // setLineFrequency('');
        // setEfficiency('');
        // setAssetTypeId('');

    }

    /* eslint-disable-next-line */
    // const validateForNullValue = (value, type) => {
    //   AddVendorValidate(value, type, setErrorObject);
    // };

    const handleAddSuccess = (dataObject) => {
        clearForm();
        handleSuccess(dataObject);
    }

    const handleUpdateSuccess = (dataObject) => {
        handleSuccess(dataObject);
        setTimeout(() => {
            setSecondDailogOpen(false);
        }, 3000);
    }

    const handleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefreshData((oldvalue) => !oldvalue);
    };

    /* eslint-disable-next-line */
    const handleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    };


    //     }, handleAddSuccess, handleException);
    //   } else {
    //     await AssetEditService({
    //       /* eslint-disable-next-line */
    //       id, assetName, assetType: assetTypeId, areaName,
    //       // assetNameSecondary,assetTypeSecondary, areaNameSecondary, 
    //       motorDetails, rpsv, ratedCurrent, motorTypeVariableSpeed, lineFrequency, efficiency,

    //     }, handleUpdateSuccess, handleException);
    //   }
    // };

    const assetTypeList = [
        { id: 1, department: 'One' },
        { id: 2, department: 'Two' },
        { id: 3, department: 'Three' },
    ]


    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={secondDailogOpen}
        >
            <form /*onSubmit={handleSubmit}*/>
                {/* <DialogTitle>
                    {isAddButton ? 'Add Tools' : 'Edit Tools'}
                </DialogTitle> */}
                <DialogTitle>
                    Sensor To Machine
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Sensor Class Module
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={sensorClassModule}
                                    label="Sensor Class Module"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setSensorClassModule(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {assetTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.department}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {}

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Select Machines
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectMachines}
                                    label="Select Machines"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setSelectMachines(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {assetTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.department}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {}

                        {}

                        {}

                        {}

                        {}
                        {}

                        {}
                        {}

                        {}

                        {}
                    </Grid>

                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setSecondDailogOpen(false);
                            // setErrorObject({});
                            loadData();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="submit"
                    >
                        {' '}
                        {/* {isAddButton ? 'Add' : 'Update'} */}
                        Add
                    </Button>
                </DialogActions>
            </form >
        </Dialog >
    );
}

export default SensorToMachineModal;
