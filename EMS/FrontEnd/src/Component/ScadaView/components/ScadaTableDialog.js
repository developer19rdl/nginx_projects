import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton, Divider,
    ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import ViewStreamIcon from "@mui/icons-material/ViewStream";

const DEFAULT_CONFIG = { layout: "right", rows: [], columnGroups: [] };

const ScadaTableDialog = ({ open, onClose, tabName, savedConfig, tableConfigId, onSave, onDelete }) => {
    // savedConfig can carry more than just layout/rows/columnGroups (namely
    // cellBindings/rowBindings — the per-cell sensor/nav bindings set via the
    // pencil icon on the table itself) that this dialog never shows or edits.
    // handleSave below MUST start from that full object and only overwrite
    // the 3 fields this form actually owns — building a bare {layout, rows,
    // columnGroups} object here would silently wipe out every already-
    // configured cell/row binding on the very next "Save Table" (a real bug:
    // saving here does a full replace of the stored config, not a merge).
    const [layout, setLayout]       = useState("right");
    const [rows, setRows]           = useState([]);
    const [groups, setGroups]       = useState([]);
    const [newRow, setNewRow]       = useState("");
    const [newGroup, setNewGroup]   = useState("");

    useEffect(() => {
        if (open) {
            const cfg = savedConfig || DEFAULT_CONFIG;
            setLayout(cfg.layout || "right");
            setRows(cfg.rows ? [...cfg.rows] : []);
            setGroups(cfg.columnGroups ? cfg.columnGroups.map(g => ({
                label: g.label,
                subColumns: g.subColumns ? [...g.subColumns] : [],
                newSub: "",
            })) : []);
            setNewRow("");
            setNewGroup("");
        }
    }, [open, savedConfig]);

    const addRow = () => {
        const v = newRow.trim();
        if (!v) return;
        setRows(prev => [...prev, v]);
        setNewRow("");
    };

    const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

    const addGroup = () => {
        const v = newGroup.trim();
        if (!v) return;
        setGroups(prev => [...prev, { label: v, subColumns: [], newSub: "" }]);
        setNewGroup("");
    };

    const removeGroup = (gi) => setGroups(prev => prev.filter((_, i) => i !== gi));

    const updateGroupLabel = (gi, label) =>
        setGroups(prev => prev.map((g, i) => i === gi ? { ...g, label } : g));

    const updateGroupNewSub = (gi, val) =>
        setGroups(prev => prev.map((g, i) => i === gi ? { ...g, newSub: val } : g));

    const addSubColumn = (gi) => {
        const v = groups[gi]?.newSub?.trim();
        if (!v) return;
        setGroups(prev => prev.map((g, i) =>
            i === gi ? { ...g, subColumns: [...g.subColumns, v], newSub: "" } : g
        ));
    };

    const removeSubColumn = (gi, ci) =>
        setGroups(prev => prev.map((g, i) =>
            i === gi ? { ...g, subColumns: g.subColumns.filter((_, j) => j !== ci) } : g
        ));

    const handleSave = () => {
        onSave({
            ...(savedConfig || {}),
            layout,
            rows,
            columnGroups: groups.map(g => ({ label: g.label, subColumns: g.subColumns })),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #eee" }}>
                Configure Table — {tabName}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>

                {/* ── LAYOUT SELECTOR ── */}
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                    Table Position
                </Typography>
                <ToggleButtonGroup
                    value={layout}
                    exclusive
                    onChange={(_, v) => { if (v) setLayout(v); }}
                    size="small"
                    sx={{ mb: 2.5 }}
                >
                    <ToggleButton value="right" sx={{ gap: 0.75, px: 2, textTransform: "none" }}>
                        <ViewSidebarIcon fontSize="small" /> Right Side of Image
                    </ToggleButton>
                    <ToggleButton value="below" sx={{ gap: 0.75, px: 2, textTransform: "none" }}>
                        <ViewStreamIcon fontSize="small" /> Below Image
                    </ToggleButton>
                </ToggleButtonGroup>
                <Divider sx={{ mb: 2 }} />

                {/* ── ROWS ── */}
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                    Row Labels
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <TextField
                        size="small" fullWidth placeholder="e.g. Line Status"
                        value={newRow} onChange={(e) => setNewRow(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRow()}
                        sx={{ "& .MuiInputBase-root": { height: 36 } }}
                    />
                    <Button variant="contained" size="small" onClick={addRow} startIcon={<AddIcon />} sx={{ whiteSpace: "nowrap" }}>
                        Add Row
                    </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, minHeight: 36 }}>
                    {rows.map((r, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", background: "#e3f2fd", borderRadius: 2, px: 1.5, py: 0.5, gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{r}</Typography>
                            <IconButton size="small" onClick={() => removeRow(i)} sx={{ p: 0.25 }}>
                                <DeleteIcon sx={{ fontSize: 14, color: "#e53935" }} />
                            </IconButton>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* ── COLUMN GROUPS ── */}
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 1 }}>
                    Column Groups
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                        size="small" fullWidth placeholder="e.g. Line 1"
                        value={newGroup} onChange={(e) => setNewGroup(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addGroup()}
                        sx={{ "& .MuiInputBase-root": { height: 36 } }}
                    />
                    <Button variant="contained" size="small" onClick={addGroup} startIcon={<AddIcon />} sx={{ whiteSpace: "nowrap" }}>
                        Add Group
                    </Button>
                </Box>

                {groups.map((group, gi) => (
                    <Box key={gi} sx={{ border: "1px solid #ddd", borderRadius: 2, p: 1.5, mb: 1.5, background: "#fafafa" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <TextField
                                size="small" label="Group Name" value={group.label}
                                onChange={(e) => updateGroupLabel(gi, e.target.value)}
                                sx={{ flex: 1, "& .MuiInputBase-root": { height: 36 } }}
                            />
                            <IconButton size="small" onClick={() => removeGroup(gi)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Sub-columns */}
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                            <TextField
                                size="small" fullWidth placeholder="Sub-column e.g. ASM"
                                value={group.newSub} onChange={(e) => updateGroupNewSub(gi, e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addSubColumn(gi)}
                                sx={{ "& .MuiInputBase-root": { height: 32 } }}
                            />
                            <Button variant="outlined" size="small" onClick={() => addSubColumn(gi)} sx={{ whiteSpace: "nowrap", height: 32 }}>
                                + Sub
                            </Button>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                            {group.subColumns.map((col, ci) => (
                                <Box key={ci} sx={{ display: "flex", alignItems: "center", background: "#e8f5e9", borderRadius: 2, px: 1, py: 0.25, gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{col}</Typography>
                                    <IconButton size="small" onClick={() => removeSubColumn(gi, ci)} sx={{ p: 0.2 }}>
                                        <DeleteIcon sx={{ fontSize: 12, color: "#e53935" }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}
            </DialogContent>

            {(rows.length === 0 || groups.length === 0) && (
                <Typography variant="caption" sx={{ color: "#e65100", display: "block", px: 3, pb: 1 }}>
                    Save is disabled until there's at least one row and one column group —
                    {rows.length === 0 && groups.length === 0
                        ? " type a row label and a group name, then click Add Row / Add Group (typing alone doesn't add it)."
                        : rows.length === 0
                            ? " add at least one row label (click Add Row, or press Enter)."
                            : " add at least one column group (click Add Group, or press Enter)."}
                </Typography>
            )}
            <DialogActions sx={{ borderTop: "1px solid #eee", px: 3, py: 2, justifyContent: "space-between" }}>
                {/* Left: Remove Table (only if table already exists in DB) */}
                {tableConfigId ? (
                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete && onDelete(tableConfigId)}
                    >
                        Remove Table
                    </Button>
                ) : (
                    <Box />
                )}

                {/* Right: Cancel + Save */}
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button color="inherit" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={rows.length === 0 || groups.length === 0}>
                        Save Table
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ScadaTableDialog;
