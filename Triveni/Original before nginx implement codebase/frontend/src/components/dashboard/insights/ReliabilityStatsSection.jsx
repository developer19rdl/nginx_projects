import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PercentIcon from '@mui/icons-material/Percent';
import TimerIcon from '@mui/icons-material/Timer';
import HandymanIcon from '@mui/icons-material/Handyman';
import InsightSectionCard from './InsightSectionCard';
import { formatDuration } from '../../../utils/dashboardFormat';
import { higherIsBetter } from '../../../utils/health';

function StatBlock({ icon, color, label, value, caption }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{
        p: 1.5,
        borderRadius: '12px',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.04) : 'grey.50'),
        flex: 1,
        minWidth: 150,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette[color]?.main || theme.palette.text.primary, 0.15),
          color: color ? `${color}.main` : 'text.secondary',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight={800} noWrap>
          {value}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {caption}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/** Section: Machine Utilization (today) + MTBF/MTTR (trailing window) - the "how reliable/well-
 * used is this machine" numbers that don't fit neatly into any of the shift-scoped sections above.
 * MTBF/MTTR are null (not zero) when the window has no failures - shown as "No failures" rather
 * than a misleading 0. */
export default function ReliabilityStatsSection({ todayTotals, reliability }) {
  if (!todayTotals || !reliability) return null;
  const { utilizationPercent } = todayTotals;
  const { mtbfMinutes, mttrMinutes, failureCount, windowDays } = reliability;

  return (
    <InsightSectionCard icon={<BuildCircleIcon fontSize="small" />} title="Reliability & Utilization">
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
        <StatBlock
          icon={<PercentIcon fontSize="small" />}
          color={higherIsBetter(utilizationPercent, { warn: 40, good: 70 })}
          label="Machine Utilization"
          value={`${Math.round(utilizationPercent)}%`}
          caption="Today, running / elapsed"
        />
        <StatBlock
          icon={<TimerIcon fontSize="small" />}
          color={failureCount > 0 ? 'primary' : 'default'}
          label="MTBF"
          value={mtbfMinutes != null ? formatDuration(mtbfMinutes) : '—'}
          caption={failureCount > 0 ? `Last ${windowDays} days` : 'No failures recorded'}
        />
        <StatBlock
          icon={<HandymanIcon fontSize="small" />}
          color={failureCount > 0 ? 'primary' : 'default'}
          label="MTTR"
          value={mttrMinutes != null ? formatDuration(mttrMinutes) : '—'}
          caption={failureCount > 0 ? `${failureCount} failure${failureCount === 1 ? '' : 's'}` : 'No failures recorded'}
        />
      </Stack>
    </InsightSectionCard>
  );
}
