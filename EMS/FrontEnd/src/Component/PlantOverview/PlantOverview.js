import React, { useState, useCallback, useMemo } from "react";
import { Box, Card, Container } from "@mui/material";

// Plant Overview reuses the exact same editing/rendering engine as the SCADA
// Dashboard (image upload, draggable sensor markers, dynamic table, click
// hotspot "hyperlink" areas) — only the header changes (Home/Back/Next
// buttons instead of a tab-strip, see PlantOverviewHeader). Both pages call
// useScadaData with a different `module` tag so their screens/markers/tables/
// hyperlinks are stored separately (Database/migration_plant_overview_module.sql)
// while sharing one codebase. See ../ScadaView/ScadaView.js for the SCADA
// Dashboard, which is untouched by this feature.
import useSocket      from "../ScadaView/hooks/useSocket";
import useScadaData   from "../ScadaView/hooks/useScadaData";
import useMarkerForm  from "../ScadaView/hooks/useMarkerForm";
import { resolveImagePath, buildImageUrl } from "../ScadaView/utils/markerUtils";
import { AddScadaService, DeleteScadaService } from "../../Services/LoginPageService";

import ScadaTabPanel     from "../ScadaView/components/ScadaTabPanel";
import MarkerDialog      from "../ScadaView/components/MarkerDialog";
import CellBindingDialog from "../ScadaView/components/CellBindingDialog";
import PlantOverviewHeader from "./components/PlantOverviewHeader";
import PlantOverviewConsumptionPanel from "./components/PlantOverviewConsumptionPanel";
import PlantOverviewVideoPanel from "./components/PlantOverviewVideoPanel";
import { PLANT_OVERVIEW_DEFAULT_TABS } from "./constants/plantOverviewDefaults";

const MODULE = "plantOverview";

const PlantOverview = () => {
    const socketLiveData = useSocket();

    const {
        userDetails, locationDetails,
        scadaTabs, deviceList, slaveIdList, selectList,
        combinedSensorOptions, loadCombinedSensorOptions,
        tableConfigs, liveSnapshot, liveSnapshotUpdatedAt, hyperlinks,
        fetchScadaData, fetchScadaNames, loadSlaveIds, loadSensors, uploadTabImage,
        addTab, deleteTab, updateTabImage, updateTabImagePath, clearTabImage,
        renameTab, updateMarkerPosition, updateMarkerSize, upsertMarker, removeMarker,
        saveTableConfig, deleteTableConfig, saveHyperlink, deleteHyperlink,
    } = useScadaData(MODULE, PLANT_OVERVIEW_DEFAULT_TABS, 1);

    // Seed with the last known live_tag_snapshot values so tables show real numbers
    // immediately on open; live socket values (once the feed starts) take priority.
    const liveData = useMemo(
        () => ({ ...liveSnapshot, ...socketLiveData }),
        [liveSnapshot, socketLiveData]
    );

    // Plant Overview never shows the gray OFFLINE/OFF treatment ScadaView uses —
    // badges here are meant to always read as live (the plant floor screen is
    // shown ambiently in a control room; a value it once received but hasn't
    // seen refresh recently should still just show that value, not flip to a
    // stale-looking gray "OFF"). isMarkerStale/isMarkerStale-based components
    // treat a falsy thresholdMinutes as "not loaded yet — never stale", which
    // this exploits intentionally by simply never fetching/setting a real one.
    // ScadaView is unaffected — it fetches and applies the real global
    // meter_offline_settings threshold independently of this file.
    const thresholdMinutes = 0;

    const {
        dialogOpen, newMarkerData, editingMarkerId, pendingTabIndex,
        selectedDevice,    setSelectedDevice,
        selectedSensors,   setSelectedSensors,
        selectedSlaveId,   setSelectedSlaveId,
        chartMode,         setChartMode,
        selectedCombinedDevices, setSelectedCombinedDevices,
        updateMarkerData, openForNew, openForEdit, resetForm, closeDialog,
    } = useMarkerForm();

    const [tabIndex, setTabIndex]               = useState(0);
    const [draggingMarker, setDraggingMarker]   = useState(null);
    const [unsavedMarkerIds, setUnsavedMarkerIds] = useState(new Set());
    const [dialogTableConfig, setDialogTableConfig] = useState(null);

    // ── Cell binding dialog state ────────────────────────────────────────────
    const [cellDialogOpen, setCellDialogOpen]     = useState(false);
    const [pendingCell, setPendingCell]           = useState(null); // { row, colGroup, subCol, tabIdx, key }
    const [existingCellBinding, setExistingCellBinding] = useState(null);
    const [cellDevice, setCellDevice]             = useState("");
    const [cellSlave, setCellSlave]               = useState("");
    const [cellTag, setCellTag]                   = useState("");

    // ── Image upload ────────────────────────────────────────────────────────
    const handleImageUpload = useCallback((e, tabIdx) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert("Image size must be less than 5 MB"); return; }

        // Show a local preview immediately while the upload is in flight
        const previewUrl = URL.createObjectURL(file);
        updateTabImage(tabIdx, previewUrl, null);

        uploadTabImage(file, tabIdx, userDetails?.id,
            (res) => {
                if (res?.success && res?.imagePath) {
                    // Replace the temporary blob URL with the permanent server URL.
                    // The blob URL disappears when the tab panel unmounts; the server
                    // URL survives tab switches and page reloads.
                    updateTabImage(tabIdx, buildImageUrl(res.imagePath), res.imagePath);
                    // Refresh scada_tabs state so background_image is current for this session
                    fetchScadaNames();
                }
            },
            (err) => console.error("Plant Overview image upload failed:", err),
            scadaTabs[tabIdx]?.name
        );
    }, [updateTabImage, uploadTabImage, fetchScadaNames, scadaTabs]);

    // ── Click on image → open "Add Marker" dialog ───────────────────────────
    const handleImageClick = useCallback((e, tabIdx, tblCfg) => {
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setDialogTableConfig(tblCfg || null);
        openForNew(x.toFixed(2), y.toFixed(2), tabIdx);
    }, [openForNew]);

    // ── Drag marker position ─────────────────────────────────────────────────
    const handlePointerMove = useCallback((e, tabIdx) => {
        if (!draggingMarker) return;
        const img = document.getElementById(`scada-image-${tabIdx}`);
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        updateMarkerPosition(tabIdx, draggingMarker, x.toFixed(2), y.toFixed(2));
        setUnsavedMarkerIds(prev => new Set(prev).add(draggingMarker));
    }, [draggingMarker, updateMarkerPosition]);

    const handleDragStart = useCallback((markerId) => setDraggingMarker(markerId), []);
    const handleDragEnd   = useCallback((markerId) => {
        setDraggingMarker(null);
        setUnsavedMarkerIds(prev => new Set(prev).add(markerId));
    }, []);

    // ── Resize marker (local state only, pending save — same as drag-reposition) ──
    const handleResizeEnd = useCallback((markerId, width, height, tabIdx) => {
        updateMarkerSize(tabIdx, markerId, width, height);
        setUnsavedMarkerIds(prev => new Set(prev).add(markerId));
    }, [updateMarkerSize]);

    // ── Double-click marker → open edit/delete dialog ───────────────────────
    const handleMarkerDoubleClick = useCallback((marker, tabIdx, tblCfg) => {
        setDialogTableConfig(tblCfg || null);
        if (marker.style?.chartMode === "combined") {
            const deviceIds = [...new Set((marker.style.combinedSensors || []).map(s => s.deviceId))];
            loadCombinedSensorOptions(deviceIds);
        } else if (marker.deviceId) {
            loadSlaveIds(marker.deviceId);
            if (marker.slaveId) loadSensors({ deviceId: marker.deviceId, slaveId: marker.slaveId });
        }
        openForEdit(marker, tabIdx);
    }, [loadSlaveIds, loadSensors, loadCombinedSensorOptions, openForEdit]);

    // ── Add / update marker (local state only, pending save) ────────────────
    const handleAddMarker = useCallback(() => {
        const {
            x, y, label, unit, textColor, bgColor, widgetType, alignment,
            cardWidth, cardHeight, cardRadius, width, height,
            tableRow, tableColGroup, tableSubCol,
            maxVal, threshold1, color1, threshold2, color2, color3,
            statusType, statusThreshold1, statusThreshold2, statusThreshold3, statusThreshold4,
            statusImage1, statusImage2, statusImage3, statusImage4, statusImage5,
            statusImage0, statusImage1_digital, fontSize, decimalPoints, iconSize,
            chartLast, chartAggregation, chartInterval, chartWidth, chartHeight,
            specMin, specMax, controlLow, controlMax,
            combinedSensors,
        } = newMarkerData;

        const selectedSensorData = selectList.find(s => s.id === selectedSensors);

        const styleObj = {
            iconSize: iconSize || "medium",
            textColor, bgColor,
            widgetType: widgetType || "card",
            alignment: alignment || "top",
            // Carried forward unconditionally so a drag-resize on gauge/semicircle/
            // progress/sevensegment (the only types that use this generic pair) isn't
            // silently dropped the next time this marker's dialog is saved for an
            // unrelated edit — card/status/chart types ignore these in favor of their
            // own cardWidth/cardHeight/chartWidth/chartHeight fields below.
            width: width === "" || width === undefined ? "" : Number(width),
            height: height === "" || height === undefined ? "" : Number(height),
            // Same reasoning: carried forward unconditionally so combinedSensors
            // survives an unrelated edit (e.g. just repositioning) instead of being
            // silently dropped by this from-scratch styleObj rebuild.
            chartMode: chartMode === "combined" ? "combined" : "single",
            combinedSensors: chartMode === "combined" ? (combinedSensors || []) : [],
        };

        if (widgetType === "card" || widgetType === "status" || widgetType === "text") {
            Object.assign(styleObj, {
                cardWidth: cardWidth === "" ? "" : Number(cardWidth),
                cardHeight: cardHeight === "" ? "" : Number(cardHeight),
                cardRadius: cardRadius === "" ? "" : Number(cardRadius),
            });
        }
        if (widgetType === "text") {
            Object.assign(styleObj, { fontSize: Number(fontSize) || 14 });
        }

        // Table cell mapping (applies to any widget type)
        if (tableRow || tableColGroup || tableSubCol) {
            Object.assign(styleObj, { tableRow, tableColGroup, tableSubCol });
        }

        if (["semicircle", "gauge", "progress"].includes(widgetType)) {
            Object.assign(styleObj, {
                maxVal: Number(maxVal) || 100,
                threshold1: Number(threshold1) || 30, color1: color1 || "#4caf50",
                threshold2: Number(threshold2) || 60, color2: color2 || "#ffeb3b",
                color3: color3 || "#f44336",
            });
        } else if (widgetType === "status") {
            Object.assign(styleObj, {
                statusType: statusType || "analog",
                statusThreshold1: Number(statusThreshold1) || 20,
                statusThreshold2: Number(statusThreshold2) || 40,
                statusThreshold3: Number(statusThreshold3) || 60,
                statusThreshold4: Number(statusThreshold4) || 80,
                statusImage1, statusImage2, statusImage3, statusImage4, statusImage5,
                statusImage0, statusImage1_digital,
            });
        } else if (widgetType === "sevensegment") {
            Object.assign(styleObj, {
                fontSize: Number(fontSize) || 24,
                decimalPoints: Number(decimalPoints) !== undefined ? Number(decimalPoints) : 2,
                threshold1: Number(threshold1) || 30, color1: color1 || "#4caf50",
                threshold2: Number(threshold2) || 60, color2: color2 || "#ffeb3b",
                color3: color3 || "#f44336",
            });
        } else if (widgetType === "linechart" || widgetType === "barchart" || widgetType === "areachart") {
            Object.assign(styleObj, {
                chartLast: chartLast || "8hr",
                chartAggregation: chartAggregation || "avg",
                chartInterval: chartInterval || "15min",
                chartWidth: Number(chartWidth) || 360,
                chartHeight: Number(chartHeight) || 220,
                // Optional horizontal reference lines — "" (unset) hides a line
                // entirely rather than defaulting to 0, so leave blank as-is.
                specMin: specMin === "" || specMin === undefined ? "" : Number(specMin),
                specMax: specMax === "" || specMax === undefined ? "" : Number(specMax),
                controlLow: controlLow === "" || controlLow === undefined ? "" : Number(controlLow),
                controlMax: controlMax === "" || controlMax === undefined ? "" : Number(controlMax),
            });
        }

        const newMarkerId = editingMarkerId || Date.now();
        setUnsavedMarkerIds(prev => new Set(prev).add(newMarkerId));

        // Combined (Analytics) markers have no single sensor identity — omitting
        // these explicitly (rather than leaving whatever the Normal tab's dropdowns
        // currently hold) prevents a stale single-sensor identity from sticking to
        // a marker the user actually meant to make combined.
        const isCombined = chartMode === "combined";
        const newMarker = {
            id: newMarkerId,
            deviceId: isCombined ? null : selectedDevice,
            edgeDeviceId: isCombined ? null : selectedDevice,
            slaveId: isCombined ? null : selectedSlaveId,
            x: parseFloat(x),
            y: parseFloat(y),
            label: label || `Point ${(scadaTabs[pendingTabIndex]?.markers.length || 0) + 1}`,
            unit,
            tagKey: isCombined ? null : (selectedSensorData?.id || selectedSensors),
            color: JSON.stringify(styleObj),
            style: styleObj,
        };

        upsertMarker(pendingTabIndex, newMarker, editingMarkerId);
        closeDialog();
    }, [newMarkerData, selectList, selectedSensors, selectedDevice, selectedSlaveId, chartMode, editingMarkerId, pendingTabIndex, scadaTabs, upsertMarker, closeDialog]);

    // ── Save single marker to server ─────────────────────────────────────────
    const handleMarkerSave = useCallback((marker, markerTabIndex) => {
        const tab = scadaTabs[markerTabIndex];
        const payload = {
            deviceId: marker.deviceId,
            edgeDeviceId: marker.edgeDeviceId || "",
            slaveId: marker.slaveId || "",
            userId: userDetails?.id,
            locationId: locationDetails,
            tagsId: marker.tagKey,
            units: marker.unit,
            titleName: marker.label,
            x: parseFloat(marker.x),
            y: parseFloat(marker.y),
            color: typeof marker.style === "string" ? marker.style : JSON.stringify(marker.style),
            image: resolveImagePath(tab),
            scadaTab: String(markerTabIndex + 1),
            module: MODULE,
        };
        if (String(marker.id).length < 13) payload.id = marker.id;

        AddScadaService(payload,
            () => {
                setUnsavedMarkerIds(prev => { const next = new Set(prev); next.delete(marker.id); return next; });
                fetchScadaData();
            },
            (err) => console.error("Marker save error:", err)
        );
    }, [scadaTabs, userDetails?.id, locationDetails, fetchScadaData]);

    // ── Delete marker ────────────────────────────────────────────────────────
    const handleDeleteMarker = useCallback(() => {
        if (!editingMarkerId) return;

        if (String(editingMarkerId).length >= 13) {
            removeMarker(pendingTabIndex, editingMarkerId);
            setUnsavedMarkerIds(prev => { const next = new Set(prev); next.delete(editingMarkerId); return next; });
            closeDialog();
            return;
        }

        DeleteScadaService(
            editingMarkerId,
            () => { fetchScadaData(); closeDialog(); },
            (err) => console.error("Marker delete error:", err)
        );
    }, [editingMarkerId, pendingTabIndex, removeMarker, fetchScadaData, closeDialog]);

    // ── Cell binding ─────────────────────────────────────────────────────────
    // Device/Slave/Sensor seeding for whichever widget is being edited now
    // happens inside CellBindingDialog itself (a cell can hold several
    // widgets, each with its own data source) — this just hands it the raw
    // saved binding and starts the pickers blank.
    const handleCellEdit = useCallback((row, colGroup, subCol, tabIdx) => {
        const key      = `${row}||${colGroup}||${subCol}`;
        const existing = tableConfigs[tabIdx + 1]?.config?.cellBindings?.[key] || null;
        setPendingCell({ row, colGroup, subCol, tabIdx, key, isRow: false });
        setExistingCellBinding(existing);
        setCellDevice(""); setCellSlave(""); setCellTag("");
        setCellDialogOpen(true);
    }, [tableConfigs]);

    // Row-label click ("+"/pencil on the leftmost Description column) — same
    // dialog as a cell, opened in "row" mode (navigation + color, no sensor —
    // see CellBindingDialog's `mode` prop), stored under config.rowBindings
    // (a separate map keyed by row label, so it never collides with
    // cellBindings' row||colGroup||subCol keys).
    const handleRowEdit = useCallback((row, tabIdx) => {
        const existing = tableConfigs[tabIdx + 1]?.config?.rowBindings?.[row] || null;
        setPendingCell({ row, colGroup: null, subCol: null, tabIdx, key: row, isRow: true });
        setExistingCellBinding(existing);
        setCellDevice(""); setCellSlave(""); setCellTag("");
        setCellDialogOpen(true);
    }, [tableConfigs]);

    // bindingData comes fully-formed from CellBindingDialog (includes widget config)
    const handleCellBindingSave = useCallback((bindingData) => {
        if (!pendingCell) return;
        const { tabIdx, key, isRow } = pendingCell;
        const currentConfig = tableConfigs[tabIdx + 1]?.config;
        if (!currentConfig) return;
        const bucket = isRow ? "rowBindings" : "cellBindings";
        const updatedConfig = {
            ...currentConfig,
            [bucket]: { ...(currentConfig[bucket] || {}), [key]: bindingData },
        };
        saveTableConfig(updatedConfig, tabIdx + 1);
        setCellDialogOpen(false);
        setPendingCell(null);
        setExistingCellBinding(null);
    }, [pendingCell, tableConfigs, saveTableConfig]);

    const handleCellBindingClear = useCallback(() => {
        if (!pendingCell) return;
        const { tabIdx, key, isRow } = pendingCell;
        const currentConfig = tableConfigs[tabIdx + 1]?.config;
        if (!currentConfig) return;
        const bucket = isRow ? "rowBindings" : "cellBindings";
        const bindings = { ...(currentConfig[bucket] || {}) };
        delete bindings[key];
        saveTableConfig({ ...currentConfig, [bucket]: bindings }, tabIdx + 1);
        setCellDialogOpen(false);
        setPendingCell(null);
        setExistingCellBinding(null);
    }, [pendingCell, tableConfigs, saveTableConfig]);


    // ────────────────────────────────────────────────────────────────────────
    // The shell (.home-OutLet in HomeScreen.css) is `display:flex; flex-
    // direction:column; justify-content:space-between` between this content
    // and the Footer — every other page is short enough that "space-between"
    // just pins the footer below naturally-sized content. Plant Overview's
    // home screen wants that leftover gap consumed instead (no blank strip
    // above the footer, table fits without its own scrollbar) — flex:1 here
    // makes this stretch to fill exactly the space available before the
    // footer, however tall that turns out to be, instead of guessing a fixed
    // vh number. minHeight:0 at each flex level below is required for a flex
    // child to actually shrink to fit instead of overflowing its box.
    return (
        <Card style={{ boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px", borderRadius: "12px" }}
            sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <Container maxWidth={false} disableGutters sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

                    <PlantOverviewHeader
                        scadaTabs={scadaTabs}
                        tabIndex={tabIndex}
                        onTabChange={setTabIndex}
                        onAddTab={() => { addTab(); }}
                        onRenameTab={renameTab}
                        onDeleteTab={deleteTab}
                    />

                    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                    {scadaTabs.map((tab, index) => {
                        const tabHyperlinks  = hyperlinks.filter(h => Number(h.tabIndex) === index + 1);
                        const tabTableEntry  = tableConfigs[index + 1] || null;
                        const tabTableCfg    = tabTableEntry?.config || null;
                        const tabTableCfgId  = tabTableEntry?.id || null;
                        return (
                            <ScadaTabPanel
                                key={index}
                                tab={tab}
                                tabIndex={index}
                                tabValue={tabIndex}
                                liveData={liveData}
                                unsavedMarkerIds={unsavedMarkerIds}
                                draggingMarker={draggingMarker}
                                locationId={locationDetails}
                                thresholdMinutes={thresholdMinutes}
                                liveSnapshotUpdatedAt={liveSnapshotUpdatedAt}
                                scadaTabs={scadaTabs}
                                // Home screen (index 0): "100%" fills whatever the flex:1 wrapper
                                // above actually has left after the header + consumption panel —
                                // no more guessing a fixed vh number that's sometimes too tall
                                // (own scrollbar) and sometimes too short (blank gap before the
                                // footer). Every other screen keeps maxHeightCss's own default
                                // (fills the viewport exactly like the SCADA Dashboard does).
                                maxHeightCss={index === 0 ? "100%" : undefined}
                                // ScadaView's 400px floor is taller than what's actually left on a
                                // compact screen once the header + (now height-capped) consumption
                                // panel take their share — forcing it anyway was overflowing this
                                // row into the panel below instead of just sizing down.
                                minHeightPx={index === 0 ? 180 : undefined}
                                // Home screen only: table takes the main (wider) column and the
                                // floor image shrinks to a smaller reference panel with the
                                // "Awards & Plant Highlights Videos" panel stacked under it —
                                // matching the client wireframe's layout exactly.
                                tableFirst={index === 0}
                                belowImage={index === 0 ? <PlantOverviewVideoPanel /> : null}
                                // Table now has real leftover height to work with (see the flex
                                // chain above) — stretch it and spread its rows to use that
                                // instead of leaving blank space below the last row.
                                tableFillHeight={index === 0}
                                hyperlinks={tabHyperlinks}
                                tableConfig={tabTableCfg}
                                tableConfigId={tabTableCfgId}
                                userDetails={userDetails}
                                onImageUpload={handleImageUpload}
                                onImageClick={handleImageClick}
                                onPointerMove={(e) => handlePointerMove(e, index)}
                                onPointerRelease={() => setDraggingMarker(null)}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onResizeEnd={handleResizeEnd}
                                onMarkerDoubleClick={handleMarkerDoubleClick}
                                onMarkerSave={handleMarkerSave}
                                onImageError={clearTabImage}
                                onSaveTable={saveTableConfig}
                                onDeleteTable={deleteTableConfig}
                                onSaveHyperlink={saveHyperlink}
                                onDeleteHyperlink={deleteHyperlink}
                                onNavigateTab={setTabIndex}
                                onCellEdit={(row, grp, sub) => handleCellEdit(row, grp, sub, index)}
                                onRowEdit={(row) => handleRowEdit(row, index)}
                            />
                        );
                    })}
                    </Box>

                    {/* Live Energy/Water consumption summary — home screen only
                        (tabIndex 0), matching the client wireframe; reuses the
                        already-implemented Energy Dashboard tree + Utility
                        Dashboard water meters, see PlantOverviewConsumptionPanel.
                        Capped at ~26% of the viewport (not left to its natural
                        content height) so it can never grow large enough to push
                        the row above into overflow on a shorter screen — an
                        internal scrollbar is the worst case now, never overlap. */}
                    {tabIndex === 0 && (
                        <Box sx={{ flex: "0 0 auto", maxHeight: "26vh", overflowY: "auto" }}>
                            <PlantOverviewConsumptionPanel />
                        </Box>
                    )}

                </Box>
            </Container>

            <MarkerDialog
                open={dialogOpen}
                onClose={closeDialog}
                onExited={() => { resetForm(); setDialogTableConfig(null); }}
                editingMarkerId={editingMarkerId}
                markerData={newMarkerData}
                onMarkerDataChange={updateMarkerData}
                selectedDevice={selectedDevice}       setSelectedDevice={setSelectedDevice}
                selectedSensors={selectedSensors}     setSelectedSensors={setSelectedSensors}
                selectedSlaveId={selectedSlaveId}     setSelectedSlaveId={setSelectedSlaveId}
                chartMode={chartMode}                 setChartMode={setChartMode}
                selectedCombinedDevices={selectedCombinedDevices} setSelectedCombinedDevices={setSelectedCombinedDevices}
                deviceList={deviceList}
                slaveIdList={slaveIdList}
                selectList={selectList}
                combinedSensorOptions={combinedSensorOptions}
                onLoadSlaveIds={loadSlaveIds}
                onLoadSensors={loadSensors}
                onLoadCombinedSensorOptions={loadCombinedSensorOptions}
                onAdd={handleAddMarker}
                onDelete={handleDeleteMarker}
                tableConfig={dialogTableConfig}
            />

            <CellBindingDialog
                open={cellDialogOpen}
                onClose={() => { setCellDialogOpen(false); setPendingCell(null); setExistingCellBinding(null); }}
                cellInfo={pendingCell}
                existingBinding={existingCellBinding}
                hasExisting={!!existingCellBinding}
                deviceList={deviceList}
                slaveIdList={slaveIdList}
                selectList={selectList}
                selectedDevice={cellDevice}   setSelectedDevice={setCellDevice}
                selectedSlaveId={cellSlave}   setSelectedSlaveId={setCellSlave}
                selectedTagKey={cellTag}      setSelectedTagKey={setCellTag}
                onLoadSlaveIds={loadSlaveIds}
                onLoadSensors={loadSensors}
                onSave={handleCellBindingSave}
                onClear={handleCellBindingClear}
                scadaTabs={scadaTabs}
                currentTabIndex={pendingCell?.tabIdx}
                mode={pendingCell?.isRow ? "row" : "cell"}
            />
        </Card>
    );
};

export default PlantOverview;
