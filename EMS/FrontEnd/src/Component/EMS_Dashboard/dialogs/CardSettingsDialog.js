import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, Typography,
} from "@mui/material";
import { DEFAULT_CARD_CONFIGS } from "../constants";

const CARD_LABELS = {
  card1: "EB",
  card2: "Green Energy",
  card3: "Generator",
  card4: "CO2",
  card5: "Alert",
};

const CardSettingsDialog = ({
  open,
  onClose,
  onApply,
  tempCardConfigs,
  onCardChange,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Customize All Cards</DialogTitle>
    <DialogContent>
      <Box display="flex" flexDirection="column" gap={3} mt={2}>
        {Object.keys(DEFAULT_CARD_CONFIGS).map((cardKey) => (
          <Box key={cardKey}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              {CARD_LABELS[cardKey]}
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                label="Title"
                value={tempCardConfigs[cardKey]?.title || ""}
                onChange={(e) => onCardChange(cardKey, "title", e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Unit"
                value={tempCardConfigs[cardKey]?.unit || ""}
                onChange={(e) => onCardChange(cardKey, "unit", e.target.value)}
                fullWidth
                size="small"
                placeholder={DEFAULT_CARD_CONFIGS[cardKey]?.unit || "Optional"}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancel</Button>
      <Button onClick={onApply} variant="contained">Apply</Button>
    </DialogActions>
  </Dialog>
);

export default CardSettingsDialog;
