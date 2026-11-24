import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormDialog from '../common/FormDialog';
import ItemSizeField from './ItemSizeField';
import LotNoField from './LotNoField';
import WarehouseLocationField from './WarehouseLocationField';
import { useAdjustStock } from '../../hooks/useInventory';

const emptyForm = { itemCode: '', size: '', lotNo: '', warehouseId: null, locationId: null, quantity: '', direction: 'IN', reason: '' };

/** Corrects a balance with a mandatory reason - the only sanctioned way to change stock outside
 * of Quality Acceptance/Dispatch/Transfer/Hold (a correction is its own auditable adjustment,
 * never a silent edit to a released Quality Report). */
export default function AdjustmentDialog({ open, onClose, initial }) {
  const adjust = useAdjustStock();
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
    await adjust.mutateAsync({
      itemCode: form.itemCode,
      size: form.size || null,
      lotNo: form.lotNo || null,
      warehouseId: form.warehouseId,
      locationId: form.locationId,
      quantity: Number(form.quantity),
      direction: form.direction,
      reason: form.reason,
    });
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Stock Adjustment"
      onSubmit={submit}
      submitLabel="Save Adjustment"
      canSubmit={canSubmit}
      loading={adjust.isPending}
      error={adjust.isError && (adjust.error.response?.data?.message || 'Adjustment failed')}
    >
      <ItemSizeField itemCode={form.itemCode} size={form.size} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
      <WarehouseLocationField
        warehouseId={form.warehouseId}
        locationId={form.locationId}
        onChange={(v) => setForm((f) => ({ ...f, ...v }))}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <LotNoField itemCode={form.itemCode} size={form.size} lotNo={form.lotNo} onChange={(lotNo) => setForm((f) => ({ ...f, lotNo }))} />
        <TextField
          label="Quantity"
          type="number"
          required
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          sx={{ flex: 1 }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={form.direction}
          onChange={(e, value) => value && setForm((f) => ({ ...f, direction: value }))}
        >
          <ToggleButton value="IN" color="success">
            Increase
          </ToggleButton>
          <ToggleButton value="OUT" color="error">
            Decrease
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <TextField
        label="Reason"
        required
        multiline
        rows={2}
        placeholder="e.g. Cycle count correction, damaged stock write-off"
        value={form.reason}
        onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
      />
    </FormDialog>
  );
}
