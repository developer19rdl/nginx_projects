import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
import NotificationBar from '../../../../Utility/NotificationBar';
import { SensorCategoryAdd } from '../../../../Services/NodeJsApiServices';
// import { addSensorCategory, editSensorCategory } from '../../../../Actions';
// import NotificationBar from './NotificationBar';

const SensorCategoryModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;

    // const [capacityMeasureType, setCapacityMeasureType] = useState('')
    // const [capacityMeasure, setCapacityMeasure] = useState('')
    //new state
    const [edgeDeviceName, setEdgeDeviceName] = useState('');
    const [deviceTag, setDeviceTag] = useState('');

    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');

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
            SensorCategoryAdd({ sensorCatName: categoryName, sensorCatDes: categoryDescription }, handleSuccess, handleException);
        } else {
            props.editSensorCategory({
                id: rowId,
                sensorCatName: categoryName,
                sensorCatDes: categoryDescription
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
        setCategoryName(configSetupData?.sensorCategoryName || '');
        setCategoryDescription(configSetupData?.sensorCategoryDescription || '');
    }

    const ClearData = () => {
        setOpen(false);
        setRowId('');
        setCategoryName('');
        setCategoryDescription('');
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
                    {isAddButton ? 'Add Sensor Category' : 'Edit Sensor Category'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                value={categoryName}
                                margin="dense"
                                id="outlined-basic"
                                label="Category Name"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setCategoryName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={categoryDescription}
                                margin="dense"
                                id="outlined-basic"
                                label="Category Description"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setCategoryDescription(e.target.value); }}
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

export default SensorCategoryModal;