import { useState } from 'react';
import { ComposedChart, Bar, Cell, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Fade from '@mui/material/Fade';
import { useTheme, alpha } from '@mui/material/styles';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightSectionCard from './InsightSectionCard';
import { useProductionTrend } from '../../../hooks/useDashboard';

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const produced = payload.find((p) => p.dataKey === 'produced')?.value ?? 0;
  const target = payload.find((p) => p.dataKey === 'target')?.value ?? 0;
  const achievement = target > 0 ? Math.round((produced / target) * 1000) / 10 : null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 1.25, py: 0.75, boxShadow: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Stack spacing={0.2}>
        <Stack direction="row" spacing={1.5} justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Production Count
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            {produced.toLocaleString()}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Target Production
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            {target > 0 ? target.toLocaleString() : '—'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Achievement
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: achievement == null ? 'text.primary' : achievement >= 100 ? 'success.main' : 'warning.main' }}>
            {achievement == null ? '—' : `${achievement}%`}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function ChartSkeleton() {
  return (
    <Stack spacing={1.5}>
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="text" width="60%" />
    </Stack>
  );
}

/**
 * Section: production output over a user-chosen period (Today/Weekly/Monthly, pill selector
 * top-right of the card) as a bar chart - one bar per hour/day/week, a dashed target-production
 * line traced across the same buckets, and a tooltip with Production Count/Target Production/
 * Achievement % per bar. Own independently-fetched query (see useProductionTrend), so switching
 * periods doesn't touch the rest of the Machine Details page. The current hour/day/week's bar is
 * rendered in the full primary accent color, every other bar in a muted tint of the same color -
 * "highlighted", not a different hue, so it still reads as one consistent series.
 */
export default function ProductionTrendSection({ machineId }) {
  const theme = useTheme();
  const [period, setPeriod] = useState('today');
  const { data } = useProductionTrend(machineId, period);

  const chartData = data?.chart || [];
  const hasData = chartData.some((d) => d.produced > 0);
  const hasTarget = chartData.some((d) => d.target > 0);

  return (
    <InsightSectionCard
      icon={<ShowChartIcon fontSize="small" />}
      title="Production Trend"
      action={
        <ToggleButtonGroup
          size="small"
          value={period}
          exclusive
          onChange={(e, val) => val && setPeriod(val)}
          sx={{
            bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(t.palette.common.white, 0.04) : 'grey.100'),
            borderRadius: '10px',
            p: 0.4,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '7px !important',
              px: 1.25,
              py: 0.25,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
            },
          }}
        >
          {PERIODS.map((p) => (
            <ToggleButton key={p.value} value={p.value}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      }
    >
      {!data ? (
        <ChartSkeleton />
      ) : (
        <Fade in key={period} timeout={350}>
          <Stack sx={{ height: '100%' }} spacing={1}>
            <Stack direction="row" spacing={2}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: 'primary.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Produced
                </Typography>
              </Stack>
              {hasTarget && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box sx={{ width: 14, height: 0, borderTop: `2px dashed ${theme.palette.text.secondary}` }} />
                  <Typography variant="caption" color="text.secondary">
                    Target
                  </Typography>
                </Stack>
              )}
            </Stack>

            {!hasData ? (
              <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1, py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No production recorded in this period yet.
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ flexGrow: 1, minHeight: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={alpha(theme.palette.text.primary, 0.08)} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: period === 'today' ? 10 : 11, fill: theme.palette.text.secondary }}
                      axisLine={false}
                      tickLine={false}
                      interval={period === 'today' ? 2 : 0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.08) }} />
                    <Bar dataKey="produced" radius={[3, 3, 0, 0]} isAnimationActive>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.isCurrent ? theme.palette.primary.main : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.28)}
                        />
                      ))}
                    </Bar>
                    {hasTarget && (
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke={theme.palette.text.secondary}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={false}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Stack>
        </Fade>
      )}
    </InsightSectionCard>
  );
}
