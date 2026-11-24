import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
    ReportSettingsShow,
    ReportSettingsUpdate,
    EmailRecipientsShow,
    EmailRecipientsAdd,
    EmailRecipientsDelete,
} from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';

const REPORT_LABELS = {
    daily: 'Daily Report',
    weekly: 'Weekly Report',
    monthly: 'Monthly Report',
};

// Cycle length must evenly divide 24 so the same fire-hours repeat every day.
const CYCLE_HOUR_OPTIONS = [1, 2, 3, 4, 6, 8, 12, 24];
const MONTH_START_DAY_OPTIONS = Array.from({ length: 28 }, (_, i) => i + 1);

const EnergyReportEmail = () => {
    const [settings, setSettings] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [emailInputs, setEmailInputs] = useState({});
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        ReportSettingsShow('energy', handleSettingsSuccess, handleException);
        EmailRecipientsShow(handleRecipientsSuccess, handleException);
    }, [refreshData]);

    const handleSettingsSuccess = (dataObject) => setSettings(dataObject?.data || []);
    const handleRecipientsSuccess = (dataObject) => setRecipients(dataObject?.data || []);

    const handleException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage });
    };

    const handleClose = () => {
        setNotification({ status: false, type: '', message: '' });
    };

    const updateLocalSetting = (id, patch) => {
        setSettings((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    };

    const handleSaveSchedule = (row) => {
        ReportSettingsUpdate(
            {
                id: row.id,
                executionTime: row.execution_time,
                status: row.status,
                granularity: row.granularity,
                cycleHours: row.cycle_hours,
                monthStartDay: row.month_start_day,
            },
            () => setNotification({
                status: true,
                type: 'success',
                message: `${REPORT_LABELS[row.report_type] || row.report_type} schedule saved.`,
            }),
            handleException
        );
    };

    const handleAddEmail = (row) => {
        const email = (emailInputs[row.report_type] || '').trim();
        if (!email) return;
        EmailRecipientsAdd(
            { reportId: row.id, email },
            () => {
                setEmailInputs((prev) => ({ ...prev, [row.report_type]: '' }));
                setRefreshData((value) => !value);
            },
            handleException
        );
    };

    const handleDeleteEmail = (recipient) => {
        EmailRecipientsDelete({ id: recipient.id }, () => setRefreshData((value) => !value), handleException);
    };

    const renderScheduleFields = (row) => {
        if (row.report_type === 'daily') {
            return (
                <>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel id={`granularity-${row.id}`}>Report Detail</InputLabel>
                        <Select
                            labelId={`granularity-${row.id}`}
                            label="Report Detail"
                            value={row.granularity || 'day'}
                            onChange={(e) => updateLocalSetting(row.id, { granularity: e.target.value })}
                        >
                            <MenuItem value="day">Day-wise</MenuItem>
                            <MenuItem value="hour">Hour-wise</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel id={`cycle-hours-${row.id}`}>Cycle Length (hours)</InputLabel>
                        <Select
                            labelId={`cycle-hours-${row.id}`}
                            label="Cycle Length (hours)"
                            value={row.cycle_hours || 24}
                            onChange={(e) => updateLocalSetting(row.id, { cycle_hours: e.target.value })}
                        >
                            {CYCLE_HOUR_OPTIONS.map((hrs) => (
                                <MenuItem key={hrs} value={hrs}>{hrs === 24 ? '24 (once a day)' : hrs}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        type="time"
                        label="Cycle Start Time"
                        InputLabelProps={{ shrink: true }}
                        value={(row.execution_time || '07:00:00').slice(0, 5)}
                        onChange={(e) => updateLocalSetting(row.id, { execution_time: `${e.target.value}:00` })}
                        sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Sent every {row.cycle_hours || 24}h from this time
                        {(row.cycle_hours || 24) < 24 ? ' (e.g. 12h anchored at 08:00 sends at 08:00 and 20:00).' : '.'}
                    </Typography>
                </>
            );
        }

        if (row.report_type === 'weekly') {
            return (
                <>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel id={`granularity-${row.id}`}>Report Detail</InputLabel>
                        <Select
                            labelId={`granularity-${row.id}`}
                            label="Report Detail"
                            value={row.granularity || 'day'}
                            onChange={(e) => updateLocalSetting(row.id, { granularity: e.target.value })}
                        >
                            <MenuItem value="day">Day-wise</MenuItem>
                            <MenuItem value="hour">Hour-wise</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        type="time"
                        label="Send Time"
                        InputLabelProps={{ shrink: true }}
                        value={(row.execution_time || '07:00:00').slice(0, 5)}
                        onChange={(e) => updateLocalSetting(row.id, { execution_time: `${e.target.value}:00` })}
                        sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Sent every Sunday at this time, covering the previous 7 days.
                    </Typography>
                </>
            );
        }

        // monthly
        return (
            <>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id={`month-start-${row.id}`}>Month Start Day</InputLabel>
                    <Select
                        labelId={`month-start-${row.id}`}
                        label="Month Start Day"
                        value={row.month_start_day || 1}
                        onChange={(e) => updateLocalSetting(row.id, { month_start_day: e.target.value })}
                    >
                        {MONTH_START_DAY_OPTIONS.map((day) => (
                            <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    type="time"
                    label="Send Time"
                    InputLabelProps={{ shrink: true }}
                    value={(row.execution_time || '07:00:00').slice(0, 5)}
                    onChange={(e) => updateLocalSetting(row.id, { execution_time: `${e.target.value}:00` })}
                    sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Sent on day {row.month_start_day || 1} of every month, covering the prior billing cycle.
                    Monthly reports are always day-wise.
                </Typography>
            </>
        );
    };

    return (
        <Box sx={{ width: '100%', padding: '15px' }}>
            <Paper
                variant="outlined"
                sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ m: 0, padding: '15px', backgroundColor: '#f8f8ff', borderBottom: '1px solid #e0e0e0' }}
                    fontFamily={'Roboto Slab'}
                >
                    Energy Report Email Configuration
                </Typography>
                <Box sx={{ padding: '20px' }}>
                    <Grid container spacing={2}>
                        {settings.map((row) => {
                            const rowRecipients = recipients.filter((recipient) => recipient.report_id === row.id);
                            return (
                                <Grid item xs={12} md={4} key={row.report_type}>
                                    <Card>
                                        <CardContent sx={{ pb: 4, '&:last-child': { pb: 4 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6">
                                                    {REPORT_LABELS[row.report_type] || row.report_type}
                                                </Typography>
                                                <Switch
                                                    checked={!!row.status}
                                                    onChange={(e) => updateLocalSetting(row.id, { status: e.target.checked ? 1 : 0 })}
                                                />
                                            </Box>

                                            {renderScheduleFields(row)}

                                            <Button variant="contained" size="small" onClick={() => handleSaveSchedule(row)} sx={{ mb: 2 }}>
                                                Save Schedule
                                            </Button>

                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Recipients
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, minHeight: 32 }}>
                                                {rowRecipients.map((recipient) => (
                                                    <Chip
                                                        key={recipient.id}
                                                        label={recipient.email}
                                                        size="small"
                                                        onDelete={() => handleDeleteEmail(recipient)}
                                                    />
                                                ))}
                                                {rowRecipients.length === 0 && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        No recipients added yet.
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="name@example.com"
                                                    value={emailInputs[row.report_type] || ''}
                                                    onChange={(e) => setEmailInputs((prev) => ({ ...prev, [row.report_type]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddEmail(row);
                                                        }
                                                    }}
                                                />
                                                <Button variant="outlined" onClick={() => handleAddEmail(row)}>
                                                    Add
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Paper>

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    );
};

export default EnergyReportEmail;
