import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import { useMachines } from '../../hooks/useMachines';
import { useShiftSummary, useByMachine } from '../../hooks/useMachinePlanning';

const MACHINE_COLUMN = { key: 'machine_display', label: 'Machine', render: (row) => `${row.machine_code} - ${row.machine_name}` };

const PLAN_COLUMNS = [
  { key: 'order_no', label: 'Order No' },
  { key: 'priority', label: 'Priority' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'item_code', label: 'Item' },
  { key: 'size', label: 'Size' },
  { key: 'shift_name', label: 'Shift' },
  { key: 'operator_name', label: 'Operator', render: (row) => row.operator_name || '—' },
  { key: 'lot_no', label: 'Lot No' },
  { key: 'quantity', label: 'Qty' },
  { key: 'produced_qty', label: 'Produced Qty' },
];

const today = dayjs().format('YYYY-MM-DD');

export default function MachinePlanning() {
  const [draft, setDraft] = useState({ date: today, machineId: '', shiftId: '' });
  // Opens already loaded with today's plan across every machine - Load just re-applies the draft
  // (e.g. after narrowing by machine/shift), it isn't required for the initial view any more.
  const [applied, setApplied] = useState({ date: today, machineId: '', shiftId: '' });

  const { data: machines } = useMachines({ pageSize: 200 });
  // Shift options come straight from the Shift master - the same list for every machine/date.
  const { data: shiftOptions } = useShiftSummary();

  const { data: planRows, isLoading: planLoading, refetch: refetchPlan } = useByMachine(
    applied?.machineId ? Number(applied.machineId) : undefined,
    applied?.shiftId ? Number(applied.shiftId) : undefined,
    applied?.date
  );

  // "All machines" view (no Machine filter applied) needs its own Machine column so rows from
  // different machines aren't indistinguishable.
  const machineColumns = useMemo(() => [PLAN_COLUMNS[0], MACHINE_COLUMN, ...PLAN_COLUMNS.slice(1)], []);

  const setDraftField = (patch) => setDraft((d) => ({ ...d, ...patch }));

  // useByMachine's queryKey is built from `applied`'s fields - if Load is clicked again with the
  // same Date/Machine/Shift selection still in the draft, setApplied produces an object that's
  // deep-equal to the current `applied`, so React Query sees the same key and won't refetch on its
  // own (that only happens automatically when the key actually changes). Force it explicitly in
  // that case so Load always hits the API, not just on the first click per distinct selection.
  const handleLoad = () => {
    const next = { ...draft };
    const unchanged = next.date === applied.date && next.machineId === applied.machineId && next.shiftId === applied.shiftId;
    setApplied(next);
    if (unchanged) refetchPlan();
  };

  const selectedShift = shiftOptions?.find((s) => String(s.shiftId) === String(applied?.shiftId));

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarViewWeekIcon color="primary" />
            <span>Machine Planning</span>
          </Stack>
        }
        subtitle="Loads today's plan across all machines by default - filter by Machine or Shift as needed"
      />

      <FilterBar>
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
              <MenuItem key={m.id} value={m.id}>{m.machine_code} - {m.machine_name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Shift"
            size="small"
            value={draft.shiftId}
            onChange={(e) => setDraftField({ shiftId: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All shifts</MenuItem>
            {shiftOptions?.map((s) => (
              <MenuItem key={s.shiftId} value={s.shiftId}>{s.shiftName}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleLoad}
            disabled={!draft.date}
            sx={{ height: 40 }}
          >
            Load
          </Button>
      </FilterBar>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle1">Machine Plan</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {applied.machineId
            ? `${applied.shiftId ? `Rows scheduled in ${selectedShift?.shiftName || 'the selected shift'}` : 'All shifts scheduled'} on ${applied.date}`
            : `All machines${applied.shiftId ? `, ${selectedShift?.shiftName || 'the selected shift'}` : ', all shifts'} on ${applied.date}`}
        </Typography>
        <DataTable
          columns={applied.machineId ? PLAN_COLUMNS : machineColumns}
          rows={planRows}
          loading={planLoading}
          emptyMessage="Nothing planned on this date yet"
        />
      </Paper>
    </Box>
  );
}
