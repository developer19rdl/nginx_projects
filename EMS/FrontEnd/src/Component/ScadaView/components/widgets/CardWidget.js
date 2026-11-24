import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

const CardWidget = ({ marker, val, style, unsaved, onSave, isCritical, sizeOverride }) => (
    <Box sx={{
        boxSizing: "border-box",
        background: `${style.bgColor}e6`,
        backdropFilter: "blur(8px)",
        border: `1px solid ${style.textColor}60`,
        borderRadius: style.cardRadius ? `${style.cardRadius}px` : "10px",
        padding: "8px 16px",
        boxShadow: isCritical ? "0 0 15px rgba(244,67,54,0.6)" : "0 8px 25px rgba(0,0,0,0.4)",
        animation: isCritical ? "alarmPulse 1.5s infinite" : "none",
        width: sizeOverride?.width ? `${sizeOverride.width}px` : (style.cardWidth ? `${style.cardWidth}px` : undefined),
        minWidth: sizeOverride?.width ? undefined : (style.cardWidth ? undefined : "90px"),
        height: sizeOverride?.height ? `${sizeOverride.height}px` : (style.cardHeight ? `${style.cardHeight}px` : undefined),
        minHeight: sizeOverride?.height ? undefined : (style.cardHeight ? undefined : "auto"),
        overflow: (sizeOverride?.width || style.cardWidth || sizeOverride?.height || style.cardHeight) ? "hidden" : "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    }}>
        <Typography variant="caption" sx={{ color: style.textColor, fontWeight: 600, fontSize: "12px", letterSpacing: "0.5px", opacity: 0.9 }}>
            {marker.label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px", mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: style.textColor, fontWeight: "bold", fontSize: "16px" }}>{val}</Typography>
            <Typography sx={{ color: `${style.textColor}aa`, fontSize: "10px", fontWeight: "bold" }}>{marker.unit}</Typography>
        </Box>
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

export default CardWidget;
