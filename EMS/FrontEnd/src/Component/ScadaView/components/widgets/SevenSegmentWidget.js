import React from "react";
import { Box, Typography } from "@mui/material";
import WidgetSaveButton from "./WidgetSaveButton";

const SevenSegmentWidget = ({ marker, displayVal, activeColor, style, unsaved, onSave, isCritical, sizeOverride }) => (
    <Box sx={{
        boxSizing: "border-box",
        background: `${style.bgColor}e6`,
        backdropFilter: "blur(8px)",
        border: `1px solid ${activeColor}80`,
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: sizeOverride?.width ? `${sizeOverride.width}px` : (style.width ? `${style.width}px` : undefined),
        minWidth: (sizeOverride?.width || style.width) ? undefined : "100px",
        height: sizeOverride?.height ? `${sizeOverride.height}px` : (style.height ? `${style.height}px` : undefined),
        overflow: "hidden",
        position: "relative",
    }}>
        <Typography variant="caption" sx={{ color: activeColor, fontWeight: 700, fontSize: "11px", mb: 0.5, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90px" }}>
            {marker.label}
        </Typography>
        <Box sx={{
            display: "flex", alignItems: "baseline", gap: "4px",
            background: "rgba(0,0,0,0.4)", padding: "4px 10px",
            borderRadius: "4px", border: `1px solid ${activeColor}30`,
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.5)",
            ...(isCritical && { animation: "alarmPulse 1.5s infinite" }),
        }}>
            <Typography sx={{
                color: activeColor, fontWeight: "bold",
                fontSize: `${style.fontSize || 24}px`,
                fontFamily: "monospace",
                textShadow: `0 0 10px ${activeColor}, 0 0 20px ${activeColor}40`,
                letterSpacing: "3px", lineHeight: 1,
            }}>
                {displayVal}
            </Typography>
            <Typography sx={{ color: `${activeColor}aa`, fontSize: "11px", fontWeight: "bold" }}>
                {marker.unit}
            </Typography>
        </Box>
        <WidgetSaveButton unsaved={unsaved} onSave={onSave} />
    </Box>
);

export default SevenSegmentWidget;
