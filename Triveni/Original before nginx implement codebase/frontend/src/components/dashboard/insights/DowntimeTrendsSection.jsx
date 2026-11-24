import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Fade from '@mui/material/Fade';
import { useTheme, alpha } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InsightSectionCard from './InsightSectionCard';
import { useDowntimeTrends } from '../../../hooks/useDashboard';
import { formatDuration } from '../../../utils/dashboardFormat';
import { lowerIsBetter } from '../../../utils/health';

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];
const PALETTE_KEYS = ['error', 'warning', 'primary', 'info', 'success'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 1.25, py: 0.75, boxShadow: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {formatDuration(payload[0].value)}
      </Typography>
    </Box>
  );
}

function MiniStat({ icon, color, label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.6} alignItems="center" sx={{ color: 'text.secondary', mb: 0.25 }}>
        {icon}
        <Typography variant="caption" fontWeight={600} noWrap>
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: color ? `${color}.main` : 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

function TopReasonsList({ topReasons, dayLabel }) {
  if (!topReasons?.length) return null;
  const maxMinutes = Math.max(1, ...topReasons.map((r) => r.minutes));
  return (
    <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {dayLabel}
      </Typography>
      {topReasons.slice(0, 4).map((r, i) => (
        <Box key={r.reasonName}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
            <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '65%' }}>
              {r.reasonName}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {formatDuration(r.minutes)}
              {r.daysAffected != null ? ` · ${r.daysAffected}d` : ` · ${r.count}x`}
            </Typography>
          </Stack>
          <Box sx={{ height: 6, borderRadius: 3, bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.08) }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.round((r.minutes / maxMinutes) * 100)}%`,
                borderRadius: 3,
                bgcolor: (theme) => theme.palette[PALETTE_KEYS[i % PALETTE_KEYS.length]].main,
                transition: 'width 0.4s ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function ChartSkeleton() {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="text" width={70} height={36} />
        <Skeleton variant="text" width={70} height={36} />
        <Skeleton variant="text" width={70} height={36} />
      </Stack>
      <Skeleton variant="rounded" height={170} />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="70%" />
    </Stack>
  );
}

/**
 * Section: downtime over a user-chosen period (Today/Weekly/Monthly, pill selector top-right of
 * the card) - its own independently-fetched query (see useDowntimeTrends), so switching periods
 * doesn't touch the rest of the Machine Details page. Every period renders as a bar chart (hourly
 * bars for Today, day/week bars for Weekly/Monthly) and has its own relevant stats, per the brief -
 * a skeleton replaces the whole body while a period's data is (re)loading, and the chart is
 * remounted (via `key={period}`) on every switch so Recharts' entrance animation plays cleanly
 * instead of trying to morph between two differently-shaped charts.
 */
export default function DowntimeTrendsSection({ machineId }) {
  const theme = useTheme();
  const [period, setPeriod] = useState('today');
  const { data, isFetching } = useDowntimeTrends(machineId, period);

  const chartData = data?.chart || [];
  const hasData = chartData.some((d) => d.minutes > 0);

  return (
    <InsightSectionCard
      icon={<TimelineIcon fontSize="small" />}
      title="Downtime Trends"
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          {/* A quiet pulse for a background refresh once data already exists - the skeleton is
              reserved for an actual period switch, this is just "still live" reassurance. */}
          {isFetching && data && (
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'success.main',
                animation: 'downtime-trends-pulse 1.4s ease-in-out infinite',
                '@keyframes downtime-trends-pulse': { '0%,100%': { opacity: 0.3 }, '50%': { opacity: 1 } },
              }}
            />
          )}
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
        </Stack>
      }
    >
      {/* Only the initial load of a period (no cached data for this key yet) shows the skeleton -
          the 30s background refresh once data exists updates in place without re-flashing it. */}
      {!data ? (
        <ChartSkeleton />
      ) : (
        <Fade in key={period} timeout={350}>
          <Box>
            {period === 'today' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
                <MiniStat icon={<ScheduleIcon sx={{ fontSize: 14 }} />} label="Total Downtime" value={formatDuration(data.totalDowntimeMinutes)} />
                <MiniStat icon={<ReportProblemIcon sx={{ fontSize: 14 }} />} label="Events" value={data.eventCount} />
                <MiniStat
                  icon={<HourglassBottomIcon sx={{ fontSize: 14 }} />}
                  label="Longest Event"
                  value={data.longestEvent ? formatDuration(data.longestEvent.minutes) : '—'}
                />
                <MiniStat
                  icon={<EventAvailableIcon sx={{ fontSize: 14 }} />}
                  color={data.availabilityPercent >= 85 ? 'success' : data.availabilityPercent >= 60 ? 'warning' : 'error'}
                  label="Availability"
                  value={`${Math.round(data.availabilityPercent)}%`}
                />
              </Box>
            )}
            {period === 'weekly' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                <MiniStat icon={<ScheduleIcon sx={{ fontSize: 14 }} />} label="Total This Week" value={formatDuration(data.totalDowntimeMinutes)} />
                <MiniStat icon={<ReportProblemIcon sx={{ fontSize: 14 }} />} label="Avg Daily" value={formatDuration(data.avgDailyDowntimeMinutes)} />
              </Box>
            )}
            {period === 'monthly' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                <MiniStat icon={<ScheduleIcon sx={{ fontSize: 14 }} />} label="Total This Month" value={formatDuration(data.totalDowntimeMinutes)} />
                <MiniStat icon={<ReportProblemIcon sx={{ fontSize: 14 }} />} label="Avg / Day" value={formatDuration(data.avgDowntimePerDay)} />
                <MiniStat
                  icon={
                    data.comparisonWithPreviousMonth.changePercent == null ? null : data.comparisonWithPreviousMonth.changePercent <= 0 ? (
                      <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  color={
                    data.comparisonWithPreviousMonth.changePercent == null
                      ? undefined
                      : lowerIsBetter(data.comparisonWithPreviousMonth.changePercent, { warn: 0, critical: 20 })
                  }
                  label="vs Last Month"
                  value={
                    data.comparisonWithPreviousMonth.changePercent == null
                      ? 'N/A'
                      : `${data.comparisonWithPreviousMonth.changePercent > 0 ? '+' : ''}${data.comparisonWithPreviousMonth.changePercent}%`
                  }
                />
              </Box>
            )}

            {!hasData ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No downtime recorded in this period.
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={alpha(theme.palette.text.primary, 0.08)} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: period === 'today' ? 10 : 11, fill: theme.palette.text.secondary }}
                      axisLine={false}
                      tickLine={false}
                      interval={period === 'today' ? 2 : 0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.error.main, 0.08) }} />
                    <Bar dataKey="minutes" fill={theme.palette.error.main} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            <TopReasonsList
              topReasons={data.topReasons}
              dayLabel={period === 'today' ? 'Top Reasons' : period === 'weekly' ? 'Top Recurring Reasons' : 'Downtime by Reason'}
            />
          </Box>
        </Fade>
      )}
    </InsightSectionCard>
  );
}
