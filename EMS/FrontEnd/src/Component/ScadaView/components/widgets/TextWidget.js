import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

// A plain text label on the image — e.g. "Line 1" / "Server room" — with no
// sensor value at all (unlike every other widget type). Reuses the same
// cardWidth/cardHeight/cardRadius sizing fields as CardWidget so the existing
// "Width/Height/Border Radius" controls in MarkerDialog apply to it too.
const TextWidget = ({ marker, style, unsaved, onSave, sizeOverride }) => (
    <Box sx={{
        boxSizing: "border-box",
        background: `${style.bgColor}e6`,
        border: `1px solid ${style.textColor}60`,
        borderRadius: style.cardRadius ? `${style.cardRadius}px` : "6px",
        padding: "6px 14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        width: sizeOverride?.width ? `${sizeOverride.width}px` : (style.cardWidth ? `${style.cardWidth}px` : undefined),
        minWidth: sizeOverride?.width ? undefined : (style.cardWidth ? undefined : "40px"),
        height: sizeOverride?.height ? `${sizeOverride.height}px` : (style.cardHeight ? `${style.cardHeight}px` : undefined),
        minHeight: sizeOverride?.height ? undefined : (style.cardHeight ? undefined : "auto"),
        overflow: (sizeOverride?.width || style.cardWidth || sizeOverride?.height || style.cardHeight) ? "hidden" : "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    }}>
        <Typography sx={{
            color: style.textColor, fontWeight: 700,
            fontSize: `${style.fontSize || 14}px`,
            whiteSpace: "nowrap", textAlign: "center",
        }}>
            {marker.label}
        </Typography>
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

export default TextWidget;
