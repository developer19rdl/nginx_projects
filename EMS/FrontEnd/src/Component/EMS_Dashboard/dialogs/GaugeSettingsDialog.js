import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField,
} from "@mui/material";

const GaugeSettingsDialog = ({
  open,
  onClose,
  onApply,
  gaugeTitle,  onGaugeTitleChange,
  gaugeUnit,   onGaugeUnitChange,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Customize Gauge</DialogTitle>
    <DialogContent>
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <TextField
          label="Gauge Title"
          value={gaugeTitle}
          onChange={(e) => onGaugeTitleChange(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Unit"
          value={gaugeUnit}
          onChange={(e) => onGaugeUnitChange(e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g., Kw, PF, °C"
        />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancel</Button>
      <Button onClick={onApply} variant="contained">Apply</Button>
    </DialogActions>
  </Dialog>
);

export default GaugeSettingsDialog;
