import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DataTable from '../../components/common/DataTable';
import KpiCard from '../../components/common/KpiCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { CAPA_STATUS_LABELS } from '../../constants';
import { useCapaList, useCloseCapa } from '../../hooks/useQualityCapa';

/** Open/in-progress CAPA (Corrective/Preventive Action) items across every inspection - "CAPA
 * overdue" is simply status != CLOSED and due_date in the past, computed here rather than
 * needing its own backend flag or a scheduled job. */
export default function CapaTracker() {
  const navigate = useNavigate();
  const [closingCapa, setClosingCapa] = useState(null);
  const { data: capas, isLoading } = useCapaList({ activeOnly: true });
  const closeCapa = useCloseCapa();

  const today = dayjs().format('YYYY-MM-DD');
  const overdueCount = capas?.filter((c) => c.due_date && c.due_date < today).length || 0;

  const confirmClose = async () => {
    await closeCapa.mutateAsync(closingCapa.id);
    setClosingCapa(null);
  };

  const columns = [
    { key: 'inspection_no', label: 'Inspection No', render: (row) => row.inspection_no },
    { key: 'item_code', label: 'Item' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'corrective_action', label: 'Corrective Action' },
    { key: 'owner_name', label: 'Owner', render: (row) => row.owner_name || '—' },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (row) =>
        row.due_date ? (
          <Chip
            size="small"
            label={row.due_date}
            color={row.due_date < today && row.status !== 'CLOSED' ? 'error' : 'default'}
            variant={row.due_date < today && row.status !== 'CLOSED' ? 'filled' : 'outlined'}
          />
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={CAPA_STATUS_LABELS[row.status]} />,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
          <Button size="small" onClick={() => navigate(`/quality/inspections/${row.inspection_id}`)}>
            View Inspection
          </Button>
          <Button size="small" variant="outlined" color="success" onClick={() => setClosingCapa(row)}>
            Close
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <KpiCard icon={<AssignmentLateIcon fontSize="small" />} color="warning" label="Open CAPAs" value={capas?.length || 0} />
        <KpiCard icon={<EventBusyIcon fontSize="small" />} color="error" label="Overdue" value={overdueCount} />
        <KpiCard icon={<CheckCircleIcon fontSize="small" />} color="success" label="Closed This View" value={0} caption="See inspection history for closed CAPAs" />
      </Stack>

      {closeCapa.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {closeCapa.error.response?.data?.message || 'Could not close CAPA'}
        </Alert>
      )}

      <DataTable columns={columns} rows={capas} loading={isLoading} emptyMessage="No open CAPA items" />

      <ConfirmDialog
        open={!!closingCapa}
        title="Close CAPA"
        message={`Mark this corrective/preventive action as closed? "${closingCapa?.corrective_action}"`}
        confirmLabel="Close CAPA"
        loading={closeCapa.isPending}
        onConfirm={confirmClose}
        onClose={() => setClosingCapa(null)}
      />
    </Box>
  );
}
