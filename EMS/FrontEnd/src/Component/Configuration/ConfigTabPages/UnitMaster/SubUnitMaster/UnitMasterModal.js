import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { UnitAdd, UnitAddUpdate } from '../../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../../Utility/NotificationBar';

const UnitMasterModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;
    const [unitName, setUnitName] = useState('');
    const [unit, setUnit] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    useEffect(() => {
        setOpen(open);
        loaderData();
    }, [configSetupData]);

    const hanldeUnitAdd = (e) => {
        e.preventDefault();
        console.log('succress');
        if (isAddButton) {
            UnitAdd({
                unit: unit,
                unitName: unitName
            }, handleSuccess, handleException);
        } else {
            UnitAddUpdate({
                id: configSetupData?.id,
                unit: unit,
                unitName: unitName
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
        setUnit(configSetupData?.unit || '');
        setUnitName(configSetupData?.unitName || '');
    }

    const ClearData = () => {
        setOpen(false);
        setUnit('');
        setUnitName('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleChangeUnitName = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z\s]*$/; 
        if (regex.test(value)) {
            setUnitName(value);
        }
    };

    const handleChangeUnit = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z\s]*$/;
        if (regex.test(value)) {
            setUnit(value);
        }
    };

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={hanldeUnitAdd}>
                <DialogTitle>
                    {isAddButton ? 'Add Unit Master' : 'Edit Unit Master'}
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                value={unitName}
                                margin="dense"
                                id="outlined-basic"
                                label="Unit Name"
                                variant="outlined"
                                fullWidth
                                onChange={handleChangeUnitName}
                                autoComplete="off"
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                value={unit}
                                margin="dense"
                                id="outlined-basic"
                                label="Unit"
                                variant="outlined"
                                fullWidth
                                onChange={handleChangeUnit}
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
                            ClearData();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="submit"

                    >
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </form >
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog >
    );
}
export default UnitMasterModal;
