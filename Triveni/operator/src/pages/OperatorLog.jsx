import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { usePlanningContext } from '../contexts/PlanningContext';
import { useMachines, useShiftSummary, useByMachine } from '../hooks/useMachinePlanning';
import { useDowntimeByMachineShift } from '../hooks/useDowntime';

function SectionCard({ icon, title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function StatBox({ label, value }) {
  return (
    <Box sx={{ minWidth: 100 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800}>
        {value}
      </Typography>
    </Box>
  );
}

function formatSeconds(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDuration(startedAt, endedAt) {
  const totalSec = Math.max(0, (endedAt ? dayjs(endedAt) : dayjs()).diff(dayjs(startedAt), 'second'));
  return formatSeconds(totalSec);
}

/** Read-only recap of a shift, compiled entirely from data already captured elsewhere (Produced
 * Qty entries, Coil Info, Downtime) - nothing here is typed in fresh, it's just surfaced. */
export default function OperatorLog() {
  const { machineId, date, shiftId, update } = usePlanningContext();

  const { data: machines } = useMachines();
  const { data: shiftOptions } = useShiftSummary();
  const { data: rows, isLoading: rowsLoading } = useByMachine(
    machineId ? Number(machineId) : undefined,
    shiftId ? Number(shiftId) : undefined,
    date
  );
  const { data: downtimeEvents, isLoading: downtimeLoading } = useDowntimeByMachineShift(
    machineId ? Number(machineId) : undefined,
    date,
    shiftId ? Number(shiftId) : undefined
  );

  const machine = machines?.data?.find((m) => String(m.id) === String(machineId));
  const selectedShiftName = shiftOptions?.find((s) => String(s.shiftId) === String(shiftId))?.shiftName;
  const hasContext = !!machineId && !!shiftId && !!date;

  const totalProduced = rows?.reduce((sum, r) => sum + (Number(r.produced_qty) || 0), 0) ?? 0;
  const totalTarget = rows?.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0) ?? 0;
  const pctComplete = totalTarget > 0 ? Math.min(100, Math.round((totalProduced / totalTarget) * 100)) : 0;
  const totalDowntimeSec =
    downtimeEvents?.reduce((sum, d) => sum + Math.max(0, dayjs(d.ended_at || undefined).diff(dayjs(d.started_at), 'second')), 0) ?? 0;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={machine ? `${machine.machine_code} · ${machine.machine_name}` : 'Operator Log'} />

      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <PersonIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Operator Log
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Shift Activity Summary - what happened on this Machine, Date and Shift.
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
            <TextField
              select
              label="Shift"
              size="small"
              value={shiftId}
              onChange={(e) => update({ shiftId: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon fontSize="small" color="action" /></InputAdornment> }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Select Shift</MenuItem>
              {shiftOptions?.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.shiftName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        {!hasContext ? (
          <Alert severity="info">Select a Date, Machine and Shift to see the shift's activity.</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {machine ? `${machine.machine_code} - ${machine.machine_name}` : ''} · {selectedShiftName || ''} · {date}
            </Typography>

            <SectionCard icon={<SpeedIcon color="primary" />} title="Produced Qty">
              {rowsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : rows?.length ? (
                <>
                  <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                    <StatBox label="Produced" value={totalProduced} />
                    <StatBox label="Target" value={totalTarget} />
                    <StatBox label="% Complete" value={`${pctComplete}%`} />
                  </Stack>
                  <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order No</TableCell>
                          <TableCell>Item</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>Produced Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.order_no}</TableCell>
                            <TableCell>{row.item_code}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>{row.produced_qty}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nothing scheduled for this Machine, Date and Shift.
                </Typography>
              )}
            </SectionCard>

            <SectionCard icon={<ReportProblemIcon color="warning" />} title="Downtime">
              {downtimeLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : downtimeEvents?.length ? (
                <>
                  <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                    <StatBox label="Events" value={downtimeEvents.length} />
                    <StatBox label="Total Down" value={formatSeconds(totalDowntimeSec)} />
                  </Stack>
                  <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Reason</TableCell>
                          <TableCell>Started</TableCell>
                          <TableCell>Ended</TableCell>
                          <TableCell>Duration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {downtimeEvents.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.reason_name}</TableCell>
                            <TableCell>{dayjs(d.started_at).format('hh:mm A')}</TableCell>
                            <TableCell>
                              {d.ended_at ? dayjs(d.ended_at).format('hh:mm A') : <Chip size="small" color="error" label="Ongoing" />}
                            </TableCell>
                            <TableCell>{formatDuration(d.started_at, d.ended_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No downtime logged this shift.
                </Typography>
              )}
            </SectionCard>
          </>
        )}
      </Box>

      <BottomBar />
    </Box>
  );
}
