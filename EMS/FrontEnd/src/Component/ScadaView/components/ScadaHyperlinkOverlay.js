import React, { useState } from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const COLORS = [
    "#2196f3", "#4caf50", "#ff9800", "#9c27b0",
    "#f44336", "#00bcd4", "#795548", "#e91e63",
];

const ScadaHyperlinkOverlay = ({ hyperlinks, scadaTabs, onNavigate, onDelete, readOnly }) => {
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <>
            {hyperlinks.map((hl, idx) => {
                const left   = Math.min(hl.x1, hl.x2);
                const top    = Math.min(hl.y1, hl.y2);
                const width  = Math.abs(hl.x2 - hl.x1);
                const height = Math.abs(hl.y2 - hl.y1);
                const color  = COLORS[idx % COLORS.length];
                const isHov  = hoveredId === hl.id;
                const tabName = scadaTabs[hl.targetTabIndex]?.name || `Tab ${hl.targetTabIndex + 1}`;
                const tipText = hl.label ? `${hl.label} → ${tabName}` : `→ ${tabName}`;

                return (
                    <Tooltip key={hl.id} title={tipText} placement="top" arrow>
                        <Box
                            onMouseEnter={() => setHoveredId(hl.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={(e) => { e.stopPropagation(); onNavigate(hl.targetTabIndex); }}
                            sx={{
                                position: "absolute",
                                left:   `${left}%`,
                                top:    `${top}%`,
                                width:  `${width}%`,
                                height: `${height}%`,
                                background: isHov ? `${color}55` : `${color}25`,
                                border: `2px ${isHov ? "solid" : "dashed"} ${color}`,
                                borderRadius: "4px",
                                cursor: "pointer",
                                zIndex: 5,
                                transition: "background 0.2s, border 0.2s",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "flex-end",
                                boxSizing: "border-box",
                            }}
                        >
                            {!readOnly && isHov && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); onDelete(hl.id); }}
                                    sx={{
                                        background: "rgba(244,67,54,0.85)",
                                        color: "#fff",
                                        width: 20,
                                        height: 20,
                                        m: 0.5,
                                        "&:hover": { background: "#f44336" },
                                    }}
                                >
                                    <DeleteIcon sx={{ fontSize: 12 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Tooltip>
                );
            })}
        </>
    );
};

export default ScadaHyperlinkOverlay;
