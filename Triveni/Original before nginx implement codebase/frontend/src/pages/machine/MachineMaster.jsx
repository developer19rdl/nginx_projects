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
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useMachines, useCreateMachine, useUpdateMachine, useDeleteMachine, useSetMachineStatus } from '../../hooks/useMachines';
import { MACHINE_STATUSES } from '../../constants';

const MACHINE_COLUMNS = (onStatusChange, onEdit, onDelete) => [
  { key: 'machine_code', label: 'Machine Code' },
  { key: 'machine_name', label: 'Machine Name' },
  { key: 'machine_type', label: 'Type' },
  { key: 'production_rate', label: 'Production Rate/hr' },
  { key: 'capacity_per_day', label: 'Capacity/Day' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <TextField
        select
        size="small"
        value={row.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(row.id, e.target.value)}
        sx={{ minWidth: 140 }}
      >
        {MACHINE_STATUSES.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>
    ),
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

const emptyForm = { machineCode: '', machineName: '', machineType: '', deviceId: '', slaveId: '', productionRate: '', capacityPerDay: '' };

function MachineFormDialog({ open, onClose, machine }) {
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const isEdit = !!machine;
  const [form, setForm] = useState(emptyForm);

  // Re-seed the form fresh from `machine` every time the dialog transitions from closed to
  // open - not just when a different machine is opened. This dialog stays mounted the whole
  // time (only its `open` prop toggles), so without this, cancelling out of an edit without
  // saving and reopening the same machine would show the abandoned unsaved values instead of
  // its real current data.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm(
      machine
        ? {
            machineCode: machine.machine_code,
            machineName: machine.machine_name,
            machineType: machine.machine_type || '',
            deviceId: machine.device_id || '',
            slaveId: machine.slave_id ?? '',
            productionRate: machine.production_rate,
            capacityPerDay: machine.capacity_per_day || '',
          }
        : emptyForm
    );
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const payload = {
      machineCode: form.machineCode,
      machineName: form.machineName,
      machineType: form.machineType,
      deviceId: form.deviceId || null,
      slaveId: form.slaveId !== '' ? Number(form.slaveId) : null,
      productionRate: Number(form.productionRate),
      capacityPerDay: form.capacityPerDay ? Number(form.capacityPerDay) : undefined,
    };
    if (isEdit) {
      // Carry the machine's current status/location through unchanged - this dialog doesn't
      // expose them, and the update endpoint replaces the whole row.
      await updateMachine.mutateAsync({
        id: machine.id,
        payload: { ...payload, status: machine.status, location: machine.location },
      });
    } else {
      await createMachine.mutateAsync(payload);
    }
    onClose();
  };

  const pending = createMachine.isPending || updateMachine.isPending;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEdit ? 'Edit Machine' : 'New Machine'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Machine Code" value={form.machineCode} onChange={set('machineCode')} required disabled={isEdit} />
          <TextField label="Machine Name" value={form.machineName} onChange={set('machineName')} required />
          <TextField label="Machine Type" value={form.machineType} onChange={set('machineType')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Device ID" value={form.deviceId} onChange={set('deviceId')} fullWidth />
            <TextField label="Slave ID" type="number" value={form.slaveId} onChange={set('slaveId')} fullWidth />
          </Stack>
          <TextField label="Production Rate (units/hr)" type="number" value={form.productionRate} onChange={set('productionRate')} required />
          <TextField label="Capacity/Day" type="number" value={form.capacityPerDay} onChange={set('capacityPerDay')} />
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

export default function MachineMaster() {
  const [filters, setFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [deletingMachine, setDeletingMachine] = useState(null);

  const { data: machines, isLoading } = useMachines(filters);
  const setStatus = useSetMachineStatus();
  const deleteMachine = useDeleteMachine();

  const openCreate = () => {
    setEditingMachine(null);
    setFormOpen(true);
  };
  const openEdit = (machine) => {
    setEditingMachine(machine);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMachine.mutateAsync(deletingMachine.id);
    setDeletingMachine(null);
  };

  return (
    <Box>
      <PageHeader
        title="Machine Master"
        subtitle="Machines and item compatibility"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Machine
          </Button>
        }
      />

      <FilterBar>
        <TextField label="Search" size="small" value={filters.search || ''} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        <TextField
          select
          label="Status"
          size="small"
          sx={{ width: 180 }}
          value={filters.status || ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <MenuItem value="">All</MenuItem>
          {MACHINE_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </FilterBar>
      <DataTable
        columns={MACHINE_COLUMNS((id, status) => setStatus.mutate({ id, status }), openEdit, setDeletingMachine)}
        rows={machines?.data}
        meta={machines?.meta}
        loading={isLoading}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      <MachineFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        machine={editingMachine}
      />

      <ConfirmDialog
        open={!!deletingMachine}
        title="Delete Machine"
        message={`Remove ${deletingMachine?.machine_code} - ${deletingMachine?.machine_name}? It will no longer appear anywhere machines are selected, but existing planning history is kept.`}
        confirmLabel="Delete"
        danger
        loading={deleteMachine.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingMachine(null)}
      />
    </Box>
  );
}
