import React from "react";
import { Box, Typography } from "@mui/material";
import WidgetSaveButton from "./WidgetSaveButton";

const ProgressWidget = ({ marker, numericVal, activeColor, style, unsaved, onSave, isCritical, sizeOverride }) => {
    const progressPercent = Math.min(100, Math.max(0, (numericVal / (style.maxVal || 100)) * 100));
    const width  = sizeOverride?.width ? `${sizeOverride.width}px` : (style.width ? `${style.width}px` : "160px");
    const height = sizeOverride?.height ? `${sizeOverride.height}px` : (style.height ? `${style.height}px` : undefined);
    return (
        <Box sx={{
            boxSizing: "border-box",
            background: `${style.bgColor}e6`, backdropFilter: "blur(8px)",
            border: `1px solid ${activeColor}80`, borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: isCritical ? "0 0 15px rgba(244,67,54,0.6)" : "0 8px 25px rgba(0,0,0,0.4)",
            animation: isCritical ? "alarmPulse 1.5s infinite" : "none",
            display: "flex", flexDirection: "column", justifyContent: "center",
            width, height, overflow: "hidden", gap: 0.5, position: "relative",
        }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: activeColor, fontWeight: 700, fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
                    {marker.label}
                </Typography>
                <Typography sx={{ color: activeColor, fontSize: "11px", fontWeight: "bold" }}>
                    {numericVal} {marker.unit}
                </Typography>
            </Box>
            <Box sx={{ width: "100%", height: "8px", background: "#333", borderRadius: "4px", overflow: "hidden", mt: 0.5 }}>
                <Box sx={{ width: `${progressPercent}%`, height: "100%", background: activeColor, transition: "width 0.5s ease-in-out", boxShadow: `0 0 10px ${activeColor}80` }} />
            </Box>
            <WidgetSaveButton unsaved={unsaved} onSave={onSave} />
        </Box>
    );
};

export default ProgressWidget;
