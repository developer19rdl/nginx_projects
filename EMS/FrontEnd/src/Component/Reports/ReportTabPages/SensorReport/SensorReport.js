import React, { useEffect, useMemo, useState } from "react";
import './SensorReport.css';
import * as XLSX from 'xlsx';
import {
    FormControl, FormHelperText, Button, Grid, TextField, InputLabel, MenuItem, Select,
    Checkbox, ListItemText, Box, LinearProgress, Autocomplete,
    Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Paper, Typography,
} from '@mui/material';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ReferenceArea,
} from 'recharts';
import {
    GetSensorReportMeterDropdown,
    GetSensorReportTagDropdown,
    GetSensorReportData,
    GetSensorReportExportData,
} from "../../../../Services/NodeJsApiServices";

const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const MAX_TAGS = 6;

// Fixed-order categorical palette (validated for CVD-safe adjacent contrast).
// Assigned by tagId (identity), not by array position, so a tag's line color
// never changes when other tags are added/removed from the selection.
const CHART_PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const colorForTag = (tagId) => CHART_PALETTE[Number(tagId) % CHART_PALETTE.length];

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
    background: "#1a3a5c",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.8rem",
    textAlign: "center",
    border: "1px solid #2d5a8e",
    padding: "8px 10px",
    whiteSpace: "nowrap",
};

const subHdrCell = {
    background: "#2d5a8e",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.75rem",
    textAlign: "center",
    border: "1px solid #1a3a5c",
    padding: "6px 8px",
};

const dataCell = {
    border: "1px solid #ddd",
    padding: "6px 8px",
    minWidth: 70,
    textAlign: "center",
    whiteSpace: "nowrap",
};

const SUB_COLUMNS = ["Value", "Min", "Max", "Avg"];

const formatNum = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    const n = parseFloat(v);
    return isNaN(n) ? String(v) : n.toFixed(2);
};







const SensorReport = () => {
    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");

    // Cascade: Energy Meter (friendly name, resolves to deviceId+slaveId) -> Tag Name
    const [meterList, setMeterList] = useState([]);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [tagList, setTagList] = useState([]);

    const [device, setDevice] = useState("");
    const [slave, setSlave] = useState("");
    const [tags, setTags] = useState([]); // required, max 6
    const [tagLimitHit, setTagLimitHit] = useState(false);

    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]); // current table page only
    const [chartSeries, setChartSeries] = useState([]); // full selected date range, Avg-only — independent of table page
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Server-side table pagination — MUI TablePagination's `page` is 0-indexed,
    // the API's `page` param is 1-indexed (fetchReportPage does the +1).
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [totalRows, setTotalRows] = useState(0);

    // Drag-to-zoom on the trend chart: refAreaLeft/Right track the in-progress
    // drag selection, zoomRange holds the committed (dateTime) bounds.
    const [zoomRange, setZoomRange] = useState(null); // { left, right } or null = full range
    const [refAreaLeft, setRefAreaLeft] = useState('');
    const [refAreaRight, setRefAreaRight] = useState('');

    // The chart plots the full-range series returned by the API (Avg per tag per
    // dateTime) — it does NOT depend on `rows`/`columns` (the current table page),
    // so paging through the table never changes what the chart/zoom show.
    const chartData = chartSeries;

    // Slice down to the zoomed-in window, if one is active.
    const displayedChartData = useMemo(() => {
        if (!zoomRange) return chartData;
        const leftIdx = chartData.findIndex((d) => d.dateTime === zoomRange.left);
        const rightIdx = chartData.findIndex((d) => d.dateTime === zoomRange.right);
        if (leftIdx === -1 || rightIdx === -1) return chartData;
        return chartData.slice(Math.min(leftIdx, rightIdx), Math.max(leftIdx, rightIdx) + 1);
    }, [chartData, zoomRange]);

    const handleChartMouseDown = (e) => {
        if (!e?.activeLabel) return;
        setRefAreaLeft(e.activeLabel);
        setRefAreaRight(e.activeLabel);
    };

    const handleChartMouseMove = (e) => {
        if (!refAreaLeft || !e?.activeLabel) return;
        setRefAreaRight(e.activeLabel);
    };

    const handleChartMouseUp = () => {
        if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
            const leftIdx = chartData.findIndex((d) => d.dateTime === refAreaLeft);
            const rightIdx = chartData.findIndex((d) => d.dateTime === refAreaRight);
            const [left, right] = leftIdx <= rightIdx ? [refAreaLeft, refAreaRight] : [refAreaRight, refAreaLeft];
            setZoomRange({ left, right });
        }
        setRefAreaLeft('');
        setRefAreaRight('');
    };

    const handleResetZoom = () => {
        setZoomRange(null);
        setRefAreaLeft('');
        setRefAreaRight('');
    };

    // On mount: load Energy Meters (friendly names) instead of raw devices — an
    // easier way for the user to find the right one than hunting for a device/slave
    // pair. Only meters whose (deviceId, slaveId) actually has sensor tags are listed.
    useEffect(() => {
        GetSensorReportMeterDropdown(
            (dataObject) => setMeterList(dataObject?.data || []),
            () => { }
        );
    }, []);

    // Tag list cascades directly on the selected meter — deviceId/slaveId are
    // resolved from the meter record, no separate Slave ID selection needed.
    const handleMeterChange = (meter) => {
        setSelectedMeter(meter);
        setDevice(meter?.deviceId || "");
        setSlave(meter?.slaveId != null ? String(meter.slaveId) : "");
        setTags([]);
        setTagLimitHit(false);
        setTagList([]);
        if (!meter) return;

        GetSensorReportTagDropdown(
            { deviceId: meter.deviceId, slaveId: meter.slaveId },
            (dataObject) => setTagList(dataObject?.data || []),
            () => { }
        );
    };

    // Tag Name allows at most MAX_TAGS selections — extra clicks are ignored
    // and surfaced as a small warning instead of silently accepted.
    const handleTagsChange = (e) => {
        const value = e.target.value;
        if (value.length > MAX_TAGS) {
            setTagLimitHit(true);
            return;
        }
        setTagLimitHit(false);
        setTags(value);
    };

    // Fetches one table page; chart/columns come back full-range every time
    // (independent of which page is requested) so paging never disturbs them.
    const fetchReportPage = (pageIndex, size) => {
        setLoader(true);
        GetSensorReportData(
            {
                deviceId: device,
                slaveId: slave,
                tagIds: tags,
                fromDate: fromDateTime,
                toDate: toDateTime,
                page: pageIndex + 1,
                pageSize: size,
            },
            (dataObject) => {
                setLoader(false);
                setColumns(dataObject?.columns || []);
                setRows(dataObject?.rows || []);
                setChartSeries(dataObject?.chartSeries || []);
                setTotalRows(dataObject?.pagination?.totalRows || 0);
            },
            () => {
                setLoader(false);
                setColumns([]);
                setRows([]);
                setChartSeries([]);
                setTotalRows(0);
            }
        );
    };

    const handleSubmit = () => {
        if (!device || !slave || !tags.length || !fromDateTime || !toDateTime) return;

        setSearched(true);
        setPage(0);
        handleResetZoom();
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
    // Builds and downloads the workbook from a full { columns, rows } pair —
    // shared by the export flow below (which always fetches the complete,
    // unpaginated date range so the download isn't limited to one table page).
    const buildAndDownloadWorkbook = (exportColumns, exportRows) => {
        // --- Build the header rows (same 2-row merged structure as the on-screen table) ---
        const headerRow1 = ["Date Time"];
        const headerRow2 = [""]; // blank under "Date Time" since it row-spans

        exportColumns.forEach((col) => {
            headerRow1.push(col.tagName, "", "", ""); // tagName + 3 blanks (will be merged)
            headerRow2.push(...SUB_COLUMNS);           // Value, Min, Max, Avg
        });

        // --- Build the data rows ---
        const dataRows = exportRows.map((row) => {
            const line = [row.dateTime];
            exportColumns.forEach((col) => {
                const bucket = row.tags[col.tagId] || {};
                line.push(
                    bucket.value ?? '-',
                    bucket.min ?? '-',
                    bucket.max ?? '-',
                    bucket.avg ?? '-'
                );
            });
            return line;
        });

        const sheetData = [headerRow1, headerRow2, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // --- Merges: "Date Time" spans 2 rows; each tag name spans 4 columns ---
        const merges = [
            { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Date Time (rowSpan)
        ];
        exportColumns.forEach((_, i) => {
            const startCol = 1 + i * 4;
            merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 3 } });
        });
        ws['!merges'] = merges;

        // --- Column widths ---
        ws['!cols'] = [
            { wch: 20 },
            ...exportColumns.flatMap(() => [{ wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }]),
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sensor Report");

        const fileTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        XLSX.writeFile(wb, `SensorReport_${fileTimestamp}.xlsx`);
    };

    // Export always pulls the full filtered date range (not just the current
    // table page) via the unpaginated /export endpoint.
    const handleExportExcel = () => {
        if (!device || !slave || !tags.length || !fromDateTime || !toDateTime) return;

        setExporting(true);
        GetSensorReportExportData(
            {
                deviceId: device,
                slaveId: slave,
                tagIds: tags,
                fromDate: fromDateTime,
                toDate: toDateTime,
            },
            (dataObject) => {
                setExporting(false);
                const exportColumns = dataObject?.columns || [];
                const exportRows = dataObject?.rows || [];
                if (exportColumns.length && exportRows.length) {
                    buildAndDownloadWorkbook(exportColumns, exportRows);
                }
            },
            () => setExporting(false)
        );
    };

    return (
        <>
            <div className="sensorReport_bottomContainer">
                <div className="sensorReport_headerContainer">
                    <span>SENSOR REPORT</span>
                </div>

                <Grid
                    container
                    spacing={2}
                    paddingLeft={"50px"}
                    paddingRight={"30px"}
                    paddingTop={"30px"}
                    paddingBottom={"30px"}
                    alignItems="center"
                >
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="From Date Time"
                            type="datetime-local"
                            variant="outlined"
                            value={fromDateTime}
                            required
                            onChange={(e) => setFromDateTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="To Date Time"
                            type="datetime-local"
                            variant="outlined"
                            value={toDateTime}
                            onChange={(e) => setToDateTime(e.target.value)}
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: fromDateTime }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={4}>
                        <Autocomplete
                            size="small"
                            options={meterList}
                            value={selectedMeter}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option?.displayName || ''}
                            onChange={(event, newValue) => handleMeterChange(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Energy Meter" placeholder="Search by meter name…" required />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3}>
                        <FormControl fullWidth required error={tagLimitHit}>
                            <InputLabel id="sensor-report-tag-label">Tag Name</InputLabel>
                            <Select
                                size="small"
                                labelId="sensor-report-tag-label"
                                label="Tag Name"
                                multiple
                                disabled={!slave}
                                value={tags}
                                onChange={handleTagsChange}
                                renderValue={(selected) => tagList
                                    .filter((t) => selected.includes(t.id))
                                    .map((t) => t.displayName)
                                    .join(", ")}
                            >
                                {tagList.map((data) => {
                                    const isChecked = tags.indexOf(data.id) > -1;
                                    return (
                                        <MenuItem key={data.id} value={data.id} disabled={!isChecked && tags.length >= MAX_TAGS}>
                                            <Checkbox checked={isChecked} />
                                            <ListItemText primary={data.displayName} />
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                            <FormHelperText>
                                {tagLimitHit
                                    ? `You can select a maximum of ${MAX_TAGS} tag names`
                                    : `Select up to ${MAX_TAGS} tag names`}
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={1} lg={1}>
                        <Button
                            variant="contained"
                            size="small"
                            disabled={!device || !slave || !tags.length || !fromDateTime || !toDateTime}
                            onClick={handleSubmit}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </div>

            <div className="energy_table_bottomContainer">
                {loader &&
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
                <div className="energy_headerContainer">
                    <span>Sensor Report</span>
                </div>

                {!loader && searched && rows.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">No sensor data found for the selected filters.</Typography>
                    </Box>
                )}

                {!loader && columns.length > 0 && rows.length > 0 && (
                    <Box sx={{ p: 2 }}>
                        <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a3a5c' }}>
                                    Sensor Trend (Average)
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#898781' }}>
                                        Drag on the chart to zoom
                                    </Typography>
                                    {zoomRange && (
                                        <Button variant="outlined" size="small" onClick={handleResetZoom}>
                                            Reset Zoom
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart
                                    data={displayedChartData}
                                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                                    onMouseDown={handleChartMouseDown}
                                    onMouseMove={handleChartMouseMove}
                                    onMouseUp={handleChartMouseUp}
                                    style={{ cursor: 'crosshair', userSelect: 'none' }}
                                >
                                    <CartesianGrid stroke="#e1e0d9" strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="dateTime"
                                        tick={{ fontSize: 11, fill: '#898781' }}
                                        tickFormatter={(v) => v ? String(v).slice(5, 16) : ''}
                                        minTickGap={32}
                                        axisLine={{ stroke: '#c3c2b7' }}
                                        tickLine={false}
                                        allowDataOverflow
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#898781' }}
                                        axisLine={{ stroke: '#c3c2b7' }}
                                        tickLine={false}
                                        width={50}
                                        allowDataOverflow
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    {columns.length > 1 && (
                                        <Legend wrapperStyle={{ fontSize: 12, color: '#52514e' }} />
                                    )}
                                    {columns.map((col) => (
                                        <Line
                                            key={col.tagId}
                                            type="monotone"
                                            dataKey={col.tagId}
                                            name={col.tagName}
                                            stroke={colorForTag(col.tagId)}
                                            strokeWidth={2}
                                            dot={{ r: 3, strokeWidth: 2, stroke: '#fcfcfb' }}
                                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fcfcfb' }}
                                            connectNulls
                                            isAnimationActive={false}
                                        />
                                    ))}
                                    {refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight && (
                                        <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#2a78d6" fillOpacity={0.15} />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                )}

                {!loader && columns.length > 0 && rows.length > 0 && (

                    <Box sx={{ overflowX: "auto", p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button variant="outlined" size="small" disabled={exporting} onClick={handleExportExcel}>
                                {exporting ? 'Exporting…' : 'Export Excel'}
                            </Button>
                        </Box>
                        <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                            <Table size="small" sx={{ borderCollapse: "collapse", width: "100%" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell rowSpan={2} sx={{ ...hdrCell, minWidth: 170, borderRight: "2px solid #fff", verticalAlign: "middle" }}>
                                            Date Time
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.tagId} colSpan={SUB_COLUMNS.length} sx={{ ...hdrCell, borderLeft: "2px solid #fff" }}>
                                                {col.tagName}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    <TableRow>
                                        {columns.map((col) => (
                                            SUB_COLUMNS.map((sub, si) => (
                                                <TableCell key={`${col.tagId}-${sub}`} sx={{ ...subHdrCell, borderLeft: si === 0 ? "2px solid #fff" : "1px solid #1a3a5c" }}>
                                                    {sub}
                                                </TableCell>
                                            ))
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.dateTime} sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f7fa" } }}>
                                            <TableCell sx={{ ...dataCell, fontWeight: 600, borderRight: "2px solid #ddd", textAlign: "left" }}>
                                                {row.dateTime}
                                            </TableCell>
                                            {columns.map((col) => {
                                                const bucket = row.tags[col.tagId];
                                                return (
                                                    <React.Fragment key={col.tagId}>
                                                        <TableCell sx={{ ...dataCell, borderLeft: "2px solid #ddd" }}>{formatNum(bucket?.value)}</TableCell>
                                                        <TableCell sx={dataCell}>{formatNum(bucket?.min)}</TableCell>
                                                        <TableCell sx={dataCell}>{formatNum(bucket?.max)}</TableCell>
                                                        <TableCell sx={dataCell}>{formatNum(bucket?.avg)}</TableCell>
                                                    </React.Fragment>
                                                );
                                            })}
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
            </div>
        </>
    );
};

export default SensorReport;
