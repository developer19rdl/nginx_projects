import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import {
    FormControl, FormHelperText, Button, Grid, TextField, InputLabel, MenuItem, Select,
    Box, LinearProgress,
    Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Paper, Typography,
} from '@mui/material';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
    GetEnvReportCategoryDropdown,
    GetEnvReportData,
    GetEnvReportExportData,
} from "../../../../Services/NodeJsApiServices";

// Separate, simpler report than SensorReport.js per the client's ask: Temperature/
// Humidity/CO2/Pressure only, one actual reading per hour — no Min/Max/Avg
// sub-columns, industry-log style (Date & Hour | Temperature | Humidity | ...).
// Single Sensor + single Location (no multi-select) — Location is scoped to
// whichever sensor is picked, so only locations that actually have that sensor
// type show up (also fixes same-named locations from different buildings/floors
// showing as visually-duplicate entries regardless of sensor type).

// Display labels only — the underlying value sent to the backend (and matched
// against utility_meters.meterType/Tag_Name everywhere else in this app) stays
// CO2/Pressure; only how it reads in this dropdown changes.
const SENSOR_TYPE_OPTIONS = [
    { value: 'Temperature', label: 'Temperature' },
    { value: 'Humidity',    label: 'Humidity' },
    { value: 'CO2',         label: 'Air Quality' },
    { value: 'Pressure',    label: 'Air Pressure' },
];

const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const categoryLabel = (c) => c.categoryName;

const CHART_PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948'];
const colorForTag = (tagId) => CHART_PALETTE[Number(tagId) % CHART_PALETTE.length];

const formatNum = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    const n = parseFloat(v);
    return isNaN(n) ? String(v) : n.toFixed(2);
};

// Green when the reading is inside this column's configured Min/Max limit, red when
// it's outside — same convention as the gauge coloring on the Sensor Dashboards
// (IoTGauge.js). Columns with no limit configured (minLimit/maxLimit both null)
// render with no extra coloring, same as a meter with no limits set there.
const thresholdCellStyle = (value, col) => {
    if (value === null || value === undefined) return {};
    if (col.minLimit == null || col.maxLimit == null) return {};
    const n = parseFloat(value);
    if (isNaN(n)) return {};
    const lo = Math.min(col.minLimit, col.maxLimit);
    const hi = Math.max(col.minLimit, col.maxLimit);
    const inRange = n >= lo && n <= hi;
    return inRange
        ? { backgroundColor: '#e8f5e9', color: '#1b5e20', fontWeight: 700 }
        : { backgroundColor: '#ffebee', color: '#b71c1c', fontWeight: 700 };
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#fcfcfb', border: '1px solid #e1e0d9', borderRadius: 8,
            padding: '8px 12px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
            <p style={{ color: '#52514e', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ margin: '2px 0', display: 'flex', alignItems: 'center', gap: 6, color: '#0b0b0b' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span>{p.name}: <strong>{p.value === null || p.value === undefined ? '-' : Number(p.value).toFixed(2)}</strong></span>
                </p>
            ))}
        </div>
    );
};

const hdrCell = {
    background: "#1a3a5c", color: "#fff", fontWeight: 700, fontSize: "0.8rem",
    textAlign: "center", border: "1px solid #2d5a8e", padding: "8px 10px", whiteSpace: "nowrap",
};
const dataCell = { border: "1px solid #ddd", padding: "6px 8px", minWidth: 100, textAlign: "center" };

const EnvironmentalReport = () => {
    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");

    const [categoryList, setCategoryList] = useState([]);
    const [category, setCategory] = useState("");
    const [sensorType, setSensorType] = useState("");

    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [chartSeries, setChartSeries] = useState([]);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [totalRows, setTotalRows] = useState(0);

    // Location is scoped to the selected sensor — picking a sensor re-fetches the
    // location list from the server, filtered to locations that actually have that
    // sensor type grouped (and resets any previously chosen location).
    const handleSensorTypeChange = (type) => {
        setSensorType(type);
        setCategory("");
        setCategoryList([]);
        if (!type) return;
        GetEnvReportCategoryDropdown({ sensorType: type }, (d) => setCategoryList(d?.data || []), () => {});
    };

    const fetchReportPage = (pageIndex, size) => {
        setLoader(true);
        GetEnvReportData(
            { categoryId: category, sensorType, fromDate: fromDateTime, toDate: toDateTime, page: pageIndex + 1, pageSize: size },
            (d) => {
                setLoader(false);
                setColumns(d?.columns || []);
                setRows(d?.rows || []);
                setChartSeries(d?.chartSeries || []);
                setTotalRows(d?.pagination?.totalRows || 0);
            },
            () => {
                setLoader(false);
                setColumns([]); setRows([]); setChartSeries([]); setTotalRows(0);
            }
        );
    };

    const isValid = Boolean(category) && Boolean(sensorType) && fromDateTime && toDateTime;

    const handleSubmit = () => {
        if (!isValid) return;
        setSearched(true);
        setPage(0);
        fetchReportPage(0, rowsPerPage);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchReportPage(newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchReportPage(0, newSize);
    };

    const handleExportExcel = () => {
        if (!isValid) return;
        setExporting(true);
        GetEnvReportExportData(
            { categoryId: category, sensorType, fromDate: fromDateTime, toDate: toDateTime },
            (d) => {
                setExporting(false);
                const exportColumns = d?.columns || [];
                const exportRows = d?.rows || [];
                if (!exportColumns.length || !exportRows.length) return;

                const header = ["Date & Hour", ...exportColumns.map((c) => c.tagName)];
                const dataRows = exportRows.map((row) => [
                    row.dateTime,
                    ...exportColumns.map((c) => row.tags[c.tagId] ?? '-'),
                ]);
                const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
                ws['!cols'] = [{ wch: 20 }, ...exportColumns.map(() => ({ wch: 14 }))];
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Environmental Report");
                XLSX.writeFile(wb, `EnvironmentalReport_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
            },
            () => setExporting(false)
        );
    };

    return (
        <>
            <Box sx={{ backgroundColor: '#f5f7fa', border: '1px solid #e1e0d9', borderRadius: 1, p: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, color: '#1a3a5c', mb: 2 }}>
                    ENVIRONMENTAL HOURLY REPORT (Temperature / Humidity / Air Quality / Air Pressure)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth size="small" label="From Date Time" type="datetime-local" variant="outlined"
                            value={fromDateTime} required onChange={(e) => setFromDateTime(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth size="small" label="To Date Time" type="datetime-local" variant="outlined"
                            value={toDateTime} required onChange={(e) => setToDateTime(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: fromDateTime }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth required>
                            <InputLabel id="env-report-sensor-label">Sensor</InputLabel>
                            <Select size="small" labelId="env-report-sensor-label" label="Sensor"
                                value={sensorType} displayEmpty onChange={(e) => handleSensorTypeChange(e.target.value)}>
                                {SENSOR_TYPE_OPTIONS.map(({ value, label }) => (
                                    <MenuItem key={value} value={value}>{label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth required>
                            <InputLabel id="env-report-category-label">Location</InputLabel>
                            <Select size="small" labelId="env-report-category-label" label="Location"
                                value={category} displayEmpty disabled={!sensorType} onChange={(e) => setCategory(e.target.value)}>
                                {categoryList.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{categoryLabel(c)}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                {sensorType ? 'Pick a location' : 'Pick a sensor first'}
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={1}>
                        <Button variant="contained" size="small" disabled={!isValid} onClick={handleSubmit}>
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {loader && <Box sx={{ width: '100%' }}><LinearProgress /></Box>}

            {!loader && searched && rows.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No hourly readings found for the selected filters.</Typography>
                </Box>
            )}

            {!loader && columns.length > 0 && rows.length > 0 && (
                <Box sx={{ p: 2 }}>
                    <Paper elevation={2} sx={{ borderRadius: 2, p: 2, mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a3a5c', mb: 1 }}>Hourly Trend</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartSeries} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                <CartesianGrid stroke="#e1e0d9" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="dateTime" tick={{ fontSize: 11, fill: '#898781' }} tickFormatter={(v) => v ? String(v).slice(5, 16) : ''} minTickGap={32} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} width={50} />
                                <Tooltip content={<ChartTooltip />} />
                                {columns.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: '#52514e' }} />}
                                {columns.map((col) => (
                                    <Line key={col.tagId} type="monotone" dataKey={col.tagId} name={col.tagName}
                                        stroke={colorForTag(col.tagId)} strokeWidth={2} dot={{ r: 3, strokeWidth: 2, stroke: '#fcfcfb' }}
                                        connectNulls isAnimationActive={false} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        {columns.some((c) => c.minLimit != null && c.maxLimit != null) ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', backgroundColor: '#e8f5e9', border: '1px solid #1b5e20' }} />
                                    <Typography sx={{ fontSize: '0.75rem', color: '#52514e' }}>Within limit</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '2px', backgroundColor: '#ffebee', border: '1px solid #b71c1c' }} />
                                    <Typography sx={{ fontSize: '0.75rem', color: '#52514e' }}>Out of limit</Typography>
                                </Box>
                            </Box>
                        ) : <span />}
                        <Button variant="outlined" size="small" disabled={exporting} onClick={handleExportExcel}>
                            {exporting ? 'Exporting…' : 'Export Excel'}
                        </Button>
                    </Box>
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <Table size="small" sx={{ borderCollapse: "collapse", width: "100%" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...hdrCell, minWidth: 170 }}>Date & Hour</TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col.tagId} sx={hdrCell}>{col.tagName}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.dateTime} sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f7fa" } }}>
                                        <TableCell sx={{ ...dataCell, fontWeight: 600, textAlign: "left" }}>{row.dateTime}</TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.tagId} sx={{ ...dataCell, ...thresholdCellStyle(row.tags[col.tagId], col) }}>
                                                {formatNum(row.tags[col.tagId])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={totalRows}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                        />
                    </Paper>
                </Box>
            )}
        </>
    );
};

export default EnvironmentalReport;
