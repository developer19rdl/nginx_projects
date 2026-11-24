import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ItemSizeField from './ItemSizeField';
import LotNoField from './LotNoField';
import WarehouseLocationField from './WarehouseLocationField';
import { useDispatchStock } from '../../hooks/useInventory';

const emptyForm = { itemCode: '', size: '', lotNo: '', quantity: '', warehouseId: null, locationId: null, referenceNo: '', remarks: '' };

/** Reduces available stock when finished goods physically leave the warehouse - posts a DISPATCH
 * transaction. `initial` optionally pre-fills item/size/lot/warehouse/location when opened from a
 * specific batch-stock row. */
export default function DispatchDialog({ open, onClose, initial }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatchStock();
  const [form, setForm] = useState(emptyForm);

  // Re-seed fresh every time this (permanently-mounted) dialog transitions closed -> open.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm({ ...emptyForm, ...initial });
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const canSubmit = form.itemCode && Number(form.quantity) > 0;

  const submit = async () => {
    await dispatch.mutateAsync({
      itemCode: form.itemCode,
      size: form.size || null,
      lotNo: form.lotNo || null,
      quantity: Number(form.quantity),
      warehouseId: form.warehouseId || null,
      locationId: form.locationId || null,
      referenceNo: form.referenceNo || null,
      remarks: form.remarks || null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Stock Dispatch</DialogTitle>
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
          <WarehouseLocationField
            optional
            warehouseId={form.warehouseId}
            locationId={form.locationId}
            onChange={(v) => setForm((f) => ({ ...f, ...v }))}
          />
          <TextField
            label="Reference No"
            placeholder="Dispatch Order / Invoice No"
            value={form.referenceNo}
            onChange={(e) => setForm((f) => ({ ...f, referenceNo: e.target.value }))}
          />
          <TextField label="Remarks" value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} multiline rows={2} />
          {dispatch.isError && <Alert severity="error">{dispatch.error.response?.data?.message || 'Dispatch failed'}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!canSubmit || dispatch.isPending}>
          {dispatch.isPending ? 'Dispatching...' : 'Dispatch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
