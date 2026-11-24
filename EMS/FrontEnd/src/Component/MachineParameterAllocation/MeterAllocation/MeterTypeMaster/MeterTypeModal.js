import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Grid, InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import NotificationBar from '../../../../Utility/NotificationBar';
import { MeterTypeAdd, MeterTypeUpdate, MeterCategoryShowList } from '../../../../Services/NodeJsApiServices';

const MeterTypeModal = ({ open, setOpen, isAddButton, editData, setRefreshData }) => {
    const [meterType, setMeterType] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categoryList, setCategoryList] = useState([]);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        if (open) {
            MeterCategoryShowList(
                (res) => setCategoryList(res?.data || []),
                () => {}
            );
        }
        setMeterType(editData?.meterType || '');
        setCategoryId(editData?.categoryId || '');
    }, [editData, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { meterType, categoryId };
        if (isAddButton) {
            MeterTypeAdd(payload, handleSuccess, handleException);
        } else {
            MeterTypeUpdate({ ...payload, id: editData.id }, handleSuccess, handleException);
        }
    };

    const handleSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setTimeout(() => clearAndClose(), 1500);
    };

    const handleException = (_, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage });
    };

    const clearAndClose = () => {
        setMeterType('');
        setCategoryId('');
        setNotification({ status: false, type: 'error', message: '' });
        setRefreshData((v) => !v);
        setOpen(false);
    };

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    return (
        <Dialog fullWidth maxWidth="xs" open={open}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{isAddButton ? 'Add Meter Type' : 'Edit Meter Type'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={categoryId}
                                    label="Category"
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    {categoryList.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.categoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Meter Type"
                                value={meterType}
                                onChange={(e) => setMeterType(e.target.value)}
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

export default MeterTypeModal;
