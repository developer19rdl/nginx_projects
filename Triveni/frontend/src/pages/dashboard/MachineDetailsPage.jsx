import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMachineInsights } from '../../hooks/useDashboard';
import MachineKpiStrip from '../../components/dashboard/insights/MachineKpiStrip';
import LiveProductionSection from '../../components/dashboard/insights/LiveProductionSection';
import RuntimeAnalyticsSection from '../../components/dashboard/insights/RuntimeAnalyticsSection';
import OeeDashboardSection from '../../components/dashboard/insights/OeeDashboardSection';
import ProductionTrendSection from '../../components/dashboard/insights/ProductionTrendSection';
import DowntimeTrendsSection from '../../components/dashboard/insights/DowntimeTrendsSection';
import ShiftPerformanceSection from '../../components/dashboard/insights/ShiftPerformanceSection';
import ReliabilityStatsSection from '../../components/dashboard/insights/ReliabilityStatsSection';

const STATUS_CHIP_COLOR = {
  Running: 'success',
  Available: 'default',
  Maintenance: 'warning',
  Breakdown: 'error',
  Inactive: 'default',
};

/**
 * 360° single-machine drill-down: a dedicated page (not a modal) reached by clicking a machine
 * card on the Production Floor dashboard. A KPI summary row up top (visible without scrolling on
 * most screens) followed by a 2x3 analytics grid - Live Production/Runtime/OEE, then Production
 * Trend/Downtime Trends/Shift Performance - and a bottom row of reliability/utilization insights.
 * Polls independently of the floor grid (see useMachineInsights) at its own, slower cadence.
 */
export default function MachineDetailsPage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } = useMachineInsights(Number(machineId));

  const currentShiftProduction = data?.shiftPerformance?.find((s) => s.isCurrent) || null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Tooltip title="Back to Production Floor">
            <IconButton onClick={() => navigate('/dashboard')}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
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
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={800} noWrap>
                {data?.machine ? `${data.machine.machineCode} · ${data.machine.machineName}` : 'Machine Details'}
              </Typography>
              {data?.machine?.status && (
                <Chip
                  size="small"
                  color={STATUS_CHIP_COLOR[data.machine.status] === 'default' ? undefined : STATUS_CHIP_COLOR[data.machine.status]}
                  label={data.machine.status}
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              360° performance overview · live &amp; today
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Refresh now">
          <IconButton size="small" onClick={() => refetch()}>
            <RefreshIcon fontSize="small" sx={{ animation: isFetching ? 'spin 0.8s linear infinite' : 'none', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading && !data ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
          <CircularProgress />
        </Stack>
      ) : !data ? (
        <Alert severity="error">Couldn't load this machine's insights.</Alert>
      ) : (
        <>
          <MachineKpiStrip
            machine={data.machine}
            oee={data.oee}
            currentShiftProduction={currentShiftProduction}
            todayTotals={data.todayTotals}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
              gap: 2.5,
              alignItems: 'stretch',
              mb: 2.5,
            }}
          >
            <LiveProductionSection data={data.liveProduction} />
            <RuntimeAnalyticsSection data={data.runtimeAnalytics} />
            <OeeDashboardSection data={data.oee} />
            <ProductionTrendSection machineId={Number(machineId)} />
            <DowntimeTrendsSection machineId={Number(machineId)} />
            <ShiftPerformanceSection shifts={data.shiftPerformance} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
            <ReliabilityStatsSection todayTotals={data.todayTotals} reliability={data.reliability} />
          </Box>
        </>
      )}
    </Box>
  );
}
