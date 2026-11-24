import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogContent, DialogTitle, TextField,
    Grid, DialogActions, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { MeterAddService, MeterEditService, FetchMeterService, FetchCompanyService, FetchDeviceListService } from '../../../Services/LoginPageService.js'
import { AddCustomerValidate } from '../../../Pages/validation/formValidation.js'
import NotificationBar from '../../../Component/Notification/NotificationBar.js'
import { EdgeDevicename, MeterAllocationAdd, MeterAllocationViewedit, allocMachinesList, getDeviceSlaveId, updateOperatorPassword } from '../../../Services/NodeJsApiServices.js';
import { DataGrid } from '@mui/x-data-grid';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';

function OperatorPasswordModal({ setPasswordModal, passwordModal, rowId, setRowId }) {

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateOperatorPassword({
            id: rowId,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        }, handleSuccess, handleException)
    }

    const handleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            clearData();
            handleClose()
        }, 3000);
    }
    const handleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const clearData = () => {
        setNewPassword('');
        setConfirmPassword('');
        setRowId('')
        setPasswordModal(false);
    }

    return (
        <Dialog open={passwordModal}>
            <DialogTitle >Create Password</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12} md={12}>
                            <TextField
                                label="New Password"
                                type="text"
                                value={newPassword}
                                variant="outlined"
                                placeholder="New Password"
                                required
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="off"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <TextField
                                label="Confirm Password"
                                type="text"
                                value={confirmPassword}
                                variant="outlined"
                                placeholder="Confirm Password"
                                required
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="off"
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" style={{ background: '#0e2d5d', color: '#f5f5fc' }}>Save</Button>
                    <Button style={{ background: '#0e2d5d', color: '#f5f5fc' }} onClick={() => {
                        setPasswordModal(false);
                        clearData();
                    }}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    );
}

export default OperatorPasswordModal;
