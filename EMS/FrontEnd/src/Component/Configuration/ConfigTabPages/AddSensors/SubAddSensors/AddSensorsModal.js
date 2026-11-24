import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { AddSensorconfi, AddSensorconfiUpdate } from '../../../../../Services/NodeJsApiServices';
// import { AddSensorconfi, AddSensorconfiUpdate } from '../../../../../services/LoginServiceNod';
//   import { AssetAddService, AssetEditService, AssetTypeFetchService } from '../../../../services/LoginPageService';
// import { AddVendorValidate } from '../../../../validation/locationValidation';
//   import NotificationBar from '../../../notification/ServiceNotificationBar';
/* eslint-disable-next-line */

const AddSensorsModal = ({
    open, setOpen, isAddButton, configSetupData, setRefreshData, handleClose, openNotification, setNotification
}) => {
    const [id, setId] = useState('');
    const [Sensor, setSensor] = useState('');
    const [metricUnit, setMetricUnit] = useState('');

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
        setOpen(open);
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

  
        setSensor(configSetupData.Sensor || '')
        setMetricUnit(configSetupData.metricUnit || '')
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
        setSensor('')
        setMetricUnit('')
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
        setTimeout(() => {
            setOpen(false);
        }, 3000);
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
        await AddSensorconfi({
            Sensor:Sensor,metricUnit:metricUnit
        }, handleAddSuccess, handleException);
      } else {
        await AddSensorconfiUpdate({
          /* eslint-disable-next-line */
          id,Sensor:Sensor,metricUnit:metricUnit

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
                    {isAddButton ? 'Add Sensor' : 'Edit Sensor'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>

                            <TextField
                                value={Sensor}
                                margin="dense"
                                id="outlined-basic"
                                label="Sensor"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(assetName, 'assetName')}
                                onChange={(e) => { setSensor(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        {}
                        <Grid item xs={6}>
                            <TextField
                                value={metricUnit}
                                margin="dense"
                                id="outlined-basic"
                                label="Metric Unit"
                                // type="password"
                                variant="outlined"
                                fullWidth
                                // required
                                // onBlur={() =>validateForNullValue(areaName, 'areaName')}
                                onChange={(e) => { setMetricUnit(e.target.value); }}
                                autoComplete="off"
                                required
                            />
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

export default AddSensorsModal;
