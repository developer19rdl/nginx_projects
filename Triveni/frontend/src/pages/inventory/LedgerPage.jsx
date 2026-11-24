import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import InventoryTransactionDialog from '../../components/inventory/InventoryTransactionDialog';
import { useInventoryLedger } from '../../hooks/useInventory';
import { exportInventoryLedger } from '../../api/inventory.api';

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

const COLUMNS = [
  { key: 'created_at', label: 'Date', render: (row) => dayjs(row.created_at).format('DD-MMM-YYYY HH:mm') },
  { key: 'transaction_type', label: 'Transaction', render: (row) => <Chip size="small" label={TYPE_LABELS[row.transaction_type]} /> },
  { key: 'transaction_no', label: 'Reference', render: (row) => row.inspection_no || row.transaction_no },
  { key: 'lot_no', label: 'Lot No', render: (row) => row.lot_no || '—' },
  { key: 'warehouse_code', label: 'Location', render: (row) => `${row.warehouse_code} / ${row.location_code}` },
  { key: 'qty_in', label: 'In', render: (row) => (Number(row.qty_in) > 0 ? Number(row.qty_in).toLocaleString() : '—') },
  { key: 'qty_out', label: 'Out', render: (row) => (Number(row.qty_out) > 0 ? Number(row.qty_out).toLocaleString() : '—') },
  { key: 'running_balance', label: 'Balance', render: (row) => <strong>{Number(row.running_balance).toLocaleString()}</strong> },
];

/** The full Inventory Ledger for one item(+size/+batch) - a running on-hand balance, oldest
 * first, same shape as the spec's example table. Requires an Item Code since a ledger without
 * one isn't a meaningful "balance over time" view. */
export default function LedgerPage() {
  const [filters, setFilters] = useState({ itemCode: '', size: '', lotNo: '', dateFrom: '', dateTo: '' });
  const [viewTransactionId, setViewTransactionId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { data: rows, isLoading } = useInventoryLedger(filters.itemCode ? filters : undefined);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportInventoryLedger(filters);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <FilterBar>
        <TextField
          label="Item Code"
          size="small"
          required
          value={filters.itemCode}
          onChange={(e) => setFilters((f) => ({ ...f, itemCode: e.target.value }))}
        />
        <TextField label="Size" size="small" value={filters.size} onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))} />
        <TextField
          label="Batch / Lot No"
          size="small"
          value={filters.lotNo}
          onChange={(e) => setFilters((f) => ({ ...f, lotNo: e.target.value }))}
        />
        <TextField
          label="From"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
        />
        <Button
          variant="outlined"
          startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={!filters.itemCode || exporting}
        >
          {exporting ? 'Preparing…' : 'Export to Excel'}
        </Button>
      </FilterBar>

      {!filters.itemCode ? (
        <Alert severity="info">Enter an Item Code to view its inventory ledger and running balance.</Alert>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={rows}
          loading={isLoading}
          emptyMessage="No movements recorded for this item yet"
          onRowClick={(row) => setViewTransactionId(row.id)}
        />
      )}

      <InventoryTransactionDialog transactionId={viewTransactionId} onClose={() => setViewTransactionId(null)} />
    </Box>
  );
}
