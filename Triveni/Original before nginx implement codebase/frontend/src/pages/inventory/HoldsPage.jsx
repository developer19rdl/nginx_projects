import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import dayjs from 'dayjs';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import ReleaseHoldDialog from '../../components/inventory/ReleaseHoldDialog';
import { useStockHolds } from '../../hooks/useInventory';

/** Every quantity currently sitting on hold (Stock Hold action from the Stock tab), with a
 * Release action per row - "Stock Release" from the spec. */
export default function HoldsPage() {
  const [status, setStatus] = useState('ON_HOLD');
  const [releasing, setReleasing] = useState(null);
  const { data: holds, isLoading } = useStockHolds(status || undefined);

  const columns = [
    { key: 'hold_no', label: 'Hold No' },
    { key: 'item_code', label: 'Item' },
    { key: 'size', label: 'Size', render: (row) => row.size || '—' },
    { key: 'lot_no', label: 'Batch', render: (row) => row.lot_no || '—' },
    { key: 'warehouse_code', label: 'Location', render: (row) => `${row.warehouse_code} / ${row.location_code}` },
    { key: 'quantity', label: 'Quantity' },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Chip size="small" color={row.status === 'ON_HOLD' ? 'warning' : 'success'} label={row.status === 'ON_HOLD' ? 'On Hold' : 'Released'} />,
    },
    { key: 'held_by_name', label: 'Held By', render: (row) => row.held_by_name || '—' },
    { key: 'held_at', label: 'Held At', render: (row) => dayjs(row.held_at).format('DD-MMM-YYYY HH:mm') },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        row.status === 'ON_HOLD' && (
          <Button size="small" variant="outlined" onClick={() => setReleasing(row)}>
            Release
          </Button>
        ),
    },
  ];

  return (
    <Box>
      <FilterBar>
        <TextField select label="Status" size="small" sx={{ minWidth: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="ON_HOLD">On Hold</MenuItem>
          <MenuItem value="RELEASED">Released</MenuItem>
          <MenuItem value="">All</MenuItem>
        </TextField>
      </FilterBar>

      <DataTable columns={columns} rows={holds} loading={isLoading} emptyMessage="No stock is currently on hold" />

      <ReleaseHoldDialog hold={releasing} onClose={() => setReleasing(null)} />
    </Box>
  );
}
