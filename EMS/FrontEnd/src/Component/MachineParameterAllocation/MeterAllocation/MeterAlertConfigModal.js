import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, TextField, FormControlLabel, Checkbox, Switch, Typography,
} from '@mui/material';
import { UtilityMeterViewedit } from '../../../Services/NodeJsApiServices.js';
import NotificationBar from '../../Notification/NotificationBar.js';

// Compact per-meter alert config — Alert Enabled / Alert Count / Alert Reset Count /
// Email Alert / SMS Alert / Latched Alert — kept out of the already-dense Edit Allocate
// form (MeterAllocationModal.js) and opened instead via a dedicated icon in the grid,
// same pattern as this codebase's other icon-triggered secondary-config modals.
// Submits the FULL meter row (unchanged) plus the edited alert fields through the same
// UtilityMeterViewedit endpoint used by the Edit Allocate form, since it's a full-row UPDATE.
const MeterAlertConfigModal = ({ open, setOpen, row, setRefreshData }) => {
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [alertCount, setAlertCount] = useState('');
    const [alertResetCount, setAlertResetCount] = useState('');
    const [emailAlert, setEmailAlert] = useState(false);
    const [smsAlert, setSmsAlert] = useState(false);
    const [latchAlert, setLatchAlert] = useState(false);

    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        if (!row) return;
        setAlertEnabled(Number(row.alertEnabled) ? true : false);
        setAlertCount(row.alertCount ?? 5);
        setAlertResetCount(row.alertResetCount ?? '');
        setEmailAlert(Number(row.emailAlert) ? true : false);
        setSmsAlert(Number(row.smsAlert) ? true : false);
        setLatchAlert(Number(row.latchAlert) ? true : false);
    }, [row]);

    const handleClose = () => setNotification({ status: false, type: '', message: '' });
    const handleCancel = () => setOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!row) return;

        const formData = {
            id: row.id,
            plantId: row.plantId,
            buildingId: row.buildingId,
            meterName: row.meterName,
            meterType: row.meterType,
            meterTypeId: row.meterTypeId || null,
            category: row.category,
            deviceId: row.deviceId,
            slaveId: row.slaveId,
            uamSet: row.uamSet,
            threshold: row.threshold,
            minLimit: row.minLimit,
            maxLimit: row.maxLimit,
            alertEnabled,
            alertCount: alertCount === '' ? null : alertCount,
            alertResetCount: alertResetCount === '' ? null : alertResetCount,
            emailAlert,
            smsAlert,
            latchAlert,
            displayMeter: row.displayMeter,
            counterValue: row.counter_value ?? null,
            meterKind: 'Utility Meter',
        };
        UtilityMeterViewedit(formData, handleSuccess, handleException);
    };

    const handleSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject?.message || 'Saved successfully' });
        setRefreshData && setRefreshData((v) => !v);
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 1200);
    };

    const handleException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage || 'Request failed' });
    };

    return (
        <>
            <Dialog fullWidth maxWidth="sm" open={open}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Alert Settings — {row?.meterName || ''}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} paddingTop={1}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={alertEnabled} onChange={(e) => setAlertEnabled(e.target.checked)} />}
                                    label="Alert Enabled"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Alert Count" type="number" variant="outlined" fullWidth size="small"
                                    helperText="Consecutive breach ticks before one notification is sent"
                                    value={alertCount}
                                    onChange={(e) => setAlertCount(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Alert Reset Count" type="number" variant="outlined" fullWidth size="small"
                                    helperText="Consecutive ticks after which the counter resets"
                                    value={alertResetCount}
                                    onChange={(e) => setAlertResetCount(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControlLabel
                                    control={<Checkbox checked={emailAlert} onChange={(e) => setEmailAlert(e.target.checked)} />}
                                    label="Email Alert"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControlLabel
                                    control={<Checkbox checked={smsAlert} onChange={(e) => setSmsAlert(e.target.checked)} />}
                                    label="SMS Alert"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControlLabel
                                    control={<Checkbox checked={latchAlert} onChange={(e) => setLatchAlert(e.target.checked)} />}
                                    label="Latched Alert"
                                />
                            </Grid>
                            {row && row.minLimit == null && row.maxLimit == null && (
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="error">
                                        This meter has no Min Limit / Max Limit set yet (Edit Allocate screen) — alerts won't
                                        trigger until at least one is configured.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ margin: '10px' }}>
                        <Button onClick={handleCancel} size="large">Cancel</Button>
                        <Button type="submit" size="large">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </>
    );
};

export default MeterAlertConfigModal;
