import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel,
    Checkbox,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
// import { connect } from 'react-redux';
// import { addOeeParameters, editOeeParameter } from '../../../../../Actions';
// import NotificationBar from './NotificationBar';
import { OEEParameters, OEEParametersUpdate } from '../../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../../Utility/NotificationBar';
// import { OEEParameters, OEEParametersUpdate } from '../../../../../services/LoginServiceNod';

const oEEParameters = [
    { id: 1, parameterName: 'Utilization Factor' },
    { id: 2, parameterName: 'Performance Factor' },
    { id: 3, parameterName: 'Quality Performance Factor' },
]

const AddOeeParametersModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;

    const [oeeParameter, setOeeParameters] = useState('');
    const [parameterValue, setParameterValue] = useState('');
    const [rowId, setRowId] = useState('')
    const [isFaultMetric, setIsFaultMetric] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    useEffect(() => {
        setOpen(open);
        loaderData();
    }, [configSetupData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            OEEParameters({ oeeParaCategoryId: oeeParameter, parameterName: parameterValue, isfaultmetric: isFaultMetric }, handleSuccess, handleException)
        } else {
            OEEParametersUpdate({
                id: rowId,
                oeeParaCategoryId: oeeParameter,
                parameterName: parameterValue,
                isfaultmetric: isFaultMetric
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
        setOeeParameters(configSetupData?.oeeParaCategoryId || '');
        setParameterValue(configSetupData?.parameterName || '');
        setIsFaultMetric(configSetupData?.isfaultmetric || false);
    }

    const ClearData = () => {
        setOpen(false);
        setRowId('');
        setOeeParameters('');
        setParameterValue('');
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
                <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                    {isAddButton ? 'Add OEE Parameters' : 'Edit OEE Parameters'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} padding={1}>

                        <Grid item xs={6}>
                            <FormControl fullWidth /*margin="normal"*/>
                                <InputLabel id="demo-simple-select-label">
                                    OEE Parameters
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={oeeParameter}
                                    label="Sensor Category"
                                    // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                    onChange={(e) => {
                                        setOeeParameters(e.target.value);
                                        console.log('setDepartment', e.target.value);
                                    }}
                                    required
                                // error={errorObject?.deviceCategory?.errorStatus}
                                // helperText={errorObject?.deviceCategory?.helperText}
                                >
                                    {oEEParameters.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.parameterName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={parameterValue}
                                id="outlined-basic"
                                label="Parameter Name"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setParameterValue(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Typography style={{ fontWeight: 'bold' }}>Consider for MTTR, MTBF</Typography>
                            <Checkbox
                                checked={isFaultMetric}
                                onChange={(e) => setIsFaultMetric(e.target.checked)}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
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


export default AddOeeParametersModal;