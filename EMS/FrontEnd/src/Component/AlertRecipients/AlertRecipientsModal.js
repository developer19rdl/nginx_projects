import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput,
    Chip, Box, FormControlLabel, Switch,
} from '@mui/material';
import { AlertRecipientsAdd, AlertRecipientsUpdate } from '../../Services/NodeJsApiServices';
import NotificationBar from '../../Utility/NotificationBar';

const AlertRecipientsModal = ({ open, setOpen, isAddButton, editData, meterTypeOptions, setRefreshData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [status, setStatus] = useState(true);
    const [meterTypes, setMeterTypes] = useState([]);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        if (!open) return;
        if (!isAddButton && editData) {
            setName(editData.name || '');
            setEmail(editData.email || '');
            setPhone(editData.phone || '');
            setEmailEnabled(Number(editData.emailEnabled) === 1);
            setSmsEnabled(Number(editData.smsEnabled) === 1);
            setStatus(Number(editData.status) === 1);
            setMeterTypes(editData.meterTypes || []);
        } else {
            setName(''); setEmail(''); setPhone('');
            setEmailEnabled(true); setSmsEnabled(true); setStatus(true); setMeterTypes([]);
        }
    }, [open, isAddButton, editData]);

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { name, email, phone, emailEnabled, smsEnabled, status, meterTypes };
        const service = isAddButton ? AlertRecipientsAdd : AlertRecipientsUpdate;
        service(isAddButton ? payload : { id: editData.id, ...payload }, handleSuccess, handleException);
    };

    const handleSuccess = (dataObject) => {
        setRefreshData((v) => !v);
        setNotification({ status: true, type: 'success', message: dataObject?.message || 'Saved' });
        setTimeout(() => { handleClose(); setOpen(false); }, 1200);
    };
    const handleException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage || 'Request failed' });
    };

    return (
        <div>
            <Dialog open={open} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{isAddButton ? 'Add Alert Recipient' : 'Edit Alert Recipient'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} paddingTop={1}>
                            <Grid item xs={12}>
                                <TextField fullWidth required label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Mobile Number" value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    helperText="10-digit number, e.g. 9876543210" />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Receive alerts for meter types</InputLabel>
                                    <Select
                                        multiple
                                        value={meterTypes}
                                        onChange={(e) => setMeterTypes(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                        input={<OutlinedInput label="Receive alerts for meter types" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((t) => <Chip key={t} label={t} size="small" />)}
                                            </Box>
                                        )}
                                    >
                                        {meterTypeOptions.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                <Checkbox checked={meterTypes.indexOf(t) > -1} />
                                                <ListItemText primary={t} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel control={<Switch checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />} label="Email alerts" />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel control={<Switch checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />} label="SMS alerts" />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel control={<Switch checked={status} onChange={(e) => setStatus(e.target.checked)} />} label="Active" />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ margin: '10px' }}>
                        <Button onClick={() => setOpen(false)} size="large">Cancel</Button>
                        <Button type="submit" size="large" variant="contained">{isAddButton ? 'Add' : 'Update'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    );
};

export default AlertRecipientsModal;
