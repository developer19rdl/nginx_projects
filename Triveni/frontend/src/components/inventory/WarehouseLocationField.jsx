import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useWarehouses, useWarehouseLocations } from '../../hooks/useInventory';

/** Cascading Warehouse -> Location picker shared by every stock action dialog. Picking a
 * warehouse resets the location choice, since a location from the old warehouse would no longer
 * be valid. */
export default function WarehouseLocationField({ label = 'Warehouse', warehouseId, locationId, onChange, optional }) {
  const { data: warehouses } = useWarehouses();
  const { data: locations } = useWarehouseLocations(warehouseId);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        select
        label={optional ? `${label} (defaults to Finished Goods)` : label}
        required={!optional}
        value={warehouseId || ''}
        onChange={(e) => onChange({ warehouseId: Number(e.target.value), locationId: null })}
        sx={{ flex: 1 }}
      >
        {warehouses?.length ? (
          warehouses.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.warehouse_name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="" disabled>
            Loading...
          </MenuItem>
        )}
      </TextField>
      <TextField
        select
        label="Location"
        required={!optional}
        disabled={!warehouseId}
        value={locationId || ''}
        onChange={(e) => onChange({ warehouseId, locationId: Number(e.target.value) })}
        sx={{ flex: 1 }}
      >
        {locations?.length ? (
          locations.map((l) => (
            <MenuItem key={l.id} value={l.id}>
              {l.location_name || l.location_code}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="" disabled>
            {warehouseId ? 'No locations' : 'Select a warehouse first'}
          </MenuItem>
        )}
      </TextField>
    </Stack>
  );
}
