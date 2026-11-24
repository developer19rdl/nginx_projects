import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { Department, DepartmentUpdateOperation } from '../../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../../Utility/NotificationBar';

const DepartmentModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;
    console.log("configSetupData", configSetupData)
    const [id, setId] = useState('');
    const [departmentName, setDepartmentName] = useState('')
    const [description, setDescription] = useState('')
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
            Department({ 
                departmentName: departmentName, 
                departmentDescription: description 
            }, handleSuccess, handleException)
        } else {
            DepartmentUpdateOperation({
                id: rowId,
                departmentName: departmentName,
                departmentDescription: description
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
        setDepartmentName(configSetupData?.Department || '');
        setDescription(configSetupData?.Description || '');
    }

    const ClearData = () => {
        setOpen(false);
        setRowId('');
        setDepartmentName('');
        setDescription('');
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
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isAddButton ? 'Add' : 'Update'} Department
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                value={departmentName}
                                margin="dense"
                                id="outlined-basic"
                                label="Department Name"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setDepartmentName(e.target.value); }}
                                autoComplete="off"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                value={description}
                                margin="dense"
                                id="outlined-basic"
                                label="Description"
                                variant="outlined"
                                fullWidth
                                 onChange={(e) => { setDescription(e.target.value); }}
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
                    <Button size="large" type="submit"
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

export default DepartmentModal;