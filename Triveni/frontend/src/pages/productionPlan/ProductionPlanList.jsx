import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Alert from '@mui/material/Alert';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { usePlans, useDeletePlan } from '../../hooks/useProductionPlans';
import { PLAN_STATUSES } from '../../constants';

/** Confirms before deleting an order - this cascades to every machine_planning row under it, so
 * it's worded plainly. The backend refuses (409) if any row already has produced_qty logged. */
function DeleteConfirmDialog({ row, onClose }) {
  const mutation = useDeletePlan();

  const confirm = async () => {
    await mutation.mutateAsync(row.id);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Production Order?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will permanently delete order <strong>{row.order_no}</strong> and every machine plan row
          under it. This cannot be undone.
        </DialogContentText>
        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mutation.error.response?.data?.message || 'Delete failed'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={confirm} disabled={mutation.isPending}>
          {mutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const buildColumns = (onDelete) => [
  { key: 'order_no', label: 'Order No', sortable: true },
  { key: 'order_date', label: 'Order Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  { key: 'created_by_name', label: 'Created By' },
  { key: 'created_at', label: 'Created Date' },
  {
    key: 'actions',
    label: '',
    render: (row) => (
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
  },
];

export default function ProductionPlanList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, pageSize: 25, sortBy: 'created_at', sortDir: 'DESC' });
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = usePlans(filters);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  return (
    <Box>
      <PageHeader
        title="Production Orders"
        subtitle="All imported production orders"
        actions={
          <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => navigate('/production-plans/upload')}>
            Upload Order
          </Button>
        }
      />

      <FilterBar>
        <TextField
          label="Search Order No"
          size="small"
          value={filters.search || ''}
          onChange={(e) => update({ search: e.target.value })}
        />
        <TextField select label="Status" size="small" sx={{ width: 200 }} value={filters.status || ''} onChange={(e) => update({ status: e.target.value })}>
          <MenuItem value="">All</MenuItem>
          {PLAN_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="From Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.fromDate || ''}
          onChange={(e) => update({ fromDate: e.target.value })}
        />
        <TextField
          label="To Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.toDate || ''}
          onChange={(e) => update({ toDate: e.target.value })}
        />
      </FilterBar>

      <DataTable
        columns={buildColumns((row) => setDeleting(row))}
        rows={data?.data}
        meta={data?.meta}
        loading={isLoading}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        onSortChange={(key) => update({ sortBy: key, sortDir: filters.sortBy === key && filters.sortDir === 'ASC' ? 'DESC' : 'ASC' })}
        onPageChange={(page) => update({ page })}
        onPageSizeChange={(pageSize) => update({ pageSize, page: 1 })}
        onRowClick={(row) => navigate(`/production-plans/${row.id}`)}
      />

      {deleting && <DeleteConfirmDialog row={deleting} onClose={() => setDeleting(null)} />}
    </Box>
  );
}
