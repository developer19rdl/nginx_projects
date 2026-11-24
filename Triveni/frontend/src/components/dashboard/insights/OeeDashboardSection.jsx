import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import EfficiencyRing, { ringColorVars } from '../EfficiencyRing';
import { higherIsBetter } from '../../../utils/health';
import InsightSectionCard from './InsightSectionCard';

function FactorBar({ label, value, thresholds }) {
  const color = higherIsBetter(value, thresholds);
  const barColor = color === 'default' ? 'grey.400' : `${color}.main`;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: color === 'default' ? 'text.primary' : `${color}.main` }}>
          {value != null ? `${Math.round(value)}%` : '—'}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, value ?? 0))}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.08),
          '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: barColor },
        }}
      />
    </Box>
  );
}

/** Section: real Availability x Performance x Quality OEE for whichever shift is happening right
 * now - a gauge for the headline number plus each factor broken out as its own bar, so a low OEE
 * is immediately traceable to which factor is actually dragging it down. Same data as the KPI
 * strip's top row, just with the per-factor breakdown a single number can't show. */
export default function OeeDashboardSection({ data }) {
  if (!data) {
    return (
      <InsightSectionCard icon={<DonutLargeIcon fontSize="small" />} title="OEE Dashboard">
        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No shift is running right now.
          </Typography>
        </Stack>
      </InsightSectionCard>
    );
  }

  const { oeePercent, availabilityPercent, performancePercent, qualityPercent, goodCount, rejectCount } = data;
  const ringColor = higherIsBetter(oeePercent, { warn: 40, good: 70 });

  return (
    <InsightSectionCard icon={<DonutLargeIcon fontSize="small" />} title="OEE Dashboard">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
        <Box sx={ringColorVars}>
          <EfficiencyRing
            value={oeePercent}
            color={ringColor === 'default' ? 'default' : ringColor}
            size={112}
            thickness={9}
            label={`${Math.round(oeePercent)}%`}
            sub="OEE"
            glow={ringColor !== 'default'}
          />
        </Box>
        <Stack spacing={1.5} sx={{ width: '100%', flexGrow: 1 }}>
          <FactorBar label="Availability" value={availabilityPercent} thresholds={{ warn: 60, good: 85 }} />
          <FactorBar label="Performance" value={performancePercent} thresholds={{ warn: 60, good: 85 }} />
          <FactorBar label="Quality" value={qualityPercent} thresholds={{ warn: 90, good: 98 }} />
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Chip size="small" color="success" variant="outlined" label={`Good: ${goodCount.toLocaleString()}`} sx={{ fontWeight: 700 }} />
        <Chip size="small" color="error" variant="outlined" label={`Reject: ${rejectCount.toLocaleString()}`} sx={{ fontWeight: 700 }} />
      </Stack>
    </InsightSectionCard>
  );
}
