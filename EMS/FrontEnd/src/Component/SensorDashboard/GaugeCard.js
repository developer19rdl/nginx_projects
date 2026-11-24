import React from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import IoTGauge from '../IoTDashboard/IoTGauge';
import { getSensorPalette } from './sensorTheme';

// Dial gauge + Min/Avg/Max stat row + trend line, one per meter — styled after
// the tado-style reference dashboards the client shared.
// size: 'small' (dense companion gauges) | 'medium' (default — fits a normal
// laptop screen without scrolling) | 'large' (hero/full-page use).
const SIZES = {
  small:  { pad: 1.25, title: 12, labelFont: 11, gauge: 96,  statGap: 0.5, statPy: 0.3, statLabel: 8,  statVal: 10, trend: 40,  trendMt: 0.6, stroke: 1.75, spin: 22 },
  medium: { pad: 1.5,  title: 13, labelFont: 13, gauge: 140, statGap: 0.6, statPy: 0.4, statLabel: 9,  statVal: 12, trend: 60,  trendMt: 0.8, stroke: 1.75, spin: 26 },
  large:  { pad: 2.25, title: 17, labelFont: 15, gauge: 220, statGap: 1,   statPy: 0.7, statLabel: 11, statVal: 16, trend: 130, trendMt: 1.5, stroke: 2.25, spin: 32 },
};

// Backend labels are always "YYYY-MM-DD HH:mm" — in Month view the bucket IS a
// full day, so trim to just the date (Day/Week keep the time). See the same
// helper in AggregatedTrendCard.js.
const formatLabel = (label, dateOnly) => (dateOnly ? String(label || '').slice(0, 10) : label);

const GaugeCard = ({
  title, meterName, unit, value, min, max, avg,
  trendData = [], gaugeRange = [0, 100], color = '#0ea5e9',
  size = 'medium', loading = false, palette, dateOnly = false,
  minLimit = null, maxLimit = null,
  offline = false, lastSeenText = null,
}) => {
  const s = SIZES[size] || SIZES.medium;
  const showAxisLabels = size === 'large';
  const p = palette || getSensorPalette(false);

  return (
    <Card elevation={2} sx={{
      borderRadius: 2.5, border: `1px solid ${color}30`, height: '100%',
      backgroundColor: p.paperBg, transition: 'background-color 0.2s ease',
      // Same grey/dim treatment as IoTChildCards.js's OFFLINE_CARD, so a stale
      // reading (the sensor stopped reporting) is never mistaken for a live one —
      // noData on IoTGauge only covers "no value at all", not "value is stale".
      ...(offline ? { filter: 'grayscale(0.7)', opacity: 0.7 } : {}),
    }}>
      <CardContent sx={{ p: s.pad, '&:last-child': { pb: s.pad } }}>
        {/* Full line/meter name, never truncated — stacked under the title
            (Temperature/Humidity/...) instead of squeezed into a fixed-width
            pill, since floor-overview labels ("Assembly Line 1 & 2 · temp 12")
            can run long. */}
        <Box mb={0.8}>
          <Typography sx={{ fontWeight: 700, fontSize: s.title, color: p.text, lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: s.labelFont, color, lineHeight: 1.35, wordBreak: 'break-word' }}>
            {meterName}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}><CircularProgress size={s.spin} /></Box>
        ) : offline ? (
          <Typography sx={{ color: p.subtext, fontSize: s.labelFont, fontStyle: 'italic', py: 2, textAlign: 'center' }}>
            {lastSeenText || 'No data received yet'}
          </Typography>
        ) : (
          <>
            <Box sx={{ height: s.gauge }}>
              <IoTGauge value={value} min={gaugeRange[0]} max={gaugeRange[1]} unit={unit}
                noData={value == null} trackColor="#d1d5db"
                minLimit={minLimit} maxLimit={maxLimit} />
            </Box>

            <Box display="flex" gap={s.statGap} mt={0.5}>
              {[
                { label: 'Max', val: max, color: '#c62828' },
                { label: 'Avg', val: avg, color: '#e65100' },
                { label: 'Min', val: min, color: '#2e7d32' },
              ].map((st) => (
                <Box key={st.label} sx={{
                  flex: 1, py: s.statPy, borderRadius: 1.5, textAlign: 'center',
                  border: `1px solid ${st.color}30`, backgroundColor: `${st.color}0c`,
                }}>
                  <Typography sx={{ fontSize: s.statLabel, color: p.subtext, lineHeight: 1.3 }}>{st.label}</Typography>
                  <Typography sx={{ fontSize: s.statVal, fontWeight: 700, color: st.color, lineHeight: 1.3 }}>
                    {st.val != null ? `${st.val}${unit}` : '—'}
                  </Typography>
                </Box>
              ))}
            </Box>

            {trendData.length > 1 && (
              <Box sx={{ height: s.trend, mt: s.trendMt }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={p.border} />
                    <XAxis dataKey="label" hide={!showAxisLabels} tick={{ fontSize: 9, fill: p.subtext }} interval="preserveStartEnd"
                      tickFormatter={(l) => formatLabel(l, dateOnly)} />
                    <YAxis hide width={0} domain={['auto', 'auto']} />
                    <RTooltip
                      contentStyle={{ fontSize: 11, borderRadius: 6, backgroundColor: '#263238', color: '#fff', border: 'none' }}
                      labelStyle={{ color: '#b0bec5' }}
                      labelFormatter={(l) => formatLabel(l, dateOnly)}
                      formatter={(v) => (v != null ? `${parseFloat(v).toFixed(1)} ${unit}` : '—')}
                    />
                    <Line type="monotone" dataKey="value" stroke={color} dot={false} strokeWidth={s.stroke} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GaugeCard;
