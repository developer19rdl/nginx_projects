import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DEFECT_CATEGORY_LABELS } from '../../constants';
import { useDefectCatalog, useCreateDefect, useUpdateDefect, useDeleteDefect } from '../../hooks/useQualityDefectCatalog';

const CATEGORY_COLORS = { CRITICAL: 'error', MAJOR: 'warning', MINOR: 'info' };

const DEFECT_COLUMNS = (onEdit, onDelete) => [
  { key: 'defect_code', label: 'Defect Code' },
  { key: 'defect_name', label: 'Defect Name' },
  {
    key: 'category',
    label: 'Category',
    render: (row) => <Chip size="small" label={DEFECT_CATEGORY_LABELS[row.category]} color={CATEGORY_COLORS[row.category]} />,
  },
  { key: 'description', label: 'Description', render: (row) => row.description || '—' },
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
        <IconButton size="small" onClick={() => onEdit(row)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(row)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];

const emptyForm = { defectCode: '', defectName: '', category: 'MINOR', description: '' };

function DefectFormDialog({ open, onClose, defect }) {
  const createDefect = useCreateDefect();
  const updateDefect = useUpdateDefect();
  const isEdit = !!defect;
  const [form, setForm] = useState(emptyForm);

  // Re-seed the form fresh every time the dialog transitions from closed to open - not just
  // when a different defect is opened. This dialog stays mounted the whole time (only its
  // `open` prop toggles), so without this, cancelling an edit and reopening the same row would
  // show the abandoned unsaved values instead of its real current data.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm(
      defect
        ? { defectCode: defect.defect_code, defectName: defect.defect_name, category: defect.category, description: defect.description || '' }
        : emptyForm
    );
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (isEdit) {
      await updateDefect.mutateAsync({ id: defect.id, payload: form });
    } else {
      await createDefect.mutateAsync(form);
    }
    onClose();
  };

  const pending = createDefect.isPending || updateDefect.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Defect' : 'New Defect'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Defect Code" value={form.defectCode} onChange={set('defectCode')} required disabled={isEdit} />
          <TextField label="Defect Name" value={form.defectName} onChange={set('defectName')} required />
          <TextField select label="Category" value={form.category} onChange={set('category')}>
            <MenuItem value="CRITICAL">Critical</MenuItem>
            <MenuItem value="MAJOR">Major</MenuItem>
            <MenuItem value="MINOR">Minor</MenuItem>
          </TextField>
          <TextField label="Description" value={form.description} onChange={set('description')} multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={pending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Master list of defect types (Critical/Major/Minor) inspectors pick from when logging a
 * rejected quantity - lives as a Configuration tab alongside Checklist Templates/Downtime
 * Reasons/Inspection Plans. */
export default function DefectCatalogMaster() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);
  const [deletingDefect, setDeletingDefect] = useState(null);

  const { data: defects, isLoading } = useDefectCatalog({ activeOnly: false });
  const deleteDefect = useDeleteDefect();

  const openCreate = () => {
    setEditingDefect(null);
    setFormOpen(true);
  };
  const openEdit = (defect) => {
    setEditingDefect(defect);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    await deleteDefect.mutateAsync(deletingDefect.id);
    setDeletingDefect(null);
  };

  return (
    <Box>
      <PageHeader
        title="Defect Catalog"
        subtitle="Standard defect codes inspectors select when logging rejected quantity"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Defect
          </Button>
        }
      />

      <DataTable columns={DEFECT_COLUMNS(openEdit, setDeletingDefect)} rows={defects} loading={isLoading} emptyMessage="No defects yet" />

      <DefectFormDialog open={formOpen} onClose={() => setFormOpen(false)} defect={editingDefect} />

      <ConfirmDialog
        open={!!deletingDefect}
        title="Deactivate Defect"
        message={`Deactivate "${deletingDefect?.defect_code} - ${deletingDefect?.defect_name}"? It will no longer be selectable for new inspections, but existing records keep it.`}
        confirmLabel="Deactivate"
        danger
        loading={deleteDefect.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingDefect(null)}
      />
    </Box>
  );
}
