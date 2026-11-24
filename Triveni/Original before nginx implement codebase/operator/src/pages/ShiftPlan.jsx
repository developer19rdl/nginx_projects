import { useEffect, useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { alpha } from '@mui/material/styles';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import QrScannerDialog from '../components/QrScannerDialog';
import { usePlanningContext } from '../contexts/PlanningContext';
import {
  useMachines,
  useShiftSummary,
  useByMachine,
  useStartProduction,
  useStopProduction,
  useResumeProduction,
  useResetProduction,
  useUpdateProducedQty,
  useUpdateCoilInfo,
  useLookupCoilInfo,
} from '../hooks/useMachinePlanning';
import { useProductionSocket } from '../hooks/useProductionSocket';

/** Seconds between production_start_at and (production_end_at, or now while still running). Both
 * timestamps come from the backend as MySQL DATETIME strings (dateStrings:true, no timezone) - the
 * same "just parse as local time" convention already used for inspection_datetime etc. elsewhere
 * in this app, so no timezone conversion is needed here either. */
function elapsedSeconds(row) {
  if (!row.production_start_at) return 0;
  const start = dayjs(row.production_start_at);
  const end = row.production_end_at ? dayjs(row.production_end_at) : dayjs();
  return Math.max(0, end.diff(start, 'second'));
}

/** Produced vs. planned, as a 0-100 percentage - clamped at 100 since produced_qty can land
 * slightly over quantity (the last MQTT reading isn't required to land exactly on target). */
function progressPct(row) {
  const planned = Number(row.quantity) || 0;
  if (planned <= 0) return 0;
  return Math.min(100, Math.round((Number(row.produced_qty) / planned) * 100));
}

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const PRODUCTION_STATUS_META = {
  RUNNING: { label: 'Running', color: 'success' },
  STOPPED: { label: 'Stopped', color: 'warning' },
  COMPLETED: { label: 'Completed', color: 'default' },
};

/** Whether this row's Coil Info has actually been entered - same check the Coil Info cell already
 * uses to decide "Add" vs. a filled-in chip, reused here to gate the Start button on it too. */
function hasCoilInfo(row) {
  return Boolean(row.coil_no || row.grade || row.coil_size || row.coil_wt);
}

/** Start/Stop/Resume/Reset + live elapsed timer for one row.
 * - NOT_STARTED shows Start; clicking it stamps production_start_at and flips the row to RUNNING
 *   (only one row per machine can be RUNNING at a time - the backend rejects a second Start on the
 *   same machine, and the table dims/disables every other row while this one runs).
 * - RUNNING ticks once a second purely from production_start_at -> now, so it stays correct across
 *   re-renders without needing the row to be refetched. Stop freezes the timer and moves it to
 *   STOPPED - a manual Stop is *not* completion.
 * - STOPPED keeps the frozen elapsed time and Produced Qty exactly as they were, and offers Resume
 *   (continues the timer from where it left off - the backend shifts production_start_at forward
 *   by the paused duration rather than restarting it from zero, so elapsed time never jumps) and
 *   Reset (back to zero/NOT_STARTED). Resume shares the same single-running-per-machine guard as
 *   Start, since it also makes the row RUNNING again.
 * - COMPLETED only ever happens by actually reaching the planned quantity (a Produced Qty save or
 *   an MQTT reading, never Stop) - see poDetail.repository.js. Reset is disabled here; a completed
 *   order is a final state, not something this button clears.
 */
function ProductionTimerCell({ row, disabledStart }) {
  const start = useStartProduction();
  const stop = useStopProduction();
  const resume = useResumeProduction();
  const reset = useResetProduction();
  const [elapsed, setElapsed] = useState(() => elapsedSeconds(row));

  useEffect(() => {
    setElapsed(elapsedSeconds(row));
    if (row.production_status !== 'RUNNING') return undefined;
    const id = setInterval(() => setElapsed(elapsedSeconds(row)), 1000);
    return () => clearInterval(id);
  }, [row.production_status, row.production_start_at, row.production_end_at]);

  if (row.production_status === 'NOT_STARTED') {
    // Coil Info must be entered before this order can be started - a coil physically has to be
    // identified/loaded before production begins, so there's nothing valid to run without it yet.
    const missingCoilInfo = !hasCoilInfo(row);
    return (
      <Stack spacing={0.5}>
        <Tooltip title={missingCoilInfo ? 'Add Coil Info before starting production' : ''}>
          <span>
            <Button
              variant="contained"
              color="success"
              sx={{ minHeight: 44 }}
              startIcon={start.isPending ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
              onClick={() => start.mutate(row.id)}
              disabled={disabledStart || start.isPending || missingCoilInfo}
            >
              Start
            </Button>
          </span>
        </Tooltip>
        {missingCoilInfo && !disabledStart && (
          <Typography variant="caption" color="text.secondary">
            Add Coil Info to enable Start
          </Typography>
        )}
        {start.isError && (
          <Typography variant="caption" color="error">
            {start.error.response?.data?.message || 'Could not start production'}
          </Typography>
        )}
      </Stack>
    );
  }

  const meta = PRODUCTION_STATUS_META[row.production_status];
  const canReset = row.production_status !== 'COMPLETED';
  const busy = stop.isPending || resume.isPending || reset.isPending;
  const error = stop.error || resume.error || reset.error;

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Chip size="small" color={meta.color} label={meta.label} />
        <Typography
          variant="body2"
          fontWeight={row.production_status === 'RUNNING' ? 700 : 400}
          color={row.production_status === 'RUNNING' ? 'text.primary' : 'text.secondary'}
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatDuration(elapsed)}
        </Typography>
        {row.production_status === 'RUNNING' && (
          <Tooltip title="Stop - halt this order's production without marking it complete">
            <span>
              <IconButton color="error" sx={{ p: 1.25 }} onClick={() => stop.mutate(row.id)} disabled={busy}>
                {stop.isPending ? <CircularProgress size={18} /> : <StopIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}
        {row.production_status === 'STOPPED' && (
          <Tooltip title="Resume - continue the timer from where it was stopped">
            <span>
              <IconButton color="success" sx={{ p: 1.25 }} onClick={() => resume.mutate(row.id)} disabled={disabledStart || busy}>
                {resume.isPending ? <CircularProgress size={18} /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}
        <Tooltip title={canReset ? 'Reset - discard this run and start the timer over' : 'A completed order cannot be reset'}>
          <span>
            <IconButton sx={{ p: 1.25 }} onClick={() => reset.mutate(row.id)} disabled={!canReset || busy}>
              {reset.isPending ? <CircularProgress size={18} /> : <RestartAltIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <LinearProgress
          variant="determinate"
          color={row.production_status === 'COMPLETED' ? 'success' : 'primary'}
          value={progressPct(row)}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>
          {progressPct(row)}%
        </Typography>
      </Stack>
      {error && (
        <Typography variant="caption" color="error">
          {error.response?.data?.message || 'Action failed'}
        </Typography>
      )}
    </Stack>
  );
}

/** A coil's QR label might just be the coil number as plain text, or a fuller JSON payload with
 * more fields already on it (grade/size/weight) - support both rather than assuming one. */
function parseScannedCoil(text) {
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object') {
      return {
        coilNo: obj.coilNo ?? obj.coil_no ?? null,
        grade: obj.grade ?? null,
        coilSize: obj.coilSize ?? obj.coil_size ?? null,
        coilWt: obj.coilWt ?? obj.coil_wt ?? null,
      };
    }
  } catch {
    // not JSON - treat the whole scanned string as just the coil number
  }
  return { coilNo: text };
}

// Consolidated from 12 single-fact columns down to 8 - a table this wide simply can't fit on a
// tablet at any orientation without forcing a horizontal scroll while the operator's also trying
// to tap Start/enter Produced Qty, which is exactly the "responsiveness in tab[let]" problem this
// screen had. Order No/Priority, Item/Size, and Shift/Operator/Lot No each collapse into one
// two-line cell (still all the same data, just grouped by how related it is) - the three
// interactive cells (Production, Produced Qty, Coil Info) are untouched, they need the room.
const PLAN_COLUMNS = ['Order', 'Customer', 'Item / Size', 'Shift / Operator / Lot', 'Qty', 'Production', 'Produced Qty', 'Coil Info'];

function ProducedQtyCell({ row, disabled }) {
  const mutation = useUpdateProducedQty();
  const [value, setValue] = useState(row.produced_qty);
  const [syncedQty, setSyncedQty] = useState(row.produced_qty);

  // Produced Qty can now change from outside this cell entirely - an MQTT reading landing on the
  // backend patches `row` via the WebSocket (useProductionSocket), not just this cell's own Save
  // button. Adopt that new value only when the operator has no unsaved edit in progress (the
  // field still shows what we last synced) - otherwise their in-progress typing/correction would
  // get silently overwritten out from under them mid-edit.
  useEffect(() => {
    if (row.produced_qty === syncedQty) return;
    setSyncedQty(row.produced_qty);
    setValue((current) => (current === syncedQty ? row.produced_qty : current));
  }, [row.produced_qty, syncedQty]);

  const dirty = String(value) !== String(row.produced_qty);
  // A completed order is done - its Produced Qty is final and shouldn't be edited any further
  // (matches Reset also being disabled once COMPLETED, for the same reason).
  const locked = disabled || row.production_status === 'COMPLETED';

  const save = () => {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return;
    mutation.mutate({ id: row.id, producedQty: num });
  };

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputProps={{ min: 0, step: '0.01' }}
        disabled={locked}
        sx={{ width: 96 }}
      />
      <Tooltip title={row.production_status === 'COMPLETED' ? 'Completed - cannot be changed' : dirty ? 'Save' : 'Saved'}>
        <span>
          <IconButton size="small" color={dirty ? 'primary' : 'success'} onClick={save} disabled={locked || !dirty || mutation.isPending}>
            {mutation.isPending ? <CircularProgress size={16} /> : dirty ? <SaveIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      {mutation.isError && (
        <Typography variant="caption" color="error.main">
          Failed
        </Typography>
      )}
    </Stack>
  );
}

/** Popup for entering a row's coil details. Pre-fills from whatever the row already has (empty
 * fields if none yet), and maps 1:1 onto that machine_planning row on Save. */
function CoilInfoDialog({ row, onClose }) {
  const mutation = useUpdateCoilInfo();
  const lookup = useLookupCoilInfo();
  const [coilNo, setCoilNo] = useState(row.coil_no || '');
  const [grade, setGrade] = useState(row.grade || '');
  const [coilSize, setCoilSize] = useState(row.coil_size || '');
  const [coilWt, setCoilWt] = useState(row.coil_wt ?? '');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScan = (text) => {
    const parsed = parseScannedCoil(text);
    if (parsed.coilNo != null) setCoilNo(String(parsed.coilNo));
    if (parsed.grade != null) setGrade(String(parsed.grade));
    if (parsed.coilSize != null) setCoilSize(String(parsed.coilSize));
    if (parsed.coilWt != null) setCoilWt(String(parsed.coilWt));
    setScannerOpen(false);
  };

  // Calls the external coil API for whatever's typed in Coil No. Only overwrites fields the API
  // actually returned - anything it doesn't provide is left for the operator to enter manually.
  const handleGetInfo = () => {
    if (!coilNo.trim()) return;
    lookup.mutate(coilNo.trim(), {
      onSuccess: (info) => {
        if (info.grade != null) setGrade(String(info.grade));
        if (info.coilSize != null) setCoilSize(String(info.coilSize));
        if (info.coilWt != null) setCoilWt(String(info.coilWt));
      },
    });
  };

  const save = async () => {
    await mutation.mutateAsync({
      id: row.id,
      coilInfo: {
        coilNo: coilNo.trim() || null,
        grade: grade.trim() || null,
        coilSize: coilSize.trim() || null,
        coilWt: coilWt === '' ? null : Number(coilWt),
      },
    });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Coil Info</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {row.order_no} · {row.item_code} · Qty {row.quantity}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Coil No"
            fullWidth
            size="small"
            value={coilNo}
            onChange={(e) => setCoilNo(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Scan QR code">
                    <IconButton size="small" onClick={() => setScannerOpen(true)}>
                      <QrCodeScannerIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={lookup.isPending ? <CircularProgress size={14} /> : <SearchIcon fontSize="small" />}
            onClick={handleGetInfo}
            disabled={!coilNo.trim() || lookup.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            Get Coil Info
          </Button>
          {lookup.isError && (
            <Alert severity="warning" sx={{ py: 0 }}>
              {lookup.error.response?.data?.message || 'Could not fetch coil info - enter details manually.'}
            </Alert>
          )}
          <TextField label="Grade" fullWidth size="small" value={grade} onChange={(e) => setGrade(e.target.value)} />
          <TextField label="Coil Size" fullWidth size="small" value={coilSize} onChange={(e) => setCoilSize(e.target.value)} />
          <TextField
            label="Coil Wt"
            type="number"
            fullWidth
            size="small"
            value={coilWt}
            onChange={(e) => setCoilWt(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </Stack>
        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mutation.error.response?.data?.message || 'Save failed'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
      <QrScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScan} />
    </Dialog>
  );
}

function CoilInfoCell({ row, onOpen, disabled }) {
  return hasCoilInfo(row) ? (
    <Chip
      icon={<Inventory2Icon fontSize="small" />}
      label={row.coil_no || 'View'}
      size="small"
      color="success"
      variant="outlined"
      onClick={() => onOpen(row)}
      disabled={disabled}
      sx={{ cursor: 'pointer' }}
    />
  ) : (
    <Button size="small" variant="outlined" startIcon={<Inventory2Icon fontSize="small" />} onClick={() => onOpen(row)} disabled={disabled}>
      Add
    </Button>
  );
}

export default function ShiftPlan() {
  const { machineId, date, shiftId, update } = usePlanningContext();

  const { data: machines } = useMachines();
  const { data: shiftOptions } = useShiftSummary();

  // Date/Shift are editable right here, but nothing is fetched until Load is clicked - the
  // context's last-saved values only seed the initial draft (Machine, when already fixed in
  // Settings, is never part of the draft since it can't be changed on this screen).
  const [draft, setDraft] = useState({ date, machineId, shiftId });
  const [applied, setApplied] = useState(null);
  const setDraftField = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const appliedMachineId = applied?.machineId ? Number(applied.machineId) : undefined;
  const appliedShiftId = applied?.shiftId ? Number(applied.shiftId) : undefined;

  // Only the very first load (no data yet) blanks the table for a spinner - a background refetch
  // with data already in hand (isFetching) updates the rows in place instead, so an action on one
  // row never flashes the whole table away.
  const { data: rows, isLoading, refetch: refetchPlan } = useByMachine(appliedMachineId, appliedShiftId, applied?.date);

  // Replaces polling: once Load has fetched the plan, this keeps Produced Qty/Status/Timer fresh
  // by patching WebSocket events straight into the same query's cache - see the hook for details.
  useProductionSocket({ machineId: appliedMachineId, shiftId: appliedShiftId, scheduleDate: applied?.date });

  // useByMachine's queryKey is built from `applied`'s fields - tapping Load again with the same
  // Date/Machine/Shift still in the draft produces an object deep-equal to the current `applied`,
  // so React Query sees the same key and won't refetch on its own (that only happens automatically
  // when the key actually changes). Force it explicitly in that case so Load always hits the API.
  const handleLoad = () => {
    update(draft);
    const next = { ...draft };
    const unchanged = applied && next.date === applied.date && next.machineId === applied.machineId && next.shiftId === applied.shiftId;
    setApplied(next);
    if (unchanged) refetchPlan();
  };

  // Auto-load once, on mount, whenever a Machine is already known (fixed via Settings, or
  // remembered from a previous session) - Date defaults to today and Shift defaults to blank
  // ("All Shifts"), so the plan for every shift today shows up the instant the page opens rather
  // than waiting for the operator to press Load. Load stays available for an explicit re-load
  // after changing a filter.
  useEffect(() => {
    if (draft.date && draft.machineId) setApplied({ ...draft });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const machine = machines?.data?.find((m) => String(m.id) === String(draft.machineId));
  const selectedShiftName = applied?.shiftId
    ? shiftOptions?.find((s) => String(s.shiftId) === String(applied.shiftId))?.shiftName
    : 'All Shifts';
  const canLoad = !!draft.date && !!draft.machineId;

  const [coilRow, setCoilRow] = useState(null);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={machine ? `${machine.machine_code} · ${machine.machine_name}` : 'Machine Planning'} />

      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Machine Planning
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Your plan for today loads automatically - narrow it to one Shift, or change Date/Machine, any time.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap" useFlexGap>
            <TextField
              label="Date"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={draft.date}
              onChange={(e) => setDraftField({ date: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon fontSize="small" color="action" /></InputAdornment> }}
              sx={{ minWidth: 190 }}
            />
            {machineId ? (
              // Machine is fixed in Settings for this device - shown read-only here so it can't
              // be silently changed mid-shift; go to Settings to switch machines.
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
                value={draft.machineId}
                onChange={(e) => setDraftField({ machineId: e.target.value })}
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
              value={draft.shiftId}
              onChange={(e) => setDraftField({ shiftId: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon fontSize="small" color="action" /></InputAdornment> }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Shifts</MenuItem>
              {shiftOptions?.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.shiftName}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="large"
              startIcon={<ManageSearchIcon />}
              onClick={handleLoad}
              disabled={!canLoad}
              sx={{ height: 40 }}
            >
              Load
            </Button>
          </Stack>
        </Paper>

        {!applied ? (
          <Alert severity="info">Select a Machine, then tap Load to see the plan (Shift is optional - leave it blank for every shift).</Alert>
        ) : (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1">Machine Plan</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {machine ? `${machine.machine_code} - ${machine.machine_name}` : ''} · {selectedShiftName || ''} · {applied.date}
            </Typography>

            <TableContainer
              sx={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Table
                size="small"
                sx={{
                  '& .MuiTableCell-root': { border: '1px solid', borderColor: 'divider' },
                  '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 700, bgcolor: 'action.hover' },
                }}
              >
                <TableHead>
                  <TableRow>
                    {PLAN_COLUMNS.map((label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={PLAN_COLUMNS.length} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : rows?.length ? (
                    rows.map((row) => {
                      // While any row is RUNNING, that row is highlighted and every other row on
                      // this screen is dimmed and locked - only one order can physically be
                      // running on a machine at once, so there's nothing useful to do on the rest
                      // until it's stopped/completed (matches the backend's single-running check).
                      const isRunning = row.production_status === 'RUNNING';
                      const someoneElseRunning = rows.some((r) => r.production_status === 'RUNNING' && r.id !== row.id);
                      return (
                        <TableRow
                          key={row.id}
                          sx={{
                            opacity: someoneElseRunning ? 0.4 : 1,
                            pointerEvents: someoneElseRunning ? 'none' : 'auto',
                            transition: 'opacity 0.2s, background-color 0.2s',
                            ...(isRunning && { bgcolor: (theme) => alpha(theme.palette.success.main, 0.08) }),
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {row.order_no}
                            </Typography>
                            {row.priority && (
                              <Chip size="small" label={row.priority} variant="outlined" sx={{ mt: 0.5, height: 20 }} />
                            )}
                          </TableCell>
                          <TableCell>{row.customer_name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {row.item_code}
                            </Typography>
                            {row.size && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {row.size}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.shift_name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {row.operator_name || '—'}
                              {row.lot_no ? ` · Lot ${row.lot_no}` : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.quantity}</TableCell>
                          <TableCell>
                            <ProductionTimerCell row={row} disabledStart={someoneElseRunning} />
                          </TableCell>
                          <TableCell>
                            <ProducedQtyCell row={row} disabled={someoneElseRunning} />
                          </TableCell>
                          <TableCell>
                            <CoilInfoCell row={row} onOpen={setCoilRow} disabled={someoneElseRunning} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={PLAN_COLUMNS.length} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nothing scheduled for this Machine, Date and Shift.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {coilRow && <CoilInfoDialog row={coilRow} onClose={() => setCoilRow(null)} />}

      <BottomBar />
    </Box>
  );
}
