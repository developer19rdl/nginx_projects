import { useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useBatchStock } from '../../hooks/useInventory';

/** Batch/Lot No picker shared by every stock action dialog. Free typing still works (e.g. a brand
 * new lot on a Stock Adjustment IN), but as soon as an item is chosen this also lists the batches
 * that actually exist in stock for it - so dispatching/transferring/holding against a batch means
 * picking a real one instead of guessing the exact lot string. A blank or mistyped lot silently
 * targets a different, unrelated (usually empty) balance row and looks like "no stock available"
 * even though the item clearly has stock. */
export default function LotNoField({ itemCode, size, lotNo, onChange, label = 'Batch / Lot No' }) {
  const { data: batches } = useBatchStock(itemCode ? { itemCode, size: size || undefined } : undefined);

  const options = useMemo(() => {
    const seen = new Set();
    return (batches || []).filter((b) => {
      const key = `${b.size}::${b.lot_no}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [batches]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.lot_no || '(no batch)')}
      inputValue={lotNo}
      onInputChange={(e, value, reason) => {
        // Same MUI quirk as ItemSizeField: a selection also fires onInputChange right after, with
        // the *displayed* label - only 'input' (the user actually typing) is a real lotNo edit.
        if (reason !== 'input') return;
        onChange(value);
      }}
      onChange={(e, value) => {
        if (typeof value === 'string') onChange(value);
        else if (value) onChange(value.lot_no || '');
      }}
      renderOption={(props, opt) => (
        <li {...props} key={`${opt.size}::${opt.lot_no}`}>
          {opt.lot_no || '(no batch)'}
          {opt.size ? ` · ${opt.size}` : ''} — {opt.available_qty} available
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={{ flex: 1 }}
    />
  );
}
