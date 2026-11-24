import React, { useCallback, useRef, useState } from "react";
import { Box } from "@mui/material";
import ScadaWidget from "./widgets";
import ResizeHandle from "./widgets/ResizeHandle";
import { computeActiveColor, computeDisplayVal, isAlarmCritical, isMarkerStale, markerTransform } from "../utils/markerUtils";
import { WIDGET_MIN_SIZE } from "../constants/scadaDefaults";

const DEFAULT_MIN_SIZE = { width: 50, height: 30 };

// Pure pixel-delta resize math shared by the move (live preview) and up (commit)
// handlers so both agree on the exact same clamped/aspect-locked result.
const clampSize = (widgetType, startWidth, startHeight, dx, dy) => {
    const min = WIDGET_MIN_SIZE[widgetType] || DEFAULT_MIN_SIZE;
    let width = Math.max(min.width, startWidth + dx);
    let height = Math.max(min.height, startHeight + dy);
    if (widgetType === "gauge") {
        height = width; // stays a circle
    } else if (widgetType === "semicircle") {
        height = Math.round(width * 0.55); // preserve the SemiArc's native ~100:55 ratio
    }
    return { width, height };
};

const ScadaMarker = ({
    marker,
    tabIndex,
    liveData,
    unsavedMarkerIds,
    draggingMarker,
    locationId,
    thresholdMinutes,
    onDragStart,
    onDragEnd,
    onDoubleClick,
    onSave,
    onResizeEnd,
}) => {
    const val        = liveData[marker.tagKey] !== undefined ? liveData[marker.tagKey] : marker.sensorValue;
    const style      = marker.style || { textColor: "#ffffff", bgColor: "#040408", widgetType: "card" };
    const numericVal = parseFloat(val) || 0;
    const unsaved    = unsavedMarkerIds.has(marker.id);
    const isCritical = isAlarmCritical(style.widgetType, numericVal, style.threshold2);
    const activeColor = computeActiveColor(style, numericVal);
    const displayVal  = computeDisplayVal(val, numericVal, style.decimalPoints);
    // Combined (multi-sensor) markers have no single deviceId/slaveId/tagsId to
    // join live_tag_snapshot against, so lastUpdated is always undefined for them
    // — isMarkerStale would otherwise treat "no lastUpdated at all" as permanently
    // OFFLINE. Per-underlying-sensor staleness isn't computed in this iteration.
    // "text" markers are plain labels with no sensor at all — never OFFLINE.
    const isStale     = (style.widgetType === "text" || style.chartMode === "combined")
        ? false : isMarkerStale(marker.lastUpdated, thresholdMinutes);

    const wrapperRef       = useRef(null);
    const resizeStateRef   = useRef(null); // { startX, startY, startWidth, startHeight, originLeft, originTop }
    const latestPointerRef = useRef({ x: 0, y: 0 });
    const rafIdRef         = useRef(null);
    const [liveSize, setLiveSize] = useState(null);

    const isChartType = style.widgetType === "linechart" || style.widgetType === "barchart" || style.widgetType === "areachart";

    const handlePointerDown = useCallback((e) => {
        if (!unsaved) return;
        e.stopPropagation();
        e.target.setPointerCapture(e.pointerId);
        onDragStart(marker.id);
    }, [unsaved, marker.id, onDragStart]);

    const handlePointerUp = useCallback((e) => {
        if (draggingMarker !== marker.id) return;
        e.stopPropagation();
        e.target.releasePointerCapture(e.pointerId);
        onDragEnd(marker.id);
    }, [draggingMarker, marker.id, onDragEnd]);

    const handleDoubleClick = useCallback((e) => {
        e.stopPropagation();
        onDoubleClick(marker, tabIndex);
    }, [marker, tabIndex, onDoubleClick]);

    // ── Resize ────────────────────────────────────────────────────────────────
    const handleResizeDown = useCallback((e) => {
        e.target.setPointerCapture(e.pointerId);
        const rect = wrapperRef.current.getBoundingClientRect();
        resizeStateRef.current = {
            startX: e.clientX, startY: e.clientY,
            startWidth: rect.width, startHeight: rect.height,
            originLeft: rect.left, originTop: rect.top,
        };
        setLiveSize({ width: rect.width, height: rect.height });
    }, []);

    const handleResizeMove = useCallback((e) => {
        if (!resizeStateRef.current) return;
        latestPointerRef.current = { x: e.clientX, y: e.clientY };
        if (rafIdRef.current) return; // already scheduled for this frame
        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            const s = resizeStateRef.current;
            if (!s) return;
            const { x, y } = latestPointerRef.current;
            setLiveSize(clampSize(style.widgetType, s.startWidth, s.startHeight, x - s.startX, y - s.startY));
        });
    }, [style.widgetType]);

    const handleResizeUp = useCallback((e) => {
        const s = resizeStateRef.current;
        if (!s) return;
        e.target.releasePointerCapture(e.pointerId);
        if (rafIdRef.current) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
        const { width, height } = clampSize(style.widgetType, s.startWidth, s.startHeight, e.clientX - s.startX, e.clientY - s.startY);
        resizeStateRef.current = null;
        setLiveSize(null);
        onResizeEnd(marker.id, width, height, tabIndex);
    }, [style.widgetType, marker.id, tabIndex, onResizeEnd]);

    // Chart widgets skip the live sizeOverride entirely (recharts' own ResizeObserver
    // would thrash on every pixel of drag) — they show a ghost outline instead and only
    // pick up the new size once committed via onResizeEnd/re-render.
    const sizeOverride = (liveSize && !isChartType) ? liveSize : null;

    // While actively resizing, the box is repositioned via fixed viewport coordinates
    // frozen at drag-start instead of the normal x%/y%+alignment-transform placement.
    // That transform is a percentage of the box's OWN size, so growing/shrinking it
    // while the transform is live moves the rendered corner nonlinearly (e.g. the
    // default "top" alignment pins the bottom edge, so the handle wouldn't visually
    // move at all while dragging down) — freezing the top-left corner in viewport
    // space keeps the handle tracking the cursor 1:1 regardless of alignment.
    const origin = resizeStateRef.current;
    const wrapperSx = liveSize && origin
        ? {
            position: "fixed",
            left: `${origin.originLeft}px`,
            top: `${origin.originTop}px`,
            width: `${liveSize.width}px`,
            height: `${liveSize.height}px`,
            textAlign: "center",
            pointerEvents: "auto",
            cursor: "nwse-resize",
            zIndex: 10,
        }
        : {
            position: "absolute",
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            transform: markerTransform(style?.alignment),
            textAlign: "center",
            pointerEvents: "auto",
            cursor: unsaved
                ? (draggingMarker === marker.id ? "grabbing" : "grab")
                : "pointer",
            zIndex: draggingMarker === marker.id ? 10 : 2,
        };

    return (
        <Box
            ref={wrapperRef}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onClick={(e) => e.stopPropagation()}
            sx={wrapperSx}
        >
            <ScadaWidget
                marker={marker}
                val={val}
                numericVal={numericVal}
                displayVal={displayVal}
                activeColor={activeColor}
                style={style}
                liveData={liveData}
                unsaved={unsaved}
                onSave={onSave}
                isCritical={isCritical}
                locationId={locationId}
                isStale={isStale}
                lastUpdated={marker.lastUpdated}
                sizeOverride={sizeOverride}
            />
            {liveSize && isChartType && (
                <Box sx={{
                    position: "absolute", inset: 0,
                    border: "2px dashed #2196f3",
                    borderRadius: "8px",
                    pointerEvents: "none",
                    zIndex: 50,
                }} />
            )}
            <ResizeHandle
                visible={unsaved}
                onPointerDown={handleResizeDown}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
            />
        </Box>
    );
};

export default ScadaMarker;
