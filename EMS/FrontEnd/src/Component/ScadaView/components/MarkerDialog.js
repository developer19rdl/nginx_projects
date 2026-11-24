import React, { useState, useMemo } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Grid, TextField, Typography, Box,
    FormControl, InputLabel, Select, MenuItem,
    Tabs, Tab, Checkbox, FormControlLabel, FormGroup,
} from "@mui/material";
import {
    CHART_LAST_OPTIONS, CHART_AGGREGATION_OPTIONS, CHART_INTERVAL_OPTIONS,
    CHART_TYPE_OPTIONS, MAX_COMBINED_SENSORS,
} from "../constants/scadaDefaults";

const MarkerDialog = ({
    open,
    onClose,
    onExited,
    editingMarkerId,
    markerData,
    onMarkerDataChange,
    selectedDevice,    setSelectedDevice,
    selectedSensors,   setSelectedSensors,
    selectedSlaveId,   setSelectedSlaveId,
    chartMode,         setChartMode,
    selectedCombinedDevices, setSelectedCombinedDevices,
    deviceList,
    slaveIdList,
    selectList,
    combinedSensorOptions,
    onLoadSlaveIds,
    onLoadSensors,
    onLoadCombinedSensorOptions,
    onAdd,
    onDelete,
    tableConfig,
}) => {
    const update = onMarkerDataChange;
    const { widgetType, statusType, combinedSensors } = markerData;
    const isChartWidget = widgetType === "linechart" || widgetType === "barchart" || widgetType === "areachart";
    const isCombinedMode = chartMode === "combined";
    // A plain text label ("Line 1" / "Server room") has no sensor value at
    // all — the only other widget type that skips Data Source is N/A, every
    // other type needs a live reading to show anything.
    const isTextWidget = widgetType === "text";

    const sensorsByDevice = useMemo(() => {
        const groups = [];
        const byId = new Map();
        (combinedSensorOptions || []).forEach((row) => {
            if (!byId.has(row.deviceId)) {
                const group = { deviceId: row.deviceId, deviceName: row.deviceName, rows: [] };
                byId.set(row.deviceId, group);
                groups.push(group);
            }
            byId.get(row.deviceId).rows.push(row);
        });
        return groups;
    }, [combinedSensorOptions]);

    const isSensorChecked = (row) => (combinedSensors || []).some(
        (s) => s.deviceId === row.deviceId && s.slaveId === row.slaveId && s.tagId === row.tagId
    );

    const toggleCombinedSensor = (row, checked) => {
        const current = combinedSensors || [];
        if (checked) {
            update({ combinedSensors: [...current, row] });
        } else {
            update({
                combinedSensors: current.filter(
                    (s) => !(s.deviceId === row.deviceId && s.slaveId === row.slaveId && s.tagId === row.tagId)
                ),
            });
        }
    };

    const handleChartModeChange = (e, newMode) => {
        setChartMode(newMode);
        if (newMode === "combined" && !["linechart", "barchart", "areachart", "cyclebadge"].includes(widgetType)) {
            update({ widgetType: "linechart" });
        }
    };

    const handleCombinedDevicesChange = (e) => {
        const newDeviceIds = e.target.value;
        setSelectedCombinedDevices(newDeviceIds);
        onLoadCombinedSensorOptions(newDeviceIds);
        // Drop any already-checked sensors whose device was just deselected
        update({ combinedSensors: (combinedSensors || []).filter((s) => newDeviceIds.includes(s.deviceId)) });
    };

    // Derive sub-columns for the selected column group
    const selectedGroup = tableConfig?.columnGroups?.find(g => g.label === markerData.tableColGroup);
    const subColOptions = selectedGroup?.subColumns || [];
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handleConfirmDelete = () => {
        setConfirmDeleteOpen(false);
        onDelete();
    };

    const handleIconUpload = (key, maxBytes, file) => {
        if (!file) return;
        if (file.size > maxBytes) { alert(`Icon must be under ${maxBytes / 1024} KB`); return; }
        const reader = new FileReader();
        reader.onload = (ev) => update({ [key]: ev.target.result });
        reader.readAsDataURL(file);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionProps={{ onExited }}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, padding: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: "bold", pb: 1, borderBottom: "1px solid #eee", mb: 2 }}>
                {editingMarkerId ? "Edit Marker" : "Add New Marker"}
            </DialogTitle>

            <Tabs
                value={chartMode}
                onChange={handleChartModeChange}
                sx={{ px: 3, borderBottom: "1px solid #eee", minHeight: 40 }}
            >
                <Tab value="single" label="Normal" sx={{ minHeight: 40, py: 0.5 }} />
                <Tab value="combined" label="Analytics" sx={{ minHeight: 40, py: 0.5 }} />
            </Tabs>

            <DialogContent sx={{ overflowY: "auto" }}>

                    {!isCombinedMode && !isTextWidget && (
                        <>
                            {/* ── DATA SOURCE ─────────────────────────────────── */}
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.85rem" }}>
                                Data Source
                            </Typography>
                            <Grid container spacing={1.5} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Select Device</InputLabel>
                                        <Select
                                            value={selectedDevice}
                                            label="Select Device"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => {
                                                const deviceId = e.target.value;
                                                setSelectedDevice(deviceId);
                                                setSelectedSlaveId("");
                                                setSelectedSensors("");
                                                onLoadSlaveIds(deviceId);
                                            }}
                                        >
                                            {deviceList.map((d) => (
                                                <MenuItem key={d.id} value={d.id}>{d.deviceName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Slave ID</InputLabel>
                                        <Select
                                            value={selectedSlaveId}
                                            label="Slave ID"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => {
                                                const sv = e.target.value;
                                                setSelectedSlaveId(sv);
                                                setSelectedSensors("");
                                                if (selectedDevice && sv) {
                                                    onLoadSensors({ deviceId: selectedDevice, slaveId: sv });
                                                }
                                            }}
                                            disabled={slaveIdList.length === 0}
                                        >
                                            {slaveIdList.map((s) => (
                                                <MenuItem key={s.id ?? s.slaveId} value={s.slaveId}>
                                                    {s.slaveInformation ? `${s.slaveId} - ${s.slaveInformation}` : s.slaveId}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Select Sensor / Tag</InputLabel>
                                        <Select
                                            value={selectedSensors}
                                            label="Select Sensor / Tag"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => setSelectedSensors(e.target.value)}
                                            disabled={selectList.length === 0}
                                        >
                                            {selectList.map((s) => (
                                                <MenuItem key={s.id} value={s.id}>{s.tagDisplayName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {isCombinedMode && (
                        <>
                            {/* ── ANALYTICS DATA SOURCE (combined multi-sensor) ── */}
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.85rem" }}>
                                Data Source — combine any Device × Slave × Tag
                            </Typography>
                            <Grid container spacing={1.5} alignItems="center">
                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Select Devices</InputLabel>
                                        <Select
                                            multiple
                                            value={selectedCombinedDevices}
                                            label="Select Devices"
                                            sx={{ height: "40px" }}
                                            onChange={handleCombinedDevicesChange}
                                            renderValue={(selected) =>
                                                deviceList.filter((d) => selected.includes(d.id)).map((d) => d.deviceName).join(", ")
                                            }
                                        >
                                            {deviceList.map((d) => (
                                                <MenuItem key={d.id} value={d.id}>
                                                    <Checkbox size="small" checked={selectedCombinedDevices.includes(d.id)} />
                                                    <Typography variant="body2">{d.deviceName}</Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ maxHeight: 220, overflowY: "auto", border: "1px solid #ddd", borderRadius: 1, p: 1.5 }}>
                                        {sensorsByDevice.length === 0 ? (
                                            <Typography variant="caption" color="text.secondary">
                                                Select one or more devices above to see their sensors.
                                            </Typography>
                                        ) : (
                                            sensorsByDevice.map((group) => (
                                                <Box key={group.deviceId} sx={{ mb: 1.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "primary.main", display: "block", mb: 0.5 }}>
                                                        {group.deviceName}
                                                    </Typography>
                                                    <FormGroup sx={{ pl: 1 }}>
                                                        {group.rows.map((row) => {
                                                            const checked = isSensorChecked(row);
                                                            const atCap = (combinedSensors || []).length >= MAX_COMBINED_SENSORS;
                                                            return (
                                                                <FormControlLabel
                                                                    key={`${row.deviceId}-${row.slaveId}-${row.tagId}`}
                                                                    control={
                                                                        <Checkbox
                                                                            size="small"
                                                                            checked={checked}
                                                                            disabled={!checked && atCap}
                                                                            onChange={(e) => toggleCombinedSensor(row, e.target.checked)}
                                                                        />
                                                                    }
                                                                    label={<Typography variant="body2">{`Slave ${row.slaveId} / ${row.tagName}`}</Typography>}
                                                                />
                                                            );
                                                        })}
                                                    </FormGroup>
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color={(combinedSensors || []).length >= MAX_COMBINED_SENSORS ? "error" : "text.secondary"}
                                        sx={{ display: "block", mt: 0.5 }}
                                    >
                                        {(combinedSensors || []).length} / {MAX_COMBINED_SENSORS} sensors selected
                                    </Typography>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {/* ── DISPLAY SETTINGS ────────────────────────────── */}
                    <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: "bold", fontSize: "0.85rem" }}>
                        Display Settings
                    </Typography>
                    <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label={isTextWidget ? "Label Text" : "Display Name"} size="small" value={markerData.label} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ label: e.target.value })} />
                        </Grid>
                        {!isTextWidget && (
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth label="Unit" size="small" value={markerData.unit} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ unit: e.target.value })} />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{isCombinedMode ? "Chart Type" : "Widget Type"}</InputLabel>
                                <Select
                                    value={widgetType || (isCombinedMode ? "linechart" : "card")}
                                    label={isCombinedMode ? "Chart Type" : "Widget Type"}
                                    sx={{ height: "40px" }}
                                    onChange={(e) => update({ widgetType: e.target.value })}
                                >
                                    {isCombinedMode ? (
                                        CHART_TYPE_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))
                                    ) : (
                                        [
                                            <MenuItem key="card" value="card">Standard Card</MenuItem>,
                                            <MenuItem key="text" value="text">Text Label</MenuItem>,
                                            <MenuItem key="semicircle" value="semicircle">Semi-Circle Gauge</MenuItem>,
                                            <MenuItem key="status" value="status">Status Card</MenuItem>,
                                            <MenuItem key="progress" value="progress">Progress Bar</MenuItem>,
                                            <MenuItem key="sevensegment" value="sevensegment">7-Segment Display</MenuItem>,
                                            <MenuItem key="linechart" value="linechart">Line Chart</MenuItem>,
                                            <MenuItem key="barchart" value="barchart">Bar Chart</MenuItem>,
                                            <MenuItem key="areachart" value="areachart">Area Chart</MenuItem>,
                                        ]
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        {widgetType === "sevensegment" && (
                            <>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth type="number" label="Font Size (px)" size="small" value={markerData.fontSize} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ fontSize: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth type="number" label="Decimal Points" size="small" value={markerData.decimalPoints} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ decimalPoints: e.target.value })} />
                                </Grid>
                            </>
                        )}

                        {isTextWidget && (
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth type="number" label="Font Size (px)" size="small" value={markerData.fontSize} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ fontSize: e.target.value })} />
                            </Grid>
                        )}

                        {widgetType === "status" && (
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status Type</InputLabel>
                                    <Select value={statusType || "analog"} label="Status Type" sx={{ height: "40px" }} onChange={(e) => update({ statusType: e.target.value })}>
                                        <MenuItem value="analog">Analog (Multi-state)</MenuItem>
                                        <MenuItem value="digital">Digital (On/Off)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Data Alignment</InputLabel>
                                <Select value={markerData.alignment || "top"} label="Data Alignment" sx={{ height: "40px" }} onChange={(e) => update({ alignment: e.target.value })}>
                                    <MenuItem value="top">Top (Above coordinate)</MenuItem>
                                    <MenuItem value="bottom">Bottom (Below coordinate)</MenuItem>
                                    <MenuItem value="left">Left of coordinate</MenuItem>
                                    <MenuItem value="right">Right of coordinate</MenuItem>
                                    <MenuItem value="center">Center on coordinate</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* ── CHART SETTINGS (Line / Bar) ─────────────────── */}
                    {isChartWidget && (
                        <>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: "bold", fontSize: "0.85rem" }}>
                                Chart Settings
                            </Typography>
                            <Grid container spacing={1.5} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Last</InputLabel>
                                        <Select
                                            value={markerData.chartLast || "8hr"}
                                            label="Last"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => update({ chartLast: e.target.value })}
                                        >
                                            {CHART_LAST_OPTIONS.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Data Aggregation</InputLabel>
                                        <Select
                                            value={markerData.chartAggregation || "avg"}
                                            label="Data Aggregation"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => update({ chartAggregation: e.target.value })}
                                        >
                                            {CHART_AGGREGATION_OPTIONS.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Grouping Interval</InputLabel>
                                        <Select
                                            value={markerData.chartInterval || "15min"}
                                            label="Grouping Interval"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => update({ chartInterval: e.target.value })}
                                        >
                                            {CHART_INTERVAL_OPTIONS.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField fullWidth type="number" label="Chart Width (px)" size="small" value={markerData.chartWidth} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ chartWidth: e.target.value })} />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField fullWidth type="number" label="Chart Height (px)" size="small" value={markerData.chartHeight} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ chartHeight: e.target.value })} />
                                </Grid>
                            </Grid>

                            {/* ── LIMIT LINES (Spec / Control) ─────────────── */}
                            <Typography variant="caption" sx={{ display: "block", mt: 2, mb: 1, fontWeight: "bold", color: "text.secondary" }}>
                                Limit Lines <Typography component="span" variant="caption" color="text.secondary">(optional — drawn as horizontal reference lines on the chart; leave blank to hide)</Typography>
                            </Typography>
                            <Grid container spacing={1.5} alignItems="center">
                                <Grid item xs={6} sm={3}>
                                    <TextField fullWidth type="number" label="Spec Min" size="small" placeholder="None" value={markerData.specMin} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ specMin: e.target.value })} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField fullWidth type="number" label="Spec Max" size="small" placeholder="None" value={markerData.specMax} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ specMax: e.target.value })} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField fullWidth type="number" label="Control Low" size="small" placeholder="None" value={markerData.controlLow} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ controlLow: e.target.value })} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField fullWidth type="number" label="Control Max" size="small" placeholder="None" value={markerData.controlMax} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ controlMax: e.target.value })} />
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {/* ── POSITIONING & STYLING ───────────────────────── */}
                    <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: "bold", fontSize: "0.85rem" }}>
                        Positioning & Styling
                    </Typography>
                    <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={6} sm={3}>
                            <TextField fullWidth type="number" label="X Coord (%)" size="small" value={markerData.x} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ x: e.target.value })} />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField fullWidth type="number" label="Y Coord (%)" size="small" value={markerData.y} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ y: e.target.value })} />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField fullWidth type="color" label="Text Color" size="small" value={markerData.textColor || "#ffffff"} onChange={(e) => update({ textColor: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputBase-root": { height: "40px" }, "& input": { height: "24px", cursor: "pointer", padding: "0 4px" } }} />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField fullWidth type="color" label="Bg Color" size="small" value={markerData.bgColor || "#040408"} onChange={(e) => update({ bgColor: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputBase-root": { height: "40px" }, "& input": { height: "24px", cursor: "pointer", padding: "0 4px" } }} />
                        </Grid>
                    </Grid>

                    {(widgetType === "card" || widgetType === "status" || isTextWidget) && (
                        <Grid container spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                            <Grid item xs={4} sm={3}>
                                <TextField fullWidth type="number" label="Width (px)" size="small" placeholder="Auto" value={markerData.cardWidth} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ cardWidth: e.target.value })} />
                            </Grid>
                            <Grid item xs={4} sm={3}>
                                <TextField fullWidth type="number" label="Height (px)" size="small" placeholder="Auto" value={markerData.cardHeight} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ cardHeight: e.target.value })} />
                            </Grid>
                            <Grid item xs={4} sm={3}>
                                <TextField fullWidth type="number" label="Border Radius (px)" size="small" placeholder="Default" value={markerData.cardRadius} sx={{ "& .MuiInputBase-root": { height: "40px" } }} onChange={(e) => update({ cardRadius: e.target.value })} />
                            </Grid>
                        </Grid>
                    )}

                    {/* ── TABLE CELL MAPPING ──────────────────────────── */}
                    {tableConfig?.rows?.length > 0 && tableConfig?.columnGroups?.length > 0 && (
                        <>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: "bold", fontSize: "0.85rem" }}>
                                Table Cell Mapping <Typography component="span" variant="caption" color="text.secondary">(optional — shows this marker's value inside the table)</Typography>
                            </Typography>
                            <Grid container spacing={1.5} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Table Row</InputLabel>
                                        <Select
                                            value={markerData.tableRow || ""}
                                            label="Table Row"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => update({ tableRow: e.target.value })}
                                        >
                                            <MenuItem value=""><em>— None —</em></MenuItem>
                                            {tableConfig.rows.map((r) => (
                                                <MenuItem key={r} value={r}>{r}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Column Group</InputLabel>
                                        <Select
                                            value={markerData.tableColGroup || ""}
                                            label="Column Group"
                                            sx={{ height: "40px" }}
                                            onChange={(e) => update({ tableColGroup: e.target.value, tableSubCol: "" })}
                                        >
                                            <MenuItem value=""><em>— None —</em></MenuItem>
                                            {tableConfig.columnGroups.map((g) => (
                                                <MenuItem key={g.label} value={g.label}>{g.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {subColOptions.length > 0 && (
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Sub-Column</InputLabel>
                                            <Select
                                                value={markerData.tableSubCol || ""}
                                                label="Sub-Column"
                                                sx={{ height: "40px" }}
                                                onChange={(e) => update({ tableSubCol: e.target.value })}
                                            >
                                                <MenuItem value=""><em>— None —</em></MenuItem>
                                                {subColOptions.map((c) => (
                                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    )}

                    {/* ── ANALOG STATUS CONFIG ────────────────────────── */}
                    {widgetType === "status" && statusType === "analog" && (
                        <Box sx={{ mt: 2, p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: "bold", fontSize: "0.8rem", color: "#666", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                Analog Status Configuration (5 Icon Levels)
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: "bold" }}>Icon Size:</Typography>
                                    <Select size="small" value={markerData.iconSize || "medium"} onChange={(e) => update({ iconSize: e.target.value })} sx={{ height: 28, fontSize: "0.75rem", minWidth: 80 }}>
                                        <MenuItem value="small">Small</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="big">Big</MenuItem>
                                    </Select>
                                </Box>
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", mb: 2, color: "text.secondary", bgcolor: "#fff3e0", p: 0.5, borderRadius: 1, textAlign: "center", border: "1px solid #ffe0b2" }}>
                                Use square icons (PNG/SVG) under <b>5 KB</b> for best performance.
                            </Typography>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs={2}><Typography variant="caption" sx={{ fontWeight: "bold", color: "#888" }}>Level</Typography></Grid>
                                <Grid item xs={5}><Typography variant="caption" sx={{ fontWeight: "bold", color: "#888" }}>Threshold</Typography></Grid>
                                <Grid item xs={5}><Typography variant="caption" sx={{ fontWeight: "bold", color: "#888" }}>Icon</Typography></Grid>

                                {[1, 2, 3, 4].map((level) => (
                                    <React.Fragment key={level}>
                                        <Grid item xs={2}><Typography variant="body2" sx={{ fontSize: "0.75rem" }}>Icon {level}</Typography></Grid>
                                        <Grid item xs={5}>
                                            <TextField fullWidth type="number" size="small" label={`Threshold ${level}`} value={markerData[`statusThreshold${level}`]} sx={{ "& .MuiInputBase-root": { height: "36px" } }} onChange={(e) => update({ [`statusThreshold${level}`]: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Button variant="outlined" component="label" fullWidth size="small" sx={{ textTransform: "none", justifyContent: "space-between", height: "36px", fontSize: "0.75rem" }}>
                                                {markerData[`statusImage${level}`] ? "Change" : `Icon ${level} (5KB)`}
                                                {markerData[`statusImage${level}`] && <img src={markerData[`statusImage${level}`]} style={{ width: 18, height: 18, marginLeft: 8 }} alt="" />}
                                                <input type="file" hidden accept="image/*" onChange={(e) => handleIconUpload(`statusImage${level}`, 5120, e.target.files[0])} />
                                            </Button>
                                        </Grid>
                                    </React.Fragment>
                                ))}

                                <Grid item xs={2}><Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main", fontSize: "0.75rem" }}>Default</Typography></Grid>
                                <Grid item xs={5}><Typography variant="caption" sx={{ fontSize: "0.7rem", color: "#999" }}>Value &gt; Threshold 4</Typography></Grid>
                                <Grid item xs={5}>
                                    <Button variant="contained" component="label" fullWidth size="small" sx={{ textTransform: "none", justifyContent: "space-between", height: "36px", fontSize: "0.75rem" }}>
                                        {markerData.statusImage5 ? "Change Default" : "Default (5KB)"}
                                        {markerData.statusImage5 && <img src={markerData.statusImage5} style={{ width: 18, height: 18, marginLeft: 8 }} alt="" />}
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleIconUpload("statusImage5", 5120, e.target.files[0])} />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* ── DIGITAL STATUS CONFIG ───────────────────────── */}
                    {widgetType === "status" && statusType === "digital" && (
                        <Box sx={{ mt: 2, p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: "bold", fontSize: "0.8rem", color: "#666", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                Digital Status Configuration (On/Off Icons)
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: "bold" }}>Icon Size:</Typography>
                                    <Select size="small" value={markerData.iconSize || "medium"} onChange={(e) => update({ iconSize: e.target.value })} sx={{ height: 28, fontSize: "0.75rem", minWidth: 80 }}>
                                        <MenuItem value="small">Small</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="big">Big</MenuItem>
                                    </Select>
                                </Box>
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", mb: 2, color: "text.secondary", bgcolor: "#fff3e0", p: 0.5, borderRadius: 1, textAlign: "center", border: "1px solid #ffe0b2" }}>
                                Use square icons (PNG/SVG) under <b>5 KB</b> for best performance.
                            </Typography>
                            <Grid container spacing={1.5} alignItems="center">
                                {[
                                    { key: "statusImage0", label: "Off Icon" },
                                    { key: "statusImage1_digital", label: "On Icon" },
                                ].map(({ key, label }) => (
                                    <Grid item xs={12} sm={4} key={key}>
                                        <Button variant="outlined" component="label" fullWidth size="small" sx={{ textTransform: "none", justifyContent: "space-between", height: "40px", fontSize: "0.8rem" }}>
                                            {markerData[key] ? `Change ${label}` : `Upload ${label} (5KB)`}
                                            {markerData[key] && <img src={markerData[key]} style={{ width: 22, height: 22, marginLeft: 8 }} alt="" />}
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleIconUpload(key, 5120, e.target.files[0])} />
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* ── THRESHOLD COLORS ────────────────────────────── */}
                    {["semicircle", "gauge", "progress", "sevensegment"].includes(widgetType) && (
                        <>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 3, mb: 1, fontWeight: "bold" }}>
                                {widgetType === "sevensegment" ? "Threshold Colors" : "Gauge Range & Threshold Colors"}
                            </Typography>
                            <Grid container spacing={2}>
                                {widgetType !== "sevensegment" && (
                                    <Grid item xs={4}>
                                        <TextField fullWidth type="number" label="Max Value" size="small" value={markerData.maxVal} onChange={(e) => update({ maxVal: e.target.value })} />
                                    </Grid>
                                )}
                                <Grid item xs={4}>
                                    <TextField fullWidth type="number" label="Threshold 1" size="small" value={markerData.threshold1} onChange={(e) => update({ threshold1: e.target.value })} />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField fullWidth type="number" label="Threshold 2" size="small" value={markerData.threshold2} onChange={(e) => update({ threshold2: e.target.value })} />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField fullWidth type="color" label="Low Color" size="small" value={markerData.color1} onChange={(e) => update({ color1: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& input": { height: "24px", cursor: "pointer", padding: "0 4px" } }} />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField fullWidth type="color" label="Mid Color" size="small" value={markerData.color2} onChange={(e) => update({ color2: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& input": { height: "24px", cursor: "pointer", padding: "0 4px" } }} />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField fullWidth type="color" label="High Color" size="small" value={markerData.color3} onChange={(e) => update({ color3: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& input": { height: "24px", cursor: "pointer", padding: "0 4px" } }} />
                                </Grid>
                            </Grid>
                        </>
                    )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 3, borderTop: "1px solid #eee", justifyContent: "space-between" }}>
                {editingMarkerId ? (
                    <>
                        <Button color="error" variant="outlined" onClick={() => setConfirmDeleteOpen(true)} sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}>Delete Marker</Button>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button color="inherit" onClick={onClose} sx={{ fontWeight: "bold", borderRadius: 2 }}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={onAdd} sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}>Update Marker</Button>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                        <Button color="inherit" onClick={onClose} sx={{ fontWeight: "bold", borderRadius: 2 }}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={onAdd} sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}>Add Marker</Button>
                    </Box>
                )}
            </DialogActions>

            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle sx={{ fontWeight: "bold" }}>Delete Marker</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this marker? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete} sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default MarkerDialog;
