import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Autocomplete, TextField, Typography, Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon  from "@mui/icons-material/Close";

// Per-box "which meter(s) feed this number" picker for the Plant Overview
// consumption panel (EB / a group like "IDG Consumption" / a feeder like
// "AC System" / a water item like "Good water"). Picks directly from a
// first-class meter list — id + display name — rather than composing a
// Device+Slave+Sensor combination by hand for something that already has a
// name of its own. WHICH meter list depends on `kind`: "energy" (the Energy
// Dashboard's own `meters` table — EB/DG/group/feeder boxes) or "water"
// (utility_meters, meterType='Water' — a completely separate table/id-space,
// water group/item boxes) — the parent passes the right `meterOptions` for
// the box being edited, so an energy meter can never end up picked for a
// water box or vice versa. A box can be backed by MORE THAN ONE physical
// meter (e.g. "AC System" is really 4 separate meters, or "Good water" is
// really several water meters) whose readings should be added together —
// pick a meter and click "+ Add" for each one.
// `existingOverride` accepts the current meter-list shape
// ([{meterId,name}] for energy or [{utilityMeterId,name}] for water), or an
// older shape saved before this picker existed — either a single
// Device+Slave+Sensor object ({deviceId,slaveId,tagKey,deviceName,tagName})
// or an array of those — which still displays and can still be removed, just
// can't be re-picked from this simplified UI (add a proper meter instead).
const MeterBindingDialog = ({
    open, onClose,
    boxLabel,          // e.g. "EB (Incomer)" or "AC System"
    existingOverride,  // see comment above — several possible shapes, always normalized to a list here
    kind = "energy",   // "energy" | "water" — which id field new picks are tagged with
    meterOptions,      // [{ id, name, category }] — the meter list for THIS box's kind
    onSave,   // (meters: [{ meterId, name }] | [{ utilityMeterId, name }]) => void
    onClear,  // () => void — removes the override, panel falls back to auto-detection
}) => {
    const [pendingMeter, setPendingMeter] = useState(null); // meterOptions entry about to be added
    const [meters, setMeters] = useState([]); // meters already added to this box, to be summed

    useEffect(() => {
        if (!open) return;
        setPendingMeter(null);
        const eo = existingOverride;
        setMeters(Array.isArray(eo) ? eo : (eo ? [eo] : []));
    }, [open, existingOverride]);

    const refIdField = kind === "water" ? "utilityMeterId" : "meterId";
    const getRefId = (m) => m.meterId ?? m.utilityMeterId; // whichever kind this entry actually is
    const isLegacyMeter = (m) => getRefId(m) === undefined; // pre-meter-picker Device/Slave/Sensor entry
    const meterKey = (m) => (isLegacyMeter(m) ? `${m.deviceId}-${m.slaveId}-${m.tagKey}` : `m${getRefId(m)}`);
    const meterDisplay = (m) => (isLegacyMeter(m) ? `${m.deviceName || "Device"} — ${m.tagName || "Sensor"}` : m.name);

    const handleAddMeter = () => {
        if (!pendingMeter) return;
        const already = meters.some((m) => !isLegacyMeter(m) && getRefId(m) === pendingMeter.id);
        if (!already) {
            setMeters([...meters, { [refIdField]: pendingMeter.id, name: pendingMeter.name }]);
        }
        setPendingMeter(null);
    };

    const handleRemoveMeter = (idx) => setMeters(meters.filter((_, i) => i !== idx));

    const handleSave = () => onSave(meters);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #eee", pb: 1 }}>
                Pick Meter(s) — {boxLabel}
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontWeight: 400 }}>
                    Leave empty to keep auto-detecting this value from the Energy/Utility Dashboards.
                    Add more than one meter if this box is really a group of several physical
                    meters — their current hour's consumption is added together into one number.
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Autocomplete
                        fullWidth size="small"
                        options={meterOptions || []}
                        getOptionLabel={(m) => m.name || ""}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        value={pendingMeter}
                        onChange={(_, v) => setPendingMeter(v)}
                        renderInput={(params) => <TextField {...params} label="Meter" placeholder="Search meters…" />}
                    />
                    <Button
                        size="small" variant="outlined"
                        disabled={!pendingMeter}
                        onClick={handleAddMeter}
                        sx={{ flexShrink: 0, height: 40 }}
                    >
                        + Add
                    </Button>
                </Box>

                {meters.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
                            {meters.length > 1
                                ? `${meters.length} meters — summed into "${boxLabel}"`
                                : "1 meter"}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                            {meters.map((m, i) => (
                                <Box key={meterKey(m)} sx={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                                    background: "#eef3f8", border: "1px solid #cbd8e6", borderRadius: 1.5,
                                    pl: 1.25, pr: 0.5, py: 0.5,
                                }}>
                                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a3a5c" }}>
                                        {i + 1}. {meterDisplay(m)}
                                    </Typography>
                                    <Box
                                        component="button" type="button"
                                        onClick={() => handleRemoveMeter(i)}
                                        sx={{ border: "none", background: "none", cursor: "pointer", display: "flex", p: 0.25, color: "#888", "&:hover": { color: "#f44336" } }}
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ borderTop: "1px solid #eee", px: 3, py: 2, justifyContent: "space-between" }}>
                {existingOverride ? (
                    <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={onClear}>
                        Clear (use auto-detect)
                    </Button>
                ) : <span />}
                <div>
                    <Button color="inherit" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={meters.length === 0} sx={{ ml: 1 }}>
                        Save
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default MeterBindingDialog;
