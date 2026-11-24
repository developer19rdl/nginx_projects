import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton, Divider,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Shared editor for a group→children level — used for BOTH the Energy side
// (groups like "IDG Consumption" with feeders like "UPS") and the Water side
// (groups like "Good water"/"Waste water (STP)" with items like "Facility"/
// "RO"), since the client wireframe wants water in that exact same fixed
// 2-level shape, not a flat meter list. Same add-chip/remove-chip pattern as
// ScadaTableDialog.js's rows/column-groups editor for a consistent feel.
// Which meter feeds each box is a separate step (the pencil icon on the box
// itself, see MeterBindingDialog) — this editor never touches `override`.
const GroupsEditor = ({ groups, setGroups, groupPrefix, childPrefix, groupPlaceholder, childPlaceholder, childButtonLabel }) => {
    const [newGroupName, setNewGroupName] = useState("");
    const [newChildName, setNewChildName] = useState({}); // { [groupId]: text }

    const addGroup = () => {
        const v = newGroupName.trim();
        if (!v) return;
        setGroups(prev => [...prev, { id: newId(groupPrefix), name: v, override: null, feeders: [] }]);
        setNewGroupName("");
    };
    const removeGroup = (gi) => setGroups(prev => prev.filter((_, i) => i !== gi));
    const renameGroup = (gi, name) => setGroups(prev => prev.map((g, i) => i === gi ? { ...g, name } : g));

    const addChild = (gi, groupId) => {
        const v = (newChildName[groupId] || "").trim();
        if (!v) return;
        setGroups(prev => prev.map((g, i) =>
            i === gi ? { ...g, feeders: [...g.feeders, { id: newId(childPrefix), name: v, override: null }] } : g
        ));
        setNewChildName(prev => ({ ...prev, [groupId]: "" }));
    };
    const removeChild = (gi, ci) => setGroups(prev => prev.map((g, i) =>
        i === gi ? { ...g, feeders: g.feeders.filter((_, j) => j !== ci) } : g
    ));
    const renameChild = (gi, ci, name) => setGroups(prev => prev.map((g, i) =>
        i === gi ? { ...g, feeders: g.feeders.map((f, j) => j === ci ? { ...f, name } : f) } : g
    ));

    return (
        <>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                    size="small" fullWidth placeholder={groupPlaceholder}
                    value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGroup()}
                    sx={{ "& .MuiInputBase-root": { height: 36 } }}
                />
                <Button variant="contained" size="small" onClick={addGroup} startIcon={<AddIcon />} sx={{ whiteSpace: "nowrap" }}>
                    Add Group
                </Button>
            </Box>

            {groups.map((group, gi) => (
                <Box key={group.id} sx={{ border: "1px solid #ddd", borderRadius: 2, p: 1.5, mb: 1.5, background: "#fafafa" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <TextField
                            size="small" label="Group Name" value={group.name}
                            onChange={(e) => renameGroup(gi, e.target.value)}
                            sx={{ flex: 1, "& .MuiInputBase-root": { height: 36 } }}
                        />
                        <IconButton size="small" onClick={() => removeGroup(gi)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <TextField
                            size="small" fullWidth placeholder={childPlaceholder}
                            value={newChildName[group.id] || ""}
                            onChange={(e) => setNewChildName(prev => ({ ...prev, [group.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && addChild(gi, group.id)}
                            sx={{ "& .MuiInputBase-root": { height: 32 } }}
                        />
                        <Button variant="outlined" size="small" onClick={() => addChild(gi, group.id)} sx={{ whiteSpace: "nowrap", height: 32 }}>
                            {childButtonLabel}
                        </Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {group.feeders.map((f, fi) => (
                            <Box key={f.id} sx={{ display: "flex", alignItems: "center", background: "#e8f5e9", borderRadius: 2, px: 1, py: 0.25, gap: 0.5 }}>
                                <TextField
                                    variant="standard" value={f.name}
                                    onChange={(e) => renameChild(gi, fi, e.target.value)}
                                    InputProps={{ disableUnderline: true, sx: { fontSize: "0.75rem", fontWeight: 600, width: Math.max(50, f.name.length * 7) } }}
                                />
                                <IconButton size="small" onClick={() => removeChild(gi, fi)} sx={{ p: 0.25 }}>
                                    <DeleteIcon sx={{ fontSize: 14, color: "#e53935" }} />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </>
    );
};

const ConsumptionTreeDialog = ({ open, onClose, ebLabel, dgLabel, groups, water, onSave }) => {
    const [localEbLabel, setLocalEbLabel] = useState("");
    const [localDgLabel, setLocalDgLabel] = useState("");
    const [localGroups,  setLocalGroups]  = useState([]);
    const [localWater,   setLocalWater]   = useState([]);

    useEffect(() => {
        if (!open) return;
        setLocalEbLabel(ebLabel || "EB (Incomer)");
        setLocalDgLabel(dgLabel || "DG (Generator)");
        setLocalGroups((groups || []).map(g => ({ ...g, feeders: [...(g.feeders || [])] })));
        setLocalWater((water || []).map(w => ({ ...w, feeders: [...(w.feeders || [])] })));
    }, [open, ebLabel, dgLabel, groups, water]);

    const handleSave = () => {
        onSave({ ebLabel: localEbLabel, dgLabel: localDgLabel, groups: localGroups, water: localWater });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #eee" }}>
                Configure Energy &amp; Water Consumption
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>

                {/* ── EB / DG ── */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>EB Box Label</Typography>
                        <TextField
                            size="small" fullWidth value={localEbLabel}
                            onChange={(e) => setLocalEbLabel(e.target.value)}
                            sx={{ "& .MuiInputBase-root": { height: 36 } }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                            DG (Generator) Box Label
                        </Typography>
                        <TextField
                            size="small" fullWidth value={localDgLabel}
                            onChange={(e) => setLocalDgLabel(e.target.value)}
                            sx={{ "& .MuiInputBase-root": { height: 36 } }}
                        />
                    </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* ── ENERGY GROUPS ── */}
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                    Energy Groups (e.g. IDG Consumption, ISG Consumption)
                </Typography>
                <GroupsEditor
                    groups={localGroups} setGroups={setLocalGroups}
                    groupPrefix="g" childPrefix="f"
                    groupPlaceholder="e.g. IDG Consumption"
                    childPlaceholder="Feeder e.g. UPS"
                    childButtonLabel="+ Feeder"
                />

                <Divider sx={{ my: 2 }} />

                {/* ── WATER GROUPS — same fixed 2-level shape as Energy (e.g. "Good
                     water" → Facility/RO, "Waste water (STP)" → Inlet/Outlet),
                     matching the client wireframe instead of a flat meter list ── */}
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                    Water Groups (e.g. Good water, Waste water (STP))
                </Typography>
                <GroupsEditor
                    groups={localWater} setGroups={setLocalWater}
                    groupPrefix="wg" childPrefix="wi"
                    groupPlaceholder="e.g. Good water"
                    childPlaceholder="Item e.g. Facility"
                    childButtonLabel="+ Item"
                />

            </DialogContent>
            <DialogActions sx={{ borderTop: "1px solid #eee", px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConsumptionTreeDialog;
