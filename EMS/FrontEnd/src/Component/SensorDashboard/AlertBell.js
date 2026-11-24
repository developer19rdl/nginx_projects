import React, { useEffect, useState, useCallback } from 'react';
import {
    IconButton, Badge, Tooltip, Dialog, DialogTitle, DialogContent, IconButton as CloseBtn,
    Box, Typography, Chip, List, ListItem, CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { GetDashboardAlerts } from '../../Services/NodeJsApiServices';
import { getSensorPalette } from './sensorTheme';

const SEVERITY_COLOR = {
    Critical:       '#c62828',
    Warning:        '#e65100',
    'Out of Range': '#f9a825',
};

const POLL_MS = 60 * 1000; // matches the live-tag cron cadence elsewhere in this app

// Bell icon + red count badge in the dashboard header (SensorDashboard.js) —
// click opens a modal listing this dashboard's own active/uncleared alerts
// (dashboardController-side filtering by sensorType, see AlertController.js's
// dashboardAlerts). Polls every 60s so the badge count doesn't go stale while
// the dashboard is left open.
const AlertBell = ({ sensorType, palette }) => {
    const p = palette || getSensorPalette(false);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const fetchAlerts = useCallback(() => {
        GetDashboardAlerts(
            { sensorType },
            (res) => { setAlerts(res?.data || []); setLoading(false); },
            () => setLoading(false)
        );
    }, [sensorType]);

    useEffect(() => {
        setLoading(true);
        fetchAlerts();
        const t = setInterval(fetchAlerts, POLL_MS);
        return () => clearInterval(t);
    }, [fetchAlerts]);

    return (
        <>
            <Tooltip title={`${sensorType} alerts`}>
                <IconButton size="small" onClick={() => setOpen(true)} sx={{ color: p.subtext }}>
                    <Badge badgeContent={alerts.length} color="error" max={99}>
                        <NotificationsIcon fontSize="small" />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {sensorType} Alerts
                    <CloseBtn size="small" onClick={() => setOpen(false)}><CloseIcon fontSize="small" /></CloseBtn>
                </DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}><CircularProgress size={26} /></Box>
                    ) : alerts.length === 0 ? (
                        <Box textAlign="center" py={4} color="text.secondary">
                            <Typography>No active {sensorType.toLowerCase()} alerts.</Typography>
                        </Box>
                    ) : (
                        <List dense disablePadding>
                            {alerts.map((a) => {
                                const sColor = SEVERITY_COLOR[a.severity] || '#78909c';
                                return (
                                    <ListItem key={a.id} sx={{
                                        flexDirection: 'column', alignItems: 'flex-start', gap: 0.5,
                                        borderBottom: '1px solid #eceff1', py: 1.2,
                                    }}>
                                        <Box display="flex" alignItems="center" gap={1} width="100%">
                                            <Chip label={a.severity} size="small" sx={{
                                                backgroundColor: `${sColor}18`, color: sColor, fontWeight: 700, fontSize: 11,
                                            }} />
                                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{a.meterName || 'Unknown sensor'}</Typography>
                                            <Typography sx={{ fontSize: 11, color: 'text.secondary', ml: 'auto' }}>
                                                {a.dateTime}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                                            {a.alertMessage}{a.value != null ? ` (value: ${a.value})` : ''}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AlertBell;
