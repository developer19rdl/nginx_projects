import React, { useState, useRef } from "react";
import {
    Box, Button, Typography, IconButton, Menu, MenuItem,
    Input, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import UploadIcon      from "@mui/icons-material/Upload";
import SettingsIcon    from "@mui/icons-material/Settings";
import ColorLensIcon   from "@mui/icons-material/ColorLens";
import TableChartIcon  from "@mui/icons-material/TableChart";
import LinkIcon        from "@mui/icons-material/Link";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ScadaMarker            from "./ScadaMarker";
import ScadaDynamicTable      from "./ScadaDynamicTable";
import ScadaTableDialog       from "./ScadaTableDialog";
import HyperlinkDialog        from "./HyperlinkDialog";
import ScadaHyperlinkOverlay  from "./ScadaHyperlinkOverlay";

// flex/minHeight/height here only matter when this div's own parent is a
// flex column that expects it to stretch (Plant Overview's home screen —
// see PlantOverview.js); they're no-ops otherwise (flex props only apply
// inside a flex formatting context), so ScadaView's layout is unaffected.
const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index} style={{ width: "100%", flex: "1 1 auto", minHeight: 0, height: "100%" }}>
        {value === index && children}
    </div>
);

// ── Image pane (shared between both layout modes) ──────────────────────────────
const ImagePane = ({
    tab, tabIndex, liveData, unsavedMarkerIds, draggingMarker, locationId, thresholdMinutes,
    hyperlinks, scadaTabs, drawMode, drawPreview, imgRef, applyAspectRatio,
    onImageClick, onPointerMoveBox, onPointerReleaseBox,
    onDragStart, onDragEnd, onResizeEnd, onMarkerDoubleClick, onMarkerSave,
    onImageError, onImgPointerDown, onImgPointerMove, onImgPointerUp,
    onNavigateTab, onDeleteHyperlink,
    boxSx = {},
}) => (
    <Box
        sx={{
            position: "relative",
            backgroundColor: "#000",
            overflow: "hidden",
            cursor: drawMode ? "crosshair" : draggingMarker ? "grabbing" : "crosshair",
            "@keyframes alarmPulse": {
                "0%":   { boxShadow: "0 0 5px rgba(244,67,54,0.4), inset 0 0 5px rgba(244,67,54,0.2)" },
                "50%":  { boxShadow: "0 0 20px rgba(244,67,54,0.8), inset 0 0 10px rgba(244,67,54,0.4)" },
                "100%": { boxShadow: "0 0 5px rgba(244,67,54,0.4), inset 0 0 5px rgba(244,67,54,0.2)" },
            },
            ...boxSx,
        }}
        onPointerMove={onPointerMoveBox}
        onPointerUp={onPointerReleaseBox}
        onPointerLeave={onPointerReleaseBox}
    >
        {/* Drawing-mode tip */}
        {drawMode && (
            <Box sx={{
                position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
                background: "rgba(33,150,243,0.85)", color: "#fff",
                textAlign: "center", py: 0.75, fontSize: "0.8rem", fontWeight: 600,
                display: "flex", justifyContent: "center", alignItems: "center", gap: 2,
            }}>
                Click and drag on the image to draw a hyperlink area
            </Box>
        )}

        {tab.image ? (
            <>
                <img
                    id={`scada-image-${tabIndex}`}
                    src={tab.image}
                    alt="SCADA Layout"
                    style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                    ref={(el) => {
                        imgRef.current = el;
                        if (el && el.complete) applyAspectRatio(el);
                    }}
                    onClick={(e) => {
                        if (drawMode || draggingMarker) return;
                        onImageClick(e, tabIndex);
                    }}
                    onPointerDown={onImgPointerDown}
                    onPointerMove={onImgPointerMove}
                    onPointerUp={onImgPointerUp}
                    onDragStart={(e) => e.preventDefault()}
                    onError={() => onImageError(tabIndex)}
                    onLoad={(e) => applyAspectRatio(e.target)}
                />

                <ScadaHyperlinkOverlay
                    hyperlinks={hyperlinks || []}
                    scadaTabs={scadaTabs || []}
                    onNavigate={onNavigateTab}
                    onDelete={onDeleteHyperlink}
                />

                {drawPreview && (
                    <Box sx={{
                        position: "absolute",
                        left:   `${Math.min(drawPreview.x1, drawPreview.x2)}%`,
                        top:    `${Math.min(drawPreview.y1, drawPreview.y2)}%`,
                        width:  `${Math.abs(drawPreview.x2 - drawPreview.x1)}%`,
                        height: `${Math.abs(drawPreview.y2 - drawPreview.y1)}%`,
                        border: "2px dashed #2196f3",
                        background: "rgba(33,150,243,0.15)",
                        pointerEvents: "none",
                        zIndex: 15,
                    }} />
                )}

                {tab.markers.map((marker) => (
                    <ScadaMarker
                        key={marker.id}
                        marker={marker}
                        tabIndex={tabIndex}
                        liveData={liveData}
                        unsavedMarkerIds={unsavedMarkerIds}
                        draggingMarker={draggingMarker}
                        locationId={locationId}
                        thresholdMinutes={thresholdMinutes}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onResizeEnd={onResizeEnd}
                        onDoubleClick={onMarkerDoubleClick}
                        onSave={() => onMarkerSave(marker, tabIndex)}
                    />
                ))}
            </>
        ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 260, gap: 2 }}>
                <Typography variant="h6" sx={{ color: "#777", textAlign: "center" }}>
                    Upload a background image for <strong>{tab.name}</strong>
                </Typography>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ color: "#aaa", borderColor: "#555" }}>
                    Upload Image (max 5 MB)
                    <input type="file" hidden accept="image/*" onChange={(e) => onImageError && true} />
                </Button>
            </Box>
        )}
    </Box>
);

// ── Main ScadaTabPanel ─────────────────────────────────────────────────────────
const ScadaTabPanel = ({
    tab, tabIndex, tabValue, liveData, unsavedMarkerIds, draggingMarker,
    locationId, scadaTabs, hyperlinks, tableConfig, tableConfigId, userDetails,
    thresholdMinutes, liveSnapshotUpdatedAt,
    onImageUpload, onImageClick, onPointerMove, onPointerRelease,
    onDragStart, onDragEnd, onResizeEnd, onMarkerDoubleClick, onMarkerSave, onImageError,
    onSaveTable, onDeleteTable, onSaveHyperlink, onDeleteHyperlink, onNavigateTab,
    onCellEdit, onRowEdit,
    // How tall the image(+table) block is allowed to get — defaults to the
    // SCADA Dashboard's original "fill almost the whole viewport" sizing so
    // ScadaView's behavior is unchanged. Plant Overview passes a shorter value
    // on screens that render extra content (e.g. the consumption panel) below
    // this block, so that content has room instead of being pushed off-screen.
    maxHeightCss = "calc(100vh - 108px)",
    // "right" layout only. tableFirst: table pane renders first/wider and the
    // image pane second/narrower (swaps the SCADA Dashboard's default image-
    // left/table-right proportions) — Plant Overview's home screen wants the
    // table as the main focus, image as a smaller reference panel.
    // belowImage: extra content (e.g. a video panel) stacked directly under
    // the image, inside the same narrower column — image keeps its aspect
    // ratio, this fills the rest of the column's height. Both default to
    // undefined/false so ScadaView's layout is completely unchanged.
    tableFirst = false,
    belowImage = null,
    // Passed straight through to ScadaDynamicTable — stretches the table (and
    // spreads its rows evenly) to fill leftover height instead of leaving it
    // blank below a short table. Off by default (SCADA Dashboard unchanged).
    tableFillHeight = false,
    // Hard floor under maxHeightCss — 400 (ScadaView's original) is taller
    // than what's actually available on a compact viewport when maxHeightCss
    // is a flex-derived "100%" (Plant Overview's home screen) rather than a
    // near-full-viewport value, and forcing it anyway overflows this row's
    // flex parent into the consumption panel below it instead of just being
    // shorter. Plant Overview passes a smaller floor for exactly that reason.
    minHeightPx = 400,
}) => {
    const [menuAnchor, setMenuAnchor]           = useState(null);
    const [colorDialogOpen, setColorDialogOpen] = useState(false);
    const [selectedColor, setSelectedColor]     = useState("#040408ff");
    const [aspectRatio, setAspectRatio]         = useState(null);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [drawMode, setDrawMode]               = useState(false);
    const [drawStart, setDrawStart]             = useState(null);
    const [drawPreview, setDrawPreview]         = useState(null);
    const [hlDialogOpen, setHlDialogOpen]       = useState(false);
    const [pendingRect, setPendingRect]         = useState(null);
    const imgRef = useRef(null);

    const layout = tableConfig?.layout || "right"; // "right" | "below"
    const hasTable = !!(tableConfig?.rows?.length && tableConfig?.columnGroups?.length);

    const applyAspectRatio = (img) => {
        if (img && img.naturalWidth && img.naturalHeight)
            setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
    };

    const getPct = (clientX, clientY) => {
        const el = imgRef.current;
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        return {
            x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
            y: Math.min(100, Math.max(0, ((clientY - rect.top)  / rect.height) * 100)),
        };
    };

    const handleImgPointerDown = (e) => {
        if (!drawMode) return;
        e.preventDefault(); e.stopPropagation();
        const pt = getPct(e.clientX, e.clientY);
        setDrawStart(pt);
        setDrawPreview({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
    };

    const handleImgPointerMove = (e) => {
        if (!drawMode || !drawStart) return;
        const pt = getPct(e.clientX, e.clientY);
        setDrawPreview({ x1: drawStart.x, y1: drawStart.y, x2: pt.x, y2: pt.y });
    };

    const handleImgPointerUp = (e) => {
        if (!drawMode || !drawStart) return;
        const pt = getPct(e.clientX, e.clientY);
        const rect = {
            x1: parseFloat(Math.min(drawStart.x, pt.x).toFixed(2)),
            y1: parseFloat(Math.min(drawStart.y, pt.y).toFixed(2)),
            x2: parseFloat(Math.max(drawStart.x, pt.x).toFixed(2)),
            y2: parseFloat(Math.max(drawStart.y, pt.y).toFixed(2)),
        };
        setDrawStart(null); setDrawPreview(null); setDrawMode(false);
        if (Math.abs(rect.x2 - rect.x1) < 1 || Math.abs(rect.y2 - rect.y1) < 1) return;
        setPendingRect(rect);
        setHlDialogOpen(true);
    };

    const handleHyperlinkSave = (cfg) => {
        if (!pendingRect) return;
        onSaveHyperlink({ ...pendingRect, ...cfg, tabIndex: tabIndex + 1 });
        setHlDialogOpen(false);
        setPendingRect(null);
    };

    // Pass tableConfig as 3rd arg so ScadaView can feed it into MarkerDialog
    const handleImageClickWithCfg = (e, tabIdx) => onImageClick(e, tabIdx, tableConfig);
    const handleMarkerDoubleClickWithCfg = (marker, tabIdx) => onMarkerDoubleClick(marker, tabIdx, tableConfig);

    // ── Shared props for ImagePane ───────────────────────────────────────────
    const imagePaneProps = {
        tab, tabIndex, liveData, unsavedMarkerIds, draggingMarker, locationId, thresholdMinutes,
        hyperlinks, scadaTabs, drawMode, drawPreview, imgRef, applyAspectRatio,
        onImageClick: handleImageClickWithCfg,
        onPointerMoveBox: onPointerMove, onPointerReleaseBox: onPointerRelease,
        onDragStart, onDragEnd, onResizeEnd,
        onMarkerDoubleClick: handleMarkerDoubleClickWithCfg,
        onMarkerSave, onImageError,
        onImgPointerDown: handleImgPointerDown,
        onImgPointerMove: handleImgPointerMove,
        onImgPointerUp: handleImgPointerUp,
        onNavigateTab, onDeleteHyperlink,
    };

    // ── Settings overlay ─────────────────────────────────────────────────────
    const settingsOverlay = (
        <>
            <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                    position: "absolute", top: 10, right: 10, zIndex: 10,
                    color: "#fff", background: "rgba(0,0,0,0.5)",
                    "&:hover": { background: "rgba(0,0,0,0.8)" },
                }}
            >
                <SettingsIcon />
            </IconButton>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 220, p: 0.5 } }}
            >
                <MenuItem>
                    <label style={{ width: "100%", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <UploadIcon sx={{ fontSize: 18, mr: 1 }} />
                        Upload Image
                        <Input
                            type="file" accept="image/*"
                            onChange={(e) => { onImageUpload(e, tabIndex); setMenuAnchor(null); }}
                            sx={{ display: "none" }}
                        />
                    </label>
                </MenuItem>
                <MenuItem onClick={() => { setColorDialogOpen(true); setMenuAnchor(null); }}>
                    <ColorLensIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">Choose Text Color</Typography>
                </MenuItem>
                <MenuItem onClick={() => { setTableDialogOpen(true); setMenuAnchor(null); }}>
                    <TableChartIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">{hasTable ? "Edit Table" : "Configure Table"}</Typography>
                </MenuItem>
                {hasTable && tableConfigId && (
                    <MenuItem onClick={() => { onDeleteTable(tableConfigId); setMenuAnchor(null); }} sx={{ color: "#e53935" }}>
                        <DeleteForeverIcon sx={{ fontSize: 18, mr: 1 }} />
                        <Typography variant="body2" sx={{ color: "#e53935" }}>Remove Table</Typography>
                    </MenuItem>
                )}
                <MenuItem onClick={() => { setDrawMode(true); setMenuAnchor(null); }}>
                    <LinkIcon sx={{ fontSize: 18, mr: 1 }} />
                    <Typography variant="body2">Add Hyperlink Area</Typography>
                </MenuItem>
            </Menu>

            <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)}>
                <DialogTitle>Select Text Color</DialogTitle>
                <DialogContent>
                    <input
                        type="color" value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        style={{ width: "100%", height: "60px", border: "none", cursor: "pointer", background: "transparent" }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColorDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );

    // ── LAYOUT: RIGHT — image left, table right ──────────────────────────────
    if (hasTable && layout === "right") {
        // Image column — normally just the image; when belowImage is passed
        // (Plant Overview's home screen video panel) it becomes a column of
        // [image, belowImage] so the image keeps its own bounded area instead
        // of the video panel being squeezed into/over it.
        const imageColumn = (
            <Box sx={{
                flex: `0 0 ${tableFirst ? "35%" : "65%"}`, height: "100%", overflow: "hidden",
                display: "flex", flexDirection: "column",
            }}>
                {/* When belowImage is present, split the column on a fixed ratio
                    instead of the image's native aspect ratio — the <img> already
                    renders with objectFit:"fill" (stretches to its box regardless
                    of aspect ratio, same as every other ScadaTabPanel layout), so
                    aspect-ratio-driven height here was pure dead weight that could
                    consume nearly the whole column on a wide floor-plan image,
                    squeezing the video panel down to an invisible sliver. */}
                <Box sx={{ position: "relative", overflow: "hidden", flex: belowImage ? "0 0 40%" : 1, height: belowImage ? undefined : "100%" }}>
                    <ImagePane {...imagePaneProps} boxSx={{ width: "100%", height: "100%" }} />
                    {settingsOverlay}
                    {drawMode && (
                        <Box sx={{
                            position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
                            background: "rgba(33,150,243,0.85)", color: "#fff",
                            textAlign: "center", py: 0.75, fontSize: "0.8rem", fontWeight: 600,
                            display: "flex", justifyContent: "center", alignItems: "center", gap: 2,
                        }}>
                            Click and drag to draw hyperlink area
                            <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "#fff", py: 0, height: 24, fontSize: "0.7rem" }}
                                onClick={() => { setDrawMode(false); setDrawStart(null); setDrawPreview(null); }}>
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Box>
                {belowImage && (
                    <Box sx={{ flex: "1 1 60%", minHeight: 0, overflow: "hidden" }}>
                        {belowImage}
                    </Box>
                )}
            </Box>
        );

        const tableColumn = (
            <Box sx={{
                flex: 1, overflowY: "auto", overflowX: "auto", p: 1.5, bgcolor: "#fafafa",
                ...(tableFirst ? { borderRight: "1px solid #e0e0e0" } : { borderLeft: "1px solid #e0e0e0" }),
            }}>
                <ScadaDynamicTable config={tableConfig} markers={tab.markers} liveData={liveData} thresholdMinutes={thresholdMinutes} liveSnapshotUpdatedAt={liveSnapshotUpdatedAt} onCellEdit={onCellEdit ? (row, grp, sub) => onCellEdit(row, grp, sub) : undefined} onRowEdit={onRowEdit} scadaTabs={scadaTabs} onNavigateTab={onNavigateTab} fillHeight={tableFillHeight} />
            </Box>
        );

        return (
            <TabPanel value={tabValue} index={tabIndex}>
                <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: maxHeightCss, minHeight: minHeightPx }}>
                    {tableFirst ? tableColumn : imageColumn}
                    {tableFirst ? imageColumn : tableColumn}
                </Box>

                {/* Dialogs */}
                <ScadaTableDialog
                    open={tableDialogOpen}
                    onClose={() => setTableDialogOpen(false)}
                    tabName={tab.name}
                    savedConfig={tableConfig}
                    tableConfigId={tableConfigId}
                    onSave={(cfg) => { onSaveTable(cfg, tabIndex + 1); setTableDialogOpen(false); }}
                    onDelete={(id) => { onDeleteTable(id); setTableDialogOpen(false); }}
                />
                <HyperlinkDialog
                    open={hlDialogOpen}
                    onClose={() => { setHlDialogOpen(false); setPendingRect(null); }}
                    scadaTabs={scadaTabs || []}
                    currentTabIndex={tabIndex}
                    onSave={handleHyperlinkSave}
                />
            </TabPanel>
        );
    }

    // ── LAYOUT: BELOW — image on top, table below ────────────────────────────
    if (hasTable && layout === "below") {
        return (
            <TabPanel value={tabValue} index={tabIndex}>
                {/* Image — top half */}
                <Box sx={{ position: "relative", width: "100%", aspectRatio: aspectRatio || "16 / 9", maxHeight: "52vh", overflow: "hidden", bgcolor: "#000" }}>
                    <ImagePane {...imagePaneProps} boxSx={{ width: "100%", height: "100%" }} />
                    {settingsOverlay}
                    {drawMode && (
                        <Box sx={{
                            position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
                            background: "rgba(33,150,243,0.85)", color: "#fff",
                            textAlign: "center", py: 0.75, fontSize: "0.8rem", fontWeight: 600,
                            display: "flex", justifyContent: "center", alignItems: "center", gap: 2,
                        }}>
                            Click and drag to draw hyperlink area
                            <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "#fff", py: 0, height: 24, fontSize: "0.7rem" }}
                                onClick={() => { setDrawMode(false); setDrawStart(null); setDrawPreview(null); }}>
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Table — below */}
                <Box sx={{ px: 2, pb: 2 }}>
                    <ScadaDynamicTable config={tableConfig} markers={tab.markers} liveData={liveData} onCellEdit={onCellEdit ? (row, grp, sub) => onCellEdit(row, grp, sub) : undefined} onRowEdit={onRowEdit} scadaTabs={scadaTabs} onNavigateTab={onNavigateTab} />
                </Box>

                {/* Dialogs */}
                <ScadaTableDialog
                    open={tableDialogOpen}
                    onClose={() => setTableDialogOpen(false)}
                    tabName={tab.name}
                    savedConfig={tableConfig}
                    tableConfigId={tableConfigId}
                    onSave={(cfg) => { onSaveTable(cfg, tabIndex + 1); setTableDialogOpen(false); }}
                    onDelete={(id) => { onDeleteTable(id); setTableDialogOpen(false); }}
                />
                <HyperlinkDialog
                    open={hlDialogOpen}
                    onClose={() => { setHlDialogOpen(false); setPendingRect(null); }}
                    scadaTabs={scadaTabs || []}
                    currentTabIndex={tabIndex}
                    onSave={handleHyperlinkSave}
                />
            </TabPanel>
        );
    }

    // ── LAYOUT: No table — full image ────────────────────────────────────────
    return (
        <TabPanel value={tabValue} index={tabIndex}>
            <Box sx={{ position: "relative", width: "100%", aspectRatio: aspectRatio || "16 / 9", maxHeight: maxHeightCss, overflow: "hidden", bgcolor: "#000",
                cursor: drawMode ? "crosshair" : draggingMarker ? "grabbing" : "crosshair",
                "@keyframes alarmPulse": {
                    "0%":   { boxShadow: "0 0 5px rgba(244,67,54,0.4), inset 0 0 5px rgba(244,67,54,0.2)" },
                    "50%":  { boxShadow: "0 0 20px rgba(244,67,54,0.8), inset 0 0 10px rgba(244,67,54,0.4)" },
                    "100%": { boxShadow: "0 0 5px rgba(244,67,54,0.4), inset 0 0 5px rgba(244,67,54,0.2)" },
                },
            }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerRelease}
                onPointerLeave={onPointerRelease}
            >
                {settingsOverlay}
                {drawMode && (
                    <Box sx={{
                        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
                        background: "rgba(33,150,243,0.85)", color: "#fff",
                        textAlign: "center", py: 0.75, fontSize: "0.8rem", fontWeight: 600,
                        display: "flex", justifyContent: "center", alignItems: "center", gap: 2,
                    }}>
                        Click and drag to draw hyperlink area
                        <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "#fff", py: 0, height: 24, fontSize: "0.7rem" }}
                            onClick={() => { setDrawMode(false); setDrawStart(null); setDrawPreview(null); }}>
                            Cancel
                        </Button>
                    </Box>
                )}

                {tab.image ? (
                    <>
                        <img
                            id={`scada-image-${tabIndex}`}
                            src={tab.image}
                            alt="SCADA Layout"
                            style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                            ref={(el) => {
                                imgRef.current = el;
                                if (el && el.complete) applyAspectRatio(el);
                            }}
                            onClick={(e) => { if (drawMode || draggingMarker) return; onImageClick(e, tabIndex); }}
                            onPointerDown={handleImgPointerDown}
                            onPointerMove={handleImgPointerMove}
                            onPointerUp={handleImgPointerUp}
                            onDragStart={(e) => e.preventDefault()}
                            onError={() => onImageError(tabIndex)}
                            onLoad={(e) => applyAspectRatio(e.target)}
                        />
                        <ScadaHyperlinkOverlay
                            hyperlinks={hyperlinks || []}
                            scadaTabs={scadaTabs || []}
                            onNavigate={onNavigateTab}
                            onDelete={onDeleteHyperlink}
                        />
                        {drawPreview && (
                            <Box sx={{
                                position: "absolute",
                                left:   `${Math.min(drawPreview.x1, drawPreview.x2)}%`,
                                top:    `${Math.min(drawPreview.y1, drawPreview.y2)}%`,
                                width:  `${Math.abs(drawPreview.x2 - drawPreview.x1)}%`,
                                height: `${Math.abs(drawPreview.y2 - drawPreview.y1)}%`,
                                border: "2px dashed #2196f3", background: "rgba(33,150,243,0.15)",
                                pointerEvents: "none", zIndex: 15,
                            }} />
                        )}
                        {tab.markers.map((marker) => (
                            <ScadaMarker
                                key={marker.id}
                                marker={marker}
                                tabIndex={tabIndex}
                                liveData={liveData}
                                unsavedMarkerIds={unsavedMarkerIds}
                                draggingMarker={draggingMarker}
                                locationId={locationId}
                                thresholdMinutes={thresholdMinutes}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onResizeEnd={onResizeEnd}
                                onDoubleClick={onMarkerDoubleClick}
                                onSave={() => onMarkerSave(marker, tabIndex)}
                            />
                        ))}
                    </>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300, gap: 2 }}>
                        <Typography variant="h6" sx={{ color: "#777", textAlign: "center" }}>
                            Upload a background image for <strong>{tab.name}</strong>
                        </Typography>
                        <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ color: "#aaa", borderColor: "#555" }}>
                            Upload Image (max 5 MB)
                            <input type="file" hidden accept="image/*" onChange={(e) => onImageUpload(e, tabIndex)} />
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            <ScadaTableDialog
                open={tableDialogOpen}
                onClose={() => setTableDialogOpen(false)}
                tabName={tab.name}
                savedConfig={tableConfig}
                onSave={(cfg) => { onSaveTable(cfg, tabIndex + 1); setTableDialogOpen(false); }}
            />
            <HyperlinkDialog
                open={hlDialogOpen}
                onClose={() => { setHlDialogOpen(false); setPendingRect(null); }}
                scadaTabs={scadaTabs || []}
                currentTabIndex={tabIndex}
                onSave={handleHyperlinkSave}
            />
        </TabPanel>
    );
};

export default ScadaTabPanel;
