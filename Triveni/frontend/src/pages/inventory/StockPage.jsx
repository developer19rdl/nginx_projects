import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TuneIcon from '@mui/icons-material/Tune';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LockClockIcon from '@mui/icons-material/LockClock';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import KpiCard from '../../components/common/KpiCard';
import DispatchDialog from '../../components/inventory/DispatchDialog';
import TransferDialog from '../../components/inventory/TransferDialog';
import AdjustmentDialog from '../../components/inventory/AdjustmentDialog';
import HoldDialog from '../../components/inventory/HoldDialog';
import { useInventorySummary, useBatchStock } from '../../hooks/useInventory';

const SUMMARY_COLUMNS = [
  { key: 'item_code', label: 'Item' },
  { key: 'size', label: 'Size', render: (row) => row.size || '—' },
  { key: 'available_qty', label: 'Available' },
  { key: 'reserved_qty', label: 'Reserved' },
  { key: 'hold_qty', label: 'On Hold' },
  { key: 'total_qty', label: 'Total', render: (row) => <strong>{row.total_qty}</strong> },
];

const BATCH_COLUMNS = [
  { key: 'item_code', label: 'Item' },
  { key: 'size', label: 'Size', render: (row) => row.size || '—' },
  { key: 'lot_no', label: 'Batch / Lot', render: (row) => row.lot_no || '—' },
  { key: 'warehouse_name', label: 'Warehouse' },
  { key: 'location_code', label: 'Location' },
  { key: 'available_qty', label: 'Available' },
  { key: 'reserved_qty', label: 'Reserved' },
  { key: 'hold_qty', label: 'On Hold' },
];

/**
 * Finished Goods stock at a glance: an item+size rollup (Get Inventory) plus, once an item is
 * searched, the per-batch/warehouse/location breakdown underneath it (Get Batch Stock) - the two
 * APIs the spec asked for, on one page instead of two, since batch detail is meaningless without
 * an item context anyway. The four stock actions are global buttons here rather than per-row,
 * matching how a real inventory system's action bar works - the dialogs themselves ask for the
 * item/batch/location instead of requiring a row click first.
 */
export default function StockPage() {
  const [itemCode, setItemCode] = useState('');
  const [activeDialog, setActiveDialog] = useState(null);

  const { data: summary, isLoading: summaryLoading } = useInventorySummary(itemCode || undefined);
  const { data: batchRows, isLoading: batchLoading } = useBatchStock(itemCode ? { itemCode } : undefined);

  const totals = (summary || []).reduce(
    (acc, r) => ({
      skus: acc.skus + 1,
      available: acc.available + Number(r.available_qty),
      hold: acc.hold + Number(r.hold_qty),
    }),
    { skus: 0, available: 0, hold: 0 }
  );

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" startIcon={<LocalShippingIcon />} onClick={() => setActiveDialog('dispatch')}>
          Dispatch
        </Button>
        <Button variant="outlined" startIcon={<SwapHorizIcon />} onClick={() => setActiveDialog('transfer')}>
          Transfer
        </Button>
        <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setActiveDialog('adjust')}>
          Adjustment
        </Button>
        <Button variant="outlined" color="warning" startIcon={<PauseCircleIcon />} onClick={() => setActiveDialog('hold')}>
          Hold
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <KpiCard icon={<Inventory2Icon fontSize="small" />} color="primary" label="SKUs in Stock" value={totals.skus} />
        <KpiCard icon={<WarehouseIcon fontSize="small" />} color="success" label="Total Available Qty" value={totals.available.toLocaleString()} />
        <KpiCard icon={<LockClockIcon fontSize="small" />} color="warning" label="Total On Hold Qty" value={totals.hold.toLocaleString()} />
      </Stack>

      <FilterBar>
        <TextField
          label="Item Code"
          size="small"
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          placeholder="Search to see batch detail below"
        />
      </FilterBar>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Stock Summary
      </Typography>
      <DataTable columns={SUMMARY_COLUMNS} rows={summary} loading={summaryLoading} emptyMessage="No stock recorded yet" />

      {itemCode && (
        <>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>
            Batch Detail - {itemCode}
          </Typography>
          <DataTable columns={BATCH_COLUMNS} rows={batchRows} loading={batchLoading} emptyMessage="No batches found for this item" />
        </>
      )}

      <DispatchDialog open={activeDialog === 'dispatch'} onClose={() => setActiveDialog(null)} />
      <TransferDialog open={activeDialog === 'transfer'} onClose={() => setActiveDialog(null)} />
      <AdjustmentDialog open={activeDialog === 'adjust'} onClose={() => setActiveDialog(null)} />
      <HoldDialog open={activeDialog === 'hold'} onClose={() => setActiveDialog(null)} />
    </Box>
  );
}
