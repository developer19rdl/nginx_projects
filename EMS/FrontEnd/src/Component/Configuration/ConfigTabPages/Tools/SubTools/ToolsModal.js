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
                <DialogTitle>
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

                        {}

                        {}

                        {}

                        {}

                        {}
                        {}

                        {}
                        {}

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
                                        control={<Radio />}
                                        label="Hours"
                                    />
                                    <FormControlLabel
                                        value="Usage"
                                        control={<Radio />}
                                        label="Usage"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {}
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
