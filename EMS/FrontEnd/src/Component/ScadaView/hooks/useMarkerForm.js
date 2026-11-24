import { useState, useCallback } from "react";
import { DEFAULT_MARKER_DATA } from "../constants/scadaDefaults";

const useMarkerForm = () => {
    const [dialogOpen, setDialogOpen]           = useState(false);
    const [newMarkerData, setNewMarkerData]     = useState(DEFAULT_MARKER_DATA);
    const [editingMarkerId, setEditingMarkerId] = useState(null);
    const [pendingTabIndex, setPendingTabIndex] = useState(null);
    const [selectedDevice, setSelectedDevice]   = useState("");
    const [selectedSensors, setSelectedSensors] = useState("");
    const [selectedSlaveId, setSelectedSlaveId] = useState("");
    // "single" (Normal tab) | "combined" (Analytics tab) — lifted here (not local
    // useState in MarkerDialog) because that dialog is persistently mounted, so
    // internal state wouldn't reset between edits of different markers.
    const [chartMode, setChartMode] = useState("single");
    const [selectedCombinedDevices, setSelectedCombinedDevices] = useState([]);

    const updateMarkerData = useCallback((updates) => {
        setNewMarkerData(prev => ({ ...prev, ...updates }));
    }, []);

    const openForNew = useCallback((x, y, tabIdx) => {
        setNewMarkerData({ ...DEFAULT_MARKER_DATA, x, y });
        setPendingTabIndex(tabIdx);
        setSelectedDevice("");
        setSelectedSensors("");
        setSelectedSlaveId("");
        setChartMode("single");
        setSelectedCombinedDevices([]);
        setEditingMarkerId(null);
        setDialogOpen(true);
    }, []);

    const openForEdit = useCallback((marker, tabIdx) => {
        setEditingMarkerId(marker.id);
        setPendingTabIndex(tabIdx);
        setSelectedDevice(marker.deviceId || "");
        setSelectedSensors(marker.tagKey || "");
        setSelectedSlaveId(marker.slaveId || "");
        const isCombined = marker.style?.chartMode === "combined";
        setChartMode(isCombined ? "combined" : "single");
        setSelectedCombinedDevices(
            isCombined ? [...new Set((marker.style?.combinedSensors || []).map(s => s.deviceId))] : []
        );
        setNewMarkerData({
            ...DEFAULT_MARKER_DATA,
            x: marker.x, y: marker.y,
            label: marker.label, unit: marker.unit,
            tagKey: marker.tagKey,
            ...marker.style,
        });
        setDialogOpen(true);
    }, []);

    const resetForm = useCallback(() => {
        setNewMarkerData(DEFAULT_MARKER_DATA);
        setSelectedDevice("");
        setSelectedSensors("");
        setSelectedSlaveId("");
        setChartMode("single");
        setSelectedCombinedDevices([]);
        setEditingMarkerId(null);
    }, []);

    const closeDialog = useCallback(() => setDialogOpen(false), []);

    return {
        dialogOpen,
        newMarkerData,
        editingMarkerId,
        pendingTabIndex,
        selectedDevice,    setSelectedDevice,
        selectedSensors,   setSelectedSensors,
        selectedSlaveId,   setSelectedSlaveId,
        chartMode,         setChartMode,
        selectedCombinedDevices, setSelectedCombinedDevices,
        updateMarkerData,
        openForNew,
        openForEdit,
        resetForm,
        closeDialog,
    };
};

export default useMarkerForm;
