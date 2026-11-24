import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import InsightSectionCard from './InsightSectionCard';
import { formatDuration } from '../../../utils/dashboardFormat';

// Distinct from the machine card's badge palette (which keeps Idle neutral gray) - here all four
// time categories need to read apart from each other at a glance in one chart, so Idle gets amber
// ("warning/idle" per the palette guideline) and Setup a plain blue (a planned, neutral activity).
const SEGMENTS = [
  { key: 'runningMinutes', label: 'Running', color: 'success' },
  { key: 'idleMinutes', label: 'Idle', color: 'warning' },
  { key: 'downtimeMinutes', label: 'Downtime', color: 'error' },
  { key: 'setupMinutes', label: 'Setup', color: 'primary' },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 1.25, py: 0.75, boxShadow: 3 }}>
      <Typography variant="caption" fontWeight={700}>
        {name}: {formatDuration(value)}
      </Typography>
    </Box>
  );
}

/** Section 2: a Running/Idle/Downtime/Setup donut for whichever shift is happening right now -
 * Setup is split out of Downtime because it's a real, distinct downtime_reasons entry
 * ("Changeover / Setup"), not because the schema tracks it separately end-to-end. */
export default function RuntimeAnalyticsSection({ data }) {
  const theme = useTheme();
  if (!data) return null;

  if (!data.shift) {
    return (
      <InsightSectionCard icon={<DonutLargeIcon fontSize="small" />} title="Runtime Analytics">
        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No shift is running right now.
          </Typography>
        </Stack>
      </InsightSectionCard>
    );
  }

  const chartData = SEGMENTS.map((s) => ({ ...s, value: Number(data[s.key]) || 0 })).filter((s) => s.value > 0);
  const total = SEGMENTS.reduce((sum, s) => sum + (Number(data[s.key]) || 0), 0);

  return (
    <InsightSectionCard
      icon={<DonutLargeIcon fontSize="small" />}
      title="Runtime Analytics"
      action={<Chip size="small" color="primary" label={data.shift.name} sx={{ fontWeight: 700 }} />}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ height: '100%' }}>
        <Box sx={{ width: 160, height: 160, position: 'relative', flexShrink: 0 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none">
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={theme.palette[entry.color].main} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '10px solid',
                borderColor: 'divider',
              }}
            />
          )}
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight={800}>
              {formatDuration(total)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Elapsed
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.25} sx={{ width: '100%', flexGrow: 1 }}>
          {SEGMENTS.map((s) => (
            <Stack key={s.key} direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: `${s.color}.main` }} />
                <Typography variant="body2" color="text.secondary">
                  {s.label}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight={700}>
                {formatDuration(data[s.key])}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </InsightSectionCard>
  );
}
