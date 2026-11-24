import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FlagIcon from '@mui/icons-material/Flag';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import SpeedIcon from '@mui/icons-material/Speed';
import BoltIcon from '@mui/icons-material/Bolt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InsightSectionCard from './InsightSectionCard';
import { formatClockTime } from '../../../utils/dashboardFormat';

function MiniStat({ icon, color = 'primary', label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: (theme) => alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
          color: `${color}.main`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} noWrap sx={{ color: `${color}.main`, lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

/** Section 1: produced/target/remaining/efficiency/rate/ETA for whichever shift is happening
 * right now on this machine - the same current-shift figures shiftPerformance computes per shift,
 * just surfaced as six focused headline tiles. Zero/blank during a gap between shifts, same as
 * the OEE section. */
export default function LiveProductionSection({ data }) {
  if (!data) return null;
  const { producedQty, targetQty, remainingQty, efficiencyPercent, currentRatePerHour, estimatedCompletion } = data;

  const etaLabel = targetQty <= 0 ? '—' : remainingQty <= 0 ? 'Completed' : estimatedCompletion ? formatClockTime(estimatedCompletion) : '—';

  return (
    <InsightSectionCard icon={<Inventory2Icon fontSize="small" />} title="Live Production">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        <MiniStat icon={<Inventory2Icon fontSize="small" />} label="Produced Quantity" value={producedQty.toLocaleString()} />
        <MiniStat icon={<FlagIcon fontSize="small" />} label="Target Quantity" value={targetQty > 0 ? targetQty.toLocaleString() : '—'} />
        <MiniStat icon={<HourglassBottomIcon fontSize="small" />} label="Remaining Quantity" value={targetQty > 0 ? remainingQty.toLocaleString() : '—'} />
        <MiniStat
          icon={<SpeedIcon fontSize="small" />}
          color={efficiencyPercent >= 100 ? 'success' : 'primary'}
          label="Production Efficiency"
          value={targetQty > 0 ? `${Math.round(efficiencyPercent)}%` : '—'}
        />
        <MiniStat icon={<BoltIcon fontSize="small" />} label="Current Rate" value={currentRatePerHour > 0 ? `${currentRatePerHour}/hr` : '—'} />
        <MiniStat icon={<EventAvailableIcon fontSize="small" />} label="Est. Completion" value={etaLabel} />
      </Box>
    </InsightSectionCard>
  );
}
