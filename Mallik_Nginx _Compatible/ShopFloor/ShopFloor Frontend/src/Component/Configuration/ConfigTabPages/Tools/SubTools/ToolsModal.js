import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { AddTools, AddToolsMachineView, AddToolsUpdate } from '../../../../../Services/NodeJsApiServices';
// import { AddTools, AddToolsMachineView, AddToolsUpdate } from '../../../../../services/LoginServiceNod';
//   import { AssetAddService, AssetEditService, AssetTypeFetchService } from '../../../../services/LoginPageService';
// import { AddVendorValidate } from '../../../../validation/locationValidation';
//   import NotificationBar from '../../../notification/ServiceNotificationBar';
/* eslint-disable-next-line */

const ToolsModal = ({
    open, setOpen, isAddButton, configSetupData, setRefreshData, handleClose, openNotification, setNotification
}) => {
    const [id, setId] = useState('');
    const [machine, setMachine] = useState('');
    const [toolName, setToolName] = useState('');
    const [toolType, setToolType] = useState('');
    const [alertBasedOn, setAlertBasedOn] = useState('')

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
    const [assetTypeList, setAssetTypeList] = useState([]);



    useEffect(() => {
        setOpen(open);
        loadData();
        AddToolsMachineView(categoryHandleSuccess, handleAssetTypeException);
    }, [configSetupData]);

    // useEffect(() => {
    //   AssetTypeFetchService(categoryHandleSuccess, handleAssetTypeException);
    // }, []);


    const categoryHandleSuccess = (dataObject) => {
        setAssetTypeList(dataObject.data);
        console.log(dataObject.data);
    };
    const handleAssetTypeException = (dataObject) => {

    };


    const loadData = () => {

        console.log("configSetupData==",configSetupData)
        setMachine(configSetupData.Machine || '')
        setToolName(configSetupData.ToolName || '')
        setToolType(configSetupData.ToolType || '')
        setAlertBasedOn(configSetupData.AlertType || '')
        setId(configSetupData.id || '');

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
        setMachine('')
        setToolName('')
        setToolType('')
        setAlertBasedOn('')
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
            setOpen(false);
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

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isAddButton) {
        await AddTools({
          /* eslint-disable-next-line */
          Machine:machine, ToolName:toolName,ToolType:toolType, AlertType:alertBasedOn

        }, handleAddSuccess, handleException);
      } else {
        await AddToolsUpdate({
          id,  Machine:machine, ToolName:toolName,ToolType:toolType, AlertType:alertBasedOn

        }, handleUpdateSuccess, handleException);
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
                <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }}>
                    {isAddButton ? 'Add Tools' : 'Edit Tools'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Select Machine
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={machine}
                                    label="Select Machine"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setMachine(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {assetTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.machine_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={toolName}
                                // margin="dense"
                                id="outlined-basic"
                                label="Tool Name"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setToolName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    Tool Type
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={toolType}
                                    label="Select Machine"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setToolType(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                  
                                        <MenuItem value={'tool1'}> tool1</MenuItem>
                                        <MenuItem value={'tool2'}> tool2</MenuItem>
                                  
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* <Grid item xs={6}>
                            <TextField
                                value={machineTag}
                                // margin="dense"
                                id="outlined-basic"
                                label="Machine Tag"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setMachineTag(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid> */}

                        {/* <Grid item xs={6}>
                            <FormControl fullWidth >
                                <InputLabel id="demo-simple-select-label">
                                    --Capacity Measuring Type--
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={capacityMeasureType}
                                    label="--Capacity Measuring Type--"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setCapacityMeasureType(e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {assetTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.department}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid> */}

                        {/* <Grid item xs={6}>
                            <TextField
                                value={maxCapacity}
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
                        </Grid> */}

                        {/* <Grid item xs={6}>
                            <FormControl fullWidth >
                                <InputLabel id="demo-simple-select-label">
                                    --Capacity Measuring Unit--
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={capacityMeasuringUnit}
                                    label="--Capacity Measuring Unit--"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setCapacityMeasuringUnit(e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {assetTypeList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.department}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid> */}

                        {/* <Grid item xs={6}>
                            <TextField
                                value={loadingTime}
                                // margin="dense"
                                id="outlined-basic"
                                label="Loading Time"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setLoadingTime(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid> */}
                        {/* 
                        <Grid item xs={6}>
                            <TextField
                                value={UnloadingTime}
                                // margin="dense"
                                id="outlined-basic"
                                label="Unloading Time"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setUnloadingTime(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid> */}

                        {/* <Grid item xs={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="demo-simple-select-label">
                                    Asset Type
                                </InputLabel>
                                <Select

                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={assetTypeId}
                                    label="Asset Type"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setAssetTypeId(e.target.value);
                                    }}
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {assetTypeList.map((data) => (
                                        <MenuItem value={data.id}>{data.assetType}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid> */}
                        {/* <Grid item xs={6}>
                            <TextField
                                value={maxProductionHour}
                                // margin="dense"
                                id="outlined-basic"
                                label="Max Production Hour"
                                // type="password"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(areaName, 'areaName')}
                                onChange={(e) => { setMaxProductionHour(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid> */}

                        <Grid item lg={6} md={6} container justifyContent="center" alignItems={'center'} style={{ padding: 0 }}>
                            <Typography>Alert Based On</Typography>
                        </Grid>
                        <Grid item lg={6} md={6} container style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: 0 }}>
                            <FormControl component="fieldset" >
                                <RadioGroup
                                    aria-label="options"
                                    name="options"
                                    value={alertBasedOn}
                                    onChange={(e) => setAlertBasedOn(e.target.value)}
                                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                >
                                    <FormControlLabel
                                        value="Hours"
                                        control={<Radio 
                                            sx={{
                                                color: '#686D76', // unselected color
                                                '&.Mui-checked': {
                                                    color: '#000000', // selected color
                                                }
                                            }}
                                        />}
                                        label="Hours"
                                    />
                                    <FormControlLabel
                                        value="Usage"
                                        control={<Radio 
                                            sx={{
                                                color: '#686D76', // unselected color
                                                '&.Mui-checked': {
                                                    color: '#000000', // selected color
                                                }
                                            }}
                                        />}
                                        label="Usage"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* <Grid item xs={6}>
                            <TextField
                                value={motorDetails}
                                margin="dense"
                                id="outlined-basic"
                                label="Motor Details"
                                variant="outlined"
                                fullWidth
                                required
                                // onBlur={() =>validateForNullValue(motorDetails, 'motorDetails')}
                                onChange={(e) => { setMotorDetails(e.target.value); }}
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item xs={6}>

                            <TextField
                                value={rpsv}
                                margin="dense"
                                id="outlined-basic"
                                label="PowerRated SpeedRated Voltage"
                                variant="outlined"
                                required
                                //  onBlur={() =>validateForNullValue(rpsv, 'rpsv')}
                                onChange={(e) => { setRpsv(e.target.value); }}
                                autoComplete="off"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={ratedCurrent}
                                margin="dense"
                                id="outlined-basic"
                                // type="password"
                                label="Rated Current"
                                variant="outlined"
                                fullWidth
                                required
                                //  onBlur={() =>validateForNullValue(ratedCurrent, 'ratedCurrent')}
                                onChange={(e) => { setRatedCurrent(e.target.value); }}
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={motorTypeVariableSpeed}
                                margin="dense"
                                id="outlined-basic"
                                label="Motor Type Variable Speed"
                                variant="outlined"
                                fullWidth
                                required
                                //  onBlur={() =>validateForNullValue(motorTypeVariableSpeed, 'motorTypeVariableSpeed')}
                                onChange={(e) => { setMotorTypeVariableSpeed(e.target.value); }}
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={lineFrequency}
                                margin="dense"
                                id="outlined-multiline-flexible"
                                label="Line Frequency"
                                multiline
                                maxRows={4}
                                fullWidth
                                required
                                // onBlur={() =>validateForNullValue(lineFrequency, 'lineFrequency')}
                                onChange={(e) => { setLineFrequency(e.target.value); }}
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={efficiency}
                                margin="dense"
                                id="outlined-basic"
                                label="Efficiency"
                                variant="outlined"
                                fullWidth
                                required
                                //  onBlur={() =>validateForNullValue(efficiency, 'efficiency')}
                                onChange={(e) => { setEfficiency(e.target.value); }}
                                autoComplete="off"
                            />
                        </Grid> */}
                    </Grid>

                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
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
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </form >
        </Dialog >
    );
}

export default ToolsModal;