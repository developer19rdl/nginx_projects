import React, { useState } from "react";
import {
    Box, Button, IconButton, CardHeader, Typography, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import HomeIcon        from "@mui/icons-material/Home";
import ArrowBackIosNewIcon  from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon  from "@mui/icons-material/ArrowForwardIos";
import EditIcon        from "@mui/icons-material/Edit";
import AddIcon         from "@mui/icons-material/Add";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
    CreateScadaNameService,
    UpdateScadaNameService,
} from "../../../Services/LoginPageService";

// Plant Overview's navigation: a plant-image with click-hotspot areas (see
// ScadaHyperlinkOverlay) plus Home / Back / Next buttons — same idea as the
// physical HMI screens this mirrors. Deliberately NOT the SCADA Dashboard's
// horizontal tab-strip switcher (ScadaHeader) — the client asked for
// click-through-the-image navigation instead of a row of tabs.
const PlantOverviewHeader = ({ scadaTabs, tabIndex, onTabChange, onAddTab, onRenameTab, onDeleteTab }) => {
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [newTabName, setNewTabName]             = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const currentTab = scadaTabs[tabIndex];
    const atFirst = tabIndex <= 0;
    const atLast  = tabIndex >= scadaTabs.length - 1;

    const openRenameDialog = () => {
        setNewTabName(currentTab?.name || "");
        setRenameDialogOpen(true);
    };

    const handleRenameSubmit = () => {
        const payload = { scadaName: newTabName, tabIndex: tabIndex + 1, module: "plantOverview" };
        const onSuccess = (res) => {
            onRenameTab(tabIndex, newTabName, res?.id);
            setRenameDialogOpen(false);
        };
        const onError = () => setRenameDialogOpen(false);
        if (currentTab?.id) {
            UpdateScadaNameService({ id: currentTab.id, ...payload }, onSuccess, onError);
        } else {
            CreateScadaNameService(payload, onSuccess, onError);
        }
    };

    const handleDeleteConfirm = () => {
        onDeleteTab(tabIndex, () => {
            if (tabIndex > 0) onTabChange(tabIndex - 1);
            setDeleteDialogOpen(false);
        });
    };

    return (
        <>
            <CardHeader
                sx={{ py: 1, px: 2, background: "#0d1b2a", borderBottom: "1px solid #ddd" }}
                title={
                    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
                        <Tooltip title="Home">
                            <span>
                                <IconButton size="small" disabled={atFirst} onClick={() => onTabChange(0)}
                                    sx={{ color: "#fff", background: "rgba(255,255,255,0.08)", "&:hover": { background: "rgba(255,255,255,0.18)" } }}>
                                    <HomeIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Back">
                            <span>
                                <IconButton size="small" disabled={atFirst} onClick={() => onTabChange(tabIndex - 1)}
                                    sx={{ color: "#fff", background: "rgba(255,255,255,0.08)", "&:hover": { background: "rgba(255,255,255,0.18)" } }}>
                                    <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Typography sx={{ flexGrow: 1, textAlign: "center", color: "#fff", fontWeight: 600, fontSize: "15px" }}>
                            {currentTab?.name || "Plant Overview"}
                        </Typography>

                        <Tooltip title="Next">
                            <span>
                                <IconButton size="small" disabled={atLast} onClick={() => onTabChange(tabIndex + 1)}
                                    sx={{ color: "#fff", background: "rgba(255,255,255,0.08)", "&:hover": { background: "rgba(255,255,255,0.18)" } }}>
                                    <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Rename this screen">
                            <IconButton size="small" onClick={openRenameDialog}
                                sx={{ color: "#fff", ml: 1 }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => { onAddTab(); onTabChange(scadaTabs.length); }}
                            sx={{ ml: 1, fontSize: "12px", textTransform: "none", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
                        >
                            Add Screen
                        </Button>
                    </Box>
                }
            />

            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                <DialogTitle>Rename Screen</DialogTitle>
                <DialogContent style={{ paddingTop: 5 }}>
                    <TextField
                        fullWidth
                        label="Screen Name"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between" }}>
                    {scadaTabs.length > 1 && (
                        <Button color="error" onClick={() => { setRenameDialogOpen(false); setDeleteDialogOpen(true); }}>
                            Delete Screen
                        </Button>
                    )}
                    <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                        <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleRenameSubmit}>Save</Button>
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WarningAmberIcon color="warning" />
                    Delete Screen
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <b>{currentTab?.name}</b>?
                    </Typography>
                    <Typography color="error" sx={{ mt: 1 }}>
                        This will permanently delete the background image, all widgets, and the
                        saved screen name. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PlantOverviewHeader;
