import React from "react";
import { Box } from "@mui/material";

// Rendered once per marker (in ScadaMarker.js, as a sibling of the widget it
// resizes) rather than duplicated into all 7 widget files. stopPropagation on
// every pointer event is required: the marker's own onPointerDown/onPointerUp
// (used for position-drag) are gated only by `visible`'s same `unsaved`
// condition, so without it every resize would also kick off a simultaneous
// position-drag.
const ResizeHandle = ({ visible, onPointerDown, onPointerMove, onPointerUp }) => {
    if (!visible) return null;
    return (
        <Box
            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e); }}
            onPointerMove={(e) => { e.stopPropagation(); onPointerMove(e); }}
            onPointerUp={(e) => { e.stopPropagation(); onPointerUp(e); }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            sx={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: 14,
                height: 14,
                borderRadius: "3px",
                background: "#2196f3",
                border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                cursor: "nwse-resize",
                touchAction: "none",
                zIndex: 101,
            }}
        />
    );
};

export default ResizeHandle;
