import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
    Box, Typography, Divider, ToggleButtonGroup, ToggleButton, IconButton,
} from "@mui/material";
import AddIcon         from "@mui/icons-material/Add";
import DeleteIcon     from "@mui/icons-material/Delete";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AutorenewIcon  from "@mui/icons-material/Autorenew";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon      from "@mui/icons-material/Close";
import EditIcon        from "@mui/icons-material/Edit";
import CheckIcon       from "@mui/icons-material/Check";
import LinkIcon        from "@mui/icons-material/Link";
import {
    normalizeCellBinding, makeEmptyWidget, usesSensorList as usesSensorListType,
    widgetTypeLabel, widgetSummary,
} from "../utils/cellBindingUtils";

const DEFAULTS = { textColor: "#1a3a5c", bgColor: "#e8f5e9" };

const ColorSwatch = ({ label, value, onChange }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
            sx={{ width: 32, height: 32, borderRadius: 1, border: "1px solid #ccc", background: value, cursor: "pointer", flexShrink: 0 }}
            component="label"
        >
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
                style={{ opacity: 0, width: "100%", height: "100%", cursor: "pointer", border: "none" }} />
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
    </Box>
);

const widgetIcon = (widgetType, props) => {
    switch (widgetType) {
        case "status":     return <FiberManualRecordIcon {...props} />;
        case "cyclebadge": return <AutorenewIcon {...props} />;
        case "multicard":  return <ViewModuleIcon {...props} />;
        default:           return <CreditCardIcon {...props} />;
    }
};

const CellBindingDialog = ({
    open, onClose,
    cellInfo,        // { row, colGroup, subCol }
    existingBinding, // full binding object or null
    hasExisting,
    deviceList, slaveIdList, selectList,
    selectedDevice, setSelectedDevice,
    selectedSlaveId, setSelectedSlaveId,
    selectedTagKey, setSelectedTagKey,
    onLoadSlaveIds, onLoadSensors,
    onSave,   // (bindingObj) => void
    onClear,
    scadaTabs = [],      // for the "Navigate to Screen" dropdown
    currentTabIndex,     // this cell's own tab — excluded from the dropdown
    mode = "cell",       // "cell" = a row×column intersection (one or more stacked
                          // widgets + nav + nav-only color); "row" = the row-label
                          // column itself (nav + color only, no widgets)
}) => {
    // Shared by both modes: a row label's own display + colors, and — for a
    // cell with no widgets at all — the nav-link chip's label + colors (the
    // two never apply at once, since isRowMode is exclusive of cell mode).
    const [label,      setLabel]      = useState("");
    const [textColor,  setTextColor]  = useState(DEFAULTS.textColor);
    const [bgColor,    setBgColor]    = useState(DEFAULTS.bgColor);
    // "" = no click-navigation on this cell; otherwise a scadaTabs index (string, from the Select)
    const [navigateTarget, setNavigateTarget] = useState("");

    // Cell mode only: the widgets stacked in this cell, and which one (if
    // any) is currently expanded for editing — an accordion, one open at a time.
    const [widgets,   setWidgets]   = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    // Transient inputs for the sensor about to be added to the open widget's
    // combinedSensors list — cleared after each "+ Add Sensor" click.
    const [sensorLabel, setSensorLabel] = useState("");
    const [sensorUnit,  setSensorUnit]  = useState("");
    // Which already-added combined-sensor chip is being inline-edited — { wi, si }
    // (widget index, sensor index) or null. Deliberately separate state from the
    // "+ Add Sensor" scratch above so the two flows never collide.
    const [editingChip,   setEditingChip]   = useState(null);
    const [editChipLabel, setEditChipLabel] = useState("");
    const [editChipUnit,  setEditChipUnit]  = useState("");
    const clearChipEdit = () => { setEditingChip(null); setEditChipLabel(""); setEditChipUnit(""); };

    // Initialise from existingBinding whenever the dialog opens
    useEffect(() => {
        if (!open) return;
        const eb = existingBinding || {};
        setLabel(eb.label || "");
        setTextColor(eb.textColor || DEFAULTS.textColor);
        setBgColor(eb.bgColor || DEFAULTS.bgColor);
        setNavigateTarget(
            eb.navigateTargetTabIndex === null || eb.navigateTargetTabIndex === undefined
                ? "" : String(eb.navigateTargetTabIndex)
        );

        if (mode === "row") {
            setWidgets([]);
            setOpenIndex(null);
        } else {
            const normalized = normalizeCellBinding(eb);
            if (normalized.widgets.length) {
                setWidgets(normalized.widgets.map((w) => ({ ...makeEmptyWidget(), ...w })));
                setOpenIndex(null);
            } else {
                // Nothing configured yet — open a fresh blank widget right away so
                // the dialog isn't empty; it's dropped on Save if left untouched.
                setWidgets([makeEmptyWidget()]);
                setOpenIndex(0);
            }
        }
        setSelectedDevice("");
        setSelectedSlaveId("");
        setSelectedTagKey("");
        setSensorLabel("");
        setSensorUnit("");
        clearChipEdit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, existingBinding, mode]);

    if (!cellInfo) return null;
    const isRowMode = mode === "row";
    const parts = [cellInfo.row, cellInfo.colGroup, cellInfo.subCol].filter(Boolean);

    const updateWidget = (idx, patch) => {
        setWidgets((prev) => prev.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
    };

    const handleToggleWidget = (idx) => {
        clearChipEdit();
        if (openIndex === idx) { setOpenIndex(null); return; }
        setOpenIndex(idx);
        setSensorLabel("");
        setSensorUnit("");
        const w = widgets[idx];
        if (usesSensorListType(w.widgetType)) {
            setSelectedDevice(""); setSelectedSlaveId(""); setSelectedTagKey("");
        } else {
            setSelectedDevice(w.deviceId || "");
            setSelectedSlaveId(w.slaveId || "");
            setSelectedTagKey(w.tagKey || "");
            if (w.deviceId) onLoadSlaveIds(w.deviceId);
            if (w.deviceId && w.slaveId) onLoadSensors({ deviceId: w.deviceId, slaveId: w.slaveId });
        }
    };

    const handleAddWidget = () => {
        clearChipEdit();
        setWidgets((prev) => {
            const next = [...prev, makeEmptyWidget()];
            setOpenIndex(next.length - 1);
            return next;
        });
        setSelectedDevice(""); setSelectedSlaveId(""); setSelectedTagKey("");
        setSensorLabel(""); setSensorUnit("");
    };

    const handleRemoveWidget = (idx) => {
        clearChipEdit();
        setWidgets((prev) => prev.filter((_, i) => i !== idx));
        setOpenIndex((prev) => {
            if (prev === null || idx === prev) return null;
            return idx < prev ? prev - 1 : prev;
        });
    };

    const handleWidgetTypeChange = (idx, newType) => {
        const w = widgets[idx];
        const nowList = usesSensorListType(newType);
        const wasList = usesSensorListType(w.widgetType);
        const patch = { widgetType: newType, chartMode: nowList ? "combined" : "single" };
        if (nowList !== wasList) {
            // Switching between "one sensor" and "a sensor list" shape — the old
            // selection no longer applies either way.
            Object.assign(patch, { tagKey: null, deviceId: null, slaveId: null, tagName: "", deviceName: "", combinedSensors: [] });
            setSelectedDevice(""); setSelectedSlaveId(""); setSelectedTagKey("");
            clearChipEdit();
        }
        updateWidget(idx, patch);
    };

    // Adds the currently-picked Device/Slave/Sensor to widget `idx`'s sensor
    // list, then clears just the sensor + label/unit inputs so the same
    // slave's next tag can be added quickly.
    const handleAddCombinedSensor = (idx) => {
        if (!selectedDevice || !selectedSlaveId || !selectedTagKey) return;
        const current = widgets[idx]?.combinedSensors || [];
        const already = current.some(
            (s) => s.deviceId === selectedDevice && s.slaveId === selectedSlaveId && s.tagId === selectedTagKey
        );
        if (already) { setSelectedTagKey(""); return; }
        const deviceName = (deviceList || []).find((d) => d.id === selectedDevice)?.deviceName || "";
        const tagName = (selectList || []).find((s) => s.id === selectedTagKey)?.tagDisplayName || "";
        updateWidget(idx, {
            combinedSensors: [...current, {
                deviceId: selectedDevice, slaveId: selectedSlaveId, tagId: selectedTagKey, tagName, deviceName,
                label: sensorLabel.trim(), unit: sensorUnit.trim(),
            }],
        });
        setSelectedTagKey("");
        setSensorLabel("");
        setSensorUnit("");
    };

    const handleRemoveCombinedSensor = (idx, sensorIdx) => {
        const current = widgets[idx]?.combinedSensors || [];
        updateWidget(idx, { combinedSensors: current.filter((_, i) => i !== sensorIdx) });
        clearChipEdit();
    };

    // Inline editing of an already-added sensor chip's label/unit — separate
    // from the "+ Add Sensor" scratch fields above, so editing an existing
    // chip never disturbs whatever the user is about to add next.
    const handleStartEditChip = (wi, si) => {
        const s = widgets[wi]?.combinedSensors?.[si];
        if (!s) return;
        setEditingChip({ wi, si });
        setEditChipLabel(s.label || "");
        setEditChipUnit(s.unit || "");
    };

    const handleCancelEditChip = () => clearChipEdit();

    const handleSaveEditChip = () => {
        if (!editingChip) return;
        const { wi, si } = editingChip;
        const current = widgets[wi]?.combinedSensors || [];
        updateWidget(wi, {
            combinedSensors: current.map((s, i) =>
                i === si ? { ...s, label: editChipLabel.trim(), unit: editChipUnit.trim() } : s
            ),
        });
        clearChipEdit();
    };

    // Widgets missing an actual sensor (a blank one left over from "+ Add
    // Widget"/"+ Add Sensor" that was never filled in) are dropped on save
    // rather than blocking it — a cell can still be pure nav-only.
    const buildFinalWidgets = () => widgets
        .filter((w) => (usesSensorListType(w.widgetType) ? (w.combinedSensors || []).length > 0 : !!w.tagKey))
        .map((w) => {
            const isList = usesSensorListType(w.widgetType);
            return {
                tagKey: isList ? null : w.tagKey,
                tagName: isList ? "" : w.tagName,
                deviceId: isList ? null : w.deviceId,
                deviceName: isList ? "" : w.deviceName,
                slaveId: isList ? null : w.slaveId,
                label: w.label || "", unit: w.unit || "",
                widgetType: w.widgetType,
                chartMode: isList ? "combined" : "single",
                combinedSensors: isList ? (w.combinedSensors || []) : [],
                textColor: w.textColor, bgColor: w.bgColor,
                decimalPoints: Number(w.decimalPoints),
                threshold1: Number(w.threshold1), color1: w.color1,
                threshold2: Number(w.threshold2), color2: w.color2,
                color3: w.color3,
            };
        });

    const handleSave = () => {
        const navigateTargetTabIndex = navigateTarget === "" ? null : Number(navigateTarget);
        if (isRowMode) {
            onSave({ label, textColor, bgColor, navigateTargetTabIndex });
            return;
        }
        onSave({
            navigateTargetTabIndex,
            label, textColor, bgColor, // nav-only chip appearance, used only when no widgets end up bound
            widgets: buildFinalWidgets(),
        });
    };

    const finalWidgets = isRowMode ? [] : buildFinalWidgets();
    const saveDisabled = !isRowMode && finalWidgets.length === 0 && navigateTarget === "";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #eee", pb: 1 }}>
                {isRowMode ? "Configure Row Label" : "Configure Cell"}
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontWeight: 400 }}>
                    {parts.join(" / ")}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>

                {/* ── NAVIGATION (click this cell → jump to another screen, like an
                     image hyperlink area) — cell-level, shared by every widget below ── */}
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LinkIcon fontSize="inherit" /> Navigation (optional)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                    When set, clicking this {isRowMode ? "row" : "cell"} jumps straight to that screen — with or
                    without {isRowMode ? "a link" : "widgets"} bound below.
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Navigate to Screen</InputLabel>
                    <Select
                        value={navigateTarget}
                        label="Navigate to Screen"
                        sx={{ height: 40 }}
                        onChange={(e) => setNavigateTarget(e.target.value)}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {scadaTabs.map((tab, idx) => (
                            idx !== currentTabIndex && (
                                <MenuItem key={idx} value={String(idx)}>{tab.name}</MenuItem>
                            )
                        ))}
                    </Select>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                {/* ══════════════════ ROW MODE — nav + color only ══════════════════ */}
                {isRowMode && (
                    <>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                            Display Settings
                        </Typography>
                        <TextField
                            fullWidth size="small" label="Display Label"
                            value={label} onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Line 1 (leave blank to keep the row name)"
                            sx={{ mb: 2, "& .MuiInputBase-root": { height: 40 } }}
                        />
                        <Box sx={{ p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                                Appearance
                            </Typography>
                            <Grid container spacing={1.5}>
                                <Grid item xs={6}>
                                    <ColorSwatch label="Text Color" value={textColor} onChange={setTextColor} />
                                </Grid>
                                <Grid item xs={6}>
                                    <ColorSwatch label="Bg Color" value={bgColor} onChange={setBgColor} />
                                </Grid>
                            </Grid>
                        </Box>
                    </>
                )}

                {/* ══════════════════ CELL MODE — one or more stacked widgets ══════ */}
                {!isRowMode && (
                    <>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                            Widgets in this cell
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                            Add one or more — they all render together in the cell (e.g. a Standard Card plus a
                            Cycling Badge). Click a widget's row to expand it.
                        </Typography>

                        {widgets.map((w, wi) => {
                            const isOpen = openIndex === wi;
                            const isList = usesSensorListType(w.widgetType);
                            const isCyclingW = w.widgetType === "cyclebadge";

                            return (
                                <Box key={wi} sx={{ border: "1px solid #ddd", borderRadius: 2, mb: 1.5, overflow: "hidden" }}>
                                    <Box
                                        onClick={() => handleToggleWidget(wi)}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, cursor: "pointer",
                                            background: isOpen ? "#eef3f8" : "#fafafa",
                                            "&:hover": { background: "#eef3f8" },
                                        }}
                                    >
                                        {widgetIcon(w.widgetType, { fontSize: "small", sx: { color: "#1a3a5c", flexShrink: 0 } })}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                                {`Widget ${wi + 1} — ${widgetTypeLabel(w.widgetType)}`}
                                            </Typography>
                                            <Typography noWrap sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                                                {widgetSummary(w)}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small" color="error"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveWidget(wi); }}
                                            title="Remove this widget"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                    </Box>

                                    {isOpen && (
                                        <Box sx={{ p: 1.5, borderTop: "1px solid #ddd" }}>

                                            {/* ── Data Source ── */}
                                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                                                Data Source
                                            </Typography>
                                            {isList && (
                                                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                                    {isCyclingW
                                                        ? "Pick a sensor and click \"Add Sensor\" — repeat for each value you want in the rotation. They cycle in the order added below."
                                                        : "Pick a sensor and click \"Add Sensor\" — repeat for each card you want shown together in this cell."}
                                                </Typography>
                                            )}
                                            <Grid container spacing={1.5}>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Device</InputLabel>
                                                        <Select
                                                            value={selectedDevice} label="Device"
                                                            sx={{ height: 40 }}
                                                            onChange={(e) => {
                                                                const deviceId = e.target.value;
                                                                setSelectedDevice(deviceId);
                                                                setSelectedSlaveId("");
                                                                setSelectedTagKey("");
                                                                onLoadSlaveIds(deviceId);
                                                                if (!isList) {
                                                                    const deviceName = (deviceList || []).find((d) => d.id === deviceId)?.deviceName || "";
                                                                    updateWidget(wi, { deviceId, slaveId: null, tagKey: null, deviceName, tagName: "" });
                                                                }
                                                            }}
                                                        >
                                                            {(deviceList || []).map((d) => (
                                                                <MenuItem key={d.id} value={d.id}>{d.deviceName}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth size="small" disabled={!selectedDevice || (slaveIdList || []).length === 0}>
                                                        <InputLabel>Slave ID</InputLabel>
                                                        <Select
                                                            value={selectedSlaveId} label="Slave ID"
                                                            sx={{ height: 40 }}
                                                            onChange={(e) => {
                                                                const slaveId = e.target.value;
                                                                setSelectedSlaveId(slaveId);
                                                                setSelectedTagKey("");
                                                                onLoadSensors({ deviceId: selectedDevice, slaveId });
                                                                if (!isList) {
                                                                    updateWidget(wi, { slaveId, tagKey: null, tagName: "" });
                                                                }
                                                            }}
                                                        >
                                                            {(slaveIdList || []).map((s) => (
                                                                <MenuItem key={s.id ?? s.slaveId} value={s.slaveId}>
                                                                    {s.slaveInformation ? `${s.slaveId} - ${s.slaveInformation}` : s.slaveId}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth size="small" disabled={!selectedSlaveId || (selectList || []).length === 0}>
                                                        <InputLabel>Sensor / Tag</InputLabel>
                                                        <Select
                                                            value={selectedTagKey} label="Sensor / Tag"
                                                            sx={{ height: 40 }}
                                                            onChange={(e) => {
                                                                const tagKey = e.target.value;
                                                                setSelectedTagKey(tagKey);
                                                                if (!isList) {
                                                                    const tagName = (selectList || []).find((s) => s.id === tagKey)?.tagDisplayName || "";
                                                                    updateWidget(wi, { tagKey, tagName });
                                                                }
                                                            }}
                                                        >
                                                            {(selectList || []).map((s) => (
                                                                <MenuItem key={s.id} value={s.id}>{s.tagDisplayName}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            {isList && (
                                                <Box sx={{ mt: 1.5 }}>
                                                    <Grid container spacing={1.5}>
                                                        <Grid item xs={8}>
                                                            <TextField
                                                                fullWidth size="small" label="Sensor Label"
                                                                placeholder="defaults to the sensor name"
                                                                value={sensorLabel} onChange={(e) => setSensorLabel(e.target.value)}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                fullWidth size="small" label="Unit"
                                                                placeholder="kW"
                                                                value={sensorUnit} onChange={(e) => setSensorUnit(e.target.value)}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Button
                                                        size="small" variant="outlined"
                                                        disabled={!selectedDevice || !selectedSlaveId || !selectedTagKey}
                                                        onClick={() => handleAddCombinedSensor(wi)}
                                                        sx={{ mt: 1.5 }}
                                                    >
                                                        + Add Sensor
                                                    </Button>
                                                    {(w.combinedSensors || []).length > 0 && (
                                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
                                                            {w.combinedSensors.map((s, si) => {
                                                                const chipKey = `${s.deviceId}-${s.slaveId}-${s.tagId}`;
                                                                const isEditingThis = editingChip && editingChip.wi === wi && editingChip.si === si;

                                                                if (isEditingThis) {
                                                                    return (
                                                                        <Box key={chipKey} sx={{
                                                                            display: "flex", alignItems: "center", gap: 0.75, width: "100%",
                                                                            background: "#fff8e1", border: "1px solid #e0c46c",
                                                                            borderRadius: 2, pl: 1, pr: 0.5, py: 0.4,
                                                                        }}>
                                                                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#1a3a5c", flexShrink: 0 }}>
                                                                                {si + 1}.
                                                                            </Typography>
                                                                            <TextField
                                                                                size="small" placeholder="Sensor Label" autoFocus
                                                                                value={editChipLabel} onChange={(e) => setEditChipLabel(e.target.value)}
                                                                                sx={{ flex: 1, "& .MuiInputBase-root": { height: 30, fontSize: "0.72rem" } }}
                                                                            />
                                                                            <TextField
                                                                                size="small" placeholder="Unit"
                                                                                value={editChipUnit} onChange={(e) => setEditChipUnit(e.target.value)}
                                                                                sx={{ width: 70, "& .MuiInputBase-root": { height: 30, fontSize: "0.72rem" } }}
                                                                            />
                                                                            <IconButton size="small" color="primary" onClick={handleSaveEditChip} title="Confirm">
                                                                                <CheckIcon sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                            <IconButton size="small" onClick={handleCancelEditChip} title="Cancel">
                                                                                <CloseIcon sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        </Box>
                                                                    );
                                                                }

                                                                return (
                                                                    <Box key={chipKey} sx={{
                                                                        display: "inline-flex", alignItems: "center", gap: 0.5,
                                                                        background: "#eef3f8", border: "1px solid #cbd8e6",
                                                                        borderRadius: "16px", pl: 1.25, pr: 0.5, py: 0.4,
                                                                    }}>
                                                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#1a3a5c" }}>
                                                                            {si + 1}. {s.label || s.tagName || "Sensor"}{s.unit ? ` (${s.unit})` : ""}
                                                                        </Typography>
                                                                        <Box
                                                                            component="button" type="button"
                                                                            onClick={() => handleStartEditChip(wi, si)}
                                                                            title="Edit this sensor's label/unit"
                                                                            sx={{ border: "none", background: "none", cursor: "pointer", display: "flex", p: 0.25, color: "#888", "&:hover": { color: "#1a3a5c" } }}
                                                                        >
                                                                            <EditIcon sx={{ fontSize: 14 }} />
                                                                        </Box>
                                                                        <Box
                                                                            component="button" type="button"
                                                                            onClick={() => handleRemoveCombinedSensor(wi, si)}
                                                                            title="Remove this sensor"
                                                                            sx={{ border: "none", background: "none", cursor: "pointer", display: "flex", p: 0.25, color: "#888", "&:hover": { color: "#f44336" } }}
                                                                        >
                                                                            <CloseIcon sx={{ fontSize: 14 }} />
                                                                        </Box>
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>
                                                    )}
                                                    {(w.combinedSensors || []).length === 0 && (
                                                        <Typography variant="caption" sx={{ color: "#f44336", display: "block", mt: 1 }}>
                                                            Add at least one sensor for the {isCyclingW ? "badge" : "cards"} to show.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}

                                            <Divider sx={{ my: 2 }} />

                                            {/* ── Display Label + Unit — for Cycling Badge this IS the badge's own
                                                 fixed name (shown below the circle, never changes as it rotates);
                                                 for Multiple Cards it's just a fallback Unit (each sensor's own
                                                 Sensor Label shows below its own circle regardless) ── */}
                                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                                                Display Settings
                                            </Typography>
                                            {isList && (
                                                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                                    {isCyclingW
                                                        ? "This badge's own name — shown below the circle, and stays fixed as it rotates through the sensors above."
                                                        : "Fallback Unit only — each sensor's own Sensor Label shows below its own circle regardless of this Display Label."}
                                                </Typography>
                                            )}
                                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                                <Grid item xs={8}>
                                                    <TextField
                                                        fullWidth size="small" label="Display Label"
                                                        value={w.label} onChange={(e) => updateWidget(wi, { label: e.target.value })}
                                                        placeholder="e.g. Line 1 Status"
                                                        sx={{ "& .MuiInputBase-root": { height: 40 } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        fullWidth size="small" label="Unit"
                                                        value={w.unit} onChange={(e) => updateWidget(wi, { unit: e.target.value })}
                                                        placeholder="kW"
                                                        sx={{ "& .MuiInputBase-root": { height: 40 } }}
                                                    />
                                                </Grid>
                                            </Grid>

                                            {/* ── Widget Type ── */}
                                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                                                Widget Type
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={w.widgetType} exclusive
                                                onChange={(_, v) => { if (v) handleWidgetTypeChange(wi, v); }}
                                                size="small" sx={{ mb: 2, flexWrap: "wrap" }}
                                            >
                                                <ToggleButton value="card" sx={{ gap: 0.75, px: 2, textTransform: "none", fontSize: "0.8rem" }}>
                                                    <CreditCardIcon fontSize="small" /> Standard Card
                                                </ToggleButton>
                                                <ToggleButton value="status" sx={{ gap: 0.75, px: 2, textTransform: "none", fontSize: "0.8rem" }}>
                                                    <FiberManualRecordIcon fontSize="small" /> Status Indicator
                                                </ToggleButton>
                                                <ToggleButton value="cyclebadge" sx={{ gap: 0.75, px: 2, textTransform: "none", fontSize: "0.8rem" }}>
                                                    <AutorenewIcon fontSize="small" /> Cycling Badge
                                                </ToggleButton>
                                                <ToggleButton value="multicard" sx={{ gap: 0.75, px: 2, textTransform: "none", fontSize: "0.8rem" }}>
                                                    <ViewModuleIcon fontSize="small" /> Multiple Cards
                                                </ToggleButton>
                                            </ToggleButtonGroup>

                                            {/* ── STANDARD CARD config ── */}
                                            {w.widgetType === "card" && (
                                                <Box sx={{ p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={4}>
                                                            <ColorSwatch label="Text Color" value={w.textColor} onChange={(v) => updateWidget(wi, { textColor: v })} />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <ColorSwatch label="Bg Color" value={w.bgColor} onChange={(v) => updateWidget(wi, { bgColor: v })} />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                fullWidth size="small" type="number" label="Decimal Points"
                                                                value={w.decimalPoints}
                                                                onChange={(e) => updateWidget(wi, { decimalPoints: e.target.value })}
                                                                inputProps={{ min: 0, max: 6 }}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                                        Value threshold colors (optional — overrides text color when value exceeds thresholds)
                                                    </Typography>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="Threshold 1"
                                                                value={w.threshold1} onChange={(e) => updateWidget(wi, { threshold1: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Color 1" value={w.color1} onChange={(v) => updateWidget(wi, { color1: v })} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="Threshold 2"
                                                                value={w.threshold2} onChange={(e) => updateWidget(wi, { threshold2: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Color 2" value={w.color2} onChange={(v) => updateWidget(wi, { color2: v })} />
                                                        </Grid>
                                                        <Grid item xs={6} />
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Over color" value={w.color3} onChange={(v) => updateWidget(wi, { color3: v })} />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )}

                                            {/* ── STATUS INDICATOR config ── */}
                                            {w.widgetType === "status" && (
                                                <Box sx={{ p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                                                        Shows a colored circle based on sensor value vs thresholds
                                                    </Typography>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="≤ Threshold 1"
                                                                value={w.threshold1} onChange={(e) => updateWidget(wi, { threshold1: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Good (green)" value={w.color1} onChange={(v) => updateWidget(wi, { color1: v })} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="≤ Threshold 2"
                                                                value={w.threshold2} onChange={(e) => updateWidget(wi, { threshold2: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Warning (yellow)" value={w.color2} onChange={(v) => updateWidget(wi, { color2: v })} />
                                                        </Grid>
                                                        <Grid item xs={6} />
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Critical (red)" value={w.color3} onChange={(v) => updateWidget(wi, { color3: v })} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                {[w.color1, w.color2, w.color3].map((c, ci) => (
                                                                    <Box key={ci} sx={{ width: 18, height: 18, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
                                                                ))}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )}

                                            {/* ── CYCLING BADGE config ── */}
                                            {w.widgetType === "cyclebadge" && (
                                                <Box sx={{ p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                                                        One round badge that rotates through the sensors added above, one at a time — value
                                                        and unit inside the circle, this badge's own Display Label (set below in Display
                                                        Settings) shown below it, fixed regardless of which sensor is currently showing.
                                                    </Typography>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={4}>
                                                            <ColorSwatch label="Text Color" value={w.textColor} onChange={(v) => updateWidget(wi, { textColor: v })} />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <ColorSwatch label="Bg Color" value={w.bgColor} onChange={(v) => updateWidget(wi, { bgColor: v })} />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                fullWidth size="small" type="number" label="Decimal Points"
                                                                value={w.decimalPoints}
                                                                onChange={(e) => updateWidget(wi, { decimalPoints: e.target.value })}
                                                                inputProps={{ min: 0, max: 6 }}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                                        Value threshold colors (optional — overrides text color when value exceeds thresholds).
                                                        The badge's own Bg Color above stays fixed either way.
                                                    </Typography>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="Threshold 1"
                                                                value={w.threshold1} onChange={(e) => updateWidget(wi, { threshold1: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Color 1" value={w.color1} onChange={(v) => updateWidget(wi, { color1: v })} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="Threshold 2"
                                                                value={w.threshold2} onChange={(e) => updateWidget(wi, { threshold2: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Color 2" value={w.color2} onChange={(v) => updateWidget(wi, { color2: v })} />
                                                        </Grid>
                                                        <Grid item xs={6} />
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Over color" value={w.color3} onChange={(v) => updateWidget(wi, { color3: v })} />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )}

                                            {/* ── MULTIPLE CARDS config ── */}
                                            {w.widgetType === "multicard" && (
                                                <Box sx={{ p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa" }}>
                                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                                                        Every sensor added above renders as its own small circular badge — value and unit
                                                        inside the circle, that sensor's own Sensor Label below it (keep it short, e.g. "ASM",
                                                        so it doesn't get truncated) — all shown together in this cell at once, no rotation.
                                                    </Typography>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={4}>
                                                            <ColorSwatch label="Text Color" value={w.textColor} onChange={(v) => updateWidget(wi, { textColor: v })} />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <ColorSwatch label="Bg Color" value={w.bgColor} onChange={(v) => updateWidget(wi, { bgColor: v })} />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                fullWidth size="small" type="number" label="Decimal Points"
                                                                value={w.decimalPoints}
                                                                onChange={(e) => updateWidget(wi, { decimalPoints: e.target.value })}
                                                                inputProps={{ min: 0, max: 6 }}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                                        Value threshold colors (optional — overrides text color on a card when its own
                                                        value exceeds thresholds)
                                                    </Typography>
                                                    <Grid container spacing={1.5} alignItems="center">
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="Threshold 1"
                                                                value={w.threshold1} onChange={(e) => updateWidget(wi, { threshold1: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Color 1" value={w.color1} onChange={(v) => updateWidget(wi, { color1: v })} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField fullWidth size="small" type="number" label="Threshold 2"
                                                                value={w.threshold2} onChange={(e) => updateWidget(wi, { threshold2: e.target.value })}
                                                                sx={{ "& .MuiInputBase-root": { height: 36 } }} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Color 2" value={w.color2} onChange={(v) => updateWidget(wi, { color2: v })} />
                                                        </Grid>
                                                        <Grid item xs={6} />
                                                        <Grid item xs={3}>
                                                            <ColorSwatch label="Over color" value={w.color3} onChange={(v) => updateWidget(wi, { color3: v })} />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}

                        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddWidget}>
                            Add Widget
                        </Button>

                        {/* ── Nav-only appearance — only matters once every widget above
                             is empty, i.e. this ends up a pure click-through cell ── */}
                        {finalWidgets.length === 0 && (
                            <Box sx={{ p: 1.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fafafa", mt: 2 }}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: "bold", fontSize: "0.82rem" }}>
                                    Nav Link Appearance
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                                    No widgets are bound yet, so this cell (if a screen is picked above) shows as a
                                    plain click-through link styled with these settings.
                                </Typography>
                                <TextField
                                    fullWidth size="small" label="Display Label"
                                    value={label} onChange={(e) => setLabel(e.target.value)}
                                    placeholder="e.g. Go to Line 1"
                                    sx={{ mb: 1.5, "& .MuiInputBase-root": { height: 40 } }}
                                />
                                <Grid container spacing={1.5}>
                                    <Grid item xs={6}>
                                        <ColorSwatch label="Text Color" value={textColor} onChange={setTextColor} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ColorSwatch label="Bg Color" value={bgColor} onChange={setBgColor} />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </>
                )}

            </DialogContent>

            <DialogActions sx={{ borderTop: "1px solid #eee", px: 3, py: 2, justifyContent: "space-between" }}>
                {hasExisting ? (
                    <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={onClear}>
                        {isRowMode ? "Clear Row" : "Clear Cell"}
                    </Button>
                ) : <Box />}
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button color="inherit" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saveDisabled}
                        title={saveDisabled ? "Add a widget and/or pick a screen to navigate to" : undefined}
                    >
                        {isRowMode ? "Save Row" : "Save Cell"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default CellBindingDialog;
