import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DataTable from '../../components/common/DataTable';
import KpiCard from '../../components/common/KpiCard';
import StatusBadge from '../../components/common/StatusBadge';
import { QUALITY_STATUS_LABELS } from '../../constants';
import { usePendingInspections, useStartInspection } from '../../hooks/useQualityInspections';

const REASON_ACTION_LABEL = { NEW: 'Start Inspection', REWORK_REQUIRED: 'Reopen & Inspect', HOLD: 'Resume' };

export default function PendingInspections() {
  const navigate = useNavigate();
  const { data: rows, isLoading } = usePendingInspections();
  const startInspection = useStartInspection();

  const handleAction = async (row) => {
    if (row.pending_reason === 'NEW') {
      const inspection = await startInspection.mutateAsync({ machinePlanningId: row.machine_planning_id });
      navigate(`/quality/inspections/${inspection.id}`);
    } else {
      navigate(`/quality/inspections/${row.inspection_id}`);
    }
  };

  const counts = {
    NEW: rows?.filter((r) => r.pending_reason === 'NEW').length || 0,
    REWORK_REQUIRED: rows?.filter((r) => r.pending_reason === 'REWORK_REQUIRED').length || 0,
    HOLD: rows?.filter((r) => r.pending_reason === 'HOLD').length || 0,
  };

  const columns = [
    { key: 'order_no', label: 'Order No' },
    { key: 'lot_no', label: 'Lot No', render: (row) => row.lot_no || '—' },
    { key: 'item_code', label: 'Item' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'machine_code', label: 'Machine', render: (row) => `${row.machine_code} - ${row.machine_name}` },
    { key: 'quantity', label: 'Qty Produced', render: (row) => row.produced_qty },
    {
      key: 'pending_reason',
      label: 'Status',
      render: (row) => <StatusBadge status={QUALITY_STATUS_LABELS[row.pending_reason] || row.pending_reason} />,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          size="small"
          variant="contained"
          startIcon={<PlayArrowIcon fontSize="small" />}
          onClick={() => handleAction(row)}
          disabled={startInspection.isPending}
        >
          {REASON_ACTION_LABEL[row.pending_reason] || 'Open'}
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <KpiCard icon={<PendingActionsIcon fontSize="small" />} color="info" label="New - Never Inspected" value={counts.NEW} />
        <KpiCard icon={<BuildCircleIcon fontSize="small" />} color="warning" label="Awaiting Re-Inspection" value={counts.REWORK_REQUIRED} />
        <KpiCard icon={<PauseCircleIcon fontSize="small" />} color="warning" label="On Hold" value={counts.HOLD} />
      </Stack>

      {startInspection.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {startInspection.error.response?.data?.message || 'Could not start inspection'}
        </Alert>
      )}

      <DataTable columns={columns} rows={rows} loading={isLoading} emptyMessage="Nothing is pending quality inspection right now" />
    </Box>
  );
}
