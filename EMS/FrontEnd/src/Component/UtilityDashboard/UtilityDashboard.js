import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Chip,
    FormControl, InputLabel, Select, MenuItem, Divider,
    CircularProgress, ToggleButtonGroup, ToggleButton,
    LinearProgress, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemIcon, ListItemText, Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import TableRowsIcon    from '@mui/icons-material/TableRows';
import GridViewIcon     from '@mui/icons-material/GridView';
import AccountTreeIcon  from '@mui/icons-material/AccountTree';
import ExpandMoreIcon   from '@mui/icons-material/ExpandMore';
import WaterDropIcon    from '@mui/icons-material/WaterDrop';
import GasMeterIcon     from '@mui/icons-material/GasMeter';
import AirIcon          from '@mui/icons-material/Air';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SpeedIcon        from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    UtilityMeterView, MeterPlantShow, MeterBuildingShowList,
    GetUtilitySensorStats,
} from '../../Services/NodeJsApiServices';
import MeterDetailDrawer from './MeterDetailDrawer';

/* ─── Constants ──────────────────────────────────────────────────────── */
const METER_TYPE_ICON = {
    'Water':          <WaterDropIcon sx={{ fontSize: 30, color: '#1565c0' }} />,
    'Gas':            <GasMeterIcon  sx={{ fontSize: 30, color: '#e65100' }} />,
    'Compressed Air': <AirIcon       sx={{ fontSize: 30, color: '#00838f' }} />,
    'Fuel':           <LocalGasStationIcon sx={{ fontSize: 30, color: '#6a1b9a' }} />,
    'Steam':          <DeviceThermostatIcon sx={{ fontSize: 30, color: '#b71c1c' }} />,
    'Other':          <SpeedIcon     sx={{ fontSize: 30, color: '#37474f' }} />,
};

const METER_TYPE_COLOR = {
    'Water':          { bg: '#e3f2fd', border: '#90caf9', text: '#0d47a1' },
    'Gas':            { bg: '#fff3e0', border: '#ffcc02', text: '#e65100' },
    'Compressed Air': { bg: '#e0f7fa', border: '#80deea', text: '#006064' },
    'Fuel':           { bg: '#f3e5f5', border: '#ce93d8', text: '#4a148c' },
    'Steam':          { bg: '#ffebee', border: '#ef9a9a', text: '#b71c1c' },
    'Other':          { bg: '#eceff1', border: '#b0bec5', text: '#263238' },
};

/* ─── Summary KPI card ───────────────────────────────────────────────── */
const SummaryCard = ({ label, value, icon, color }) => (
    <Card elevation={2} sx={{ borderRadius: 2, border: `1px solid ${color.border}`, backgroundColor: color.bg, height: '100%' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fff', boxShadow: 1 }}>{icon}</Box>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: color.text, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="body2" sx={{ color: color.text, opacity: 0.85, mt: 0.5 }}>{label}</Typography>
            </Box>
        </CardContent>
    </Card>
);

/* ─── Stat badge pill ────────────────────────────────────────────────── */
const StatBadge = ({ label, value, color }) => (
    <Box sx={{
        textAlign: 'center', px: 0.8, py: 0.4, borderRadius: 1, flexGrow: 1,
        backgroundColor: `${color}18`, border: `1px solid ${color}40`,
    }}>
        <Typography sx={{ fontSize: 9, color: '#546e7a', lineHeight: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1.4 }}>
            {value != null ? value : '—'}
        </Typography>
    </Box>
);

/* ─── Mini 3-point sparkline ─────────────────────────────────────────── */
const MiniSparkline = ({ data, color }) => {
    const valid = (data || []).filter((v) => v != null && !isNaN(v));
    if (valid.length < 2) return null;
    const chartData = valid.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={36}>
            <LineChart data={chartData} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
                <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.8} />
            </LineChart>
        </ResponsiveContainer>
    );
};

/* ─── Progress bar color helper ─────────────────────────────────────── */
const progressColor = (pct) => pct < 80 ? '#4caf50' : pct <= 100 ? '#ff9800' : '#f44336';

// Temperature/Humidity/CO2/Pressure meters have their own dedicated sidebar
// dashboards (SensorDashboard/*) — keep this page to the true consumable /
// counter-type utility meters (Water/Gas/Compressed Air/Fuel/Steam/Other) so
// they aren't listed twice.
const ENV_SENSOR_TYPES = ['Temperature', 'Humidity', 'CO2', 'Pressure'];

// Air pressure meters live on the Air Pressure Dashboard — also drop any meter
// whose (live or stored) type name mentions pressure, e.g. "Air pressure".
const isPressureMeter = (m) => /pressure/i.test(`${m.meterType || ''} ${m.liveMeterType || ''}`);

// liveMeterType is read via meterTypeId -> meter_type_master, so a rename in the
// Meter Type CRUD (e.g. Water -> Water flow) shows here; styling falls back to the
// raw stored meterType so a renamed type keeps its colour/icon.
const typeLabel = (m) => m.liveMeterType || m.meterType;
const typeColor = (m) => METER_TYPE_COLOR[typeLabel(m)] || METER_TYPE_COLOR[m.meterType] || METER_TYPE_COLOR['Other'];
const typeIcon  = (m) => METER_TYPE_ICON[typeLabel(m)]  || METER_TYPE_ICON[m.meterType]  || METER_TYPE_ICON['Other'];

// Fixed display order for the known meters; everything else follows by name.
const METER_NAME_ORDER = ['facility', 'ro water', 'stp in', 'stp out'];
const meterRank = (m) => {
    const i = METER_NAME_ORDER.indexOf((m.meterName || '').trim().toLowerCase());
    return i === -1 ? METER_NAME_ORDER.length : i;
};
const byMeterOrder = (a, b) =>
    meterRank(a) - meterRank(b) || (a.meterName || '').localeCompare(b.meterName || '');

/* ─── Main Component ─────────────────────────────────────────────────── */
const UtilityDashboard = () => {
    const [allMeters,    setAllMeters]    = useState([]);
    const [sensorStats,  setSensorStats]  = useState({});
    const [plantList,    setPlantList]    = useState([]);
    const [buildingList, setBuildingList] = useState([]);
    const [filterPlant,    setFilterPlant]    = useState('');
    const [filterBuilding, setFilterBuilding] = useState('');
    const [filterType,     setFilterType]     = useState('');
    const [loading,  setLoading]  = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [selectedMeter, setSelectedMeter] = useState(null);

    useEffect(() => {
        let pending = 2;
        const done = () => { if (--pending === 0) setLoading(false); };

        UtilityMeterView((d) => {
            const meters = (d?.data || [])
                .filter((m) => !ENV_SENSOR_TYPES.includes(m.meterType) && !isPressureMeter(m))
                .sort(byMeterOrder);
            setAllMeters(meters);
            done();
        }, () => done());
        GetUtilitySensorStats((d) => { setSensorStats(d?.data || {}); done(); }, () => done());
        MeterPlantShow((d) => setPlantList(d?.data || []), () => {});
        MeterBuildingShowList((d) => setBuildingList(d?.data || []), () => {});
    }, []);

    /* ── Filtered list ── */
    const filteredRows = allMeters.filter((m) => {
        if (filterPlant    && String(m.plantId)    !== String(filterPlant))    return false;
        if (filterBuilding && String(m.buildingId) !== String(filterBuilding)) return false;
        if (filterType     && typeLabel(m)         !== filterType)             return false;
        return true;
    });

    /* ── Summary ── */
    const meterTypes = [...new Set(allMeters.map(typeLabel).filter(Boolean))];
    const typeCounts = meterTypes.map((type) => {
        const ofType = allMeters.filter((m) => typeLabel(m) === type);
        return { type, count: ofType.length, sample: ofType[0] };
    });
    const totalMeters = allMeters.length;

    /* ── Table columns ── */
    const columns = [
        {
            field: 'sNo', headerName: 'SL No', width: 70, align: 'center', headerAlign: 'center',
            renderCell: (params) => filteredRows.indexOf(params.row) + 1,
        },
        { field: 'plantName',    headerName: 'Plant',      flex: 1, minWidth: 110, align: 'center', headerAlign: 'center' },
        { field: 'buildingName', headerName: 'Building',   flex: 1, minWidth: 110, align: 'center', headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'meterName',    headerName: 'Meter Name', flex: 1, minWidth: 140, align: 'center', headerAlign: 'center' },
        {
            field: 'meterType', headerName: 'Meter Type', flex: 1, minWidth: 140, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const c = typeColor(p.row);
                return <Chip label={typeLabel(p.row)} size="small"
                    sx={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600, fontSize: 12 }} />;
            },
        },
        { field: 'edgeDeviceName', headerName: 'IO Model', flex: 1, minWidth: 120, align: 'center', headerAlign: 'center' },
        {
            field: 'actual', headerName: 'Actual', width: 90, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const s = sensorStats[p.row.id];
                return <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1565c0' }}>{s?.actual ?? '—'}</Typography>;
            },
        },
        {
            field: 'consumptionToday', headerName: 'Today', width: 90, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const s = sensorStats[p.row.id];
                return <Typography sx={{ fontSize: 12, color: '#0d47a1' }}>{s?.consumptionToday ?? '—'}</Typography>;
            },
        },
        {
            field: 'consumptionLastWeek', headerName: 'Last 7d', width: 90, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const s = sensorStats[p.row.id];
                return <Typography sx={{ fontSize: 12, color: '#4a148c' }}>{s?.consumptionLastWeek ?? '—'}</Typography>;
            },
        },
        {
            field: 'avgLastWeek', headerName: 'Last 7d Avg', width: 105, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const s = sensorStats[p.row.id];
                return <Typography sx={{ fontSize: 12, color: '#4a148c' }}>{s?.avgLastWeek ?? '—'}</Typography>;
            },
        },
        {
            field: 'consumptionMonth', headerName: 'This Month', width: 105, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const s = sensorStats[p.row.id];
                return <Typography sx={{ fontSize: 12, color: '#006064' }}>{s?.consumptionMonth ?? '—'}</Typography>;
            },
        },
        {
            field: 'avgMonth', headerName: 'This Month Avg', width: 125, align: 'center', headerAlign: 'center',
            renderCell: (p) => {
                const s = sensorStats[p.row.id];
                return <Typography sx={{ fontSize: 12, color: '#006064' }}>{s?.avgMonth ?? '—'}</Typography>;
            },
        },
    ];

    /* ── Tree grouping ── */
    const treeData = filteredRows.reduce((acc, meter) => {
        const plant    = meter.plantName    || 'Unknown Plant';
        const building = meter.buildingName || 'Unknown Building';
        if (!acc[plant])          acc[plant]          = {};
        if (!acc[plant][building]) acc[plant][building] = [];
        acc[plant][building].push(meter);
        return acc;
    }, {});

    return (
        <Box sx={{ p: 2 }}>
            {/* ── Page Header + View Toggle ── */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <WaterDropIcon sx={{ color: '#1565c0', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0d47a1', fontFamily: 'Roboto Slab' }}>
                        Utility Dashboard
                    </Typography>
                </Box>

                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={viewMode}
                    onChange={(_, v) => { if (v) setViewMode(v); }}
                    sx={{ '& .MuiToggleButton-root': { px: 1.5 } }}
                >
                    <ToggleButton value="table" title="Table View">
                        <TableRowsIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>Table</Typography>
                    </ToggleButton>
                    <ToggleButton value="card" title="Card View">
                        <GridViewIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>Cards</Typography>
                    </ToggleButton>
                    <ToggleButton value="tree" title="Tree View">
                        <AccountTreeIcon fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>Tree</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* ── Summary KPI Cards ── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard label="Total Utility Meters" value={totalMeters}
                        icon={<SpeedIcon sx={{ fontSize: 32, color: '#1565c0' }} />}
                        color={{ bg: '#e8eaf6', border: '#9fa8da', text: '#1a237e' }} />
                </Grid>
                {typeCounts.filter((t) => t.count > 0).slice(0, 6).map((t) => (
                    <Grid item xs={12} sm={6} md={3} key={t.type}>
                        <SummaryCard label={`${t.type} Meters`} value={t.count}
                            icon={typeIcon(t.sample)}
                            color={typeColor(t.sample)} />
                    </Grid>
                ))}
            </Grid>

            {/* ── Filters ── */}
            <Card elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Plant</InputLabel>
                                <Select value={filterPlant} label="Plant"
                                    onChange={(e) => { setFilterPlant(e.target.value); setFilterBuilding(''); }}>
                                    <MenuItem value="">All Plants</MenuItem>
                                    {plantList.map((p) => <MenuItem key={p.id} value={p.id}>{p.plantName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Building</InputLabel>
                                <Select value={filterBuilding} label="Building"
                                    onChange={(e) => setFilterBuilding(e.target.value)}>
                                    <MenuItem value="">All Buildings</MenuItem>
                                    {buildingList.map((b) => <MenuItem key={b.id} value={b.id}>{b.buildingName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Meter Type</InputLabel>
                                <Select value={filterType} label="Meter Type"
                                    onChange={(e) => setFilterType(e.target.value)}>
                                    <MenuItem value="">All Types</MenuItem>
                                    {meterTypes.map((t) => (
                                        <MenuItem key={t} value={t}>{t}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <Typography variant="body2" sx={{ color: '#546e7a' }}>
                                Showing <strong>{filteredRows.length}</strong> of <strong>{totalMeters}</strong> meters
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* ══════════ TABLE VIEW ══════════ */}
            {viewMode === 'table' && (
                <Card elevation={1} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <DataGrid
                                rows={filteredRows}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                disableSelectionOnClick
                                autoHeight
                                getRowId={(row) => row.id}
                                onRowClick={(params) => setSelectedMeter(params.row)}
                                sx={{
                                    border: 'none',
                                    cursor: 'pointer',
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#0e2d5d', color: '#fff', fontSize: 13, fontWeight: 700,
                                    },
                                    '& .MuiDataGrid-columnSeparator': { display: 'none' },
                                    '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: '#f5f5f5' },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                                    '& .MuiDataGrid-cell': { fontSize: 13 },
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ══════════ CARD VIEW ══════════ */}
            {viewMode === 'card' && (
                loading ? (
                    <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                ) : filteredRows.length === 0 ? (
                    <Box textAlign="center" py={6} color="#90a4ae">
                        <SpeedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                        <Typography>No meters match the selected filters.</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {filteredRows.map((meter) => {
                            const c       = typeColor(meter);
                            const icon    = typeIcon(meter);
                            const uam    = parseFloat(meter.uamSet)    || 0;
                            const thr     = parseFloat(meter.threshold) || 0;
                            const pct     = thr > 0 ? Math.min((uam / thr) * 100, 200) : 0;
                            const breached = thr > 0 && uam > thr;
                            const pColor  = progressColor(pct);
                            const s       = sensorStats[meter.id];

                            /* sparkline: 3-point daily-avg trend */
                            const sparkData = s ? [
                                s.consumptionMonth != null ? +(s.consumptionMonth / 30).toFixed(2) : null,
                                s.consumptionLastWeek != null ? +(s.consumptionLastWeek / 7).toFixed(2) : null,
                                s.consumptionToday,
                            ] : [];

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={meter.id}>
                                    <Card
                                        elevation={2}
                                        onClick={() => setSelectedMeter(meter)}
                                        sx={{
                                            borderRadius: 2,
                                            border: `1.5px solid ${breached ? '#ef9a9a' : c.border}`,
                                            backgroundColor: c.bg,
                                            cursor: 'pointer',
                                            height: '100%',
                                            transition: 'box-shadow 0.2s, transform 0.1s',
                                            '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                                        }}
                                    >
                                        <CardContent>
                                            {/* Header */}
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {icon}
                                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: c.text, lineHeight: 1.3 }}>
                                                        {meter.meterName}
                                                    </Typography>
                                                </Box>
                                                {breached && <WarningAmberIcon sx={{ color: '#f57c00', fontSize: 20, flexShrink: 0 }} />}
                                            </Box>

                                            <Typography variant="body2" sx={{ color: c.text, opacity: 0.75, mt: 0.5, fontSize: 12 }}>
                                                {meter.plantName || '—'}  |  {meter.buildingName || '—'}
                                            </Typography>

                                            <Divider sx={{ my: 1, borderColor: `${c.border}80` }} />

                                            {/* Type + Slave */}
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Chip label={typeLabel(meter)} size="small"
                                                    sx={{ backgroundColor: c.border, color: '#fff', fontSize: 11, fontWeight: 600 }} />
                                                <Typography sx={{ fontSize: 12, color: c.text }}>
                                                    Slave: <strong>{meter.slaveId || '—'}</strong>
                                                </Typography>
                                            </Box>

                                            {/* UAM / Threshold */}
                                            <Box display="flex" justifyContent="space-between" mb={thr > 0 ? 0.5 : 0}>
                                                <Typography sx={{ fontSize: 12, color: c.text }}>
                                                    UAM: <strong>{meter.uamSet || '—'}</strong>
                                                </Typography>
                                                <Typography sx={{ fontSize: 12, color: c.text }}>
                                                    Threshold: <strong>{meter.threshold || '—'}</strong>
                                                </Typography>
                                            </Box>

                                            {/* Progress bar */}
                                            {thr > 0 && (
                                                <Box mt={0.5}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(pct, 100)}
                                                        sx={{
                                                            height: 7, borderRadius: 4,
                                                            backgroundColor: '#ffffff90',
                                                            '& .MuiLinearProgress-bar': { backgroundColor: pColor },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: 10, color: pColor, mt: 0.2, textAlign: 'right', fontWeight: 600 }}>
                                                        {Math.round(pct)}%
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* ── Sensor Stats ── */}
                                            <Divider sx={{ my: 1, borderColor: `${c.border}80` }} />
                                            {!s ? (
                                                <Typography sx={{ fontSize: 10, color: '#90a4ae', textAlign: 'center', py: 0.5 }}>
                                                    No sensor data today
                                                </Typography>
                                            ) : (
                                                <>
                                                    {/* Actual / Min / Max / Avg */}
                                                    <Box display="flex" gap={0.5} mb={0.5}>
                                                        <StatBadge label="Actual" value={s.actual}  color="#1565c0" />
                                                        <StatBadge label="Min"    value={s.min}     color="#2e7d32" />
                                                        <StatBadge label="Max"    value={s.max}     color="#c62828" />
                                                        <StatBadge label="Avg"    value={s.avg}     color="#e65100" />
                                                    </Box>
                                                    {/* Today / Last 7d / This Month */}
                                                    <Box display="flex" gap={0.5} mb={0.5}>
                                                        <StatBadge label="Today"      value={s.consumptionToday}    color="#0d47a1" />
                                                        <StatBadge label="Last 7d"    value={s.consumptionLastWeek} color="#4a148c" />
                                                        <StatBadge label="This Month" value={s.consumptionMonth}    color="#006064" />
                                                    </Box>
                                                    {/* Sparkline */}
                                                    <MiniSparkline data={sparkData} color={c.border} />
                                                </>
                                            )}

                                            <Button size="small"
                                                sx={{ mt: 1, fontSize: 11, color: c.text, p: 0, textTransform: 'none', '&:hover': { background: 'transparent', textDecoration: 'underline' } }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedMeter(meter); }}>
                                                View Details →
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )
            )}

            {/* ══════════ TREE VIEW ══════════ */}
            {viewMode === 'tree' && (
                loading ? (
                    <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                ) : Object.keys(treeData).length === 0 ? (
                    <Box textAlign="center" py={6} color="#90a4ae">
                        <AccountTreeIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                        <Typography>No meters match the selected filters.</Typography>
                    </Box>
                ) : (
                    <Box>
                        {Object.entries(treeData).map(([plant, buildings]) => {
                            const plantTotal = Object.values(buildings).flat().length;
                            return (
                                <Accordion key={plant} defaultExpanded elevation={2}
                                    sx={{ mb: 1.5, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                                        sx={{ backgroundColor: '#e8eaf6', borderRadius: '8px 8px 0 0' }}>
                                        <AccountTreeIcon sx={{ mr: 1, color: '#3949ab', fontSize: 20 }} />
                                        <Typography sx={{ fontWeight: 700, color: '#1a237e', flexGrow: 1 }}>
                                            {plant}
                                        </Typography>
                                        <Chip label={`${plantTotal} meters`} size="small"
                                            sx={{ mr: 1, backgroundColor: '#3949ab', color: '#fff', fontSize: 11 }} />
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        {Object.entries(buildings).map(([building, meters]) => (
                                            <Accordion key={building} elevation={0}
                                                sx={{ '&:before': { display: 'none' }, borderTop: '1px solid #e0e0e0' }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                                                    sx={{ pl: 4, backgroundColor: '#f5f5f5', minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#424242', flexGrow: 1 }}>
                                                        {building}
                                                    </Typography>
                                                    <Chip label={meters.length} size="small"
                                                        sx={{ mr: 1, fontSize: 11, backgroundColor: '#e0e0e0', color: '#424242' }} />
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 0 }}>
                                                    <List dense disablePadding>
                                                        {meters.map((meter) => {
                                                            const c       = typeColor(meter);
                                                            const icon    = typeIcon(meter);
                                                            const breached = meter.uamSet && meter.threshold &&
                                                                parseFloat(meter.uamSet) > parseFloat(meter.threshold);
                                                            const s = sensorStats[meter.id];

                                                            return (
                                                                <ListItem key={meter.id} button
                                                                    onClick={() => setSelectedMeter(meter)}
                                                                    sx={{
                                                                        pl: 6, borderBottom: '1px solid #f5f5f5',
                                                                        alignItems: 'flex-start',
                                                                        '&:hover': { backgroundColor: '#e3f2fd' },
                                                                    }}>
                                                                    <ListItemIcon sx={{ minWidth: 34, mt: 0.5 }}>
                                                                        {React.cloneElement(icon, { sx: { fontSize: 20, color: icon.props.sx.color } })}
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                                                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>
                                                                                    {meter.meterName}
                                                                                </Typography>
                                                                                <Chip label={typeLabel(meter)} size="small"
                                                                                    sx={{ backgroundColor: c.bg, color: c.text,
                                                                                          border: `1px solid ${c.border}`, fontSize: 10 }} />
                                                                                {breached && (
                                                                                    <Chip
                                                                                        icon={<WarningAmberIcon sx={{ fontSize: '12px !important', color: '#f57c00 !important' }} />}
                                                                                        label="Alert"
                                                                                        size="small"
                                                                                        sx={{ backgroundColor: '#fff8e1', color: '#e65100', fontSize: 10 }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        }
                                                                        secondary={
                                                                            <Box>
                                                                                <Typography variant="caption" sx={{ color: '#78909c' }}>
                                                                                    Device: {meter.edgeDeviceName || '—'} &nbsp;|&nbsp; Slave: {meter.slaveId || '—'} &nbsp;|&nbsp; UAM: {meter.uamSet || '—'}
                                                                                </Typography>
                                                                                {s && (
                                                                                    <Box display="flex" gap={0.5} mt={0.4} flexWrap="wrap">
                                                                                        <StatBadge label="Actual"  value={s.actual}              color="#1565c0" />
                                                                                        <StatBadge label="Today"   value={s.consumptionToday}    color="#0d47a1" />
                                                                                        <StatBadge label="7d"      value={s.consumptionLastWeek} color="#4a148c" />
                                                                                        <StatBadge label="Month"   value={s.consumptionMonth}    color="#006064" />
                                                                                    </Box>
                                                                                )}
                                                                            </Box>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            );
                                                        })}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                )
            )}

            {/* ── Detail Drawer ── */}
            <MeterDetailDrawer
                open={Boolean(selectedMeter)}
                onClose={() => setSelectedMeter(null)}
                meter={selectedMeter}
                allMeters={allMeters}
                sensorStats={sensorStats}
            />
        </Box>
    );
};

export default UtilityDashboard;
