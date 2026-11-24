import React from "react";
import { Box, Typography } from "@mui/material";
import WidgetSaveButton from "./WidgetSaveButton";

const StatusWidget = ({ marker, numericVal, activeColor, style, unsaved, onSave, isCritical, sizeOverride }) => {
    let currentIcon = "";
    if (style.statusType === "analog") {
        if      (numericVal <= (style.statusThreshold1 || 20)) currentIcon = style.statusImage1;
        else if (numericVal <= (style.statusThreshold2 || 40)) currentIcon = style.statusImage2;
        else if (numericVal <= (style.statusThreshold3 || 60)) currentIcon = style.statusImage3;
        else if (numericVal <= (style.statusThreshold4 || 80)) currentIcon = style.statusImage4;
        else                                                    currentIcon = style.statusImage5;
    } else {
        currentIcon = Number(numericVal) === 1 ? style.statusImage1_digital : style.statusImage0;
    }

    const iconDim          = style.iconSize === "small" ? "25px" : style.iconSize === "big" ? "50px" : "35px";
    const containerHeight  = sizeOverride?.height ? `${sizeOverride.height}px` : (style.cardHeight ? `${style.cardHeight}px` : (style.iconSize === "big" ? "70px" : "55px"));
    const containerWidth   = sizeOverride?.width ? `${sizeOverride.width}px` : (style.cardWidth ? `${style.cardWidth}px` : undefined);
    const containerMinWidth = containerWidth ? undefined : (style.iconSize === "big" ? "260px" : "220px");

    return (
        <Box sx={{
            boxSizing: "border-box",
            background: `${style.bgColor}e6`, backdropFilter: "blur(8px)",
            border: `1px solid ${activeColor}80`, borderRadius: style.cardRadius ? `${style.cardRadius}px` : "12px",
            padding: "4px 12px",
            boxShadow: isCritical ? "0 0 15px rgba(244,67,54,0.6)" : "0 8px 25px rgba(0,0,0,0.4)",
            animation: isCritical ? "alarmPulse 1.5s infinite" : "none",
            display: "flex", flexDirection: "row", alignItems: "center",
            width: containerWidth, minWidth: containerMinWidth,
            height: containerHeight, overflow: "hidden", gap: 1.5,
            position: "relative", transition: "all 0.3s ease",
        }}>
            <Box sx={{ flex: `0 0 ${iconDim}`, display: "flex", justifyContent: "center" }}>
                {currentIcon
                    ? <img src={currentIcon} alt="status" style={{ width: iconDim, height: iconDim, objectFit: "contain" }} />
                    : <Box sx={{ width: iconDim, height: iconDim, background: "#333", borderRadius: "4px" }} />}
            </Box>
            <Box sx={{ width: "1px", height: "60%", background: `${activeColor}40` }} />
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", overflow: "hidden" }}>
                <Typography variant="caption" sx={{ color: activeColor, fontWeight: 700, fontSize: "12px", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {marker.label}
                </Typography>
            </Box>
            <Box sx={{ width: "1px", height: "60%", background: `${activeColor}40` }} />
            <Box sx={{ flex: "0 0 60px", display: "flex", justifyContent: "center", alignItems: "baseline", gap: "2px" }}>
                <Typography sx={{ color: activeColor, fontSize: "14px", fontWeight: "bold" }}>{numericVal}</Typography>
                <Typography sx={{ color: `${activeColor}aa`, fontSize: "9px", fontWeight: "bold" }}>{marker.unit}</Typography>
            </Box>
            <WidgetSaveButton unsaved={unsaved} onSave={onSave} />
        </Box>
    );
};

export default StatusWidget;
