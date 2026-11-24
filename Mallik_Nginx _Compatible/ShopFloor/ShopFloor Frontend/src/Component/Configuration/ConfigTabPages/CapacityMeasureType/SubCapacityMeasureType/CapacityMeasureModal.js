import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { CapacityMeasureAdd, CapacityMeasureUpdate } from '../../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../../Utility/NotificationBar';

const CapacityMeasureModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;
    const [capacityMeasureType, setCapacityMeasureType] = useState('')
    const [capacityMeasure, setCapacityMeasure] = useState('')
    const [rowId, setRowId] = useState('')
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
            CapacityMeasureAdd({
                capacityMeasureType: capacityMeasureType, 
                capacityMeasure: capacityMeasure 
            }, handleSuccess, handleException)
        } else {
            CapacityMeasureUpdate({
                id:configSetupData?. id,
                capacityMeasureType: capacityMeasureType,
                capacityMeasure: capacityMeasure
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
        setCapacityMeasureType(configSetupData?.capacityMeasureType || '');
        setCapacityMeasure(configSetupData?.capacityMeasure || '');
    }

    const ClearData = () => {
        setOpen(false);
        setRowId('');
        setCapacityMeasureType('');
        setCapacityMeasure('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z0-9\s]*$/;
        if (regex.test(value)) {
            setCapacityMeasureType(value);
        }
    };

    const handleChangeMeasure = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z0-9\s]*$/; 
        if (regex.test(value)) {
            setCapacityMeasure(value);
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
                    {isAddButton ? 'Add ' : 'Update'} Capacity Measure
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                value={capacityMeasureType}
                                margin="dense"
                                id="outlined-basic"
                                label="Production Type"
                                variant="outlined"
                                fullWidth
                                onChange={handleChange}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={capacityMeasure}
                                margin="dense"
                                id="outlined-basic"
                                label="Description"
                                variant="outlined"
                                fullWidth
                                onChange={handleChangeMeasure}
                                autoComplete="off"
                                required
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


export default CapacityMeasureModal;