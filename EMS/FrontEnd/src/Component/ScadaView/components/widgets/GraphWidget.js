import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { GetScadaChartDataService, GetScadaCombinedChartDataService } from "../../../../Services/LoginPageService";

const REFRESH_MS = 30000;

const GraphWidget = ({ marker, style, unsaved, onSave, sizeOverride }) => {
    const [chartData, setChartData] = useState([]);
    const [lines, setLines] = useState([]);
    const [maxValue, setMaxValue] = useState(100);

    const isCombined = style.chartMode === "combined";
    // Stable primitive so the effect only refires when the actual sensor
    // selection changes, not on every parent re-render (array identity would
    // otherwise change constantly).
    const combinedSensorsKey = isCombined ? JSON.stringify(style.combinedSensors || []) : "";

    useEffect(() => {
        if (isCombined) {
            if (!style.combinedSensors?.length) return;
        } else if (!marker.deviceId || !marker.tagKey) {
            return;
        }

        const fetchChartData = () => {
            const params = {
                aggregation: style.chartAggregation || "avg",
                interval: style.chartInterval || "15min",
                sortDataType: style.chartLast || "8hr",
            };
            const onSuccess = (res) => {
                setChartData(res?.data || []);
                setLines(res?.lines || []);
                setMaxValue(res?.maxValue || 100);
            };

            if (isCombined) {
                GetScadaCombinedChartDataService({ ...params, sensors: style.combinedSensors }, onSuccess, () => {});
            } else {
                GetScadaChartDataService({ ...params, deviceId: marker.deviceId, slaveId: marker.slaveId, tagId: marker.tagKey }, onSuccess, () => {});
            }
        };

        fetchChartData();
        const timer = setInterval(fetchChartData, REFRESH_MS);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCombined, combinedSensorsKey, marker.deviceId, marker.slaveId, marker.tagKey, style.chartAggregation, style.chartInterval, style.chartLast]);

    // sizeOverride is intentionally never fed live during an active drag for chart
    // types (see ScadaMarker.js) — recharts' own internal ResizeObserver would
    // reflow on every pixel. Kept here for consistency with the other 6 widgets so
    // the committed size (from onResizeEnd) is picked up the same way once it lands.
    const width = sizeOverride?.width || style.chartWidth || 360;
    const height = sizeOverride?.height || style.chartHeight || 220;
    const chartKind = style.widgetType === "barchart" ? "bar" : style.widgetType === "areachart" ? "area" : "line";

    // Optional Spec/Control horizontal reference lines — "" (unset) hides a line
    // rather than defaulting to 0. Spec lines (amber) mark the acceptable range;
    // Control lines (red) mark the tighter action-limit range, so they're visually
    // distinct at a glance.
    const numOrNull = (v) => (v === "" || v === undefined || v === null || Number.isNaN(Number(v))) ? null : Number(v);
    const limitLines = [
        { key: "specMin", value: numOrNull(style.specMin), color: "#ff9800", label: "Spec Min" },
        { key: "specMax", value: numOrNull(style.specMax), color: "#ff9800", label: "Spec Max" },
        { key: "controlLow", value: numOrNull(style.controlLow), color: "#f44336", label: "Control Low" },
        { key: "controlMax", value: numOrNull(style.controlMax), color: "#f44336", label: "Control Max" },
    ].filter((l) => l.value !== null);

    // Stretch the Y-axis so a limit line above the highest data point (or below
    // zero) is never clipped off-chart — otherwise a freshly-set threshold with no
    // data near it yet would be invisible.
    const yDomain = limitLines.length
        ? [Math.min(0, ...limitLines.map((l) => l.value)), Math.max(maxValue, ...limitLines.map((l) => l.value))]
        : [0, maxValue];

    const renderLimitLines = () => limitLines.map((l) => (
        <ReferenceLine
            key={l.key}
            y={l.value}
            stroke={l.color}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
            label={{ value: l.label, position: "insideTopRight", fill: l.color, fontSize: 9 }}
        />
    ));

    return (
        <Box
            sx={{
                boxSizing: "border-box",
                background: `${style.bgColor}e6`,
                backdropFilter: "blur(8px)",
                border: `1px solid ${style.textColor}60`,
                borderRadius: "10px",
                padding: "8px",
                width,
                height,
                position: "relative",
                boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
            }}
        >
            <Typography
                variant="caption"
                sx={{ color: style.textColor, fontWeight: 600, fontSize: "12px", letterSpacing: "0.5px", opacity: 0.9 }}
            >
                {marker.label}{marker.unit ? ` (${marker.unit})` : ""}
            </Typography>

            <ResponsiveContainer width="100%" height="85%">
                {chartKind === "bar" ? (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateTime" tick={{ fill: style.textColor, fontSize: 10 }} />
                        <YAxis domain={yDomain} tick={{ fill: style.textColor, fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {lines.map((l, index) => (
                            <Bar key={index} dataKey={l.dataKey} name={l.name} fill={l.stroke} />
                        ))}
                        {renderLimitLines()}
                    </BarChart>
                ) : chartKind === "area" ? (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateTime" tick={{ fill: style.textColor, fontSize: 10 }} />
                        <YAxis domain={yDomain} tick={{ fill: style.textColor, fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {lines.map((l, index) => (
                            <Area key={index} type="monotone" dataKey={l.dataKey} name={l.name} stroke={l.stroke} fill={l.stroke} fillOpacity={0.3} />
                        ))}
                        {renderLimitLines()}
                    </AreaChart>
                ) : (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateTime" tick={{ fill: style.textColor, fontSize: 10 }} />
                        <YAxis domain={yDomain} tick={{ fill: style.textColor, fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {lines.map((l, index) => (
                            <Line key={index} type="monotone" dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={2} dot={false} />
                        ))}
                        {renderLimitLines()}
                    </LineChart>
                )}
            </ResponsiveContainer>

            {unsaved && (
                <IconButton
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                    sx={{ position: "absolute", top: -20, right: -20, backgroundColor: "#4caf50", color: "#fff", width: 30, height: 30, "&:hover": { backgroundColor: "#388e3c" }, boxShadow: "0 4px 10px rgba(0,0,0,0.3)", zIndex: 100 }}
                    size="small"
                >
                    <UploadIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
};

export default GraphWidget;
