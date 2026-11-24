import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { alpha } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import KpiCard from '../../components/common/KpiCard';
import MachineCard from '../../components/dashboard/MachineCard';
import { useMachinesLive } from '../../hooks/useDashboard';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'idle', label: 'Idle' },
  { value: 'down', label: 'Down' },
];

export default function ProductionDashboard() {
  const navigate = useNavigate();
  const { data: machines, isLoading } = useMachinesLive();
  const [statusFilter, setStatusFilter] = useState('all');

  // Ticks every 30s purely to re-render each machine card's "Updated Xm ago" label - the actual
  // data refetches on its own 10s interval (useMachinesLive), this is just for display freshness.
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(timer);
  }, []);

  const rows = machines || [];
  const runningCount = rows.filter((m) => m.status === 'Running' && !m.isDown).length;
  const idleCount = rows.filter((m) => m.status === 'Available' && !m.isDown).length;
  const downCount = rows.filter((m) => m.isDown).length;
  // Real Availability x Performance x Quality OEE (see dashboard.service.js#getMachineLiveStatus),
  // averaged across whichever machines have one right now - null (excluded, not zero) for a
  // machine sitting in a gap between shifts, same "don't let a non-answer drag the average down"
  // reasoning the old target-based Avg. Efficiency card used for machines with no target.
  const withOee = rows.filter((m) => m.oeePercent != null);
  const avgOee = withOee.length ? Math.round((withOee.reduce((sum, m) => sum + m.oeePercent, 0) / withOee.length) * 10) / 10 : 0;

  const filterCounts = { all: rows.length, running: runningCount, idle: idleCount, down: downCount };
  const filteredRows = useMemo(() => {
    if (statusFilter === 'running') return rows.filter((m) => m.status === 'Running' && !m.isDown);
    if (statusFilter === 'idle') return rows.filter((m) => m.status === 'Available' && !m.isDown);
    if (statusFilter === 'down') return rows.filter((m) => m.isDown);
    return rows;
  }, [rows, statusFilter]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            <SettingsIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Production Floor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live status across {rows.length} active machine{rows.length === 1 ? '' : 's'} · today, since midnight
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <KpiCard
          icon={<PlayCircleIcon fontSize="small" />}
          color="primary"
          label="Running Machines"
          value={`${runningCount} / ${rows.length}`}
          caption="Machines actively producing"
        />
        <KpiCard
          icon={<PauseCircleIcon fontSize="small" />}
          color="warning"
          label="Idle Machines"
          value={idleCount}
          caption="Available, not producing"
        />
        <KpiCard
          icon={<ReportProblemIcon fontSize="small" />}
          color="error"
          label="Down Machines"
          value={downCount}
          caption={downCount > 0 ? 'Needs attention' : 'No active downtime'}
        />
        <KpiCard
          icon={<TaskAltIcon fontSize="small" />}
          color="success"
          label="OEE Efficiency"
          value={`${avgOee}%`}
          caption="Real OEE, machines in a shift right now"
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Machines
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={statusFilter}
          exclusive
          onChange={(e, val) => val && setStatusFilter(val)}
          sx={{
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.04) : 'grey.100'),
            borderRadius: '10px',
            p: 0.5,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '8px !important',
              px: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
            },
          }}
        >
          {STATUS_FILTERS.map((f) => (
            <ToggleButton key={f.value} value={f.value}>
              {f.label} ({filterCounts[f.value]})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {isLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      ) : rows.length === 0 ? (
        <Alert severity="info" icon={<PrecisionManufacturingIcon fontSize="inherit" />}>
          No active machines found. Add machines under Machines to see them here.
        </Alert>
      ) : filteredRows.length === 0 ? (
        <Alert severity="info" icon={<PrecisionManufacturingIcon fontSize="inherit" />}>
          No machines match this filter right now.
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2.5,
          }}
        >
          {filteredRows.map((machine) => (
            <MachineCard key={machine.id} machine={machine} now={now} onClick={() => navigate(`/dashboard/machines/${machine.id}`)} />
          ))}
        </Box>
      )}
    </Box>
  );
}
