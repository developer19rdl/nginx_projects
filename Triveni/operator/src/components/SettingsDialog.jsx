import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CategoryIcon from '@mui/icons-material/Category';
import MemoryIcon from '@mui/icons-material/Memory';
import TagIcon from '@mui/icons-material/Tag';
import SaveIcon from '@mui/icons-material/Save';
import { usePlanningContext } from '../contexts/PlanningContext';
import { useMachines } from '../hooks/useMachinePlanning';

function InfoRow({ icon, color, label, value }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
          color: `${color}.main`,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={700} noWrap>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

/** This device's Machine is configured here, once, rather than picked every time on Home - it's
 * the same shared PlanningContext every other screen reads from. Opens as a modal instead of a
 * page, same treatment as Downtime. */
export default function SettingsDialog({ open, onClose }) {
  const { machineId, update } = usePlanningContext();
  const { data: machines } = useMachines();
  const [selected, setSelected] = useState(machineId);
  const [saved, setSaved] = useState(false);

  // Re-sync to the actually-configured machine every time the dialog opens - it stays mounted
  // between opens (only `open` toggles), so without this, picking a machine and closing without
  // saving would leave that abandoned choice showing the next time Settings is opened.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setSelected(machineId);
    setSaved(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const selectedMachine = machines?.data?.find((m) => String(m.id) === String(selected));

  const save = () => {
    update({ machineId: selected });
    setSaved(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose which machine this device is set up for.
        </Typography>

        <TextField
          select
          fullWidth
          label="Machine"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setSaved(false);
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><PrecisionManufacturingIcon fontSize="small" color="action" /></InputAdornment> }}
        >
          <MenuItem value="">Select Machine</MenuItem>
          {machines?.data?.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.machine_code} - {m.machine_name}
            </MenuItem>
          ))}
        </TextField>

        {selectedMachine && (
          <Paper
            variant="outlined"
            sx={{ p: 2.5, mt: 2.5, borderRadius: 3, boxShadow: (theme) => theme.shadows[2] }}
          >
            <Stack spacing={2}>
              <InfoRow icon={<PrecisionManufacturingIcon fontSize="small" />} color="primary" label="Machine Name" value={selectedMachine.machine_name} />
              <Divider />
              <InfoRow icon={<CategoryIcon fontSize="small" />} color="secondary" label="Type" value={selectedMachine.machine_type} />
              <Divider />
              <InfoRow icon={<MemoryIcon fontSize="small" />} color="info" label="Device ID" value={selectedMachine.device_id} />
              <Divider />
              <InfoRow icon={<TagIcon fontSize="small" />} color="warning" label="Slave ID" value={selectedMachine.slave_id} />
            </Stack>
          </Paper>
        )}

        {saved && selectedMachine && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Saved - this device is now set to {selectedMachine.machine_code} - {selectedMachine.machine_name}.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={!selected || selected === machineId}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
