import React, { useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, TextField, FormControl, InputLabel, Select, MenuItem, Alert,
} from '@mui/material';
import { SmsWalletAddPackage } from '../../Services/NodeJsApiServices';
import NotificationBar from '../../Utility/NotificationBar';

// Fixed common tiers + a free-entry "Custom" option, same idea as MeterAllocationModal's
// Counter Value dropdown.
const PACKAGE_TIERS = [1000, 5000, 10000, 25000, 50000];

const AddSmsPackageModal = ({ open, setOpen, remaining = 0, setRefreshData }) => {
    const [tier, setTier] = useState('');
    const [customCount, setCustomCount] = useState('');
    const [note, setNote] = useState('');
    const [addedBy, setAddedBy] = useState('');
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    const smsCount = tier === 'custom' ? Number(customCount || 0) : Number(tier || 0);

    const ClearData = () => {
        setOpen(false);
        setTier('');
        setCustomCount('');
        setNote('');
        setAddedBy('');
    };

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!smsCount || smsCount <= 0) return;
        SmsWalletAddPackage(
            { smsCount, note: note || null, addedBy: addedBy || null },
            handleSuccess,
            handleException
        );
    };

    const handleSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject?.message || 'Added' });
        setRefreshData && setRefreshData((v) => !v);
        setTimeout(() => {
            handleClose();
            ClearData();
        }, 1200);
    };

    const handleException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage || 'Request failed' });
    };

    return (
        <div>
            <Dialog open={open} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add SMS Package</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} paddingTop={1}>
                            <Grid item xs={12}>
                                <Alert severity="info">
                                    Select an SMS package to add to your wallet. Balance is available immediately.
                                </Alert>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Select Package</InputLabel>
                                    <Select
                                        value={tier}
                                        label="Select Package"
                                        onChange={(e) => setTier(e.target.value)}
                                    >
                                        {PACKAGE_TIERS.map((t) => (
                                            <MenuItem key={t} value={t}>{t.toLocaleString()} SMS</MenuItem>
                                        ))}
                                        <MenuItem value="custom">Custom</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {tier === 'custom' && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth type="number" label="Custom SMS Count" variant="outlined"
                                        value={customCount}
                                        onChange={(e) => setCustomCount(e.target.value)}
                                        required
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Note (optional)" variant="outlined"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Added By (optional)" variant="outlined"
                                    value={addedBy}
                                    onChange={(e) => setAddedBy(e.target.value)}
                                />
                            </Grid>
                            {smsCount > 0 && (
                                <Grid item xs={12}>
                                    <Alert severity="success">
                                        Current balance: {remaining.toLocaleString()} SMS | After adding: {(remaining + smsCount).toLocaleString()} SMS
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ margin: '10px' }}>
                        <Button onClick={ClearData} size="large">Cancel</Button>
                        <Button type="submit" size="large" variant="contained">Add Package</Button>
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

export default AddSmsPackageModal;
