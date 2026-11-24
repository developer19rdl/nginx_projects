import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoryIcon from '@mui/icons-material/History';
import EfficiencyRing, { ringColorVars } from './EfficiencyRing';
import { formatDuration, formatRelative } from '../../utils/dashboardFormat';

// Badge-only color coding: green is reserved for "Running" (a genuinely good state), amber for
// Maintenance, red for Breakdown/Down, and Idle/Offline are neutral gray - not blue - so green
// and blue aren't spread across every card the way an earlier pass over-used them.
const STATUS_META = {
  Running: { color: 'success', label: 'Running' },
  Available: { color: 'default', label: 'Idle' },
  Maintenance: { color: 'warning', label: 'Maintenance' },
  Breakdown: { color: 'error', label: 'Breakdown' },
  Inactive: { color: 'default', label: 'Offline' },
};

/** A small, static status dot - "running"/"down right now" is already communicated by the status
 * Chip itself; this is just a quiet visual accent next to it, not a pulsing/glowing indicator. */
function LiveDot({ color }) {
  return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${color}.main` }} />;
}

function StatTile({ icon, label, value, accent }) {
  const theme = useTheme();
  const color = theme.palette[accent]?.main || accent;
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, p: 1.25, borderRadius: '12px', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.15),
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

/**
 * One machine's live status: a flat white/paper card with a light-gray border and a soft neutral
 * shadow - status is communicated only through the chip badge and the (blue/green) efficiency
 * ring, not by tinting the whole card, so a floor full of "Running" machines doesn't turn the
 * dashboard into a wall of green. Runtime/Downtime/Produced/Target are "since midnight today" (see
 * dashboard.service.js#getMachineLiveStatus); the OEE ring is a separate, shift-scoped figure for
 * whichever shift is happening right now - the same two-windows convention the on-demand Machine
 * Insights panel already uses (liveProduction vs oee), just surfaced here too.
 */
export default function MachineCard({ machine, now, onClick }) {
  const meta = STATUS_META[machine.status] || { color: 'default', label: machine.status || 'Unknown' };
  // An active downtime log is the ground truth for "is this machine actually stopped right now" -
  // machines.status is a separately-set master field that isn't auto-synced with downtime start/end.
  const statusColor = machine.isDown ? 'error' : meta.color;
  const statusLabel = machine.isDown ? 'Down' : meta.label;
  const hasOee = machine.oeePercent != null;
  // Ring: blue while on track, green only once real OEE actually clears 100% - green is reserved
  // for a genuine "done/succeeding" signal instead of decorating every card. Gray/dash only when
  // there's no shift covering right now at all (a gap between shifts), not merely a low reading -
  // a genuinely idle machine still gets a real (low) OEE number, not a blank dash.
  const ringColor = !hasOee ? 'default' : machine.oeePercent >= 100 ? 'success' : 'primary';
  // A running machine gets a highlighted blue ring border so it stands out on a busy floor grid -
  // every other state (Idle/Down/Maintenance) keeps the plain neutral outline.
  const isRunning = machine.status === 'Running' && !machine.isDown;

  const vsTargetPercent =
    machine.targetQty > 0 ? Math.round(((machine.producedQty - machine.targetQty) / machine.targetQty) * 1000) / 10 : null;

  return (
    <Box
      onClick={onClick}
      sx={[
        ringColorVars,
        {
          position: 'relative',
          borderRadius: '16px',
          p: 2.5,
          border: isRunning ? '2px solid' : '1px solid',
          borderColor: isRunning ? 'primary.main' : 'divider',
          bgcolor: 'background.paper',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'border-color 0.2s ease',
          '&:hover': { borderColor: 'primary.main' },
        },
      ]}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <SettingsIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ fontFamily: '"JetBrains Mono", "Roboto Mono", monospace', letterSpacing: -0.3, color: 'text.primary', lineHeight: 1.2 }}
              noWrap
            >
              {machine.machineCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 190 }}>
              {machine.machineName}
            </Typography>
          </Box>
        </Stack>
        <Chip
          size="small"
          color={statusColor === 'default' ? undefined : statusColor}
          icon={machine.status === 'Running' || machine.isDown ? <LiveDot color={machine.isDown ? 'error' : 'success'} /> : undefined}
          label={statusLabel}
          sx={{ fontWeight: 700, flexShrink: 0, '& .MuiChip-icon': { ml: 1 } }}
        />
      </Stack>

      {machine.isDown && (
        <Tooltip title={machine.activeDowntimeStartedAt ? `Since ${dayjs(machine.activeDowntimeStartedAt).format('HH:mm')}` : ''}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              mb: 1.5,
              px: 1,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
              color: 'error.main',
              width: 'fit-content',
              maxWidth: '100%',
            }}
          >
            <ReportProblemIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption" fontWeight={700} noWrap>
              {machine.activeDowntimeReason || 'Downtime in progress'}
            </Typography>
          </Stack>
        </Tooltip>
      )}

      <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 2.5 }}>
        <EfficiencyRing
          value={machine.oeePercent}
          color={ringColor}
          size={112}
          thickness={9}
          label={hasOee ? `${Math.round(machine.oeePercent)}%` : '—'}
          sub="OEE"
          glow={hasOee}
        />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Produced / Target
          </Typography>
          <Typography variant="h5" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
            {machine.producedQty.toLocaleString()}
            <Typography component="span" variant="body1" color="text.secondary" fontWeight={600}>
              {' '}/ {machine.targetQty > 0 ? machine.targetQty.toLocaleString() : '—'}
            </Typography>
          </Typography>
          {vsTargetPercent != null && (
            <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: vsTargetPercent >= 0 ? 'success.main' : 'error.main' }}>
              {vsTargetPercent >= 0 ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
              <Typography variant="caption" fontWeight={700}>
                {vsTargetPercent >= 0 ? '+' : ''}
                {vsTargetPercent}% vs target
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.25,
          p: 1,
          borderRadius: '14px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.04) : 'grey.50'),
        }}
      >
        <StatTile icon={<ScheduleIcon sx={{ fontSize: 16 }} />} label="Runtime" value={formatDuration(machine.runtimeMinutes)} accent="primary" />
        <StatTile
          icon={<ReportProblemIcon sx={{ fontSize: 16 }} />}
          label="Downtime"
          value={machine.downtimeMinutes > 0 ? formatDuration(machine.downtimeMinutes) : '0m'}
          accent="error"
        />
        <StatTile
          icon={<EventAvailableIcon sx={{ fontSize: 16 }} />}
          label="Availability"
          value={machine.availabilityPercent != null ? `${Math.round(machine.availabilityPercent)}%` : '—'}
          accent="info"
        />
        <StatTile
          icon={<SpeedIcon sx={{ fontSize: 16 }} />}
          label="Performance"
          value={machine.performancePercent != null ? `${Math.round(machine.performancePercent)}%` : '—'}
          accent="warning"
        />
      </Box>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.5, color: 'text.secondary' }}>
        <HistoryIcon sx={{ fontSize: 14 }} />
        <Typography variant="caption">Updated {formatRelative(machine.lastUpdate, now)}</Typography>
      </Stack>
    </Box>
  );
}
