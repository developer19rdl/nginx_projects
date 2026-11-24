import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ItemSizeField from './ItemSizeField';
import LotNoField from './LotNoField';
import WarehouseLocationField from './WarehouseLocationField';
import { useTransferStock } from '../../hooks/useInventory';

const emptyForm = {
  itemCode: '',
  size: '',
  lotNo: '',
  quantity: '',
  fromWarehouseId: null,
  fromLocationId: null,
  toWarehouseId: null,
  toLocationId: null,
  remarks: '',
};

/** Moves stock between warehouse/location - posts a TRANSFER_OUT at the source and a
 * TRANSFER_IN at the destination, linked by one stock_transfers record. */
export default function TransferDialog({ open, onClose, initial }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const transfer = useTransferStock();
  const [form, setForm] = useState(emptyForm);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm({ ...emptyForm, ...initial });
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const sameLocation = form.fromLocationId && form.fromLocationId === form.toLocationId;
  const canSubmit = form.itemCode && Number(form.quantity) > 0 && form.fromLocationId && form.toLocationId && !sameLocation;

  const submit = async () => {
    await transfer.mutateAsync({
      itemCode: form.itemCode,
      size: form.size || null,
      lotNo: form.lotNo || null,
      quantity: Number(form.quantity),
      fromWarehouseId: form.fromWarehouseId,
      fromLocationId: form.fromLocationId,
      toWarehouseId: form.toWarehouseId,
      toLocationId: form.toLocationId,
      remarks: form.remarks || null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Stock Transfer</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ItemSizeField itemCode={form.itemCode} size={form.size} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <LotNoField itemCode={form.itemCode} size={form.size} lotNo={form.lotNo} onChange={(lotNo) => setForm((f) => ({ ...f, lotNo }))} />
            <TextField
              label="Quantity"
              type="number"
              required
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
            From
          </Typography>
          <WarehouseLocationField
            warehouseId={form.fromWarehouseId}
            locationId={form.fromLocationId}
            onChange={(v) => setForm((f) => ({ ...f, fromWarehouseId: v.warehouseId, fromLocationId: v.locationId }))}
          />

          <Stack alignItems="center">
            <ArrowDownwardIcon color="action" />
          </Stack>

          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
            To
          </Typography>
          <WarehouseLocationField
            warehouseId={form.toWarehouseId}
            locationId={form.toLocationId}
            onChange={(v) => setForm((f) => ({ ...f, toWarehouseId: v.warehouseId, toLocationId: v.locationId }))}
          />

          <TextField label="Remarks" value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} multiline rows={2} />

          {sameLocation && <Alert severity="warning">Source and destination location must be different.</Alert>}
          {transfer.isError && <Alert severity="error">{transfer.error.response?.data?.message || 'Transfer failed'}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!canSubmit || transfer.isPending}>
          {transfer.isPending ? 'Transferring...' : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
