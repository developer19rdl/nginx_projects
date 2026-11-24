import React, { useEffect, useState } from 'react';
import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField,
    Select, FormControl, MenuItem, InputLabel, DialogActions,
} from '@mui/material';
import { EnergyCorrAddService, EnergyCorrUpdateService } from '../../APIservice';

const CONDITION_TYPES = [
    'LOW_POWER_FACTOR',
    'LOAD_IMBALANCE',
    'HIGH_PEAK_DEMAND',
    'MOTOR_OVERLOAD',
    'HIGH_THD',
    'IDLE_CURRENT',
    'LOW_VOLTAGE',
    'FREQUENT_SPIKES',
    'HIGH_IDLE_POWER',
    'AFTER_SHIFT_HOURS',
];

const CONDITION_ACTION_MAP = {
    LOW_POWER_FACTOR: 'Add capacitor bank',
    LOAD_IMBALANCE: 'Redistribute phase loads',
    HIGH_PEAK_DEMAND: 'Shift heavy load to off-peak',
    MOTOR_OVERLOAD: 'Check bearing/alignment',
    HIGH_THD: 'Install harmonic filter',
    IDLE_CURRENT: 'Auto shutdown schedule',
    LOW_VOLTAGE: 'Transformer tap check',
    FREQUENT_SPIKES: 'Inspect incoming feeder',
    HIGH_IDLE_POWER: 'Schedule equipment shutdown during idle periods',
    AFTER_SHIFT_HOURS: 'Implement auto-shutoff after shift hours',
};

const PRIORITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'];
const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const CorrectiveActionRecModal = ({ open, setOpen, isAddButton, editData, setRefreshData, setNotification }) => {
    const [id, setId] = useState('');
    const [conditionType, setConditionType] = useState('');
    const [conditionDescription, setConditionDescription] = useState('');
    const [recommendedAction, setRecommendedAction] = useState('');
    const [assetName, setAssetName] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [status, setStatus] = useState('PENDING');
    const [assignedTo, setAssignedTo] = useState('');
    const [actionDate, setActionDate] = useState('');
    const [energySaved, setEnergySaved] = useState('');

    useEffect(() => {
        if (!isAddButton && editData?.id) {
            setId(editData.id || '');
            setConditionType(editData.condition_type || '');
            setConditionDescription(editData.condition_description || '');
            setRecommendedAction(editData.recommended_action || '');
            setAssetName(editData.asset_name || '');
            setDeviceName(editData.device_name || '');
            setPriority(editData.priority || 'MEDIUM');
            setStatus(editData.status || 'PENDING');
            setAssignedTo(editData.assigned_to || '');
            setActionDate(editData.action_date || '');
            setEnergySaved(editData.energy_saved || '');
        } else {
            clearForm();
        }
    }, [editData, isAddButton]);

    const handleConditionTypeChange = (type) => {
        setConditionType(type);
        if (isAddButton && CONDITION_ACTION_MAP[type]) {
            setRecommendedAction(CONDITION_ACTION_MAP[type]);
        }
    };

    const clearForm = () => {
        setId(''); setConditionType(''); setConditionDescription(''); setRecommendedAction('');
        setAssetName(''); setDeviceName(''); setPriority('MEDIUM'); setStatus('PENDING');
        setAssignedTo(''); setActionDate(''); setEnergySaved('');
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
            condition_type: conditionType, condition_description: conditionDescription,
            recommended_action: recommendedAction, asset_name: assetName, device_name: deviceName,
            priority, status, assigned_to: assignedTo, action_date: actionDate, energy_saved: energySaved,
        };
        if (isAddButton) {
            await EnergyCorrAddService(payload, handleSuccess, handleException);
        } else {
            await EnergyCorrUpdateService({ ...payload, id }, handleSuccess, handleException);
        }
    };

    return (
        <Dialog fullWidth maxWidth="sm" open={open}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{isAddButton ? 'Add Corrective Action Recommendation' : 'Edit Corrective Action Recommendation'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Condition Type</InputLabel>
                                <Select value={conditionType} label="Condition Type" onChange={e => handleConditionTypeChange(e.target.value)}>
                                    {CONDITION_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Condition Description" value={conditionDescription}
                                onChange={e => setConditionDescription(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth required multiline rows={2} label="Recommended Action" value={recommendedAction}
                                onChange={e => setRecommendedAction(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Asset Name" value={assetName} onChange={e => setAssetName(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Device / Meter Name" value={deviceName} onChange={e => setDeviceName(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select value={priority} label="Priority" onChange={e => setPriority(e.target.value)}>
                                    {PRIORITY_OPTIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Assigned To" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} autoComplete="off" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="date" label="Action Date" value={actionDate}
                                onChange={e => setActionDate(e.target.value)} InputLabelProps={{ shrink: true }} autoComplete="off" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth type="number" label="Energy Saved (kWh)" value={energySaved}
                                onChange={e => setEnergySaved(e.target.value)} autoComplete="off" />
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

export default CorrectiveActionRecModal;
