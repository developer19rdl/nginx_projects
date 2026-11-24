import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography,
} from "@mui/material";

const HyperlinkDialog = ({ open, onClose, scadaTabs, currentTabIndex, onSave }) => {
    const [targetTab, setTargetTab] = useState("");
    const [label, setLabel]         = useState("");

    useEffect(() => {
        if (open) { setTargetTab(""); setLabel(""); }
    }, [open]);

    const handleSave = () => {
        if (targetTab === "") return;
        onSave({ targetTabIndex: Number(targetTab), label: label.trim() });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #eee" }}>
                Add Hyperlink Area
            </DialogTitle>
            <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    When a user clicks this area on the image, they will navigate to the selected tab.
                </Typography>
                <TextField
                    fullWidth size="small" label="Area Label (shown on hover)"
                    value={label} onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Line 1 Detail"
                    sx={{ "& .MuiInputBase-root": { height: 40 } }}
                />
                <FormControl fullWidth size="small">
                    <InputLabel>Navigate to Tab</InputLabel>
                    <Select
                        value={targetTab}
                        label="Navigate to Tab"
                        sx={{ height: 40 }}
                        onChange={(e) => setTargetTab(e.target.value)}
                    >
                        {scadaTabs.map((tab, idx) => (
                            idx !== currentTabIndex && (
                                <MenuItem key={idx} value={idx}>{tab.name}</MenuItem>
                            )
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ borderTop: "1px solid #eee", px: 3, py: 2, gap: 1 }}>
                <Button color="inherit" onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={targetTab === ""}>
                    Save Hyperlink
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HyperlinkDialog;
