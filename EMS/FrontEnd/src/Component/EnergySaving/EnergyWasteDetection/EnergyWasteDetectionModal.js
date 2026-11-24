import React, { useEffect, useState } from 'react';
import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField,
    Select, FormControl, MenuItem, InputLabel, DialogActions,
} from '@mui/material';
import { EnergyWasteAddService, EnergyWasteUpdateService } from '../../APIservice';

const DETECTION_TYPES = [
    'HIGH_IDLE_POWER',
    'AFTER_SHIFT_HOURS',
    'WEEKEND_CONSUMPTION',
    'SUDDEN_SPIKE',
    'LOW_POWER_FACTOR',
    'TRANSFORMER_OVERLOAD',
];

const STATUS_OPTIONS = ['OPEN', 'RESOLVED'];

const EnergyWasteDetectionModal = ({ open, setOpen, isAddButton, editData, setRefreshData, setNotification }) => {
    const [id, setId] = useState('');
    const [detectionType, setDetectionType] = useState('');
    const [assetName, setAssetName] = useState('');
    const [meterName, setMeterName] = useState('');
    const [description, setDescription] = useState('');
    const [detectedValue, setDetectedValue] = useState('');
    const [thresholdValue, setThresholdValue] = useState('');
    const [detectionDate, setDetectionDate] = useState('');
    const [status, setStatus] = useState('OPEN');

    useEffect(() => {
        if (!isAddButton && editData?.id) {
            setId(editData.id || '');
            setDetectionType(editData.detection_type || '');
            setAssetName(editData.asset_name || '');
            setMeterName(editData.meter_name || '');
            setDescription(editData.description || '');
            setDetectedValue(editData.detected_value || '');
            setThresholdValue(editData.threshold_value || '');
            setDetectionDate(editData.detection_date || '');
            setStatus(editData.status || 'OPEN');
        } else {
            clearForm();
        }
    }, [editData, isAddButton]);

    const clearForm = () => {
        setId(''); setDetectionType(''); setAssetName(''); setMeterName('');
        setDescription(''); setDetectedValue(''); setThresholdValue('');
        setDetectionDate(''); setStatus('OPEN');
    };

    const handleSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setRefreshData(v => !v);
        if (!isAddButton) setTimeout(() => setOpen(false), 2000);
        else clearForm();
    };

    const handleException = (_, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage || 'An error occurred' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            detection_type: detectionType, asset_name: assetName, meter_name: meterName,
            description, detected_value: detectedValue, threshold_value: thresholdValue,
            detection_date: detectionDate, status,
        };
        if (isAddButton) {
            await EnergyWasteAddService(payload, handleSuccess, handleException);
        } else {
            await EnergyWasteUpdateService({ ...payload, id }, handleSuccess, handleException);
        }
    };

    return (
        <Dialog fullWidth maxWidth="sm" open={open}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{isAddButton ? 'Add Energy Waste Detection' : 'Edit Energy Waste Detection'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Detection Type</InputLabel>
                                <Select value={detectionType} label="Detection Type" onChange={e => setDetectionType(e.target.value)}>
                                    {DETECTION_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Asset Name" value={assetName} onChange={e => setAssetName(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Meter Name" value={meterName} onChange={e => setMeterName(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description" value={description} onChange={e => setDescription(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Detected Value" value={detectedValue} onChange={e => setDetectedValue(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Threshold Value" value={thresholdValue} onChange={e => setThresholdValue(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="date" label="Detection Date" value={detectionDate} onChange={e => setDetectionDate(e.target.value)} InputLabelProps={{ shrink: true }} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button size="large" onClick={() => { setOpen(false); clearForm(); }}>Cancel</Button>
                    <Button size="large" type="submit" variant="contained">{isAddButton ? 'Add' : 'Update'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EnergyWasteDetectionModal;
