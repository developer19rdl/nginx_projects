import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SpeedIcon from '@mui/icons-material/Speed';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import BuildIcon from '@mui/icons-material/Build';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UpdateIcon from '@mui/icons-material/Update';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import HandymanIcon from '@mui/icons-material/Handyman';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import { alpha } from '@mui/material/styles';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import DowntimeDialog from '../components/DowntimeDialog';
import SettingsDialog from '../components/SettingsDialog';
import PasswordPromptDialog from '../components/PasswordPromptDialog';
import OeeRing, { oeeRingColorVars, oeeColor } from '../components/OeeRing';
import MenuActionCard from '../components/MenuActionCard';
import { usePlanningContext } from '../contexts/PlanningContext';
import { useMachines, useShiftSummary } from '../hooks/useMachinePlanning';
import { useMachineOee } from '../hooks/useMachineOee';

/** Which of the active shifts is happening right now, by comparing HH:mm:ss strings (which sort
 * correctly as plain strings) against each shift's start/end - handles shifts that cross
 * midnight (end time earlier than start time) too. Returns null if nothing matches (a gap
 * between shifts, or no shifts configured). */
function getCurrentShift(shiftOptions, now) {
  if (!shiftOptions?.length) return null;
  const nowStr = now.format('HH:mm:ss');
  return (
    shiftOptions.find((s) =>
      s.endTime > s.startTime ? nowStr >= s.startTime && nowStr < s.endTime : nowStr >= s.startTime || nowStr < s.endTime
    ) || null
  );
}

function formatDuration(totalMinutes) {
  const mins = Math.max(0, Math.round(totalMinutes || 0));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatRelative(date, now) {
  if (!date) return 'never';
  const diffSec = Math.max(0, now.diff(dayjs(date), 'second'));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m ago`;
}

const MENU_ITEMS = [
  {
    label: 'Machine Planning',
    description: 'Plan and allocate jobs to machines and shifts.',
    actionLabel: 'View Plans',
    color: 'primary',
    icon: <AssignmentOutlinedIcon />,
    decorIcon: CalendarMonthIcon,
    badgeIcon: SettingsIcon,
    path: '/plan',
  },
  {
    label: 'Checklist',
    description: 'View and complete machine checklists.',
    actionLabel: 'Open Checklist',
    color: 'success',
    icon: <ChecklistOutlinedIcon />,
    decorIcon: ContentPasteIcon,
    decorIconColor: 'success',
    badgeIcon: CheckIcon,
    path: '/checklist',
  },
  // Downtime opens as a modal (Start/resume the timer) rather than navigating to a page.
  {
    label: 'Downtime',
    description: 'Report and track downtime with real-time updates.',
    actionLabel: 'Report Now',
    color: 'warning',
    icon: <ReportProblemOutlinedIcon />,
    decorIcon: HandymanIcon,
    badgeIcon: AccessTimeIcon,
    key: 'downtime',
    modal: 'downtime',
  },
  // Settings opens as a modal (pick the device's Machine) rather than navigating to a page.
  {
    label: 'Settings',
    description: 'Manage machine settings.',
    actionLabel: 'Manage Settings',
    color: 'info',
    icon: <SettingsOutlinedIcon />,
    decorIcon: DesktopWindowsIcon,
    badgeIcon: SettingsIcon,
    key: 'settings',
    modal: 'settings',
  },
  {
    label: 'Operator Log',
    description: 'View your activity, shifts and operational history.',
    actionLabel: 'View Log',
    color: 'primary',
    icon: <PersonOutlinedIcon />,
    decorIcon: ContactPageIcon,
    badgeIcon: AccessTimeIcon,
    path: '/operator-log',
    fullWidth: true,
  },
];

// Maps the real machine.status enum to shop-floor-friendly labels/colors/icons. "Idle"/"Offline"
// are just friendlier names for Available/Inactive - not new states, everything here is real data.
const STATUS_META = {
  Running: { color: 'success', label: 'Running', icon: PlayCircleIcon },
  Available: { color: 'info', label: 'Idle', icon: PauseCircleIcon },
  Maintenance: { color: 'warning', label: 'Maintenance', icon: BuildIcon },
  Breakdown: { color: 'error', label: 'Breakdown', icon: ReportProblemIcon },
  Inactive: { color: 'default', label: 'Offline', icon: PowerSettingsNewIcon },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || { color: 'default', label: status || 'Unknown' };
  return (
    <Chip
      size="small"
      color={meta.color}
      label={meta.label}
      icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important' }} />}
      sx={{ fontWeight: 700 }}
    />
  );
}

function MetricTile({ icon, color, label, value, unit }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 2.5,
        bgcolor: (theme) => alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.16 : 0.06),
        boxShadow: (theme) => theme.shadows[2],
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" fontWeight={800} color={`${color}.main`}>
        {value ?? '—'}
        {unit && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.75, fontWeight: 600 }}>
            {unit}
          </Typography>
        )}
      </Typography>
    </Paper>
  );
}

function KpiCard({ icon, color, label, value, unit, sub, subColor }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 2.5, flex: 1, minWidth: 160, boxShadow: (theme) => theme.shadows[3] }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.15),
            color: `${color}.main`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h5" fontWeight={800} color={`${color}.main`}>
        {value}
        {unit && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 600 }}>
            {unit}
          </Typography>
        )}
      </Typography>
      {sub && (
        <Typography variant="caption" color={subColor || 'text.secondary'} sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.5 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

/** One of the three OEE sub-metrics (Availability/Performance/Quality) - big % value, a short
 * subtitle explaining what it measures, and a color-coded bar using the same green/amber/red
 * health bands as the OEE donut itself (see OeeRing.jsx#oeeColor). */
function OeeMetricTile({ label, subtitle, value }) {
  const color = oeeColor(value);
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, flex: 1, minWidth: 140 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} color={`${color}.main`} sx={{ lineHeight: 1.3 }}>
        {Math.round(value)}%
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {subtitle}
      </Typography>
      <LinearProgress variant="determinate" value={Math.min(100, value)} color={color} sx={{ height: 6, borderRadius: 3 }} />
    </Paper>
  );
}

function AdditionalInfoTile({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { machineId } = usePlanningContext();
  const { data: machines } = useMachines();
  const { data: shiftOptions } = useShiftSummary();
  const { data: oee, dataUpdatedAt } = useMachineOee(machineId ? Number(machineId) : undefined);
  const [downtimeOpen, setDowntimeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);

  // Re-evaluate "now" once a minute so the auto-detected current shift (and the "updated Xm ago"
  // captions) stay correct without a full clock tick.
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);

  const machine = machines?.data?.find((m) => String(m.id) === String(machineId));
  const currentShift = getCurrentShift(shiftOptions, now);

  const runtime = oee?.runtimeAnalytics;
  const runHoursLabel = formatDuration(runtime?.runningMinutes);
  const idleLabel = formatDuration(runtime?.idleMinutes);
  // Setup is folded into "Down Time" here - the operator's top-line summary keeps to the three
  // categories the redesign asked for, rather than also surfacing the changeover/setup split the
  // admin dashboard's Runtime Analytics donut shows.
  const downLabel = formatDuration((runtime?.downtimeMinutes || 0) + (runtime?.setupMinutes || 0));

  const statusMeta = STATUS_META[machine?.status] || { color: 'default', label: machine?.status || 'Unknown', icon: PowerSettingsNewIcon };
  const StatusIcon = statusMeta.icon;

  const oeeMetrics = oee?.oee;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={machine ? `${machine.machine_code} · ${machine.machine_name}` : 'Select a Machine'} />

      <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, width: '100%' }}>
        {!machineId ? null : !currentShift ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No shift is running right now - once one starts, live production numbers will appear here.
          </Alert>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              LIVE · {currentShift.shiftName} ({currentShift.startTime?.slice(0, 5)}–{currentShift.endTime?.slice(0, 5)})
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
              <KpiCard
                icon={<PlayCircleIcon fontSize="small" />}
                color="success"
                label="Run Hours"
                value={runHoursLabel}
                sub="Running this shift"
              />
              <KpiCard
                icon={<PauseCircleIcon fontSize="small" />}
                color="warning"
                label="Idle Time"
                value={idleLabel}
                sub="No work assigned"
              />
              <KpiCard
                icon={<BuildIcon fontSize="small" />}
                color="error"
                label="Down Time"
                value={downLabel}
                sub="Downtime + setup"
              />
              <KpiCard
                icon={<StatusIcon fontSize="small" />}
                color={statusMeta.color === 'default' ? 'secondary' : statusMeta.color}
                label="Device Status"
                value={statusMeta.label}
                sub={`Updated ${formatRelative(dataUpdatedAt, now)}`}
              />
            </Stack>
          </>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.35fr' }, gap: 3, alignItems: 'stretch' }}>
          {/* Left: menu - 3 equal-height rows (2x2 + the full-width Operator Log row) so this
              column's overall height naturally matches whatever height the stretched grid gives
              it, instead of packing tightly at the top and leaving a gap under it. */}
          <Box
            sx={{
              display: 'grid',
              // 2 columns needs real width for each card's title/description/CTA to stay legible -
              // below `sm` (narrow-tablet portrait, or this app opened on a phone-sized viewport)
              // stack to 1 column instead of squeezing both into half-width tiles.
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gridTemplateRows: { xs: 'auto', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {MENU_ITEMS.map((item) => (
              <MenuActionCard
                key={item.key || item.path}
                icon={item.icon}
                decorIcon={item.decorIcon}
                decorIconColor={item.decorIconColor}
                badgeIcon={item.badgeIcon}
                color={item.color}
                title={item.label}
                description={item.description}
                actionLabel={item.actionLabel}
                fullWidth={item.fullWidth}
                onClick={() => {
                  if (item.modal === 'downtime') setDowntimeOpen(true);
                  else if (item.modal === 'settings') setPasswordPromptOpen(true);
                  else navigate(item.path);
                }}
              />
            ))}
          </Box>

          {/* Right: OEE Performance */}
          <Paper
            variant="outlined"
            sx={[
              oeeRingColorVars,
              { p: 3.5, borderRadius: 3, boxShadow: (theme) => theme.shadows[4], height: '100%', boxSizing: 'border-box' },
            ]}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                  }}
                >
                  <DonutLargeIcon />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  OEE Performance
                </Typography>
              </Stack>
              {machine && <StatusPill status={machine.status} />}
            </Stack>

            {!machine ? (
              <Alert severity="info">Select a Machine above to see its details.</Alert>
            ) : (
              <Stack spacing={2.5}>
                {!currentShift || !oeeMetrics ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No shift is running right now - OEE will appear once one starts.
                  </Alert>
                ) : (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <OeeMetricTile label="Availability" subtitle="Run time vs. planned time" value={oeeMetrics.availabilityPercent} />
                      <OeeMetricTile label="Performance" subtitle="Actual vs. ideal rate" value={oeeMetrics.performancePercent} />
                      <OeeMetricTile label="Quality" subtitle="Accepted vs. inspected qty" value={oeeMetrics.qualityPercent} />
                    </Stack>

                    <Divider />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                      <OeeRing value={oeeMetrics.oeePercent} color={oeeColor(oeeMetrics.oeePercent)} />
                      <Box sx={{ flexGrow: 1, width: '100%' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                          <AdditionalInfoTile icon={<SpeedIcon fontSize="small" />} label="Production Rate" value={`${oeeMetrics.productionRate}/hr`} />
                          <AdditionalInfoTile icon={<Inventory2Icon fontSize="small" />} label="Capacity" value={oeeMetrics.capacityPerDay ? `${oeeMetrics.capacityPerDay}/day` : '—'} />
                          <AdditionalInfoTile icon={<UpdateIcon fontSize="small" />} label="Last Updated" value={formatRelative(dataUpdatedAt, now)} />
                        </Box>
                        <Stack direction="row" spacing={2}>
                          <MetricTile icon={<CheckCircleIcon fontSize="small" />} color="success" label="Good Count" value={oeeMetrics.goodCount} />
                          <MetricTile icon={<CancelIcon fontSize="small" />} color="error" label="Reject Count" value={oeeMetrics.rejectCount} />
                        </Stack>
                      </Box>
                    </Stack>
                  </>
                )}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>

      <BottomBar />

      <DowntimeDialog open={downtimeOpen} onClose={() => setDowntimeOpen(false)} machineId={machineId} />
      <PasswordPromptDialog
        open={passwordPromptOpen}
        onClose={() => setPasswordPromptOpen(false)}
        onVerified={() => {
          setPasswordPromptOpen(false);
          setSettingsOpen(true);
        }}
      />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}
