import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useInspectionPlans, useDeleteInspectionPlan } from '../../hooks/useQualityInspectionPlans';

const TYPE_COLORS = { INCOMING: 'secondary', IN_PROCESS: 'info', FINAL: 'success' };
const TYPE_LABELS = { INCOMING: 'Incoming', IN_PROCESS: 'In-Process', FINAL: 'Final' };

const PLAN_COLUMNS = (onDelete, navigate) => [
  { key: 'plan_name', label: 'Plan Name' },
  { key: 'item_code', label: 'Item Code', render: (row) => row.item_code || <em>Generic (any item)</em> },
  {
    key: 'inspection_type',
    label: 'Inspection Type',
    render: (row) => <Chip size="small" label={TYPE_LABELS[row.inspection_type]} color={TYPE_COLORS[row.inspection_type]} />,
  },
  { key: 'sample_size', label: 'Sample Size' },
  { key: 'parameter_count', label: 'Parameters' },
  {
    key: 'is_active',
    label: 'Status',
    render: (row) => <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />,
  },
  {
    key: 'actions',
    label: '',
    render: (row) => (
      <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
        <IconButton size="small" onClick={() => navigate(`/quality/inspection-plans/${row.id}/edit`)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(row)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];

/** Configurable inspection parameters per item (or a generic default plan) - lives as a
 * Configuration tab, mirroring how Checklist Templates and Downtime Reasons are both managed
 * there rather than as their own top-level nav entries. */
export default function InspectionPlanList() {
  const navigate = useNavigate();
  const [deletingPlan, setDeletingPlan] = useState(null);

  const { data: plans, isLoading } = useInspectionPlans({ activeOnly: false });
  const deletePlan = useDeleteInspectionPlan();

  const confirmDelete = async () => {
    await deletePlan.mutateAsync(deletingPlan.id);
    setDeletingPlan(null);
  };

  return (
    <Box>
      <PageHeader
        title="Inspection Plans"
        subtitle="Configurable inspection parameters per item, matched automatically when an inspection starts"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/quality/inspection-plans/new')}>
            New Plan
          </Button>
        }
      />

      <DataTable
        columns={PLAN_COLUMNS(setDeletingPlan, navigate)}
        rows={plans}
        loading={isLoading}
        emptyMessage="No inspection plans yet"
        onRowClick={(row) => navigate(`/quality/inspection-plans/${row.id}/edit`)}
      />

      <ConfirmDialog
        open={!!deletingPlan}
        title="Deactivate Inspection Plan"
        message={`Deactivate "${deletingPlan?.plan_name}"? It will no longer be matched for new inspections, but past inspections that used it are unaffected.`}
        confirmLabel="Deactivate"
        danger
        loading={deletePlan.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingPlan(null)}
      />
    </Box>
  );
}
