import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import NotificationBar from '../../../../Utility/NotificationBar';
import { MeterCategoryAdd, MeterCategoryUpdate } from '../../../../Services/NodeJsApiServices';

const MeterCategoryModal = ({ open, setOpen, isAddButton, editData, setRefreshData }) => {
    const [categoryName, setCategoryName] = useState('');
    const [meterKind, setMeterKind] = useState('Energy Meter');
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        setCategoryName(editData?.categoryName || '');
        setMeterKind(editData?.meterKind || 'Energy Meter');
    }, [editData, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { categoryName, meterKind };
        if (isAddButton) {
            MeterCategoryAdd(payload, handleSuccess, handleException);
        } else {
            MeterCategoryUpdate({ ...payload, id: editData.id }, handleSuccess, handleException);
        }
    };

    const handleSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setTimeout(() => {
            clearAndClose();
        }, 1500);
    };

    const handleException = (_, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage });
    };

    const clearAndClose = () => {
        setCategoryName('');
        setMeterKind('Energy Meter');
        setNotification({ status: false, type: 'error', message: '' });
        setRefreshData((v) => !v);
        setOpen(false);
    };

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    return (
        <Dialog fullWidth maxWidth="xs" open={open}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{isAddButton ? 'Add Meter Category' : 'Edit Meter Category'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Meter Kind</InputLabel>
                                <Select
                                    value={meterKind}
                                    label="Meter Kind"
                                    onChange={(e) => setMeterKind(e.target.value)}
                                >
                                    <MenuItem value="Energy Meter">Energy Meter</MenuItem>
                                    <MenuItem value="Utility Meter">Utility Meter</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Category Name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                fullWidth
                                required
                                autoComplete="off"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '8px' }}>
                    <Button onClick={clearAndClose}>Cancel</Button>
                    <Button type="submit" variant="contained" style={{ background: '#0e2d5d' }}>
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
        </Dialog>
    );
};

export default MeterCategoryModal;
