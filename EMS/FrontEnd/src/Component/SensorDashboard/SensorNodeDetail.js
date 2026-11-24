import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, Grid, CircularProgress } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GaugeCard from './GaugeCard';
import AggregatedTrendCard from './AggregatedTrendCard';
import { getSensorPalette } from './sensorTheme';
import {
    GetUtilityGroupedMeters, GetUtilitySensorStats,
    GetDeviceParams, GetIoTSensorGraph, GetTagLiveValue,
    GetMeterOfflineThreshold,
} from '../../Services/NodeJsApiServices';
import useSocket from '../ScadaView/hooks/useSocket';
import { isMarkerStale, formatLastSeen } from '../ScadaView/utils/markerUtils';

// Only 3 ranges per the client's request (Day/Week/Month, not the fuller
// 1h/6h/24h/7d/30d set MeterDetailDrawer.js offers) — Day and Week both use
// 1-hour aggregated buckets, Month steps down to 1-day buckets. `value`s still
// map through dashboardController.getSensorGraph's HourOffset table (see the
// comment there) so no backend change is needed beyond that table already
// knowing '24hr'/'7days'/'30days'.
const TIME_OPTIONS = [
    { label: '1 Day',   value: '24hr',   interval: '1hr'  },
    { label: '1 Week',  value: '7days',  interval: '1hr'  },
    { label: '1 Month', value: '30days', interval: '1day' },
];

// Bundle of sensor dashboard types that can show up as companion gauges on
// each other's nodes (e.g. a combo sensor grouping Temperature + Humidity +
// Pressure on the same slave). Add a new sensor dashboard's type here so it
// participates in the same companion-gauge behavior as the others.
const SENSOR_META = {
    Temperature: { unit: '°C',  range: [0, 50],   tagKeywords: ['temp'] },
    Humidity:    { unit: '%RH', range: [0, 100],  tagKeywords: ['humid'] },
    CO2:         { unit: 'ppm', range: [0, 3000], tagKeywords: ['co2', 'carbon'] },
    Pressure:    { unit: 'bar', range: [0, 10],   tagKeywords: ['pressure', 'press'] },
};
const ENVIRONMENTAL_TYPES = Object.keys(SENSOR_META).join(',');

// A meter type renamed/created in the Meter Type master (e.g. "Air pressure") still belongs to
// its sensor type ("Pressure") — resolve by keyword, not exact string equality. The original
// name is kept for display (card title); this canonical key drives grouping/units/tag picking.
const canonicalType = (meterType) => {
    const name = String(meterType || '').toLowerCase();
    return Object.keys(SENSOR_META).find((t) => SENSOR_META[t].tagKeywords.some((k) => name.includes(k))) || meterType;
};

const round = (v) => (v != null && !isNaN(v) ? Math.round(v * 10) / 10 : null);

// A reading of 0 (or below) on these sensors means the physical device is
// disconnected/faulty, not a real measurement — treated as "no data" rather
// than plotted/averaged as if it were a genuine 0. Applied uniformly to the
// trend series, the per-meter gauge value, and the aggregated summary.
const isValidReading = (v) => v != null && !isNaN(v) && v > 0;

// getDeviceParams (machine_parameter_allocation) returns ALL tags for a slave,
// ordered alphabetically by Tag_Name — on a combo sensor that reports more
// than one reading (e.g. Humidity + Temperature on the same slave), a naive
// params[0] can silently pick the wrong one ("Humidity" sorts before
// "Temperature"). Prefer the tag whose name matches the meter's own type;
// fall back to the first tag if nothing matches.
const pickTag = (params, meterType) => {
    const keywords = SENSOR_META[canonicalType(meterType)]?.tagKeywords || [];
    const match = params.find((p) => {
        const name = (p.tagName || p.Tag_name || p.name || '').toLowerCase();
        return keywords.some((k) => name.includes(k));
    });
    return match || params[0];
};

// Detail panel for the Temperature/Humidity/CO2 sensor dashboards: given the
// tree node the user selected (a cat_item category or cat_sub sub-category),
// finds every Temperature/Humidity/CO2 meter grouped there and renders one
// gauge per meter — the dashboard's own sensorType shown large/first, any
// companion readings grouped at the same node (e.g. CO2 bundled with its
// Temperature/Humidity sensor) shown alongside, smaller.
const SensorNodeDetail = ({ node, sensorType, unit, gaugeRange, color, palette }) => {
    const p = palette || getSensorPalette(false);
    const [meters, setMeters]       = useState([]);
    const [metersLoading, setMetersLoading] = useState(false);
    const [liveStats, setLiveStats] = useState({});
    const [detailMap, setDetailMap] = useState({});   // meterId -> { graphData, min, max, avg, loading }
    const [timeRange, setTimeRange] = useState('24hr');

    // Floor overview (all lines on one page) has no single category context to
    // bundle a companion sensor into, so it only makes sense to request/show
    // this dashboard's own sensorType there — the per-category view still
    // requests every environmental type so a combo sensor's companion
    // readings (e.g. Humidity riding along with Temperature) can be shown.
    const isFloorOverview = node?.type === 'cat_floor';

    // Live "actual" readings for all utility meters — fetched once, reused across node selections.
    useEffect(() => {
        GetUtilitySensorStats((d) => setLiveStats(d?.data || {}), () => {});
    }, []);

    // Global "meter offline" threshold (meter_offline_settings — same value the Meter
    // Status screen, Energy dashboard and SCADA screen use) — drives the gray-out
    // treatment below via isMarkerStale/formatLastSeen (ScadaView/utils/markerUtils.js).
    const [offlineThresholdMinutes, setOfflineThresholdMinutes] = useState(30);
    useEffect(() => {
        GetMeterOfflineThreshold(
            (res) => { if (Number.isFinite(res?.offlineThresholdMinutes)) setOfflineThresholdMinutes(res.offlineThresholdMinutes); },
            () => {}
        );
    }, []);

    // Re-render periodically so a sensor that goes silent flips to the offline/
    // grayed-out state even without any new value arriving to trigger a render.
    const [, setStaleTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setStaleTick((t) => t + 1), 30000);
        return () => clearInterval(id);
    }, []);

    // Grouped meters at the selected node
    useEffect(() => {
        if (!node) { setMeters([]); return; }
        setMetersLoading(true);
        setMeters([]);
        setDetailMap({});
        GetUtilityGroupedMeters(
            { type: node.type, id: node.id, sensorTypes: node.type === 'cat_floor' ? sensorType : ENVIRONMENTAL_TYPES },
            (res) => {
                const rows = res?.data || [];
                // Dashboard's own sensor type first/large.
                rows.sort((a, b) => (canonicalType(a.meterType) === sensorType ? -1 : 0) - (canonicalType(b.meterType) === sensorType ? -1 : 0));
                setMeters(rows);
                setMetersLoading(false);
            },
            () => { setMeters([]); setMetersLoading(false); }
        );
    }, [node, sensorType]);

    // Trend + min/avg/max per meter, for the selected time range
    const fetchDetail = useCallback((meter) => {
        if (!meter.deviceId) return;
        const timeOpt = TIME_OPTIONS.find((t) => t.value === timeRange) || TIME_OPTIONS[0];
        setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), loading: true } }));

        GetDeviceParams(
            { deviceId: meter.deviceId, slaveId: meter.slaveId },
            (d) => {
                const params = d?.data || d?.params || (Array.isArray(d) ? d : []);
                const picked = params.length > 0 ? pickTag(params, meter.meterType) : null;
                const tagId = picked ? (picked.tagId || picked.id || picked.Tag_name) : null;
                if (!tagId) {
                    setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), graphData: [], min: null, max: null, avg: null, loading: false } }));
                    return;
                }

                // Stored as soon as it's resolved (before either fetch below settles)
                // so the websocket live-push effect further down can already map
                // incoming "livedata" records to this meter by tagId.
                setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), tagId } }));

                // True "right now" value — live_tag_snapshot, refreshed by the
                // live-tag cron (~1 min), same table/join key ScadaController
                // already uses for live widget values. Independent of the
                // trend fetch below (and of the selected time range), so it's
                // fired in parallel and merged in whenever it resolves.
                GetTagLiveValue(
                    { deviceId: meter.deviceId, slaveId: meter.slaveId, tagId },
                    (lv) => setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), tagId, live: lv?.data || null } })),
                    () => setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), tagId, live: null } }))
                );

                GetIoTSensorGraph(
                    { deviceId: meter.deviceId, tagId, slaveId: meter.slaveId, last: timeOpt.value, aggregation: 'avg', interval: timeOpt.interval },
                    (g) => {
                        const raw = g?.data || (Array.isArray(g) ? g : []);
                        // sensorGraph returns { dateTime, value } — dateTime must be
                        // checked (it wasn't) or every point collapses to the same
                        // empty label, which silently breaks the by-label averaging
                        // in `aggregated` below (every position reads back the first
                        // point's value instead of its own).
                        const graphData = raw.map((p) => {
                            const raw_ = p.value ?? p.energy ?? p.reading ?? null;
                            return {
                                label: p.dateTime || p.label || p.time || p.timestamp || '',
                                // 0/negative readings are invalid for these sensors (see
                                // isValidReading) — null'd out so the chart shows a gap
                                // instead of drawing/averaging through a fake 0.
                                value: isValidReading(raw_) ? raw_ : null,
                            };
                        });
                        const values = graphData.map((p) => p.value).filter((v) => v != null && !isNaN(v));
                        const min = values.length ? round(Math.min(...values)) : null;
                        const max = values.length ? round(Math.max(...values)) : null;
                        const avg = values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null;
                        setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), graphData, min, max, avg, loading: false } }));
                    },
                    () => setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), graphData: [], min: null, max: null, avg: null, loading: false } }))
                );
            },
            () => setDetailMap((prev) => ({ ...prev, [meter.id]: { ...(prev[meter.id] || {}), graphData: [], min: null, max: null, avg: null, loading: false } }))
        );
    }, [timeRange]);

    useEffect(() => {
        meters.forEach(fetchDetail);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meters, timeRange]);

    // Live push — same SCADA socket ("livedata" events, keyed by tagId) the SCADA
    // screen already uses. Backend emits this from SensorSegregationCron.js's tick
    // (the same cron that refreshes live_tag_snapshot). Previously these gauges only
    // updated on initial fetch (node/time-range change or a manual reload); this
    // keeps them live in between without re-polling. Merges straight into
    // detail.live — the exact slot the HTTP GetTagLiveValue call above already
    // populates — so gaugeValue/aggregated.current need no changes to pick it up.
    const liveData = useSocket();
    useEffect(() => {
        if (!Object.keys(liveData).length || !meters.length) return;
        setDetailMap((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const meter of meters) {
                const entry = next[meter.id];
                const tagId = entry?.tagId;
                if (tagId == null) continue;
                const pushedValue = liveData[tagId];
                if (pushedValue === undefined || entry.live?.value === pushedValue) continue;
                next[meter.id] = { ...entry, live: { value: pushedValue, updated_at: new Date().toISOString() } };
                changed = true;
            }
            return changed ? next : prev;
        });
    }, [liveData, meters]);

    // Category-level summary: point-wise average across every meter of this
    // dashboard's own sensorType grouped at the node (usually 1, sometimes
    // several — e.g. 3 Temperature sensors on "Assembly Line 1 & 2"),
    // rendered as the full-width chart above the individual GaugeCards.
    const ownTypeMeters = useMemo(
        () => meters.filter((m) => canonicalType(m.meterType) === sensorType),
        [meters, sensorType]
    );

    const aggregated = useMemo(() => {
        if (ownTypeMeters.length === 0) return null;
        const anyLoading = ownTypeMeters.some((m) => detailMap[m.id]?.loading);

        // Canonical timeline = the longest series among the own-type meters.
        const base = ownTypeMeters
            .map((m) => detailMap[m.id]?.graphData || [])
            .reduce((longest, gd) => (gd.length > longest.length ? gd : longest), []);

        const series = base.map((p) => {
            const vals = ownTypeMeters
                .map((m) => (detailMap[m.id]?.graphData || []).find((g) => g.label === p.label)?.value)
                .filter((v) => v != null && !isNaN(v));
            return { label: p.label, value: vals.length ? round(vals.reduce((a, b) => a + b, 0) / vals.length) : null };
        });

        const values = series.map((p) => p.value).filter((v) => v != null);
        const min = values.length ? round(Math.min(...values)) : null;
        const max = values.length ? round(Math.max(...values)) : null;
        const avg = values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null;

        // "Current" precedence: live_tag_snapshot (the canonical live-value table
        // ScadaController/Energy live KPIs already use, refreshed by the ~1-min
        // live-tag cron) → trend's own latest point (if the snapshot has no row
        // yet) → utility_meter_live_data.currentReading as a last resort (built
        // for counter-type meters, not calibrated instantaneous sensors — can
        // report a value with no relation to the real trend, see pickTag above).
        const snapshotVals = ownTypeMeters.map((m) => detailMap[m.id]?.live?.value).filter(isValidReading);
        const liveVals = ownTypeMeters.map((m) => liveStats[m.id]?.actual).filter(isValidReading);
        const current = snapshotVals.length
            ? round(snapshotVals.reduce((a, b) => a + b, 0) / snapshotVals.length)
            : (values.length ? values[values.length - 1] : (liveVals.length ? round(liveVals.reduce((a, b) => a + b, 0) / liveVals.length) : null));

        return { series, min, max, avg, current, loading: anyLoading };
    }, [ownTypeMeters, detailMap, liveStats]);

    if (!node) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} sx={{ color: p.subtext, py: 8 }}>
                <AccountTreeIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography>Select a category or sub-category from the tree to view sensor readings.</Typography>
            </Box>
        );
    }

    const toggleSx = {
        '& .MuiToggleButton-root': {
            fontSize: 11, px: 1.2, py: 0.3, color: p.subtext, borderColor: p.border,
            '&.Mui-selected': { color, backgroundColor: `${color}18` },
        },
    };

    // Month view buckets by whole day, so a per-tick time (always the same
    // floor-of-day value) is just clutter — charts show date-only in that case.
    const dateOnly = (TIME_OPTIONS.find((t) => t.value === timeRange) || TIME_OPTIONS[0]).interval === '1day';

    return (
        <Box sx={{ p: 1.5, flex: 1, overflowY: 'auto' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: p.text }}>{node.name}</Typography>
                <ToggleButtonGroup exclusive size="small" value={timeRange} sx={toggleSx}
                    onChange={(_, v) => { if (v) setTimeRange(v); }}>
                    {TIME_OPTIONS.map((t) => (
                        <ToggleButton key={t.value} value={t.value}>
                            {t.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {metersLoading ? (
                <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : meters.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: p.subtext }}>
                    <Typography>
                        No {sensorType} meters {isFloorOverview ? 'found on' : 'grouped under'} "{node.name}" yet.
                    </Typography>
                    <Typography variant="caption">
                        Allocate a {sensorType} utility meter and group it into a category via Configuration → Category / Meter Grouping.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {!isFloorOverview && aggregated && (
                        <Grid item xs={12}>
                            <AggregatedTrendCard
                                title={`${sensorType} — ${node.name}`}
                                subtitle={`Category average · last ${(TIME_OPTIONS.find((t) => t.value === timeRange) || TIME_OPTIONS[0]).label}`}
                                unit={unit}
                                value={aggregated.current}
                                min={aggregated.min}
                                max={aggregated.max}
                                avg={aggregated.avg}
                                trendData={aggregated.series}
                                color={color}
                                meterCount={ownTypeMeters.length}
                                loading={aggregated.loading && aggregated.series.length === 0}
                                palette={p}
                                dateOnly={dateOnly}
                            />
                        </Grid>
                    )}
                    {meters.map((meter) => {
                        const isOwn   = canonicalType(meter.meterType) === sensorType;
                        const detail  = detailMap[meter.id] || {};
                        const live    = liveStats[meter.id];
                        const mUnit   = isOwn ? unit : (SENSOR_META[canonicalType(meter.meterType)]?.unit ?? '');
                        const mRange  = isOwn ? gaugeRange : (SENSOR_META[canonicalType(meter.meterType)]?.range ?? [0, 100]);
                        const trendLast = detail.graphData?.length ? detail.graphData[detail.graphData.length - 1].value : null;
                        const gaugeValue = isValidReading(detail.live?.value) ? detail.live.value
                            : isValidReading(trendLast) ? trendLast
                            : isValidReading(live?.actual) ? live.actual
                            : null;
                        // "Offline" = the live reading itself is stale (no data within the
                        // global threshold), independent of whether gaugeValue above found
                        // something to show via the trend/old-fallback chain — a sensor
                        // that died days ago shouldn't look live just because an older
                        // trend point or utility_meter_live_data row still has a number in it.
                        const isOffline = isMarkerStale(detail.live?.updated_at, offlineThresholdMinutes);
                        const lastSeenText = formatLastSeen(detail.live?.updated_at);
                        // Floor overview: just the line/category name — the meter
                        // name is often the same text as the category (e.g. both
                        // "Assembly Line 1&2"), which read as a duplicated label.
                        const cardLabel = isFloorOverview
                            ? (meter.categoryName || meter.meterName)
                            : meter.meterName;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={meter.id}>
                                <GaugeCard
                                    title={meter.meterType}
                                    meterName={cardLabel}
                                    unit={mUnit}
                                    value={gaugeValue}
                                    min={detail.min}
                                    max={detail.max}
                                    avg={detail.avg}
                                    trendData={detail.graphData || []}
                                    gaugeRange={mRange}
                                    color={isOwn ? color : '#78909c'}
                                    size="medium"
                                    loading={!!detail.loading}
                                    palette={p}
                                    dateOnly={dateOnly}
                                    minLimit={meter.minLimit}
                                    maxLimit={meter.maxLimit}
                                    offline={isOffline}
                                    lastSeenText={lastSeenText}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default SensorNodeDetail;
