import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormDialog from '../../components/common/FormDialog';
import { useShifts, useCreateShift, useUpdateShift } from '../../hooks/useShifts';

const emptyForm = { shiftName: '', startTime: '', endTime: '' };

/** HH:MM:SS (or HH:MM) from the API -> HH:MM for an <input type="time">. */
function toTimeInput(value) {
  return value ? value.slice(0, 5) : '';
}

/** Trims a TIME string's seconds for display - '22:00:00' -> '22:00'. */
function formatTime(value) {
  return value ? value.slice(0, 5) : '—';
}

/** shift_code is still a required, unique column on the backend (see shift.validator.js) even
 * though this screen no longer surfaces it as a field of its own - the code was never actually
 * used anywhere else in the app besides identifying the row, so it's derived from the name
 * instead of asking the operator to invent one. Collisions surface as the same "already exists"
 * error a duplicate code would have. */
function deriveShiftCode(shiftName) {
  return (
    shiftName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20) || 'SHIFT'
  );
}

/** Shift master - defines the shift codes/timings every other screen (Machine Planning, the
 * operator app's Shift Plan, Machine Insights' shift-scoped OEE) reads from. Lives under
 * Configuration alongside the other master-data tabs. */
export default function ShiftMaster() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = creating, a shift row = editing
  const [form, setForm] = useState(emptyForm);
  const [deactivating, setDeactivating] = useState(null);

  const { data: shifts, isLoading } = useShifts();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const setActive = useUpdateShift();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      shiftName: row.shift_name,
      startTime: toTimeInput(row.start_time),
      endTime: toTimeInput(row.end_time),
    });
    setFormOpen(true);
  };

  const mutation = editing ? updateShift : createShift;
  const canSubmit = Boolean(form.shiftName.trim() && form.startTime && form.endTime);

  const submit = async () => {
    const shiftName = form.shiftName.trim();
    // shiftCode/breakDurationMinutes aren't editable fields on this screen - a new shift gets a
    // code derived from its name and no break; an existing shift keeps whatever it already had for
    // both, unchanged, so editing the name/timings never silently resets them.
    if (editing) {
      await updateShift.mutateAsync({
        id: editing.id,
        shiftCode: editing.shift_code,
        shiftName,
        startTime: form.startTime,
        endTime: form.endTime,
        breakDurationMinutes: editing.break_duration_minutes || 0,
        isActive: editing.is_active,
      });
    } else {
      await createShift.mutateAsync({
        shiftCode: deriveShiftCode(shiftName),
        shiftName,
        startTime: form.startTime,
        endTime: form.endTime,
      });
    }
    setFormOpen(false);
  };

  // PUT /shifts/:id takes the full shift shape (the backend re-derives crossesMidnight/
  // totalWorkingHours from it) - toggling just isActive still means resending the row's own
  // other fields unchanged, same as an edit that only touches one field would.
  const setShiftActive = (row, isActive) =>
    setActive.mutateAsync({
      id: row.id,
      shiftCode: row.shift_code,
      shiftName: row.shift_name,
      startTime: toTimeInput(row.start_time),
      endTime: toTimeInput(row.end_time),
      breakDurationMinutes: row.break_duration_minutes || 0,
      isActive,
    });

  const confirmDeactivate = async () => {
    await setShiftActive(deactivating, 0);
    setDeactivating(null);
  };

  const columns = [
    { key: 'shift_name', label: 'Shift Name' },
    { key: 'start_time', label: 'Start', render: (row) => formatTime(row.start_time) },
    { key: 'end_time', label: 'End', render: (row) => formatTime(row.end_time) },
    {
      key: 'crosses_midnight',
      label: '',
      render: (row) => (row.crosses_midnight ? <Chip size="small" label="Overnight" variant="outlined" /> : null),
    },
    { key: 'is_active', label: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'Active' : 'Inactive'} /> },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.is_active ? (
            <Tooltip title="Deactivate">
              <IconButton size="small" color="error" onClick={() => setDeactivating(row)}>
                <BlockIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Activate">
              <IconButton size="small" color="success" onClick={() => setShiftActive(row, 1)}>
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Shifts"
        subtitle="Shift codes and timings used across Machine Planning, the operator app, and OEE reporting"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Shift
          </Button>
        }
      />

      <DataTable columns={columns} rows={shifts} loading={isLoading} emptyMessage="No shifts configured yet" />

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Shift' : 'New Shift'}
        onSubmit={submit}
        submitLabel={editing ? 'Save Changes' : 'Create Shift'}
        canSubmit={canSubmit}
        loading={mutation.isPending}
        error={mutation.isError && (mutation.error.response?.data?.message || 'Could not save shift')}
      >
        <TextField
          label="Shift Name"
          required
          autoFocus
          placeholder="e.g. Shift A"
          value={form.shiftName}
          onChange={(e) => setForm((f) => ({ ...f, shiftName: e.target.value }))}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Start Time"
            type="time"
            required
            InputLabelProps={{ shrink: true }}
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <TextField
            label="End Time"
            type="time"
            required
            InputLabelProps={{ shrink: true }}
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            sx={{ flex: 1 }}
          />
        </Stack>
        {form.startTime && form.endTime && form.endTime <= form.startTime && (
          <Typography variant="caption" color="text.secondary">
            End time is at or before start time - this shift will be treated as crossing midnight.
          </Typography>
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate Shift"
        message={`Deactivate "${deactivating?.shift_name}"? It will no longer be selectable for new machine planning or shift assignments.`}
        confirmLabel="Deactivate"
        danger
        loading={setActive.isPending}
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </Box>
  );
}
