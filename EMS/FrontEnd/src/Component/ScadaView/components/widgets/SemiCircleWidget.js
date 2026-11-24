import React from "react";
import { Box, Typography } from "@mui/material";
import WidgetSaveButton from "./WidgetSaveButton";

// Pure SVG semi-circle — no library dependency. width/height are passed as literal
// pixel numbers (not percentages): the svg's parent is a flex item with
// alignItems:"center" (not "stretch"), so it has no definite width for a
// percentage child to resolve against.
const SemiArc = ({ pct, color, bgColor, width, height }) => {
    const r = 36, cx = 50, cy = 46, sw = 9;
    const bg = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`;
    let fill = "";
    if (pct >= 99.9) {
        fill = bg;
    } else if (pct > 0.1) {
        const a = (Math.PI * pct) / 100;
        const ex = (cx - r * Math.cos(a)).toFixed(2);
        const ey = (cy - r * Math.sin(a)).toFixed(2);
        fill = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${ex},${ey}`;
    }
    return (
        <svg width={width} height={height} viewBox={`0 0 100 ${cy + sw}`}>
            <path d={bg}   fill="none" stroke={bgColor} strokeWidth={sw} strokeLinecap="round" />
            {fill && <path d={fill} fill="none" stroke={color}   strokeWidth={sw} strokeLinecap="round" />}
        </svg>
    );
};

const SemiCircleWidget = ({ marker, numericVal, displayVal, activeColor, style, unsaved, onSave, isCritical, sizeOverride }) => {
    const pct = Math.min(100, Math.max(0, (numericVal / (style.maxVal || 100)) * 100));
    const svgWidth  = sizeOverride?.width || (style.width ? Number(style.width) : 100);
    const svgHeight = sizeOverride?.height || (style.height ? Number(style.height) : 55);
    return (
        <Box sx={{
            boxSizing: "border-box",
            background: style.bgColor,
            border: `1px solid ${activeColor}`,
            borderRadius: "10px",
            padding: "8px 10px 4px",
            boxShadow: isCritical ? "0 0 15px rgba(244,67,54,0.6)" : "none",
            animation: isCritical ? "alarmPulse 1.5s infinite" : "none",
            display: "flex", flexDirection: "column",
            alignItems: "center", width: `${svgWidth}px`, overflow: "hidden", position: "relative",
        }}>
            <Typography variant="caption" sx={{ color: activeColor, fontWeight: 600, fontSize: "12px", mb: 0.3, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {marker.label}
            </Typography>
            <SemiArc pct={pct} color={activeColor} bgColor={`${activeColor}30`} width={svgWidth} height={svgHeight} />
            <Typography variant="caption" sx={{ color: activeColor, fontWeight: "bold", fontSize: "15px", mt: 0.2 }}>
                {displayVal}{marker.unit ? ` ${marker.unit}` : ""}
            </Typography>
            <WidgetSaveButton unsaved={unsaved} onSave={onSave} />
        </Box>
    );
};

export default SemiCircleWidget;
