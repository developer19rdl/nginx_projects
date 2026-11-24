import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import dayjs from 'dayjs';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import InventoryTransactionDialog from '../../components/inventory/InventoryTransactionDialog';
import { useInventoryTransactions } from '../../hooks/useInventory';

const TYPE_LABELS = {
  QUALITY_ACCEPTANCE: 'Quality Acceptance',
  DISPATCH: 'Dispatch',
  TRANSFER_OUT: 'Transfer Out',
  TRANSFER_IN: 'Transfer In',
  ADJUSTMENT_IN: 'Adjustment In',
  ADJUSTMENT_OUT: 'Adjustment Out',
  HOLD: 'Hold',
  RELEASE: 'Hold Release',
};
const TYPE_COLORS = {
  QUALITY_ACCEPTANCE: 'success',
  DISPATCH: 'error',
  TRANSFER_OUT: 'warning',
  TRANSFER_IN: 'info',
  ADJUSTMENT_IN: 'success',
  ADJUSTMENT_OUT: 'error',
  HOLD: 'warning',
  RELEASE: 'info',
};

const COLUMNS = [
  { key: 'transaction_no', label: 'Transaction No' },
  { key: 'transaction_type', label: 'Type', render: (row) => <Chip size="small" color={TYPE_COLORS[row.transaction_type]} label={TYPE_LABELS[row.transaction_type]} /> },
  { key: 'item_code', label: 'Item' },
  { key: 'size', label: 'Size', render: (row) => row.size || '—' },
  { key: 'lot_no', label: 'Lot No', render: (row) => row.lot_no || '—' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'warehouse_code', label: 'Location', render: (row) => `${row.warehouse_code} / ${row.location_code}` },
  { key: 'created_by_name', label: 'User', render: (row) => row.created_by_name || '—' },
  { key: 'created_at', label: 'Date', render: (row) => dayjs(row.created_at).format('DD-MMM-YYYY HH:mm') },
];

/** Global, filterable audit trail across every stock movement of every type - "Inventory
 * Transaction History" from the spec. Row click opens the same detail dialog the Quality Report
 * screen's "View Inventory Transaction" link uses. */
export default function TransactionsPage() {
  const [filters, setFilters] = useState({ page: 1 });
  const [viewTransactionId, setViewTransactionId] = useState(null);
  const { data, isLoading } = useInventoryTransactions(filters);

  return (
    <Box>
      <FilterBar>
        <TextField
          label="Item Code"
          size="small"
          value={filters.itemCode || ''}
          onChange={(e) => setFilters((f) => ({ ...f, itemCode: e.target.value || undefined, page: 1 }))}
        />
        <TextField
          select
          label="Type"
          size="small"
          sx={{ minWidth: 200 }}
          value={filters.transactionType || ''}
          onChange={(e) => setFilters((f) => ({ ...f, transactionType: e.target.value || undefined, page: 1 }))}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
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
        rows={data?.data}
        meta={data?.meta}
        loading={isLoading}
        onRowClick={(row) => setViewTransactionId(row.id)}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        emptyMessage="No inventory transactions recorded yet"
      />

      <InventoryTransactionDialog transactionId={viewTransactionId} onClose={() => setViewTransactionId(null)} />
    </Box>
  );
}
