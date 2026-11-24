import { useState, useEffect, useCallback } from "react";
import ApplicationStore from "../../../utils/localStorageUtil";
import {
    DevicesFetchShowService,
    ShowScadaServiceList,
    ScadaFetchSlaveIds,
    ShowSelectSensors,
    GetScadaTagsByDevicesService,
    ScadaUploadImage,
    ShowScadaNameListService,
    DeleteScadaTabService,
    SaveScadaTableService,
    ShowScadaTableService,
    DeleteScadaTableService,
    SaveScadaHyperlinkService,
    ShowScadaHyperlinkService,
    DeleteScadaHyperlinkService,
} from "../../../Services/LoginPageService";
import { DEFAULT_TABS } from "../constants/scadaDefaults";
import { buildImageUrl, mergeMarkerStyle } from "../utils/markerUtils";

// module: 'scada' (default) is the existing SCADA Dashboard's tab-strip view;
// 'plantOverview' is the new Plant Overview click-through page. Both reuse this
// same hook/engine — the module tag keeps their tabs/markers/tables/hyperlinks
// stored separately server-side (see Database/migration_plant_overview_module.sql)
// so editing one never touches the other's data.
// initialTabs: starter placeholder tabs shown before the first fetch resolves.
// The SCADA Dashboard keeps its original "Motor 1/2/3" defaults; callers for a
// different module (e.g. Plant Overview) can pass their own starter screens.
// minTabs: floor `handleScadaSuccess` pads scadaTabs up to on every marker
// fetch — 3 preserves the SCADA Dashboard's original "always at least 3 Motor
// tabs" behavior exactly; Plant Overview passes 1 so a fresh install stays a
// single "Plant Overview" home screen instead of sprouting two empty extras.
const useScadaData = (module = 'scada', initialTabs = DEFAULT_TABS, minTabs = 3) => {
    const { userDetails } = ApplicationStore().getStorage('userDetails');
    // Cosmetic-only label used for placeholder tab names ("New SCADA 4" /
    // "New Screen 4") until the user renames them — never sent to the server.
    const newTabLabel = module === 'plantOverview' ? 'New Screen' : 'New SCADA';

    const [scadaTabs, setScadaTabs]           = useState(initialTabs);
    const [deviceList, setDeviceList]         = useState([]);
    const [locationDetails, setLocationDetails] = useState(null);
    const [slaveIdList, setSlaveIdList]       = useState([]);
    const [selectList, setSelectList]         = useState([]);
    // Flat, cross-device sensor list for the Analytics (combined multi-sensor
    // chart) tab — each row self-describes {deviceId, deviceName, slaveId, tagId, tagName}.
    const [combinedSensorOptions, setCombinedSensorOptions] = useState([]);
    // tableConfigs: { [tabIndex1based]: { id, config } }
    const [tableConfigs, setTableConfigs]     = useState({});
    // liveSnapshot: { [tagKey]: value } — last known sensor values for table cells,
    // shown until the Socket.IO "livedata" feed pushes fresher values
    const [liveSnapshot, setLiveSnapshot]     = useState({});
    // liveSnapshotUpdatedAt: { [tagKey]: updated_at } — when each of those values was
    // actually last written (live_tag_snapshot), kept separate from liveSnapshot so it
    // stays a plain scalar map for every existing consumer. Used only for staleness checks.
    const [liveSnapshotUpdatedAt, setLiveSnapshotUpdatedAt] = useState({});
    // hyperlinks: flat array from DB
    const [hyperlinks, setHyperlinks]         = useState([]);

    const handleScadaSuccess = useCallback((dataObject) => {
        const scadaData = dataObject?.data || [];
        setScadaTabs((prevTabs) => {
            const tabIndices = scadaData.map(item => Number(item.scadaTab)).filter(n => !isNaN(n));
            const maxTabNeeded = Math.max(...tabIndices, prevTabs.length, minTabs);

            // Placeholder label only — real name arrives moments later via
            // fetchScadaNames/handleScadaNamesSuccess. Left as the SCADA
            // Dashboard's original literal "Motor" so its behavior is
            // byte-for-byte unchanged; Plant Overview only hits this padding
            // path in the rare case markers reference a not-yet-known screen.
            let updatedTabs = [...prevTabs];
            while (updatedTabs.length < maxTabNeeded) {
                updatedTabs.push({ name: `Motor ${updatedTabs.length + 1}`, image: "", markers: [] });
            }
            updatedTabs = updatedTabs.map(tab => ({ ...tab, markers: [] }));

            scadaData.forEach((item) => {
                const rawTab = Number(item.scadaTab);
                if (isNaN(rawTab) || rawTab < 1) return;
                const idx = rawTab - 1;
                if (!updatedTabs[idx]) return;

                if (item.image) {
                    const imageUrl = buildImageUrl(item.image);
                    const currentImg = updatedTabs[idx].image || "";
                    if (!currentImg || currentImg.startsWith("undefined/")) {
                        updatedTabs[idx].image = imageUrl;
                        updatedTabs[idx].imagePath = item.image;
                    }
                    if (!updatedTabs[idx].imagePath) {
                        updatedTabs[idx].imagePath = item.image;
                    }
                }

                updatedTabs[idx].markers.push({
                    id: item.id || Date.now() + Math.random(),
                    deviceId: item.deviceId,
                    edgeDeviceId: item.edgeDeviceId || "",
                    slaveId: item.slaveId || "",
                    x: item.x,
                    y: item.y,
                    label: item.titleName || "",
                    unit: item.units || "",
                    tagKey: item.tagsId,
                    color: item.color || "#040408ff",
                    style: mergeMarkerStyle(item.color),
                    sensorValue: item.sensorValue,
                    lastUpdated: item.lastUpdated,
                });
            });
            return updatedTabs;
        });
    }, []);

    const fetchScadaData = useCallback(() => {
        ShowScadaServiceList({ userId: userDetails?.id, module }, handleScadaSuccess, () => {});
    }, [userDetails?.id, module, handleScadaSuccess]);

    const handleScadaNamesSuccess = useCallback((dataObject) => {
        const names = dataObject?.data || [];
        if (!names.length) return;

        const indexed = names.filter(n => n.tabIndex !== null && n.tabIndex !== undefined);
        const legacy  = names.filter(n => n.tabIndex === null || n.tabIndex === undefined);

        const maxIndexed   = indexed.reduce((max, n) => Math.max(max, Number(n.tabIndex)), 0);
        const neededLength = Math.max(maxIndexed, legacy.length);

        setScadaTabs((prevTabs) => {
            const updatedTabs = [...prevTabs];
            while (updatedTabs.length < neededLength) {
                updatedTabs.push({ name: `${newTabLabel} ${updatedTabs.length + 1}`, image: "", markers: [], id: null });
            }

            legacy.forEach((tab, idx) => {
                if (!updatedTabs[idx]) return;
                const bgImage = tab.background_image ? buildImageUrl(tab.background_image) : "";
                updatedTabs[idx] = {
                    ...updatedTabs[idx],
                    name: tab.scadaName,
                    id: tab.id,
                    ...(bgImage && !updatedTabs[idx].image ? { image: bgImage, imagePath: tab.background_image } : {}),
                };
            });

            indexed.forEach((tab) => {
                const idx = Number(tab.tabIndex) - 1;
                if (idx < 0 || !updatedTabs[idx]) return;
                const bgImage = tab.background_image ? buildImageUrl(tab.background_image) : "";
                updatedTabs[idx] = {
                    ...updatedTabs[idx],
                    name: tab.scadaName,
                    id: tab.id,
                    ...(bgImage && !updatedTabs[idx].image ? { image: bgImage, imagePath: tab.background_image } : {}),
                };
            });

            return updatedTabs;
        });
    }, [newTabLabel]);

    const fetchScadaNames = useCallback(() => {
        ShowScadaNameListService({ userId: userDetails?.id, module }, handleScadaNamesSuccess, () => {});
    }, [userDetails?.id, module, handleScadaNamesSuccess]);

    const fetchTableConfigs = useCallback(() => {
        ShowScadaTableService({ userId: userDetails?.id, module }, (res) => {
            const map = {};
            (res?.data || []).forEach(row => {
                try { map[row.tabIndex] = { id: row.id, config: JSON.parse(row.tableConfig) }; }
                catch { map[row.tabIndex] = { id: row.id, config: null }; }
            });
            setTableConfigs(map);
            setLiveSnapshot(res?.liveSnapshot || {});
            setLiveSnapshotUpdatedAt(res?.liveSnapshotUpdatedAt || {});
        }, () => {});
    }, [userDetails?.id, module]);

    const fetchHyperlinks = useCallback(() => {
        ShowScadaHyperlinkService({ userId: userDetails?.id, module }, (res) => {
            setHyperlinks(res?.data || []);
        }, () => {});
    }, [userDetails?.id, module]);

    const saveTableConfig = useCallback((tableConfig, tabIndex) => {
        SaveScadaTableService(
            { userId: userDetails?.id, tabIndex, tableConfig, module },
            () => fetchTableConfigs(),
            () => {}
        );
    }, [userDetails?.id, module, fetchTableConfigs]);

    const deleteTableConfig = useCallback((id) => {
        DeleteScadaTableService(id, () => fetchTableConfigs(), () => {});
    }, [fetchTableConfigs]);

    const saveHyperlink = useCallback((data) => {
        SaveScadaHyperlinkService(
            { userId: userDetails?.id, ...data, module },
            () => fetchHyperlinks(),
            () => {}
        );
    }, [userDetails?.id, module, fetchHyperlinks]);

    const deleteHyperlink = useCallback((id) => {
        DeleteScadaHyperlinkService(id, () => fetchHyperlinks(), () => {});
    }, [fetchHyperlinks]);

    useEffect(() => {
        DevicesFetchShowService(
            { userId: userDetails?.id },
            (data) => { setDeviceList(data?.data || []); setLocationDetails(data?.locationId); },
            () => {}
        );
        fetchScadaData();
        fetchScadaNames();
        fetchTableConfigs();
        fetchHyperlinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSlaveIds = useCallback((deviceId) => {
        ScadaFetchSlaveIds(
            { edgeDeviceId: deviceId },
            (data) => setSlaveIdList(data?.data || []),
            () => {}
        );
    }, []);

    const loadSensors = useCallback((params) => {
        ShowSelectSensors(params, (data) => setSelectList(data?.data || []), () => {});
    }, []);

    const loadCombinedSensorOptions = useCallback((deviceIds) => {
        if (!deviceIds?.length) { setCombinedSensorOptions([]); return; }
        GetScadaTagsByDevicesService(
            { deviceIds },
            (data) => setCombinedSensorOptions(data?.data || []),
            () => setCombinedSensorOptions([])
        );
    }, []);

    const uploadTabImage = useCallback((file, tabIndex, userId, onSuccess, onError, tabName) => {
        const formData = new FormData();
        formData.append('image', file);
        // Send tab index (1-based) and userId so the backend can persist background_image
        if (tabIndex !== undefined && tabIndex !== null) formData.append('tabIndex', tabIndex + 1);
        if (userId) formData.append('userId', String(userId));
        formData.append('module', module);
        // A brand-new "+ Add Screen" tab has no scada_tabs row yet — the backend
        // creates one on first image upload (see ScadaController.uploadImage),
        // and uses this name for it so the tab doesn't visibly rename itself
        // to a generic placeholder right after uploading an image.
        if (tabName) formData.append('scadaName', tabName);
        ScadaUploadImage(formData, onSuccess, onError);
    }, [module]);

    const addTab = useCallback(() => {
        setScadaTabs(prev => [
            ...prev,
            { name: `${newTabLabel} ${prev.length + 1}`, image: "", markers: [], id: null },
        ]);
    }, [newTabLabel]);

    const deleteTab = useCallback((tabIndex, onSuccess, onError) => {
        DeleteScadaTabService(
            { tabIndex: tabIndex + 1, userId: userDetails?.id, module },
            () => {
                setScadaTabs(prev => {
                    if (prev.length <= 1) {
                        return [{ name: `${newTabLabel} 1`, image: "", markers: [], id: null }];
                    }
                    return prev.filter((_, idx) => idx !== tabIndex);
                });
                fetchScadaData();
                fetchScadaNames();
                if (onSuccess) onSuccess();
            },
            (status, message) => { if (onError) onError(status, message); }
        );
    }, [userDetails?.id, module, newTabLabel, fetchScadaData, fetchScadaNames]);

    const updateTabImage = useCallback((tabIndex, image, imagePath = null) => {
        setScadaTabs(prev => {
            const tabs = [...prev];
            tabs[tabIndex] = { ...tabs[tabIndex], image, imagePath };
            return tabs;
        });
    }, []);

    const updateTabImagePath = useCallback((tabIndex, imagePath) => {
        setScadaTabs(prev => {
            const tabs = [...prev];
            tabs[tabIndex] = { ...tabs[tabIndex], imagePath };
            return tabs;
        });
    }, []);

    const clearTabImage = useCallback((tabIndex) => {
        setScadaTabs(prev => {
            const tabs = [...prev];
            if (tabs[tabIndex]) tabs[tabIndex] = { ...tabs[tabIndex], image: null };
            return tabs;
        });
    }, []);

    const renameTab = useCallback((tabIndex, name, id) => {
        setScadaTabs(prev => {
            const tabs = [...prev];
            tabs[tabIndex] = { ...tabs[tabIndex], name, ...(id ? { id } : {}) };
            return tabs;
        });
    }, []);

    const updateMarkerPosition = useCallback((tabIndex, markerId, x, y) => {
        setScadaTabs(prev => {
            const updated = [...prev];
            const marker = updated[tabIndex]?.markers.find(m => m.id === markerId);
            if (marker) { marker.x = x; marker.y = y; }
            return updated;
        });
    }, []);

    // Writes into whichever size field the widget type already reads (cardWidth/
    // cardHeight, chartWidth/chartHeight) so a resize round-trips through the same
    // field the Add/Edit Marker dialog uses; gauge/semicircle/progress/sevensegment
    // have no such field today, so they get the new generic width/height pair.
    const updateMarkerSize = useCallback((tabIndex, markerId, width, height) => {
        setScadaTabs(prev => {
            const updated = [...prev];
            const marker = updated[tabIndex]?.markers.find(m => m.id === markerId);
            if (marker) {
                const w = Math.round(width);
                const h = Math.round(height);
                const widgetType = marker.style?.widgetType;
                if (widgetType === "card" || widgetType === "status") {
                    marker.style = { ...marker.style, cardWidth: w, cardHeight: h };
                } else if (widgetType === "linechart" || widgetType === "barchart" || widgetType === "areachart") {
                    marker.style = { ...marker.style, chartWidth: w, chartHeight: h };
                } else {
                    marker.style = { ...marker.style, width: w, height: h };
                }
            }
            return updated;
        });
    }, []);

    const upsertMarker = useCallback((tabIndex, marker, editingMarkerId) => {
        setScadaTabs(prev => {
            const updated = [...prev];
            if (editingMarkerId) {
                const idx = updated[tabIndex].markers.findIndex(m => m.id === editingMarkerId);
                if (idx !== -1) updated[tabIndex].markers[idx] = marker;
            } else {
                updated[tabIndex].markers.push(marker);
            }
            return updated;
        });
    }, []);

    const removeMarker = useCallback((tabIndex, markerId) => {
        setScadaTabs(prev => {
            const updated = [...prev];
            updated[tabIndex].markers = updated[tabIndex].markers.filter(m => m.id !== markerId);
            return updated;
        });
    }, []);

    return {
        userDetails,
        locationDetails,
        scadaTabs,
        deviceList,
        slaveIdList,
        selectList,
        combinedSensorOptions,
        loadCombinedSensorOptions,
        tableConfigs,
        liveSnapshot,
        liveSnapshotUpdatedAt,
        hyperlinks,
        fetchScadaData,
        fetchScadaNames,
        loadSlaveIds,
        loadSensors,
        uploadTabImage,
        addTab,
        deleteTab,
        updateTabImage,
        updateTabImagePath,
        clearTabImage,
        renameTab,
        updateMarkerPosition,
        updateMarkerSize,
        upsertMarker,
        removeMarker,
        saveTableConfig,
        deleteTableConfig,
        saveHyperlink,
        deleteHyperlink,
    };
};

export default useScadaData;
