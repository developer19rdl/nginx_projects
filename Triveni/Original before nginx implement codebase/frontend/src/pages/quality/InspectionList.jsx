import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { QUALITY_STATUS_LABELS } from '../../constants';
import { useInspections } from '../../hooks/useQualityInspections';

const STATUS_OPTIONS = ['UNDER_INSPECTION', 'APPROVED', 'APPROVED_WITH_DEVIATION', 'REWORK_REQUIRED', 'REJECTED', 'HOLD'];

const COLUMNS = [
  { key: 'inspection_no', label: 'Inspection No' },
  { key: 'order_no', label: 'Order No' },
  { key: 'lot_no', label: 'Lot No', render: (row) => row.lot_no || '—' },
  { key: 'item_code', label: 'Item' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'machine_code', label: 'Machine', render: (row) => row.machine_code },
  { key: 'inspector_full_name', label: 'Inspector', render: (row) => row.inspector_full_name || '—' },
  { key: 'quantity_produced', label: 'Qty Produced' },
  { key: 'quantity_accepted', label: 'Qty Accepted', render: (row) => row.quantity_accepted ?? '—' },
  { key: 'quantity_rejected', label: 'Qty Rejected', render: (row) => row.quantity_rejected ?? '—' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={QUALITY_STATUS_LABELS[row.status] || row.status} />,
  },
  {
    key: 'released_to_inventory',
    label: 'Released',
    render: (row) => (row.released_to_inventory ? <Chip size="small" label="Released" color="success" /> : '—'),
  },
];

/** Full traceability/history view across every inspection ever recorded - Production Order,
 * Batch/Lot, Machine, Operator, Inspector are all denormalized onto quality_inspections at
 * creation time, so this list (and each row's detail) stays accurate even if the source
 * machine_planning row is later edited. */
export default function InspectionList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1 });

  const { data, isLoading } = useInspections(filters);

  return (
    <Box>
      <FilterBar>
        <TextField
          select
          label="Status"
          size="small"
          sx={{ minWidth: 200 }}
          value={filters.status || ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
        >
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {QUALITY_STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Item Code"
          size="small"
          value={filters.itemCode || ''}
          onChange={(e) => setFilters((f) => ({ ...f, itemCode: e.target.value || undefined, page: 1 }))}
        />
        <TextField
          label="Customer"
          size="small"
          value={filters.customerName || ''}
          onChange={(e) => setFilters((f) => ({ ...f, customerName: e.target.value || undefined, page: 1 }))}
        />
        <TextField
          label="From"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.dateFrom || ''}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.dateTo || ''}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined, page: 1 }))}
        />
      </FilterBar>

      <DataTable
        columns={COLUMNS}
        rows={data?.rows}
        meta={data?.meta}
        loading={isLoading}
        onRowClick={(row) => navigate(`/quality/inspections/${row.id}`)}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        emptyMessage="No inspections recorded yet"
      />
    </Box>
  );
}
