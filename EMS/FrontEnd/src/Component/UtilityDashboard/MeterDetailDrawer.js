import React, { useEffect, useState } from 'react';
import {
    Drawer, Box, Typography, Chip, Divider, IconButton,
    FormControl, InputLabel, Select, MenuItem, ToggleButton,
    ToggleButtonGroup, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GasMeterIcon from '@mui/icons-material/GasMeter';
import AirIcon from '@mui/icons-material/Air';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SpeedIcon from '@mui/icons-material/Speed';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts';
import { GetDeviceParams, GetIoTSensorGraph, GetUtilityMeterDashboard } from '../../Services/NodeJsApiServices';

const METER_TYPE_COLOR = {
    'Water':          { bg: '#e3f2fd', border: '#90caf9', text: '#0d47a1' },
    'Gas':            { bg: '#fff3e0', border: '#ffcc02', text: '#e65100' },
    'Compressed Air': { bg: '#e0f7fa', border: '#80deea', text: '#006064' },
    'Fuel':           { bg: '#f3e5f5', border: '#ce93d8', text: '#4a148c' },
    'Steam':          { bg: '#ffebee', border: '#ef9a9a', text: '#b71c1c' },
    'Other':          { bg: '#eceff1', border: '#b0bec5', text: '#263238' },
};

const METER_TYPE_ICON = {
    'Water':          <WaterDropIcon sx={{ fontSize: 26, color: '#1565c0' }} />,
    'Gas':            <GasMeterIcon  sx={{ fontSize: 26, color: '#e65100' }} />,
    'Compressed Air': <AirIcon       sx={{ fontSize: 26, color: '#00838f' }} />,
    'Fuel':           <LocalGasStationIcon sx={{ fontSize: 26, color: '#6a1b9a' }} />,
    'Steam':          <DeviceThermostatIcon sx={{ fontSize: 26, color: '#b71c1c' }} />,
    'Other':          <SpeedIcon     sx={{ fontSize: 26, color: '#37474f' }} />,
};

const TIME_OPTIONS = [
    { label: '1h',  value: '1hr',    interval: '15min' },
    { label: '6h',  value: '6hr',    interval: '30min' },
    { label: '24h', value: '24hr',   interval: '1hr'   },
    { label: '7d',  value: '7days',  interval: '1day'  },
    { label: '30d', value: '30days', interval: '1day'  },
];

const CONSUMPTION_RANGE_OPTIONS = [
    { label: 'Hourly (Today)', value: 'today' },
    { label: 'Daily (7d)',     value: 'week'  },
    { label: 'Daily (30d)',    value: 'month' },
];

const MeterDetailDrawer = ({ open, onClose, meter, sensorStats = {} }) => {
    const [sensorParams, setSensorParams]   = useState([]);
    const [selectedTag, setSelectedTag]     = useState('');
    const [timeRange, setTimeRange]         = useState('7days');
    const [graphData, setGraphData]         = useState([]);
    const [paramsLoading, setParamsLoading] = useState(false);
    const [graphLoading, setGraphLoading]   = useState(false);
    const [paramsError, setParamsError]     = useState(false);

    const [consumptionRange, setConsumptionRange]     = useState('today');
    const [consumptionData, setConsumptionData]       = useState(null);
    const [consumptionLoading, setConsumptionLoading] = useState(false);

    /* ── fetch sensor params when meter changes ── */
    useEffect(() => {
        if (!meter || !open) return;
        setParamsError(false);
        setSelectedTag('');
        setGraphData([]);
        setSensorParams([]);

        if (!meter.deviceId) { setParamsError(true); return; }

        setParamsLoading(true);
        GetDeviceParams(
            { deviceId: meter.deviceId, slaveId: meter.slaveId },
            (d) => {
                const params = d?.data || d?.params || (Array.isArray(d) ? d : []);
                setSensorParams(params);
                if (params.length > 0) {
                    const firstTag = params[0].tagId || params[0].id || params[0].Tag_name || '';
                    setSelectedTag(firstTag);
                }
                setParamsLoading(false);
                if (params.length === 0) setParamsError(true);
            },
            () => { setParamsLoading(false); setParamsError(true); }
        );
    }, [meter, open]);

    /* ── fetch graph data when tag or time range changes ── */
    useEffect(() => {
        if (!meter || !selectedTag || !open) return;
        const timeOpt = TIME_OPTIONS.find((t) => t.value === timeRange) || TIME_OPTIONS[3];

        setGraphLoading(true);
        GetIoTSensorGraph(
            {
                deviceId:    meter.deviceId,
                tagId:       selectedTag,
                slaveId:     meter.slaveId,
                last:        timeOpt.value,
                aggregation: 'avg',
                interval:    timeOpt.interval,
            },
            (d) => {
                const raw = d?.data || (Array.isArray(d) ? d : []);
                const normalized = raw.map((point) => ({
                    label: point.label || point.time || point.timestamp || '',
                    value: point.value ?? point.energy ?? point.reading ?? 0,
                    avg:   point.avg   ?? point.average ?? null,
                }));
                setGraphData(normalized);
                setGraphLoading(false);
            },
            () => { setGraphData([]); setGraphLoading(false); }
        );
    }, [selectedTag, timeRange, meter, open]);

    /* ── fetch hour-wise / day-wise consumption when meter or range changes ── */
    useEffect(() => {
        if (!meter || !open) return;
        setConsumptionLoading(true);
        GetUtilityMeterDashboard(
            meter.id, consumptionRange,
            (d) => { setConsumptionData(d?.data || null); setConsumptionLoading(false); },
            () => { setConsumptionData(null); setConsumptionLoading(false); }
        );
    }, [meter, open, consumptionRange]);

    if (!meter) return null;

    const liveStats = sensorStats[meter.id];

    /* ── Hour-wise (today) / day-wise (week, month) consumption chart data ── */
    const consumptionChartData = !consumptionData ? [] : (
        consumptionRange === 'today'
            ? consumptionData.hourlyData.map((r) => ({ label: r.hr, value: r.consumption }))
            : consumptionData.dailyTotals.map((r) => ({ label: r.date, value: r.consumption }))
    );

    const uam = parseFloat(meter.uamSet)    || 0;
    const thr = parseFloat(meter.threshold) || 0;
    const breached   = thr > 0 && uam > thr;
    const typeColor  = METER_TYPE_COLOR[meter.liveMeterType] || METER_TYPE_COLOR[meter.meterType] || METER_TYPE_COLOR['Other'];

    /* ── Tag label helper ── */
    const tagLabel = (p) => p.tagName || p.Tag_name || p.name || p.tagId || p.id || String(p);

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{ sx: { width: 540, overflowX: 'hidden' } }}>

            {/* ── Header ── */}
            <Box sx={{ p: 2, backgroundColor: typeColor.bg, borderBottom: `3px solid ${typeColor.border}` }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={1}>
                        {METER_TYPE_ICON[meter.liveMeterType] || METER_TYPE_ICON[meter.meterType] || METER_TYPE_ICON['Other']}
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 17, color: typeColor.text, lineHeight: 1.2 }}>
                                {meter.meterName}
                            </Typography>
                            <Box display="flex" gap={0.8} mt={0.5} flexWrap="wrap">
                                <Chip label={meter.liveMeterType || meter.meterType} size="small"
                                    sx={{ backgroundColor: typeColor.border, color: '#fff', fontSize: 11, fontWeight: 600 }} />
                                <Chip
                                    icon={breached
                                        ? <WarningAmberIcon sx={{ fontSize: 14, color: '#f57c00 !important' }} />
                                        : <CheckCircleIcon  sx={{ fontSize: 14, color: '#2e7d32 !important' }} />}
                                    label={breached ? 'Alert' : 'Normal'}
                                    size="small"
                                    sx={{ backgroundColor: breached ? '#fff8e1' : '#e8f5e9',
                                          color: breached ? '#e65100' : '#2e7d32', fontSize: 11, fontWeight: 600 }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
                </Box>

                {/* meta row */}
                <Box display="flex" gap={2} flexWrap="wrap" mt={1.5}>
                    {[
                        { label: 'Plant',    val: meter.plantName    || '—' },
                        { label: 'Building', val: meter.buildingName || '—' },
                        { label: 'Device',   val: meter.edgeDeviceName || '—' },
                        { label: 'Slave',    val: meter.slaveId || '—' },
                    ].map((item) => (
                        <Box key={item.label}>
                            <Typography sx={{ fontSize: 10, color: typeColor.text, opacity: 0.7, lineHeight: 1 }}>
                                {item.label}
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: typeColor.text }}>
                                {item.val}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>

                {/* ── KPI row ── */}
                <Box display="flex" gap={2} mb={2}>
                    {[
                        { label: 'UAM Set',   val: meter.uamSet   || '—', color: '#1565c0' },
                        { label: 'Threshold', val: meter.threshold || '—', color: breached ? '#c62828' : '#2e7d32' },
                        {
                            label: 'Live Flow Rate',
                            val: liveStats?.flowRate != null ? `${liveStats.flowRate} ${liveStats.unit || 'L'}/min` : '—',
                            color: '#0277bd',
                        },
                    ].map((kpi) => (
                        <Box key={kpi.label} sx={{ flex: 1, p: 1.5, borderRadius: 2,
                            border: `1px solid ${kpi.color}30`, backgroundColor: `${kpi.color}10`, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: 11, color: '#546e7a' }}>{kpi.label}</Typography>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>{kpi.val}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* ── Sensor Stats from batch data ── */}
                {(() => {
                    const s = liveStats;
                    if (!s) return (
                        <Box sx={{ textAlign: 'center', py: 1.5, color: '#90a4ae' }}>
                            <Typography variant="body2" sx={{ fontSize: 12 }}>No sensor data available for today</Typography>
                        </Box>
                    );
                    return (
                        <>
                            <Divider sx={{ mb: 1.5 }}><Chip label="Today's Readings" size="small" /></Divider>
                            <Box display="flex" gap={1} mb={1.5}>
                                {[
                                    { label: 'Actual', val: s.actual, color: '#1565c0' },
                                    { label: 'Min',    val: s.min,    color: '#2e7d32' },
                                    { label: 'Max',    val: s.max,    color: '#c62828' },
                                    { label: 'Avg',    val: s.avg,    color: '#e65100' },
                                ].map((kpi) => (
                                    <Box key={kpi.label} sx={{
                                        flex: 1, p: 1, borderRadius: 2, textAlign: 'center',
                                        border: `1px solid ${kpi.color}30`, backgroundColor: `${kpi.color}10`,
                                    }}>
                                        <Typography sx={{ fontSize: 10, color: '#546e7a' }}>{kpi.label}</Typography>
                                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: kpi.color }}>
                                            {kpi.val ?? '—'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ mb: 1.5 }}><Chip label="Consumption (KLD)" size="small" /></Divider>
                            <Box display="flex" gap={1} mb={2}>
                                {[
                                    { label: 'Today',      val: s.consumptionToday,    color: '#0d47a1' },
                                    { label: 'Last 7 Days', val: s.consumptionLastWeek, color: '#4a148c' },
                                    { label: 'This Month', val: s.consumptionMonth,    color: '#006064' },
                                ].map((kpi) => (
                                    <Box key={kpi.label} sx={{
                                        flex: 1, p: 1, borderRadius: 2, textAlign: 'center',
                                        border: `1px solid ${kpi.color}30`, backgroundColor: `${kpi.color}10`,
                                    }}>
                                        <Typography sx={{ fontSize: 10, color: '#546e7a' }}>{kpi.label}</Typography>
                                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: kpi.color }}>
                                            {kpi.val ?? '—'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    );
                })()}

                {/* ── Hour-wise / Day-wise Consumption ── */}
                <Divider sx={{ mb: 1.5 }}><Chip label="Trends (KLD)" size="small" /></Divider>
                <Box display="flex" justifyContent="center" mb={1.5}>
                    <ToggleButtonGroup exclusive size="small" value={consumptionRange}
                        onChange={(_, v) => { if (v) setConsumptionRange(v); }}>
                        {CONSUMPTION_RANGE_OPTIONS.map((t) => (
                            <ToggleButton key={t.value} value={t.value} sx={{ fontSize: 11, px: 1.2, py: 0.4 }}>
                                {t.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>
                {consumptionLoading ? (
                    <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
                ) : consumptionChartData.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 2, color: '#90a4ae' }}>
                        <Typography variant="body2">No consumption data for selected range.</Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={190}>
                        <ComposedChart data={consumptionChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10 }} width={38} />
                            <RTooltip
                                contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: '#263238', color: '#fff', border: 'none' }}
                                labelStyle={{ color: '#b0bec5' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(v) => (v != null ? `${parseFloat(v).toFixed(2)} ${liveStats?.unit || 'L'}` : '—')}
                            />
                            <Bar dataKey="value" fill="#1565c0" radius={[3, 3, 0, 0]} name="Consumption" maxBarSize={30} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
                {consumptionData?.totalConsumption != null && (
                    <Typography sx={{ fontSize: 11, color: '#546e7a', textAlign: 'center', mt: 0.5 }}>
                        Total: {consumptionData.totalConsumption} {liveStats?.unit || 'L'}
                        {consumptionData.peakHour && ` · Peak: ${consumptionData.peakHour.consumption} ${liveStats?.unit || 'L'} (${consumptionData.peakHour.hr})`}
                    </Typography>
                )}

                {/* ── Sensor Trend ── */}
                <Divider sx={{ mb: 1.5 }}><Chip label="Live Sensor Trend" size="small" /></Divider>

                {paramsLoading ? (
                    <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>
                ) : paramsError || sensorParams.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3, color: '#90a4ae' }}>
                        <SpeedIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                        <Typography variant="body2">No sensor parameters configured for this device.</Typography>
                        <Typography variant="caption">Allocate sensor parameters via IoT Dashboard settings.</Typography>
                    </Box>
                ) : (
                    <>
                        {/* Parameter selector */}
                        <Box display="flex" gap={1.5} alignItems="center" mb={1.5} flexWrap="wrap">
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Parameter</InputLabel>
                                <Select value={selectedTag} label="Parameter"
                                    onChange={(e) => setSelectedTag(e.target.value)}>
                                    {sensorParams.map((p) => (
                                        <MenuItem key={p.tagId || p.id || p.Tag_name} value={p.tagId || p.id || p.Tag_name}>
                                            {tagLabel(p)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <ToggleButtonGroup exclusive size="small" value={timeRange}
                                onChange={(_, v) => { if (v) setTimeRange(v); }}>
                                {TIME_OPTIONS.map((t) => (
                                    <ToggleButton key={t.value} value={t.value}
                                        sx={{ fontSize: 11, px: 1.2, py: 0.4 }}>
                                        {t.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>

                        {/* Trend chart */}
                        {graphLoading ? (
                            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
                        ) : graphData.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 2, color: '#90a4ae' }}>
                                <Typography variant="body2">No data for selected range.</Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={190}>
                                <ComposedChart data={graphData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontSize: 10 }} width={38} />
                                    <RTooltip
                                        contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: '#263238', color: '#fff', border: 'none' }}
                                        labelStyle={{ color: '#b0bec5' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(v) => (v != null ? parseFloat(v).toFixed(2) : '—')}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#00bcd4" dot={false}
                                        strokeWidth={2} name="Reading" />
                                    {graphData.some((d) => d.avg != null) && (
                                        <Line type="monotone" dataKey="avg" stroke="#f97316" dot={false}
                                            strokeWidth={2} name="Average" />
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default MeterDetailDrawer;
