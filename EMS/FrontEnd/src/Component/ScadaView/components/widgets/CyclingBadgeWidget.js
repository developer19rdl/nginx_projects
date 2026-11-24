import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import useCyclingSensor from "../../hooks/useCyclingSensor";
import { computeDisplayVal } from "../../utils/markerUtils";

// One round badge that rotates through style.combinedSensors' CURRENT live
// values (Temperature -> Humidity -> CO2, ... in selection order), dimming
// briefly ("blink") between them, instead of the Analytics tab's usual
// multi-line historical chart. liveData is the same flat {tagId: value} map
// every other widget reads from — combinedSensors entries carry their own
// tagId, so each cycled value is looked up independently of marker.tagKey
// (which combined markers leave blank).
const CyclingBadgeWidget = ({ marker, style, liveData, unsaved, onSave, sizeOverride }) => {
    const sensors = style.combinedSensors || [];
    const { current, visible } = useCyclingSensor(sensors);

    const rawVal = current ? liveData?.[current.tagId] : undefined;
    const numericVal = parseFloat(rawVal);
    const displayVal = computeDisplayVal(rawVal, numericVal, style.decimalPoints);
    const label = current?.tagName || marker.label;

    const size = sizeOverride?.width || sizeOverride?.height || style.width || style.height || 64;

    return (
        <Box sx={{
            boxSizing: "border-box",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: `${style.bgColor}e6`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${style.textColor}60`,
            boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
        }}>
            <Box sx={{
                opacity: visible ? 1 : 0,
                transition: "opacity 220ms ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 0.5,
                maxWidth: "100%",
            }}>
                <Typography noWrap sx={{
                    color: style.textColor, fontWeight: 600,
                    fontSize: "9px", letterSpacing: "0.3px", opacity: 0.85,
                    maxWidth: "100%",
                }}>
                    {label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <Typography sx={{ color: style.textColor, fontWeight: "bold", fontSize: "13px" }}>
                        {displayVal}
                    </Typography>
                    {marker.unit && (
                        <Typography sx={{ color: `${style.textColor}aa`, fontSize: "8px", fontWeight: "bold" }}>
                            {marker.unit}
                        </Typography>
                    )}
                </Box>
            </Box>
            {sensors.length > 1 && (
                <Box sx={{ position: "absolute", bottom: 4, display: "flex", gap: "3px" }}>
                    {sensors.map((s, i) => (
                        <Box key={s.tagId || i} sx={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: s === current ? style.textColor : `${style.textColor}40`,
                        }} />
                    ))}
                </Box>
            )}
            {unsaved && (
                <IconButton
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                    sx={{ position: "absolute", top: -20, right: -20, backgroundColor: "#4caf50", color: "#fff", width: 30, height: 30, "&:hover": { backgroundColor: "#388e3c" }, boxShadow: "0 4px 10px rgba(0,0,0,0.3)", zIndex: 100 }}
                    size="small"
                >
                    <UploadIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
};

export default CyclingBadgeWidget;
