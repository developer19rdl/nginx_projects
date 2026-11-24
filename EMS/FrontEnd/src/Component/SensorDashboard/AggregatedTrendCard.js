import React from 'react';
import { Box, Card, CardContent, Typography, Chip, CircularProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { getSensorPalette } from './sensorTheme';

// Backend labels are always "YYYY-MM-DD HH:mm" (dashboardController.getSensorGraph's
// DATE_FORMAT is fixed regardless of bucket size). In Month view the bucket IS a
// full day, so a per-tick time (always the same floor-of-day value) is just
// clutter — trim to the date when `dateOnly` is set (Day/Week keep the time).
const formatLabel = (label, dateOnly) => (dateOnly ? String(label || '').slice(0, 10) : label);

// Full-width "category" summary — sits above the per-meter GaugeCards and
// shows the combined/averaged trend for every meter of the dashboard's own
// sensor type grouped at the selected node (e.g. 3 Temperature sensors on
// "Assembly Line 1 & 2" averaged into one line), styled after the large area
// chart in the client's tado-style reference dashboards.
const AggregatedTrendCard = ({
    title, subtitle, unit, value, min, max, avg,
    trendData = [], color = '#0ea5e9', meterCount = 0, loading = false, palette, dateOnly = false,
}) => {
    const gradientId = `agg-fill-${color.replace('#', '')}`;
    const p = palette || getSensorPalette(false);

    return (
        <Card elevation={2} sx={{
            borderRadius: 2.5, border: `1px solid ${color}30`,
            backgroundColor: p.paperBg, transition: 'background-color 0.2s ease',
        }}>
            <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1} mb={0.8}>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: p.text }}>{title}</Typography>
                        <Typography sx={{ fontSize: 11, color: p.subtext }}>{subtitle}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        {meterCount > 1 && (
                            <Chip label={`Avg of ${meterCount} sensors`} size="small"
                                sx={{ fontSize: 10, height: 20, backgroundColor: `${color}18`, color, fontWeight: 600 }} />
                        )}
                        <Typography sx={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
                            {value != null ? value : '—'}<Typography component="span" sx={{ fontSize: 14, fontWeight: 500, color: p.subtext, ml: 0.4 }}>{unit}</Typography>
                        </Typography>
                    </Box>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                ) : (
                    <>
                        <Box display="flex" gap={1} mb={1}>
                            {[
                                { label: 'Max', val: max, color: '#c62828' },
                                { label: 'Avg', val: avg, color: '#e65100' },
                                { label: 'Min', val: min, color: '#2e7d32' },
                            ].map((s) => (
                                <Box key={s.label} sx={{
                                    px: 1.2, py: 0.4, borderRadius: 1.5,
                                    border: `1px solid ${s.color}30`, backgroundColor: `${s.color}0c`,
                                }}>
                                    <Typography component="span" sx={{ fontSize: 10, color: p.subtext, mr: 0.5 }}>{s.label}</Typography>
                                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: s.color }}>
                                        {s.val != null ? `${s.val}${unit}` : '—'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ height: 170 }}>
                            {trendData.length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                                        <defs>
                                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                                                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={p.border} />
                                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: p.subtext }} interval="preserveStartEnd"
                                            tickFormatter={(l) => formatLabel(l, dateOnly)} />
                                        <YAxis tick={{ fontSize: 10, fill: p.subtext }} width={34} domain={['auto', 'auto']} />
                                        <RTooltip
                                            contentStyle={{ fontSize: 11, borderRadius: 6, backgroundColor: '#263238', color: '#fff', border: 'none' }}
                                            labelStyle={{ color: '#b0bec5' }}
                                            labelFormatter={(l) => formatLabel(l, dateOnly)}
                                            formatter={(v) => (v != null ? `${parseFloat(v).toFixed(1)} ${unit}` : '—')}
                                        />
                                        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
                                            fill={`url(#${gradientId})`} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ color: p.subtext }}>
                                    <Typography variant="body2">No trend data for the selected range.</Typography>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default AggregatedTrendCard;
