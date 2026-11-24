import React from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import EditIcon              from "@mui/icons-material/Edit";
import AddCircleOutlineIcon  from "@mui/icons-material/AddCircleOutline";

// Rectangular nested-card layout for root → group → leaf (was previously a
// connector-line tree/org-chart diagram — dropped per request in favor of
// plain rectangular boxes, matching the client wireframe's original nested-
// box style). Kept at this filename to avoid an orphaned file, even though
// "diagram" no longer quite fits — it's a Stack of Boxes now, not an SVG.
//
// MUI Stack (a thin wrapper over Box + display:flex + gap) over Grid here:
// this is a one-dimensional "row of boxes, each with a row of boxes inside"
// shape, not a breakpoint-driven 2D grid, so Stack's simpler API is the
// better fit — Grid would just add unused column-span complexity. (Tailwind
// is present in this repo — frontend/tailwind.config.js — but nothing in
// this feature uses it; mixing it into an all-MUI component would just be
// a second styling system for no benefit here.)
//
// Shared by both Energy Consumption (root = EB, plus an independent DG side
// box) and Water Consumption (root = the water total, no DG) — see
// PlantOverviewConsumptionPanel.js. `rootLabel` is optional (omit to skip
// the root box); `dgLabel`/`onEditDg` are optional together (omit both to
// skip the DG box).
// Values arrive as raw numbers (sums of live meter readings, e.g. a water
// group's total = sum of its items) with no rounding applied anywhere
// upstream, so floating-point addition can surface as "16036.028999999999".
// kWh/L consumption totals read as whole numbers on this dashboard (per
// client request) — round to the nearest integer, the one place every box's
// value (root/DG/group/feeder, both Energy and Water) renders through.
const formatNodeValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const num = Number(value);
    return Number.isFinite(num) ? String(Math.round(num)) : String(value);
};

const NodeBox = ({ label, value, unit, highlight, hasOverride, onEdit }) => (
    <Box sx={{
        position: "relative",
        textAlign: "center", minWidth: 62, px: 0.75, py: 0.4, borderRadius: 1,
        background: highlight ? "#f3e9f1" : "#fff",
        border: `1px solid ${highlight ? "#c9a8c2" : "#ddd"}`,
        "&:hover .box-edit-btn": { opacity: 1 },
    }}>
        <Typography sx={{ fontSize: 8, lineHeight: 1.2, color: "#666", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }} title={label}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: 11, lineHeight: 1.3, fontWeight: 700, color: "#1a3a5c" }}>
            {formatNodeValue(value)}{unit ? ` ${unit}` : ""}
        </Typography>
        {onEdit && (
            <IconButton
                size="small"
                className="box-edit-btn"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                title={hasOverride ? "Change meter" : "Pick a meter"}
                sx={{
                    position: "absolute", top: -7, right: -7, opacity: 0, transition: "opacity 0.15s",
                    p: 0.15, background: "#fff", boxShadow: "0 0 0 1px #ddd",
                    color: hasOverride ? "text.secondary" : "primary.main",
                    "&:hover": { color: "primary.main", background: "#fff" },
                }}
            >
                {hasOverride ? <EditIcon sx={{ fontSize: 10 }} /> : <AddCircleOutlineIcon sx={{ fontSize: 11 }} />}
            </IconButton>
        )}
    </Box>
);

const EnergyTreeDiagram = ({
    rootLabel, rootValue, rootUnit, rootOverride, onEditRoot,
    dgLabel, dgValue, dgUnit, dgOverride, onEditDg,
    groups, onEditNode, emptyMessage,
}) => {
    const hasRoot = rootLabel !== undefined && rootLabel !== null;
    const hasDg   = typeof onEditDg === "function";

    return (
        <Stack direction="row" spacing={1} alignItems="stretch">
            {/* DG (Generator) — independent power source, own bordered box. Energy only. */}
            {hasDg && (
                <Box sx={{
                    alignSelf: "center", flexShrink: 0,
                    border: "1px dashed #bbb", borderRadius: 1, p: 0.5,
                    background: "#fbfbfb", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25,
                }}>
                    <Typography sx={{ fontSize: 7, lineHeight: 1.2, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Generator
                    </Typography>
                    <NodeBox label={dgLabel} value={dgValue} unit={dgUnit} hasOverride={!!dgOverride} onEdit={onEditDg} />
                </Box>
            )}

            {/* Root → groups → leaves */}
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                {hasRoot && (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <NodeBox
                            label={rootLabel} value={rootValue} unit={rootUnit} highlight
                            hasOverride={!!rootOverride} onEdit={onEditRoot}
                        />
                    </Box>
                )}

                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                    {groups.map((g) => (
                        <Box key={g.id} sx={{ border: "1px solid #eee", borderRadius: 1, p: 0.5, minWidth: 130, background: "#fafafa" }}>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <NodeBox
                                    label={g.name} value={g.value} unit={g.unit} highlight
                                    hasOverride={!!g.override}
                                    onEdit={() => onEditNode(g.id, g.name, g.override)}
                                />
                            </Box>
                            <Stack direction="row" spacing={0.4} flexWrap="wrap" justifyContent="center" sx={{ mt: 0.5 }}>
                                {g.feeders.map((f) => (
                                    <NodeBox
                                        key={f.id}
                                        label={f.name} value={f.value} unit={f.unit}
                                        hasOverride={!!f.override}
                                        onEdit={() => onEditNode(f.id, `${g.name} / ${f.name}`, f.override)}
                                    />
                                ))}
                                {!g.feeders.length && (
                                    <Typography variant="caption" sx={{ fontSize: 9 }} color="text.secondary">No items configured</Typography>
                                )}
                            </Stack>
                        </Box>
                    ))}
                    {!groups.length && (
                        <Typography variant="caption" sx={{ fontSize: 9 }} color="text.secondary">
                            {emptyMessage || "No groups configured yet — use the gear icon to add one."}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};

export default EnergyTreeDiagram;
