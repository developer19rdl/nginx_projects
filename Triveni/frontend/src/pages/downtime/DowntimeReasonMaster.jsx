import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  useDowntimeReasons,
  useCreateDowntimeReason,
  useUpdateDowntimeReason,
  useDeleteDowntimeReason,
} from '../../hooks/useDowntimeReasons';

const REASON_COLUMNS = (onEdit, onDelete, onActivate) => [
  { key: 'reason_name', label: 'Reason' },
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
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {row.is_active ? (
          <Tooltip title="Deactivate">
            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate">
            <IconButton size="small" color="success" onClick={() => onActivate(row)}>
              <CheckCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  },
];

function ReasonFormDialog({ open, onClose, reason }) {
  const createReason = useCreateDowntimeReason();
  const updateReason = useUpdateDowntimeReason();
  const isEdit = !!reason;
  const [name, setName] = useState('');

  const [openedFor, setOpenedFor] = useState(null);
  if (open && openedFor !== (reason?.id ?? 'new')) {
    setOpenedFor(reason?.id ?? 'new');
    setName(reason?.reason_name || '');
  }

  const pending = createReason.isPending || updateReason.isPending;
  const error = createReason.error || updateReason.error;

  const submit = async () => {
    if (isEdit) {
      await updateReason.mutateAsync({ id: reason.id, payload: { reasonName: name, isActive: reason.is_active } });
    } else {
      await createReason.mutateAsync({ reasonName: name });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Downtime Reason' : 'New Downtime Reason'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Reason"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          sx={{ mt: 1 }}
        />
        {error && (
          <Box sx={{ mt: 1.5, color: 'error.main', fontSize: 13 }}>
            {error.response?.data?.message || 'Save failed'}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!name.trim() || pending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DowntimeReasonMaster() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [deletingReason, setDeletingReason] = useState(null);

  const { data: reasons, isLoading } = useDowntimeReasons({ activeOnly: false });
  const deleteReason = useDeleteDowntimeReason();
  const activateReason = useUpdateDowntimeReason();

  const openCreate = () => {
    setEditingReason(null);
    setFormOpen(true);
  };
  const openEdit = (reason) => {
    setEditingReason(reason);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    await deleteReason.mutateAsync(deletingReason.id);
    setDeletingReason(null);
  };

  // DELETE only ever soft-deactivates (see downtimeReason.repository.js#deactivate) - reactivating
  // just re-sends the same reason through the ordinary update endpoint with isActive back to 1.
  // There was previously no button anywhere in this screen that did this, so a deactivated reason
  // could never be turned back on again.
  const activate = (reason) => activateReason.mutate({ id: reason.id, payload: { reasonName: reason.reason_name, isActive: 1 } });

  return (
    <Box>
      <PageHeader
        title="Downtime Reasons"
        subtitle="Reasons operators can select when logging machine downtime"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Reason
          </Button>
        }
      />

      <DataTable
        columns={REASON_COLUMNS(openEdit, setDeletingReason, activate)}
        rows={reasons}
        loading={isLoading}
        emptyMessage="No downtime reasons yet"
      />

      <ReasonFormDialog open={formOpen} onClose={() => setFormOpen(false)} reason={editingReason} />

      <ConfirmDialog
        open={!!deletingReason}
        title="Deactivate Downtime Reason"
        message={`Deactivate "${deletingReason?.reason_name}"? It will no longer appear in the operator app's downtime dropdown, but existing downtime history keeps it, and it can be reactivated later.`}
        confirmLabel="Deactivate"
        danger
        loading={deleteReason.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingReason(null)}
      />
    </Box>
  );
}
