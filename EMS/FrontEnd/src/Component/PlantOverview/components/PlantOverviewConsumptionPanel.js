import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, CircularProgress, IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ApplicationStore from "../../../utils/localStorageUtil";
import {
    GetDashboardTree,
    GetIoTLiveData,
    UtilityMeterView,
    GetUtilitySensorStats,
    GetTagLiveValue,
    GetMeterOptions,
    GetMeterCurrentHourValue,
    ShowPlantConsumptionConfig,
    SavePlantConsumptionConfig,
} from "../../../Services/NodeJsApiServices";
import ConsumptionTreeDialog from "./ConsumptionTreeDialog";
import MeterBindingDialog     from "./MeterBindingDialog";
import EnergyTreeDiagram      from "./EnergyTreeDiagram";

// Live "Energy consumption / Water consumption" summary for Plant Overview's
// home screen. Two layers, same idea as everywhere else in Plant Overview
// (auto by default, admin can override per-box):
//   1. Auto-detected from the already-implemented Energy Dashboard tree
//      (dashboard/tree + dashboard/liveData — EB/Incomer total, each Outgoing
//      distributor's own kWhDay, each of its feeders') and Utility Dashboard's
//      water meters (UtilityMeter + sensorStats). Zero config, but shows 0/—
//      if this plant's meters aren't tagged into that Incomer/Outgoing/
//      distributor/feeder schema.
//   2. An optional manual override per box (EB / a group / a feeder / a water
//      meter) — pick one or more meters via the pencil icon on that box
//      (MeterBindingDialog) and their current-hour consumption (summed if
//      more than one — see fetchOverrideValues) is shown instead. The box
//      structure itself (which groups/feeders/water
//      meters exist) is editable via the gear icon (ConsumptionTreeDialog) —
//      always in the EB → group → feeder shape, matching the wireframe.
//      Saved as one shared JSON blob (plant_consumption_config table) — see
//      Database/migration_plant_consumption_config.sql. No saved config yet
//      → panel is 100% the auto-detected view (today's behavior unchanged).
const callAsPromise = (fn, ...args) =>
    new Promise((resolve) => fn(...args, (res) => resolve(res), () => resolve(null)));

const HEADER_BG = "#4a1942"; // dark purple — matches the client wireframe's section header bars

const fmtNum = (v) => (v === null || v === undefined || isNaN(v) ? null : Number(v));
const norm   = (s) => (s || "").trim().toLowerCase();
const findByName = (name, list) => (list || []).find((x) => norm(x.name) === norm(name));

// title's own duplicate total pill on this header (it repeated the exact
// number already shown just below in the tree's root/EB box) was removed per
// request — the gear icon (still needed to open the structure editor) is now
// the header's only right-side element.
const SectionHeader = ({ title, onEdit }) => (
    <Box sx={{
        background: HEADER_BG, color: "#fff", px: 1.25, py: 0.5, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 0.5,
    }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.72rem" }}>{title}</Typography>
        {onEdit && (
            <Tooltip title="Configure boxes">
                <IconButton size="small" onClick={onEdit} sx={{ color: "#fff", p: 0.4 }}>
                    <SettingsIcon sx={{ fontSize: 14 }} />
                </IconButton>
            </Tooltip>
        )}
    </Box>
);

const DEFAULT_EB_LABEL = "EB (Incomer)";
const DEFAULT_DG_LABEL = "DG (Generator)";

const PlantOverviewConsumptionPanel = () => {
    const { userDetails } = ApplicationStore().getStorage("userDetails");

    const [loading, setLoading]         = useState(true);
    const [plantName, setPlantName]     = useState("");
    const [plantId, setPlantId]         = useState(null);
    const [hasPlant, setHasPlant]       = useState(true);

    // Auto-detected (layer 1)
    const [autoEb, setAutoEb]                     = useState(null);           // { energyToday }
    const [autoDistributors, setAutoDistributors] = useState([]);             // [{ id, name, kWhDay, feeders:[{id,name,kWhDay}] }]
    const [autoWaterMeters, setAutoWaterMeters]   = useState([]);             // [{ id, name, consumptionToday, unit }]

    // Manual override config (layer 2) — null until first saved
    const [config, setConfig]               = useState(null);
    const [overrideValues, setOverrideValues] = useState({}); // { [boxId]: {value, unit} }

    // Meter picker options — every ENERGY meter under this plant (id + display
    // name), for MeterBindingDialog's "Pick Meter(s)" Autocomplete on Energy
    // Consumption boxes specifically.
    const [meterOptions, setMeterOptions] = useState([]);
    // Same idea for Water Consumption boxes, but sourced from Utility Meter
    // Allocation (utility_meters, meterType='Water') — a completely different
    // table/id-space from the Energy `meters` table above, so Energy meters
    // never show up when picking a meter for a water box and vice versa.
    const [waterMeterOptions, setWaterMeterOptions] = useState([]);
    // Raw per-utility-meter stats ({ [utilityMeterId]: {consumptionToday,
    // unit} }, from GetUtilitySensorStats) kept in state (not just used
    // inline in fetchAuto) so fetchOverrideValues can sum an override's water
    // meters client-side without a dedicated backend endpoint — this is the
    // exact same data autoWaterMeters below is already built from.
    const [utilityStats, setUtilityStats] = useState({});

    // Dialog state
    const [treeDialogOpen, setTreeDialogOpen] = useState(false);
    const [meterDialogOpen, setMeterDialogOpen] = useState(false);
    const [editingBox, setEditingBox] = useState(null); // { boxId, label, existingOverride }

    // ── Auto-detected data (layer 1) ─────────────────────────────────────────
    const fetchAuto = useCallback(async () => {
        try {
            const rootRes = await callAsPromise(GetDashboardTree, { type: "root" });
            const plants  = rootRes?.data || [];
            if (!plants.length) { setHasPlant(false); setLoading(false); return; }

            // Single-plant convention already used by IoTDashboard.js.
            const plant = plants[0];
            setPlantName(plant.name || "");
            setPlantId(plant.id ?? null);

            const [plantRes, outgoingRes, meterListRes, statsRes] = await Promise.all([
                callAsPromise(GetIoTLiveData, { type: "plant", id: plant.id }),
                callAsPromise(GetIoTLiveData, { type: "category", id: plant.id, selectedCategory: "Outgoing" }),
                callAsPromise(UtilityMeterView),
                callAsPromise(GetUtilitySensorStats),
            ]);

            setAutoEb(plantRes?.data || null);

            const distRows = outgoingRes?.data?.children || [];
            const withFeeders = await Promise.all(distRows.map(async (d) => {
                const feederRes = await callAsPromise(GetIoTLiveData, { type: "distributor", id: d.id });
                return { ...d, feeders: feederRes?.data?.children || [] };
            }));
            setAutoDistributors(withFeeders);

            const allMeters = meterListRes?.data || [];
            const stats      = statsRes?.data || {};
            setUtilityStats(stats);
            const water = allMeters
                .filter((m) => m.meterType === "Water" && Number(m.plantId) === Number(plant.id))
                .map((m) => {
                    const s = stats[m.id] || {};
                    return { id: m.id, name: m.meterName, consumptionToday: fmtNum(s.consumptionToday), unit: s.unit || "L" };
                });
            setAutoWaterMeters(water);
            setWaterMeterOptions(water.map((w) => ({ id: w.id, name: w.name })));
        } catch (err) {
            console.error("Plant Overview consumption panel fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Manual override config (layer 2) ─────────────────────────────────────
    // A box's override is a list of meters (MeterBindingDialog's "+ Add" list,
    // one box can be a group of several physical meters summed together) —
    // each entry is ONE of:
    //   - {meterId,name}        — an ENERGY meter (the Energy Dashboard's own
    //                             `meters` table), resolved to current-hour
    //                             kWh from the monthly energy_data_YYYY_MM
    //                             table (GetMeterCurrentHourValue).
    //   - {utilityMeterId,name} — a WATER/utility meter (utility_meters,
    //                             meterType='Water' — a completely different
    //                             table/id-space), resolved from utilityStats
    //                             (GetUtilitySensorStats, already fetched by
    //                             fetchAuto) client-side — no extra API call.
    //   - {deviceId,slaveId,tagKey} — an older Device+Slave+Sensor override
    //                             saved before the meter picker existed,
    //                             resolved via the instantaneous live-tag
    //                             value as before.
    // Every entry in a box's list — regardless of kind — is summed together
    // into that one box's number, so e.g. an Energy box can't accidentally
    // pull in a water meter's number and vice versa, but a box CAN mix an old
    // legacy sensor override with new meter picks during the transition.
    const fetchOverrideValues = useCallback(async (cfg) => {
        if (!cfg) { setOverrideValues({}); return; }
        const targets = []; // { boxId, meters: [...] }
        const collect = (boxId, override) => {
            if (!override) return;
            const meters = Array.isArray(override) ? override : [override];
            if (meters.length) targets.push({ boxId, meters });
        };
        collect("eb", cfg.eb?.override);
        collect("dg", cfg.dg?.override);
        (cfg.groups || []).forEach((g) => {
            collect(g.id, g.override);
            (g.feeders || []).forEach((f) => collect(f.id, f.override));
        });
        (cfg.water || []).forEach((wg) => {
            collect(wg.id, wg.override);
            (wg.feeders || []).forEach((item) => collect(item.id, item.override));
        });
        if (!targets.length) { setOverrideValues({}); return; }

        const results = await Promise.all(targets.map(async ({ boxId, meters }) => {
            const meterIds        = meters.filter((m) => m.meterId !== undefined).map((m) => m.meterId);
            const utilityMeterIds  = meters.filter((m) => m.utilityMeterId !== undefined).map((m) => m.utilityMeterId);
            const legacy           = meters.filter((m) => m.meterId === undefined && m.utilityMeterId === undefined);

            const [meterSumRes, legacyResults] = await Promise.all([
                meterIds.length ? callAsPromise(GetMeterCurrentHourValue, { meterIds }) : Promise.resolve(null),
                Promise.all(legacy.map((m) =>
                    callAsPromise(GetTagLiveValue, { deviceId: m.deviceId, slaveId: m.slaveId, tagId: m.tagKey })
                )),
            ]);

            // Water meters are summed straight out of the already-fetched
            // utilityStats map (today's consumption per utilityMeterId) —
            // no round trip needed.
            const waterUnit = utilityMeterIds
                .map((id) => utilityStats[id]?.unit).find(Boolean) || "";
            const waterSum = utilityMeterIds.length
                ? utilityMeterIds.reduce((s, id) => s + (fmtNum(utilityStats[id]?.consumptionToday) || 0), 0)
                : undefined;

            const values = [
                meterIds.length ? (meterSumRes?.data ? fmtNum(meterSumRes.data.value) : null) : undefined,
                waterSum,
                ...legacyResults.map((res) => (res?.data ? fmtNum(res.data.value) : null)),
            ].filter((v) => v !== undefined);
            const unit = meterSumRes?.data?.unit || waterUnit || legacyResults.find((res) => res?.data?.unit)?.data?.unit || "";
            const hasAny = values.some((v) => v !== null);
            const sum = hasAny ? values.reduce((s, v) => s + (v || 0), 0) : null;
            return [boxId, { value: sum, unit }];
        }));
        setOverrideValues(Object.fromEntries(results));
    }, [utilityStats]);

    // Water has the same fixed 2-level group→item shape as Energy. Unlike
    // Incomer/Outgoing there's no such grouping anywhere in the schema
    // (confirmed earlier — water meters are flat, untagged) to auto-derive it
    // from, so the default is hardcoded to the client wireframe's exact
    // labels — "Good water" (Facility/RO) and "Waste water (STP)" (Inlet/
    // Outlet) — so the panel matches the wireframe out of the box. These
    // labels won't auto-match a real meter name (the real meters are named
    // things like "FACILITY"/"RO Water"/"STP IN"/"STP OUT"), so each item
    // still needs its pencil-icon meter picked once — same as any other box.
    const defaultWaterGroups = useCallback(() => [
        {
            id: "water_good", name: "Good water", override: null,
            feeders: [
                { id: "water_good_facility", name: "Facility", override: null },
                { id: "water_good_ro",       name: "RO",       override: null },
            ],
        },
        {
            id: "water_waste", name: "Waste water (STP)", override: null,
            feeders: [
                { id: "water_waste_inlet",  name: "Inlet",  override: null },
                { id: "water_waste_outlet", name: "Outlet", override: null },
            ],
        },
    ], []);

    // A config saved before the water side had groups stores `water` as a
    // flat [{id,name,override}] list (no `.feeders`) — rendering that under
    // the new group→item shape shows each old flat entry as an empty group
    // ("STP IN" / "FACILITY" / ... each with "No items configured"), which is
    // why the hardcoded Good/Waste defaults above never appeared once
    // anything had ever been saved. `waterV2` marks a config whose `water` is
    // already in the new shape; anything else gets migrated to the hardcoded
    // defaults (nothing is lost — those flat entries never had a live value
    // bound to them anyway) and persisted so it doesn't need to migrate again.
    const migrateConfig = useCallback((cfg) => {
        if (!cfg || cfg.waterV2) return cfg;
        return { ...cfg, water: defaultWaterGroups(), waterV2: true };
    }, [defaultWaterGroups]);

    const fetchConfig = useCallback(async () => {
        const res = await callAsPromise(ShowPlantConsumptionConfig);
        const loaded = res?.data || null;
        const migrated = migrateConfig(loaded);
        if (migrated && migrated !== loaded) {
            SavePlantConsumptionConfig({ userId: userDetails?.id, config: migrated }, () => {}, () => {});
        }
        setConfig(migrated);
        fetchOverrideValues(migrated);
    }, [fetchOverrideValues, migrateConfig, userDetails?.id]);

    useEffect(() => {
        fetchAuto();
        fetchConfig();
        const id = setInterval(() => { fetchAuto(); fetchConfig(); }, 60000); // live refresh
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Meter picker options load once the plant is known (fetchAuto resolves it).
    useEffect(() => {
        if (!plantId) return;
        GetMeterOptions({ plantId }, (res) => setMeterOptions(res?.data || []), () => {});
    }, [plantId]);

    // Seeds a config from the current auto-detected structure — used the first
    // time the user edits anything, so they start from what's already showing
    // instead of a blank slate.
    const seedConfig = useCallback(() => ({
        eb: { label: DEFAULT_EB_LABEL, override: null },
        dg: { label: DEFAULT_DG_LABEL, override: null },
        groups: autoDistributors.map((d) => ({
            id: String(d.id), name: d.name, override: null,
            feeders: (d.feeders || []).map((f) => ({ id: String(f.id), name: f.name, override: null })),
        })),
        water: defaultWaterGroups(),
        waterV2: true,
    }), [autoDistributors, defaultWaterGroups]);

    const persistConfig = useCallback((newConfig) => {
        setConfig(newConfig);
        fetchOverrideValues(newConfig);
        SavePlantConsumptionConfig({ userId: userDetails?.id, config: newConfig }, () => {}, () => {});
    }, [fetchOverrideValues, userDetails?.id]);

    // ── Structure editor (gear icon) ─────────────────────────────────────────
    const openTreeDialog = () => setTreeDialogOpen(true);
    const handleTreeSave = ({ ebLabel, dgLabel, groups, water }) => {
        const base = config || seedConfig();
        persistConfig({
            eb: { ...base.eb, label: ebLabel },
            dg: { override: null, ...base.dg, label: dgLabel },
            groups, water,
            waterV2: true,
        });
        setTreeDialogOpen(false);
    };

    // ── Per-box meter picker (pencil icon) ───────────────────────────────────
    // kind picks which meter list MeterBindingDialog searches — "energy"
    // (the Energy Dashboard's `meters` table) for EB/DG/group/feeder boxes,
    // "water" (utility_meters, meterType='Water') for water group/item boxes
    // — so an energy meter can never be picked for a water box or vice versa.
    const openMeterDialog = (boxId, label, existingOverride, kind = "energy") => {
        setEditingBox({ boxId, label, existingOverride: existingOverride || null, kind });
        setMeterDialogOpen(true);
    };
    const closeMeterDialog = () => { setMeterDialogOpen(false); setEditingBox(null); };

    const applyOverride = (boxId, override) => {
        const base = config || seedConfig();
        const next = {
            eb: { ...base.eb },
            dg: { ...(base.dg || { label: DEFAULT_DG_LABEL, override: null }) },
            groups: base.groups.map((g) => ({
                ...g,
                override: g.id === boxId ? override : g.override,
                feeders: g.feeders.map((f) => ({ ...f, override: f.id === boxId ? override : f.override })),
            })),
            water: base.water.map((wg) => ({
                ...wg,
                override: wg.id === boxId ? override : wg.override,
                feeders: (wg.feeders || []).map((item) => ({ ...item, override: item.id === boxId ? override : item.override })),
            })),
            waterV2: true,
        };
        if (boxId === "eb") next.eb.override = override;
        if (boxId === "dg") next.dg.override = override;
        persistConfig(next);
    };

    const handleMeterSave = (override) => { applyOverride(editingBox.boxId, override); closeMeterDialog(); };
    const handleMeterClear = () => { applyOverride(editingBox.boxId, null); closeMeterDialog(); };

    if (!hasPlant) return null; // no plant configured yet — nothing to show

    // ── Merge layer 1 (auto) + layer 2 (override) into what actually renders ──
    const ebLabel = config?.eb?.label || DEFAULT_EB_LABEL;
    const ebOverride = config?.eb?.override || null;
    const ebValue = ebOverride ? overrideValues.eb?.value ?? null : fmtNum(autoEb?.energyToday);
    const ebUnit  = ebOverride ? (overrideValues.eb?.unit || "") : "kWh";

    // DG (Generator) — independent power source, no auto-detection source
    // exists for it anywhere in the Energy Dashboard tree, so it's override-only.
    const dgLabel = config?.dg?.label || DEFAULT_DG_LABEL;
    const dgOverride = config?.dg?.override || null;
    const dgValue = dgOverride ? overrideValues.dg?.value ?? null : null;
    const dgUnit  = dgOverride ? (overrideValues.dg?.unit || "") : "";

    const groupsSource = config ? config.groups : autoDistributors.map((d) => ({
        id: String(d.id), name: d.name, override: null,
        feeders: (d.feeders || []).map((f) => ({ id: String(f.id), name: f.name, override: null })),
    }));
    const renderGroups = groupsSource.map((g) => {
        const autoMatch = findByName(g.name, autoDistributors);
        const value = g.override ? (overrideValues[g.id]?.value ?? null) : fmtNum(autoMatch?.kWhDay);
        const unit  = g.override ? (overrideValues[g.id]?.unit || "") : "kWh";
        const feeders = g.feeders.map((f) => {
            const autoFeeder = findByName(f.name, autoMatch?.feeders || []);
            const fValue = f.override ? (overrideValues[f.id]?.value ?? null) : fmtNum(autoFeeder?.kWhDay);
            const fUnit  = f.override ? (overrideValues[f.id]?.unit || "") : "kWh";
            return { ...f, value: fValue, unit: fUnit };
        });
        return { ...g, value, unit, feeders };
    });

    // Water — same fixed 2-level group→item shape as Energy (e.g. "Good water"
    // → Facility/RO, "Waste water (STP)" → Inlet/Outlet). A group's own value
    // is its override if set, else the sum of its items (there's no dashboard-
    // tree equivalent to auto-aggregate a water group the way a distributor's
    // kWhDay is already summed for us).
    const waterGroupsSource = config ? config.water : defaultWaterGroups();
    const renderWaterGroups = waterGroupsSource.map((wg) => {
        const items = (wg.feeders || []).map((item) => {
            const autoMatch = findByName(item.name, autoWaterMeters);
            const value = item.override ? (overrideValues[item.id]?.value ?? null) : fmtNum(autoMatch?.consumptionToday);
            const unit  = item.override ? (overrideValues[item.id]?.unit || "") : (autoMatch?.unit || "L");
            return { ...item, value, unit };
        });
        const itemsTotal = items.some((i) => i.value !== null)
            ? items.reduce((sum, i) => sum + (i.value || 0), 0) : null;
        const value = wg.override ? (overrideValues[wg.id]?.value ?? null) : itemsTotal;
        const unit  = wg.override ? (overrideValues[wg.id]?.unit || "") : (items.find((i) => i.unit)?.unit || "L");
        return { ...wg, value, unit, feeders: items };
    });
    const waterTotal = renderWaterGroups.length && renderWaterGroups.some((g) => g.value !== null)
        ? renderWaterGroups.reduce((sum, g) => sum + (g.value || 0), 0)
        : null;

    return (
        <Box sx={{ p: 0.75, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {loading && !autoEb && !autoDistributors.length && !config ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", py: 1 }}>
                    <CircularProgress size={14} /> <Typography variant="caption">Loading live consumption…</Typography>
                </Box>
            ) : (
                // Side-by-side columns — same screen-partition layout as the client wireframe.
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1, alignItems: "stretch" }}>
                    {/* ── ENERGY CONSUMPTION ─────────────────────────────────────── */}
                    <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden", flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                        {/* Plain "Energy Consumption" title — the plant-name suffix was
                            dropped per request, to match Water Consumption's title
                            (which never had one) instead of being inconsistent. */}
                        <SectionHeader
                            title="Energy Consumption"
                            onEdit={openTreeDialog}
                        />
                        {/* display:flex + justifyContent/alignItems:center here (rather than
                            relying solely on EnergyTreeDiagram's own internal centering) keeps
                            the whole tree-diagram block centered as one unit — both
                            horizontally and top-to-bottom — inside this box, regardless of how
                            wide/tall the box itself ends up — plus a bit more padding so the
                            content isn't crowded against the panel edges. */}
                        <Box sx={{ p: 1.5, flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <EnergyTreeDiagram
                                rootLabel={ebLabel} rootValue={ebValue} rootUnit={ebUnit} rootOverride={ebOverride}
                                onEditRoot={() => openMeterDialog("eb", ebLabel, ebOverride, "energy")}
                                dgLabel={dgLabel} dgValue={dgValue} dgUnit={dgUnit} dgOverride={dgOverride}
                                groups={renderGroups}
                                onEditNode={(boxId, label, override) => openMeterDialog(boxId, label, override, "energy")}
                                onEditDg={() => openMeterDialog("dg", dgLabel, dgOverride, "energy")}
                                emptyMessage="No Outgoing distributors (e.g. IDG/ISG) configured yet — use the gear icon to add one."
                            />
                        </Box>
                    </Paper>

                    {/* ── WATER CONSUMPTION ──────────────────────────────────────── */}
                    <Paper elevation={2} sx={{ borderRadius: 1.5, overflow: "hidden", flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                        <SectionHeader
                            title="Water Consumption"
                            onEdit={openTreeDialog}
                        />
                        {/* Same nested-box layout as Energy — Good water / Waste water
                            (STP) → their items. No root "Water Consumption" box here
                            anymore (it just repeated the panel title above it with the
                            same total, removed as a duplicate) and no DG-style side box
                            either (water has no independent source). */}
                        {/* Same explicit horizontal + vertical centering and extra padding
                            as the Energy panel above. */}
                        <Box sx={{ p: 1.5, flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <EnergyTreeDiagram
                                groups={renderWaterGroups}
                                onEditNode={(boxId, label, override) => openMeterDialog(boxId, label, override, "water")}
                                emptyMessage="No water groups (e.g. Good water / Waste water) configured yet — use the gear icon to add one."
                            />
                        </Box>
                    </Paper>
                </Box>
            )}

            <ConsumptionTreeDialog
                open={treeDialogOpen}
                onClose={() => setTreeDialogOpen(false)}
                ebLabel={config?.eb?.label || (config ? DEFAULT_EB_LABEL : ebLabel)}
                dgLabel={config?.dg?.label || (config ? DEFAULT_DG_LABEL : dgLabel)}
                groups={config ? config.groups : seedConfig().groups}
                water={config ? config.water : seedConfig().water}
                onSave={handleTreeSave}
            />

            <MeterBindingDialog
                open={meterDialogOpen}
                onClose={closeMeterDialog}
                boxLabel={editingBox?.label || ""}
                existingOverride={editingBox?.existingOverride}
                kind={editingBox?.kind || "energy"}
                meterOptions={editingBox?.kind === "water" ? waterMeterOptions : meterOptions}
                onSave={handleMeterSave}
                onClear={handleMeterClear}
            />
        </Box>
    );
};

export default PlantOverviewConsumptionPanel;
