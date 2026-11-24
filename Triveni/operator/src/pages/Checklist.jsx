import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { usePlanningContext } from '../contexts/PlanningContext';
import { useMachines } from '../hooks/useMachinePlanning';
import { useAssignedChecklists } from '../hooks/useChecklist';

const FREQUENCY_COLORS = { DAILY: 'info', WEEKLY: 'secondary', MONTHLY: 'warning' };

/** Lists whichever checklist templates are currently assigned+active for this machine, each with
 * a Done/Not-Done status for its own current period - Daily is scoped to today, Weekly to this
 * ISO week, Monthly to this month, all computed server-side. Tapping one opens the fill-in/
 * read-only view for that specific template. */
export default function Checklist() {
  const navigate = useNavigate();
  const { machineId, date, update } = usePlanningContext();

  const { data: machines } = useMachines();
  const { data: checklists, isLoading } = useAssignedChecklists(machineId ? Number(machineId) : undefined, date);

  const machine = machines?.data?.find((m) => String(m.id) === String(machineId));
  const hasContext = !!machineId && !!date;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={machine ? `${machine.machine_code} · ${machine.machine_name}` : 'Checklist'} />

      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <ChecklistIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Checklist
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Checklists assigned to this machine - tap one to fill it in or view it.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap" useFlexGap>
            <TextField
              label="Date"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => update({ date: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon fontSize="small" color="action" /></InputAdornment> }}
              sx={{ minWidth: 190 }}
            />
            {machineId ? (
              <TextField
                label="Machine"
                size="small"
                value={machine ? `${machine.machine_code} - ${machine.machine_name}` : ''}
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start"><PrecisionManufacturingIcon fontSize="small" color="action" /></InputAdornment>,
                }}
                sx={{ minWidth: 220, '& .MuiInputBase-input': { cursor: 'default' } }}
              />
            ) : (
              <TextField
                select
                label="Machine"
                size="small"
                value={machineId}
                onChange={(e) => update({ machineId: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><PrecisionManufacturingIcon fontSize="small" color="action" /></InputAdornment> }}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Select Machine</MenuItem>
                {machines?.data?.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.machine_code} - {m.machine_name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </Paper>

        {!hasContext ? (
          <Alert severity="info">Select a Date and Machine to see its checklists.</Alert>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !checklists?.length ? (
          <Alert severity="info">No checklists are assigned to this machine yet.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {checklists.map((c) => (
              <Paper
                key={c.id}
                variant="outlined"
                onClick={() => navigate(`/checklist/${c.id}`)}
                sx={{ p: 2.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {c.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.department || 'General'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={c.frequency} color={FREQUENCY_COLORS[c.frequency]} />
                    <Chip
                      size="small"
                      label={c.done ? 'Done' : 'Not Done'}
                      color={c.done ? 'success' : 'default'}
                      variant={c.done ? 'filled' : 'outlined'}
                    />
                    <ChevronRightIcon color="action" />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <BottomBar />
    </Box>
  );
}
