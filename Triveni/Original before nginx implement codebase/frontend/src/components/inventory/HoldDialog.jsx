import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormDialog from '../common/FormDialog';
import ItemSizeField from './ItemSizeField';
import LotNoField from './LotNoField';
import WarehouseLocationField from './WarehouseLocationField';
import { useHoldStock } from '../../hooks/useInventory';

const emptyForm = { itemCode: '', size: '', lotNo: '', warehouseId: null, locationId: null, quantity: '', reason: '' };

/** Moves quantity from available to hold - total on-hand stock is unchanged, it just becomes
 * unavailable for dispatch/transfer until released (Stock Release, from the Holds tab). */
export default function HoldDialog({ open, onClose, initial }) {
  const hold = useHoldStock();
  const [form, setForm] = useState(emptyForm);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm({ ...emptyForm, ...initial });
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const canSubmit = Boolean(form.itemCode && form.locationId && Number(form.quantity) > 0 && form.reason.trim());

  const submit = async () => {
    await hold.mutateAsync({
      itemCode: form.itemCode,
      size: form.size || null,
      lotNo: form.lotNo || null,
      warehouseId: form.warehouseId,
      locationId: form.locationId,
      quantity: Number(form.quantity),
      reason: form.reason,
    });
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Stock Hold"
      onSubmit={submit}
      submitLabel="Place on Hold"
      submitColor="warning"
      canSubmit={canSubmit}
      loading={hold.isPending}
      error={hold.isError && (hold.error.response?.data?.message || 'Could not place stock on hold')}
    >
      <ItemSizeField itemCode={form.itemCode} size={form.size} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
      <WarehouseLocationField
        warehouseId={form.warehouseId}
        locationId={form.locationId}
        onChange={(v) => setForm((f) => ({ ...f, ...v }))}
      />
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
      <TextField
        label="Reason"
        required
        multiline
        rows={2}
        placeholder="e.g. Suspected quality issue, pending customer approval"
        value={form.reason}
        onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
      />
    </FormDialog>
  );
}
