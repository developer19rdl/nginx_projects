import React from "react";
import {
    Table, TableHead, TableBody, TableRow, TableCell, Paper, Box, Typography, IconButton, Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LinkIcon from "@mui/icons-material/Link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { computeActiveColor, computeDisplayVal, isAlarmCritical, isMarkerStale, formatLastSeen } from "../utils/markerUtils";
import { normalizeCellBinding } from "../utils/cellBindingUtils";
import useCyclingSensor, { useGlobalCycleTick } from "../hooks/useCyclingSensor";

// A cell binding is "navigable" once a target screen has been picked in
// CellBindingDialog — independent of whether a sensor is also bound, so a
// cell can be a pure click-through link, a plain live value, or both at once.
const hasNavTarget = (binding) =>
    !!binding && binding.navigateTargetTabIndex !== null && binding.navigateTargetTabIndex !== undefined;

// Matches PlantOverviewConsumptionPanel's HEADER_BG (#4a1942, the same dark
// purple as the "Energy Consumption" / "Water Consumption" section bars
// below the table) instead of an unrelated navy blue, so the whole page
// reads as one consistent color scheme rather than two different ones.
const hdrCell = {
    background: "linear-gradient(180deg, #5c1f52 0%, #3a1433 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.8rem",
    letterSpacing: "0.03em",
    textAlign: "center",
    border: "1px solid #6b2560",
    padding: "10px 10px",
    whiteSpace: "nowrap",
};

const subHdrCell = {
    background: "linear-gradient(180deg, #7a2f6d 0%, #5c2350 100%)",
    color: "#f6e9f3",
    fontWeight: 600,
    fontSize: "0.75rem",
    textAlign: "center",
    border: "1px solid #4a1942",
    borderBottom: "3px solid #ffd54f",
    padding: "7px 8px",
};

const dataCell = {
    border: "1px solid #e3e8ee",
    padding: "7px 8px",
    minWidth: 80,
    textAlign: "center",
    verticalAlign: "middle",
};

// A column group whose label combines several sensor types with "|" (e.g.
// "Temperature | Humidity | Air quality") renders as one uniform white
// header, matching every other column instead of a different random hue per
// word — a mixed rainbow of colors read as messy/inconsistent rather than
// professional.
//
// `activeIndex` (only passed for a column that actually hosts a multi-sensor
// Cycling Badge) brightens whichever ONE word matches what those badges are
// showing RIGHT NOW, in a single consistent accent color, and dims the rest
// — driven by the same shared tick every Cycling Badge reads (see
// useGlobalCycleTick), so the header word lights up in lockstep with the
// badges below it without turning the header into a rainbow. null/undefined
// activeIndex (a column with no cycling content) leaves every word at full,
// equal, plain-white brightness.
const ACTIVE_SEGMENT_COLOR = "#ffd54f"; // warm amber — reads clearly as "the active one" against the navy header, without competing with any sensor's own threshold colors below
const GroupHeaderLabel = ({ label, activeIndex = null }) => {
    const parts = String(label || "").split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return label;
    return parts.map((part, i) => {
        const isActive = activeIndex === i;
        const isDimmed = activeIndex !== null && !isActive;
        return (
            <React.Fragment key={i}>
                {i > 0 && <span style={{ opacity: 0.45, margin: "0 6px", fontWeight: 400 }}>|</span>}
                <span style={{
                    color: isActive ? ACTIVE_SEGMENT_COLOR : "#fff",
                    opacity: isDimmed ? 0.5 : 1,
                    fontWeight: isActive ? 800 : 700,
                    textShadow: isActive ? "0 0 8px rgba(255,213,79,0.7)" : "none",
                    transition: "opacity 300ms ease, color 300ms ease, text-shadow 300ms ease",
                }}>
                    {part}
                </span>
            </React.Fragment>
        );
    });
};

// One round badge that rotates through several sensors' live values in place
// — the table-cell counterpart of CyclingBadgeWidget on the floor image, used
// when several sensors need to share a single cell (e.g. "SVR Room" showing
// Temperature, then Humidity, then CO2, all in the order they were picked in
// the Analytics tab) instead of one static badge per sensor. Combined markers
// carry no single lastUpdated to check staleness against (same reasoning as
// ScadaMarker.js), so it never shows OFFLINE.
const MarkerCyclingBadge = ({ marker, liveData }) => {
    const style = marker.style || {};
    const sensors = style.combinedSensors || [];
    const { current, visible } = useCyclingSensor(sensors);

    const rawVal = current ? liveData?.[current.tagId] : undefined;
    const numericVal = parseFloat(rawVal);
    const displayVal = computeDisplayVal(rawVal, numericVal, style.decimalPoints);
    const color = style.textColor || "#1a3a5c";
    const label = current?.tagName || marker.label;

    return (
        <Box sx={{
            display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: "50%",
            background: style.bgColor ? `${style.bgColor}dd` : "#f0f4f8",
            border: `1px solid ${color}60`,
            flexShrink: 0,
        }}>
            <Box sx={{ opacity: visible ? 1 : 0, transition: "opacity 220ms ease", display: "flex", flexDirection: "column", alignItems: "center", px: 0.5, maxWidth: "100%" }}>
                <Typography noWrap sx={{ color, fontSize: "0.6rem", fontWeight: 600, lineHeight: 1.2, opacity: 0.8, maxWidth: "100%" }}>
                    {label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <Typography sx={{ color, fontSize: "0.78rem", fontWeight: "bold", lineHeight: 1.3 }}>
                        {displayVal}
                    </Typography>
                    {marker.unit && (
                        <Typography sx={{ color, fontSize: "0.6rem", fontWeight: 600, opacity: 0.75 }}>
                            {marker.unit}
                        </Typography>
                    )}
                </Box>
            </Box>
            {sensors.length > 1 && (
                <Box sx={{ display: "flex", gap: "2px", mt: 0.2 }}>
                    {sensors.map((s, i) => (
                        <Box key={s.tagId || i} sx={{ width: 3, height: 3, borderRadius: "50%", background: s === current ? color : `${color}40` }} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

// Compact display for a marker mapped to this cell. A marker set to
// "Cycling Badge" (Analytics tab, combined mode) carries several sensors
// with no single tagKey — it renders as one rotating badge instead of the
// normal single-value chip below.
const MarkerCell = ({ marker, liveData, thresholdMinutes }) => {
    const style = marker.style || {};
    if (style.chartMode === "combined" && style.widgetType === "cyclebadge") {
        return <MarkerCyclingBadge marker={marker} liveData={liveData} />;
    }

    const val        = liveData?.[marker.tagKey] !== undefined ? liveData[marker.tagKey] : marker.sensorValue;
    const numericVal = parseFloat(val) || 0;
    const isCritical = isAlarmCritical(style.widgetType, numericVal, style.threshold2);
    const activeColor = computeActiveColor(style, numericVal);
    const displayVal  = computeDisplayVal(val, numericVal, style.decimalPoints);
    const color       = isCritical ? "#f44336" : (activeColor || style.textColor || "#1a3a5c");
    const isStale     = isMarkerStale(marker.lastUpdated, thresholdMinutes);

    return (
        <Box
            title={isStale ? formatLastSeen(marker.lastUpdated) : undefined}
            sx={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                background: style.bgColor ? `${style.bgColor}dd` : "#f0f4f8",
                border: `1px solid ${color}60`,
                borderRadius: "6px",
                px: 1, py: 0.5,
                minWidth: 60,
                boxShadow: isCritical && !isStale ? `0 0 8px ${color}80` : "none",
                animation: isCritical && !isStale ? "alarmPulse 1.5s infinite" : "none",
                ...(isStale ? { filter: "grayscale(0.85)", opacity: 0.55 } : {}),
            }}>
            <Typography sx={{ color, fontSize: "0.7rem", fontWeight: 600, lineHeight: 1.2, opacity: 0.8 }}>
                {marker.label}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <Typography sx={{ color: isStale ? "#ef4444" : color, fontSize: "0.85rem", fontWeight: "bold", lineHeight: 1.3 }}>
                    {isStale ? "OFFLINE" : displayVal}
                </Typography>
                {!isStale && marker.unit && (
                    <Typography sx={{ color, fontSize: "0.65rem", fontWeight: 600, opacity: 0.75 }}>
                        {marker.unit}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

// Resolve threshold color for a bound-cell value
const getCellColor = (binding, numericVal) => {
    const t1 = binding.threshold1 ?? 20;
    const t2 = binding.threshold2 ?? 60;
    if (isNaN(numericVal)) return null;
    if (numericVal <= t1) return binding.color1 || "#4caf50";
    if (numericVal <= t2) return binding.color2 || "#ffeb3b";
    return binding.color3 || "#f44336";
};

// Small corner badge marking a cell as click-navigable — shown on both the
// sensor-bound render below and the nav-only chip (NavOnlyCell), so the two
// look consistent regardless of whether a sensor happens to be bound too.
const NavBadge = () => (
    <LinkIcon sx={{
        position: "absolute", top: -6, right: -6, fontSize: 13,
        background: "#1a3a5c", color: "#fff", borderRadius: "50%", p: "2px",
        boxSizing: "content-box", boxShadow: "0 0 0 1px #fff",
    }} />
);

// Display for a directly-bound sensor — Standard Card or Status Indicator.
// `navigable` just controls the corner badge; the click handler itself lives
// on the parent TableCell so the whole cell — value, label, padding — is one
// click target, not just this inner box.
const CellBoundValue = ({ binding, liveData, thresholdMinutes, liveSnapshotUpdatedAt, navigable }) => {
    const rawVal     = liveData?.[binding.tagKey];
    const val        = rawVal !== undefined ? rawVal : "--";
    const numericVal = parseFloat(val);
    const threshColor = getCellColor(binding, numericVal);
    const isStale     = isMarkerStale(liveSnapshotUpdatedAt?.[binding.tagKey], thresholdMinutes);
    const lastSeenTitle = isStale ? formatLastSeen(liveSnapshotUpdatedAt?.[binding.tagKey]) : undefined;

    // ── Status Indicator: colored circle ──────────────────────────────────
    if (binding.widgetType === "status") {
        const dotColor = isStale ? "#9e9e9e" : (threshColor || "#9e9e9e");
        return (
            <Box title={lastSeenTitle} sx={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0.3, py: 0.25 }}>
                {navigable && <NavBadge />}
                <Box sx={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: dotColor,
                    boxShadow: isStale ? "none" : `0 0 7px ${dotColor}cc`,
                    border: `2px solid ${dotColor}44`,
                }} />
                {binding.label && (
                    <Typography sx={{ fontSize: "0.6rem", color: "#555", lineHeight: 1, textAlign: "center" }}>
                        {binding.label}
                    </Typography>
                )}
            </Box>
        );
    }

    // ── Standard Card: value + label ─────────────────────────────────────
    const textColor  = isStale ? "#ef4444" : (threshColor || binding.textColor || "#1a3a5c");
    const bgColor    = binding.bgColor || "#e8f5e9";
    const decimals   = binding.decimalPoints ?? 2;
    const displayVal = !isNaN(numericVal) && String(val).includes(".")
        ? numericVal.toFixed(decimals) : String(val);

    return (
        <Box
            title={lastSeenTitle}
            sx={{
                position: "relative",
                display: "inline-flex", flexDirection: "column", alignItems: "center",
                background: bgColor,
                border: `1px solid ${textColor}40`,
                borderRadius: "6px",
                px: 1, py: 0.5, minWidth: 60,
                ...(isStale ? { filter: "grayscale(0.85)", opacity: 0.55 } : {}),
            }}>
            {navigable && <NavBadge />}
            {binding.label && (
                <Typography sx={{ color: textColor, fontSize: "0.7rem", fontWeight: 600, lineHeight: 1.2, opacity: 0.85 }}>
                    {binding.label}
                </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <Typography sx={{ color: textColor, fontSize: "0.85rem", fontWeight: "bold", lineHeight: 1.3 }}>
                    {isStale ? "OFFLINE" : displayVal}
                </Typography>
                {!isStale && binding.unit && (
                    <Typography sx={{ color: textColor, fontSize: "0.65rem", fontWeight: 600, opacity: 0.75 }}>
                        {binding.unit}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

// Table-cell counterpart of MarkerCyclingBadge, for a DIRECT cell binding
// (via the pencil-icon "Configure Cell" dialog, Widget Type = "Cycling
// Badge") rather than an image marker mapped into the cell — same rotation
// behavior, sourced from the binding's own combinedSensors list. The circle
// itself holds only value + unit (inline, one line); this widget's own name
// (its Display Label) sits BELOW/outside the circle as a fixed caption that
// never changes as it rotates through sensors — it names the badge, not
// whichever sensor happens to be showing. Colors like Standard Card: the
// circle's own Bg Color stays fixed (whatever the user picked) and only the
// VALUE TEXT switches to the threshold color, falling back to the
// user-defined Text Color when the value is outside every threshold.
const CellCyclingBadge = ({ binding, liveData, thresholdMinutes, liveSnapshotUpdatedAt, navigable }) => {
    const sensors = binding.combinedSensors || [];
    const { current, visible } = useCyclingSensor(sensors);

    const rawVal      = current ? liveData?.[current.tagId] : undefined;
    const numericVal  = parseFloat(rawVal);
    const displayVal  = computeDisplayVal(rawVal, numericVal, binding.decimalPoints ?? 2);
    const threshColor = getCellColor(binding, numericVal);
    const isStale     = isMarkerStale(current ? liveSnapshotUpdatedAt?.[current.tagId] : undefined, thresholdMinutes);
    const textColor   = isStale ? "#ef4444" : (threshColor || binding.textColor || "#1a3a5c");
    const bgColor     = binding.bgColor || "#e8f5e9";
    // Unit still varies per sensor (set per-entry in "+ Add Sensor", falling
    // back to the cell-level unit) as the badge rotates — no longer shown in
    // the circle itself (per request: too cramped/cluttered at this size),
    // kept available for the hover tooltip instead.
    const unit = current?.unit || binding.unit;
    const widgetLabel = binding.label;
    const tooltipTitle = isStale
        ? formatLastSeen(liveSnapshotUpdatedAt?.[current?.tagId])
        : (unit ? `${current?.tagName || widgetLabel || ""} (${unit})`.trim() : undefined);

    return (
        <Box sx={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0.2 }}>
            <Box
                title={tooltipTitle}
                sx={{
                    position: "relative",
                    display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    width: 40, height: 40, borderRadius: "50%",
                    background: bgColor,
                    border: `2px solid ${textColor}`,
                    ...(isStale ? { filter: "grayscale(0.85)", opacity: 0.55 } : {}),
                }}>
                {navigable && <NavBadge />}
                {/* Value only — unit is left off the circle itself (was
                    cramped/overflowing at this size, e.g. "PPM"); still
                    available on hover via the title tooltip above. */}
                <Box sx={{ opacity: visible ? 1 : 0, transition: "opacity 220ms ease", display: "flex", flexDirection: "column", alignItems: "center", px: 0.25, maxWidth: "100%", lineHeight: 1 }}>
                    <Typography noWrap sx={{ color: textColor, fontSize: isStale ? "0.42rem" : "0.72rem", fontWeight: "bold", lineHeight: 1.1, maxWidth: 34 }}>
                        {isStale ? "OFF" : displayVal}
                    </Typography>
                </Box>
            </Box>
            {widgetLabel && (
                <Typography noWrap sx={{ color: binding.textColor || "#1a3a5c", fontSize: "0.55rem", fontWeight: 600, opacity: 0.8, maxWidth: 50 }}>
                    {widgetLabel}
                </Typography>
            )}
        </Box>
    );
};

// Table-cell counterpart of CellCyclingBadge, for a DIRECT cell binding with
// Widget Type = "Multiple Cards" — every sensor in the binding's
// combinedSensors list renders as its own small circular badge (same shape
// as Cycling Badge, value + unit on top and its label below), all shown
// together at once instead of rotating, so several readings can share one
// cell. Each circle holds only its value + unit (inline, one line); that
// sensor's own name (its Sensor Label, or the raw tag name if none was set)
// sits BELOW/outside its circle as a caption — shown even while stale, since
// it's what tells you WHICH circle went offline.
const CellMultiCard = ({ binding, liveData, thresholdMinutes, liveSnapshotUpdatedAt, navigable }) => {
    const sensors = binding.combinedSensors || [];
    const decimals = binding.decimalPoints ?? 2;
    const labelColor = binding.textColor || "#1a3a5c";

    return (
        <Box sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 0.4, justifyContent: "center" }}>
            {navigable && <NavBadge />}
            {sensors.map((s, i) => {
                const rawVal      = liveData?.[s.tagId];
                const numericVal  = parseFloat(rawVal);
                const threshColor = getCellColor(binding, numericVal);
                const isStale     = isMarkerStale(liveSnapshotUpdatedAt?.[s.tagId], thresholdMinutes);
                const textColor   = isStale ? "#ef4444" : (threshColor || binding.textColor || "#1a3a5c");
                const bgColor     = binding.bgColor || "#e8f5e9";
                const displayVal  = computeDisplayVal(rawVal, numericVal, decimals);
                // Each sensor's own label/unit (set per-entry in "+ Add Sensor") wins;
                // falling back to its raw tag name, then the cell-level unit set in
                // Display Settings, keeps older saved bindings looking the same.
                const cardLabel = s.label || s.tagName;
                // Unit is no longer shown in the circle itself (too cramped at this
                // size, e.g. "PPM") — kept available on hover via the title tooltip.
                const cardUnit  = s.unit || binding.unit;
                const tooltipTitle = isStale
                    ? formatLastSeen(liveSnapshotUpdatedAt?.[s.tagId])
                    : (cardUnit ? `${cardLabel || ""} (${cardUnit})`.trim() : undefined);

                return (
                    <Box key={s.tagId || i} sx={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0.2 }}>
                        <Box
                            title={tooltipTitle}
                            sx={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 40, height: 40, borderRadius: "50%",
                                background: bgColor,
                                border: `2px solid ${textColor}`,
                                ...(isStale ? { filter: "grayscale(0.85)", opacity: 0.55 } : {}),
                            }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", px: 0.25, maxWidth: "100%", lineHeight: 1 }}>
                                <Typography noWrap sx={{ color: textColor, fontSize: isStale ? "0.42rem" : "0.72rem", fontWeight: "bold", lineHeight: 1.1, maxWidth: 34 }}>
                                    {isStale ? "OFF" : displayVal}
                                </Typography>
                            </Box>
                        </Box>
                        {cardLabel && (
                            <Typography noWrap sx={{ color: labelColor, fontSize: "0.55rem", fontWeight: 600, opacity: 0.8, maxWidth: 50 }}>
                                {cardLabel}
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

// A binding with a navigate-target but no sensor tag — a pure click-through
// link cell. Uses the same bgColor/textColor fields as the Standard Card so
// "cell color" configuration behaves identically whether or not a sensor is
// also bound.
const NavOnlyCell = ({ binding }) => {
    const textColor = binding.textColor || "#1a3a5c";
    const bgColor   = binding.bgColor || "#e8f5e9";
    return (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            background: bgColor,
            border: `1px solid ${textColor}40`,
            borderRadius: "6px",
            px: 1.25, py: 0.5,
        }}>
            <Typography sx={{ color: textColor, fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.3 }}>
                {binding.label || "Go to screen"}
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 14, color: textColor }} />
        </Box>
    );
};

const ScadaDynamicTable = ({
    config, markers = [], liveData = {}, thresholdMinutes, liveSnapshotUpdatedAt,
    onCellEdit, onRowEdit, scadaTabs = [], onNavigateTab,
    // When true, the table stretches to fill its container's full height and
    // native <table> row-height distribution spreads any extra space evenly
    // across the data rows, instead of the table sitting at its natural
    // (content-sized) height with blank space left below it. Off by default
    // so the SCADA Dashboard's table keeps its current compact look —
    // Plant Overview's home screen (which now has more height to work with
    // after its own layout fix) opts in via ScadaTabPanel's tableFillHeight.
    fillHeight = false,
}) => {
    // Hooks must run unconditionally before the early-return below — this is
    // the same shared, wall-clock-derived tick every Cycling Badge on the
    // page reads (see useCyclingSensor.js), reused here purely to know which
    // header word to brighten; it doesn't drive any badge itself.
    const globalTick = useGlobalCycleTick();

    if (!config || !config.rows?.length || !config.columnGroups?.length) return null;
    const { rows, columnGroups, cellBindings = {}, rowBindings = {} } = config;

    // Build lookup for markers mapped via the image marker dialog
    const cellMap = {};
    markers.forEach((m) => {
        const s = m.style || {};
        if (!s.tableRow) return;
        const key = `${s.tableRow}||${s.tableColGroup || ""}||${s.tableSubCol || ""}`;
        if (!cellMap[key]) cellMap[key] = [];
        cellMap[key].push(m);
    });

    const getCellMarkers = (row, groupLabel, subCol) =>
        cellMap[`${row}||${groupLabel}||${subCol}`] || [];

    // Which column groups actually host a multi-sensor Cycling Badge, in any
    // row — only those get their header word highlighted (a column with no
    // rotating badge in it has nothing to point at, so it stays static).
    const cyclingGroupLabels = new Set();
    columnGroups.forEach((group) => {
        const subs = group.subColumns?.length ? group.subColumns : [""];
        const hasCyclingBadge = rows.some((row) =>
            subs.some((sub) => {
                const normalized = normalizeCellBinding(cellBindings[`${row}||${group.label}||${sub}`]);
                return normalized.widgets.some((w) => w.widgetType === "cyclebadge" && (w.combinedSensors || []).length > 1);
            })
        );
        if (hasCyclingBadge) cyclingGroupLabels.add(group.label);
    });

    return (
        <Box sx={{
            mt: fillHeight ? 0 : 2, overflowX: "auto",
            ...(fillHeight ? { height: "100%", display: "flex", flexDirection: "column" } : {}),
            "@keyframes alarmPulse": {
                "0%":   { boxShadow: "0 0 4px rgba(244,67,54,0.4)" },
                "50%":  { boxShadow: "0 0 12px rgba(244,67,54,0.8)" },
                "100%": { boxShadow: "0 0 4px rgba(244,67,54,0.4)" },
            },
        }}>
            {/* fillHeight mode constrains this box to whatever height the page has
                left (Plant Overview's home screen) — a cell can now stack several
                widgets (badges/cards), so its rows don't always fit that space
                anymore. overflow:"auto" here means the table scrolls internally
                once that happens instead of "hidden" silently clipping the extra
                rows off (which read as the table overlapping the panel below it).
                Non-fillHeight tables (e.g. the plain SCADA Dashboard) keep
                "hidden" — they're never height-constrained, so it only ever
                served the rounded-corner clipping, never scroll suppression. */}
            <Paper elevation={3} sx={{ borderRadius: 2.5, overflow: fillHeight ? "auto" : "hidden", boxShadow: "0 4px 18px rgba(15,52,86,0.14)", ...(fillHeight ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}) }}>
                <Table size="small" sx={{ borderCollapse: "collapse", width: "100%", ...(fillHeight ? { height: "100%" } : {}) }}>
                    <TableHead>
                        {/* Row 1: Description + column group spans */}
                        <TableRow>
                            <TableCell rowSpan={2} sx={{ ...hdrCell, width: 180, borderRight: "2px solid #fff", verticalAlign: "middle" }}>
                                Description
                            </TableCell>
                            {columnGroups.map((group, gi) => {
                                const segmentCount = String(group.label || "").split("|").map((p) => p.trim()).filter(Boolean).length;
                                const activeIndex = cyclingGroupLabels.has(group.label) && segmentCount > 1
                                    ? globalTick % segmentCount
                                    : null;
                                return (
                                    <TableCell
                                        key={gi}
                                        colSpan={group.subColumns?.length || 1}
                                        sx={{ ...hdrCell, borderLeft: "2px solid #fff" }}
                                    >
                                        <GroupHeaderLabel label={group.label} activeIndex={activeIndex} />
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                        {/* Row 2: Sub-column names */}
                        <TableRow>
                            {columnGroups.map((group, gi) =>
                                (group.subColumns?.length ? group.subColumns : [""]).map((col, ci) => (
                                    <TableCell
                                        key={`${gi}-${ci}`}
                                        sx={{ ...subHdrCell, borderLeft: ci === 0 ? "2px solid #fff" : "1px solid #1a3a5c" }}
                                    >
                                        {col || "—"}
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row, ri) => {
                            const rowBind    = rowBindings[row];
                            const rowIsNav   = hasNavTarget(rowBind) && typeof onNavigateTab === "function";
                            const rowTabName = rowIsNav ? (scadaTabs[rowBind.navigateTargetTabIndex]?.name || `Screen ${rowBind.navigateTargetTabIndex + 1}`) : null;

                            const rowLabelCell = (
                                <TableCell
                                    onClick={rowIsNav ? () => onNavigateTab(rowBind.navigateTargetTabIndex) : undefined}
                                    sx={{
                                        ...dataCell,
                                        fontWeight: 600, fontSize: "0.8rem",
                                        bgcolor: rowBind?.bgColor || "inherit",
                                        color: rowBind?.textColor || "inherit",
                                        borderRight: "2px solid #ddd", textAlign: "left",
                                        position: "relative",
                                        "&:hover .row-edit-btn": { opacity: 1 },
                                        ...(rowIsNav ? {
                                            cursor: "pointer",
                                            "&:hover": { filter: "brightness(0.96)" },
                                        } : {}),
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                                        <span>{rowBind?.label || row}</span>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                                            {rowIsNav && <LinkIcon sx={{ fontSize: 13, opacity: 0.7 }} />}
                                            {onRowEdit && (
                                                <IconButton
                                                    size="small"
                                                    className="row-edit-btn"
                                                    onClick={(e) => { e.stopPropagation(); onRowEdit(row); }}
                                                    title="Configure this row label (navigation, colors)"
                                                    sx={{
                                                        opacity: 0, transition: "opacity 0.15s", p: 0.3,
                                                        color: rowBind ? "text.secondary" : "primary.main",
                                                        "&:hover": { color: "primary.main" },
                                                    }}
                                                >
                                                    {rowBind
                                                        ? <EditIcon sx={{ fontSize: 13 }} />
                                                        : <AddCircleOutlineIcon sx={{ fontSize: 14 }} />
                                                    }
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                            );

                            return (
                            <TableRow key={ri} sx={{
                                "&:nth-of-type(odd)": { bgcolor: "#f4f8fc" },
                                "&:hover": { bgcolor: "#e8f1fb" },
                                transition: "background 0.12s",
                            }}>
                                {rowIsNav ? (
                                    <Tooltip title={`→ ${rowTabName}`} placement="right" arrow>
                                        {rowLabelCell}
                                    </Tooltip>
                                ) : rowLabelCell}
                                {columnGroups.map((group, gi) =>
                                    (group.subColumns?.length ? group.subColumns : [""]).map((sub, ci) => {
                                        const cellKey     = `${row}||${group.label}||${sub}`;
                                        const mapped      = getCellMarkers(row, group.label, sub);
                                        const cellBound   = cellBindings[cellKey];
                                        const normalized  = normalizeCellBinding(cellBound);
                                        const hasContent  = !!cellBound || mapped.length > 0;
                                        const isNav       = hasNavTarget(normalized) && typeof onNavigateTab === "function";
                                        const navTabName  = isNav ? (scadaTabs[normalized.navigateTargetTabIndex]?.name || `Screen ${normalized.navigateTargetTabIndex + 1}`) : null;

                                        const cellContent = (
                                            <Box
                                                onClick={isNav ? () => onNavigateTab(normalized.navigateTargetTabIndex) : undefined}
                                                sx={{
                                                    display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center", alignItems: "center", minHeight: 36,
                                                    ...(isNav ? {
                                                        cursor: "pointer", borderRadius: "6px", transition: "background 0.15s",
                                                        "&:hover": { background: "rgba(33,150,243,0.08)" },
                                                    } : {}),
                                                }}
                                            >
                                                {/* One or more widgets in this cell (e.g. a Standard Card plus a Cycling
                                                    Badge together) — laid out inline, wrapping to a new line only when
                                                    the cell isn't wide enough, so several small badges/cards stay
                                                    compact side-by-side instead of each claiming a full row (that made
                                                    rows tall enough to force scrolling). The nav-link corner badge, if
                                                    this cell is also click-navigable, only shows on the first widget so
                                                    it isn't repeated. A cell with no widgets at all (pure nav link)
                                                    falls through to NavOnlyCell below. */}
                                                {normalized.widgets.map((w, wi) => {
                                                    const navigable = isNav && wi === 0;
                                                    if (w.widgetType === "cyclebadge" && (w.combinedSensors || []).length) {
                                                        return <CellCyclingBadge key={wi} binding={w} liveData={liveData} thresholdMinutes={thresholdMinutes} liveSnapshotUpdatedAt={liveSnapshotUpdatedAt} navigable={navigable} />;
                                                    }
                                                    if (w.widgetType === "multicard" && (w.combinedSensors || []).length) {
                                                        return <CellMultiCard key={wi} binding={w} liveData={liveData} thresholdMinutes={thresholdMinutes} liveSnapshotUpdatedAt={liveSnapshotUpdatedAt} navigable={navigable} />;
                                                    }
                                                    if (w.tagKey) {
                                                        return <CellBoundValue key={wi} binding={w} liveData={liveData} thresholdMinutes={thresholdMinutes} liveSnapshotUpdatedAt={liveSnapshotUpdatedAt} navigable={navigable} />;
                                                    }
                                                    return null;
                                                })}
                                                {normalized.widgets.length === 0 && isNav && (
                                                    <NavOnlyCell binding={normalized} />
                                                )}
                                                {/* Marker-mapped values */}
                                                {mapped.map((m) => (
                                                    <MarkerCell key={m.id} marker={m} liveData={liveData} thresholdMinutes={thresholdMinutes} />
                                                ))}
                                                {/* Edit icon — visible on row hover */}
                                                {onCellEdit && (
                                                    <IconButton
                                                        size="small"
                                                        className="cell-edit-btn"
                                                        onClick={(e) => { e.stopPropagation(); onCellEdit(row, group.label, sub); }}
                                                        title="Configure this cell (sensor, navigation, colors)"
                                                        sx={{
                                                            opacity: 0,
                                                            transition: "opacity 0.15s",
                                                            p: 0.3,
                                                            color: hasContent ? "text.secondary" : "primary.main",
                                                            "&:hover": { color: "primary.main" },
                                                        }}
                                                    >
                                                        {hasContent
                                                            ? <EditIcon sx={{ fontSize: 13 }} />
                                                            : <AddCircleOutlineIcon sx={{ fontSize: 14 }} />
                                                        }
                                                    </IconButton>
                                                )}
                                            </Box>
                                        );

                                        return (
                                            <TableCell
                                                key={`${gi}-${ci}`}
                                                sx={{
                                                    ...dataCell,
                                                    borderLeft: ci === 0 ? "2px solid #ddd" : "1px solid #ddd",
                                                    position: "relative",
                                                    "&:hover .cell-edit-btn": { opacity: 1 },
                                                }}
                                            >
                                                {isNav ? (
                                                    <Tooltip title={`→ ${navTabName}`} placement="top" arrow>
                                                        {cellContent}
                                                    </Tooltip>
                                                ) : cellContent}
                                            </TableCell>
                                        );
                                    })
                                )}
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default ScadaDynamicTable;
