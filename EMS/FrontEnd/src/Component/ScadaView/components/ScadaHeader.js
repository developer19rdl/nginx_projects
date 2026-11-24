import React, { useState } from "react";
import {
    Box, Tabs, Tab, Button, CardHeader,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
    CreateScadaNameService,
    UpdateScadaNameService,
} from "../../../Services/LoginPageService";

const a11yProps = (index) => ({
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
});

const ScadaHeader = ({ scadaTabs, tabIndex, onTabChange, onAddTab, onRenameTab, onDeleteTab }) => {
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameTabIndex, setRenameTabIndex]     = useState(null);
    const [newTabName, setNewTabName]             = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTabIndex, setDeleteTabIndex]     = useState(null);

    const openRenameDialog = (index, currentName) => {
        setRenameTabIndex(index);
        setNewTabName(currentName);
        setRenameDialogOpen(true);
    };

    const openDeleteDialog = (index) => {
        setDeleteTabIndex(index);
        setDeleteDialogOpen(true);
    };

    const openDeleteFromRename = () => {
        setDeleteTabIndex(renameTabIndex);
        setRenameDialogOpen(false);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteTabIndex === null) return;
        onDeleteTab(deleteTabIndex, () => {
            if (tabIndex >= deleteTabIndex && tabIndex > 0) {
                onTabChange(tabIndex - 1);
            }
            setDeleteDialogOpen(false);
            setDeleteTabIndex(null);
        });
    };

    const handleRenameSubmit = () => {
        const tab = scadaTabs[renameTabIndex];
        const payload = { scadaName: newTabName, tabIndex: renameTabIndex + 1 };
        const onSuccess = (res) => {
            onRenameTab(renameTabIndex, newTabName, res?.id);
            setRenameDialogOpen(false);
        };
        const onError = () => setRenameDialogOpen(false);
        if (tab?.id) {
            UpdateScadaNameService({ id: tab.id, ...payload }, onSuccess, onError);
        } else {
            CreateScadaNameService(payload, onSuccess, onError);
        }
    };

    return (
        <>
            <CardHeader
                sx={{ py: 0.5, px: 1, background: "#fafafa", borderBottom: "1px solid #ddd" }}
                title={
                    <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                        <Tabs
                            value={tabIndex}
                            onChange={(e, newValue) => onTabChange(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                flexGrow: 1, minHeight: 36,
                                "& .MuiTab-root": { minHeight: 36, fontSize: "14px", textTransform: "none" },
                            }}
                        >
                            {scadaTabs.map((tab, index) => (
                                <Tab
                                    key={index}
                                    label={tab.name}
                                    {...a11yProps(index)}
                                    onDoubleClick={() => openRenameDialog(index, tab.name)}
                                />
                            ))}
                        </Tabs>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={onAddTab}
                            sx={{ ml: 1, fontSize: "13px", textTransform: "none", height: "32px" }}
                        >
                            + Add Tab
                        </Button>
                    </Box>
                }
            />

            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                <DialogTitle>Rename SCADA Tab</DialogTitle>
                <DialogContent style={{ paddingTop: 5 }}>
                    <TextField
                        fullWidth
                        label="Tab Name"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between" }}>
                    {scadaTabs.length > 1 && (
                        <Button color="error" onClick={openDeleteFromRename}>Delete Tab</Button>
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
                    Delete SCADA Tab
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete{" "}
                        <b>{deleteTabIndex !== null ? scadaTabs[deleteTabIndex]?.name : ""}</b>?
                    </Typography>
                    <Typography color="error" sx={{ mt: 1 }}>
                        This will permanently delete the background image, all widgets/markers,
                        and the saved tab name for this tab. This action cannot be undone.
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

export default ScadaHeader;
