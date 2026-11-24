import { useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { useItems } from '../../hooks/useMasters';

/** Item + Size picker shared by every stock action dialog (Dispatch/Transfer/Adjustment/Hold) -
 * an autocomplete over the Items master (searches as you type) plus a plain Size field, since
 * items are unique by item_code + size but the master's search is naturally keyed on item_code.
 * Picking a suggestion fills both fields at once; typing a code that isn't in the master still
 * works (the value is just item_code/size text, not a foreign key). */
export default function ItemSizeField({ itemCode, size, onChange }) {
  const [search, setSearch] = useState('');
  const { data } = useItems({ search, pageSize: 20 });
  const options = useMemo(() => data?.data || [], [data]);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : `${opt.item_code}${opt.size ? ` (${opt.size})` : ''}`)}
        inputValue={itemCode}
        onInputChange={(e, value, reason) => {
          // MUI also fires onInputChange right after a selection, with the *displayed* label
          // text ("CR (1.2X1250XC)") rather than the raw item_code - that reason is 'reset', not
          // 'input'. Only treat 'input' (the user actually typing) as a real itemCode edit, or
          // a selection's onChange below gets immediately clobbered by the display label.
          if (reason !== 'input') return;
          onChange({ itemCode: value, size });
          setSearch(value);
        }}
        onChange={(e, value) => {
          if (value && typeof value !== 'string') onChange({ itemCode: value.item_code, size: value.size || '' });
        }}
        onOpen={() => setSearch(itemCode)}
        renderInput={(params) => <TextField {...params} label="Item Code" required />}
        sx={{ flex: 2 }}
      />
      <TextField label="Size" value={size} onChange={(e) => onChange({ itemCode, size: e.target.value })} sx={{ flex: 1 }} />
    </Stack>
  );
}
