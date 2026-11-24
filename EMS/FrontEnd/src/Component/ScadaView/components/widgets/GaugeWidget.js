import React from "react";
import { Box, Typography } from "@mui/material";
import WidgetSaveButton from "./WidgetSaveButton";

const GaugeWidget = ({ marker, displayVal, activeColor, style, unsaved, onSave, isCritical, sizeOverride }) => (
    <Box sx={{
        boxSizing: "border-box",
        background: `${style.bgColor}e6`, backdropFilter: "blur(8px)",
        border: `2px solid ${activeColor}80`, borderRadius: "50%",
        padding: "10px",
        boxShadow: isCritical ? "0 0 20px rgba(244,67,54,0.8)" : "0 8px 25px rgba(0,0,0,0.4)",
        animation: isCritical ? "alarmPulse 1.5s infinite" : "none",
        width: sizeOverride?.width ? `${sizeOverride.width}px` : (style.width ? `${style.width}px` : "80px"),
        height: sizeOverride?.height ? `${sizeOverride.height}px` : (style.height ? `${style.height}px` : "80px"),
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative",
    }}>
        <Typography variant="caption" sx={{ color: activeColor, fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", opacity: 0.9, lineHeight: 1, mb: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "65px" }}>
            {marker.label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
            <Typography variant="caption" sx={{ color: activeColor, fontWeight: "bold", fontSize: "14px", lineHeight: 1 }}>
                {displayVal}
            </Typography>
            {marker.unit && (
                <Typography sx={{ color: `${activeColor}aa`, fontSize: "9px", fontWeight: "bold", lineHeight: 1 }}>
                    {marker.unit}
                </Typography>
            )}
        </Box>
        <WidgetSaveButton unsaved={unsaved} onSave={onSave} />
    </Box>
);

export default GaugeWidget;
