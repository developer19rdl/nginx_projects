import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { higherIsBetter, lowerIsBetter } from '../../../utils/health';
import { formatDuration } from '../../../utils/dashboardFormat';

const HEALTH_DOT = { success: '🟢', warning: '🟡', error: '🔴', default: '⚪' };

function KpiTile({ icon, color, label, value, caption }) {
  const dot = HEALTH_DOT[color] || HEALTH_DOT.default;
  return (
    <Box
      sx={{
        flex: '1 1 0',
        minWidth: 150,
        p: 1.5,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: (theme) => (color === 'default' ? theme.palette.divider : alpha(theme.palette[color].main, 0.3)),
        bgcolor: (theme) => (color === 'default' ? 'background.paper' : alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.12 : 0.06)),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary', mb: 0.5 }}>
        <Box sx={{ display: 'flex', color: color === 'default' ? 'text.secondary' : `${color}.main` }}>{icon}</Box>
        <Typography variant="caption" fontWeight={600} noWrap sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 10, lineHeight: 1 }}>{dot}</Typography>
      </Stack>
      <Typography variant="h6" fontWeight={800} noWrap sx={{ color: color === 'default' ? 'text.primary' : `${color}.main` }}>
        {value}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
}

const STATUS_META = {
  Running: { label: 'Running', color: 'success' },
  Available: { label: 'Idle', color: 'warning' },
  Maintenance: { label: 'Maintenance', color: 'warning' },
  Breakdown: { label: 'Breakdown', color: 'error' },
  Inactive: { label: 'Offline', color: 'error' },
};

/**
 * The always-visible KPI summary row: OEE/Availability/Performance/Quality (from the current
 * shift's real OEE calc), current machine status, current shift's produced-vs-target, and today's
 * total downtime so far - the 7 numbers a supervisor should be able to read without scrolling.
 * Every tile carries its own 🟢/🟡/🔴 health dot on the same thresholds (see utils/health.js) so
 * the row reads consistently left to right.
 */
export default function MachineKpiStrip({ machine, oee, currentShiftProduction, todayTotals }) {
  const statusMeta = STATUS_META[machine?.status] || { label: machine?.status || 'Unknown', color: 'default' };
  const hasOee = oee != null;

  const shiftTargetQty = currentShiftProduction?.targetQty || 0;
  const shiftProducedQty = currentShiftProduction?.producedQty || 0;
  // Reuse the backend's already-capped efficiencyPercent rather than recomputing the ratio here -
  // one source of truth, and it's already clamped to 100% (see machineInsights.service.js#clampPercent).
  const shiftPercent = shiftTargetQty > 0 ? currentShiftProduction.efficiencyPercent : null;

  const todayDowntimeMinutes = (todayTotals?.downtimeMinutes || 0) + (todayTotals?.setupMinutes || 0);

  return (
    <Stack direction="row" flexWrap="wrap" spacing={1.5} useFlexGap sx={{ mb: 3 }}>
      <KpiTile
        icon={<DonutLargeIcon fontSize="small" />}
        color={hasOee ? higherIsBetter(oee.oeePercent, { warn: 40, good: 70 }) : 'default'}
        label="OEE"
        value={hasOee ? `${Math.round(oee.oeePercent)}%` : '—'}
        caption="This shift"
      />
      <KpiTile
        icon={<EventAvailableIcon fontSize="small" />}
        color={hasOee ? higherIsBetter(oee.availabilityPercent, { warn: 60, good: 85 }) : 'default'}
        label="Availability"
        value={hasOee ? `${Math.round(oee.availabilityPercent)}%` : '—'}
      />
      <KpiTile
        icon={<SpeedIcon fontSize="small" />}
        color={hasOee ? higherIsBetter(oee.performancePercent, { warn: 60, good: 85 }) : 'default'}
        label="Performance"
        value={hasOee ? `${Math.round(oee.performancePercent)}%` : '—'}
      />
      <KpiTile
        icon={<VerifiedIcon fontSize="small" />}
        color={hasOee ? higherIsBetter(oee.qualityPercent, { warn: 90, good: 98 }) : 'default'}
        label="Quality"
        value={hasOee ? `${Math.round(oee.qualityPercent)}%` : '—'}
      />
      <KpiTile
        icon={<PlayCircleIcon fontSize="small" />}
        color={statusMeta.color}
        label="Machine Status"
        value={statusMeta.label}
      />
      <KpiTile
        icon={<Inventory2Icon fontSize="small" />}
        color={shiftPercent != null ? higherIsBetter(shiftPercent, { warn: 80, good: 100 }) : 'default'}
        label="Shift Production"
        value={shiftTargetQty > 0 ? `${shiftProducedQty.toLocaleString()} / ${shiftTargetQty.toLocaleString()}` : '—'}
        caption={shiftPercent != null ? `${shiftPercent}% of target` : undefined}
      />
      <KpiTile
        icon={<ReportProblemIcon fontSize="small" />}
        color={lowerIsBetter(todayDowntimeMinutes, { warn: 30, critical: 120 })}
        label="Today's Downtime"
        value={formatDuration(todayDowntimeMinutes)}
      />
    </Stack>
  );
}
