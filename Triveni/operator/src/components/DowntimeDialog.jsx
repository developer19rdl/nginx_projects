import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useActiveDowntime, useDowntimeReasons, useStartDowntime, useEndDowntime } from '../hooks/useDowntime';

function formatElapsed(startedAt, now) {
  const diffSec = Math.max(0, now.diff(dayjs(startedAt), 'second'));
  const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
  const s = String(diffSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Live-ticking elapsed time since a downtime's started_at - re-renders once a second, isolated
 * here so nothing else in the dialog re-renders every tick. */
function ElapsedTimer({ startedAt }) {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography
      variant="h2"
      fontWeight={800}
      color="error.main"
      sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: 1, lineHeight: 1 }}
    >
      {formatElapsed(startedAt, now)}
    </Typography>
  );
}

/** Small pulsing dot to read as "live" next to the running timer. */
function LiveDot() {
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: 'error.main',
        animation: 'downtime-pulse 1.4s ease-in-out infinite',
        '@keyframes downtime-pulse': {
          '0%': { opacity: 1, boxShadow: (theme) => `0 0 0 0 ${alpha(theme.palette.error.main, 0.5)}` },
          '70%': { opacity: 0.6, boxShadow: (theme) => `0 0 0 8px ${alpha(theme.palette.error.main, 0)}` },
          '100%': { opacity: 1, boxShadow: (theme) => `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
        },
      }}
    />
  );
}

/** Opens as a modal instead of a page - reads whatever downtime is currently running for this
 * machine (if any) so closing and reopening it (or navigating away and back) "resumes" the same
 * running timer rather than losing it; the downtime itself lives on the server the whole time. */
export default function DowntimeDialog({ open, onClose, machineId }) {
  const { data: active, isLoading: activeLoading } = useActiveDowntime(machineId);
  const { data: reasons } = useDowntimeReasons();
  const startMutation = useStartDowntime();
  const endMutation = useEndDowntime();
  const [reasonId, setReasonId] = useState('');

  // Reset the reason picker every time the dialog opens - it stays mounted between opens (only
  // `open` toggles), so without this a reason picked but never started would still be selected
  // the next time Downtime is opened.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setReasonId('');
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const handleStart = () => {
    if (!reasonId) return;
    startMutation.mutate({ machineId: Number(machineId), reasonId: Number(reasonId) });
  };

  const handleEnd = () => {
    if (active) endMutation.mutate(active.id);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
              color: 'warning.main',
              flexShrink: 0,
            }}
          >
            <ReportProblemIcon fontSize="small" />
          </Box>
          <span>Downtime</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {!machineId ? (
          <Alert severity="info">Select a Machine in Settings first.</Alert>
        ) : activeLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : active ? (
          <Paper
            variant="outlined"
            sx={{
              mt: 1,
              p: 2.5,
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
              boxShadow: (theme) => theme.shadows[2],
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <LiveDot />
                <Typography variant="overline" fontWeight={700} color="error.main" sx={{ letterSpacing: 0.6 }}>
                  Machine Down
                </Typography>
              </Stack>

              <ElapsedTimer startedAt={active.started_at} />

              <Chip
                icon={<ReportProblemIcon />}
                label={active.reason_name}
                color="error"
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: '8px' }}
              />

              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
                <ScheduleIcon fontSize="small" />
                <Typography variant="body2">
                  Down since {dayjs(active.started_at).format('hh:mm A, DD-MM-YYYY')}
                </Typography>
              </Stack>

              {endMutation.isError && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {endMutation.error.response?.data?.message || 'Could not end downtime'}
                </Alert>
              )}
            </Stack>
          </Paper>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ color: 'text.secondary' }}>
              <EventBusyIcon fontSize="small" />
              <Typography variant="body2">Select a reason and start the downtime timer.</Typography>
            </Stack>
            <TextField
              select
              label="Reason"
              value={reasonId}
              onChange={(e) => setReasonId(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReportProblemIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {reasons?.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.reason_name}
                </MenuItem>
              ))}
            </TextField>
            {startMutation.isError && (
              <Alert severity="error">{startMutation.error.response?.data?.message || 'Could not start downtime'}</Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {machineId && !activeLoading && (
          active ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleEnd}
              disabled={endMutation.isPending}
            >
              {endMutation.isPending ? 'Ending...' : 'End Downtime'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              disabled={!reasonId || startMutation.isPending}
            >
              {startMutation.isPending ? 'Starting...' : 'Start Downtime'}
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
}
