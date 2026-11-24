import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  useWarehouses,
  useAllWarehouseLocations,
  useCreateWarehouse,
  useSetWarehouseActive,
  useCreateWarehouseLocation,
  useSetWarehouseLocationActive,
} from '../../hooks/useInventory';

function WarehouseFormDialog({ open, onClose }) {
  const createWarehouse = useCreateWarehouse();
  const [form, setForm] = useState({ warehouseCode: '', warehouseName: '' });

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm({ warehouseCode: '', warehouseName: '' });
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const submit = async () => {
    await createWarehouse.mutateAsync(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Warehouse</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Warehouse Code"
            required
            value={form.warehouseCode}
            onChange={(e) => setForm((f) => ({ ...f, warehouseCode: e.target.value }))}
          />
          <TextField
            label="Warehouse Name"
            required
            value={form.warehouseName}
            onChange={(e) => setForm((f) => ({ ...f, warehouseName: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!form.warehouseCode || !form.warehouseName || createWarehouse.isPending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LocationFormDialog({ open, onClose, warehouses }) {
  const createLocation = useCreateWarehouseLocation();
  const [form, setForm] = useState({ warehouseId: '', locationCode: '', locationName: '' });

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setForm({ warehouseId: warehouses?.[0]?.id || '', locationCode: '', locationName: '' });
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const submit = async () => {
    await createLocation.mutateAsync({ warehouseId: form.warehouseId, locationCode: form.locationCode, locationName: form.locationName || null });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Location</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Warehouse" required value={form.warehouseId} onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}>
            {warehouses?.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.warehouse_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Location Code"
            required
            placeholder="e.g. RACK-A-01"
            value={form.locationCode}
            onChange={(e) => setForm((f) => ({ ...f, locationCode: e.target.value }))}
          />
          <TextField
            label="Location Name"
            placeholder="e.g. Rack A, Bin 01"
            value={form.locationName}
            onChange={(e) => setForm((f) => ({ ...f, locationName: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!form.warehouseId || !form.locationCode || createLocation.isPending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Warehouse + Location master - lives under Configuration alongside the other master-data tabs.
 * Phase 1 seeds one warehouse/location; this is where more get added as the business actually
 * needs them, rather than a UI built ahead of that need. */
export default function WarehouseMaster() {
  const [warehouseFormOpen, setWarehouseFormOpen] = useState(false);
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(null);

  const { data: warehouses } = useWarehouses({ activeOnly: false });
  const { data: locations, isLoading } = useAllWarehouseLocations({ activeOnly: false });
  const setLocationActive = useSetWarehouseLocationActive();

  const confirmDeactivate = async () => {
    await setLocationActive.mutateAsync({ locationId: deactivating.id, isActive: false });
    setDeactivating(null);
  };

  const columns = [
    { key: 'warehouse_name', label: 'Warehouse', render: (row) => `${row.warehouse_name} (${row.warehouse_code})` },
    { key: 'location_code', label: 'Location Code' },
    { key: 'location_name', label: 'Location Name', render: (row) => row.location_name || '—' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />,
    },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        row.is_active && (
          <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeactivating(row); }}>
            Deactivate
          </Button>
        ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Warehouses & Locations"
        subtitle="Where Finished Goods stock physically lives - referenced by every stock movement"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setWarehouseFormOpen(true)}>
              New Warehouse
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setLocationFormOpen(true)}>
              New Location
            </Button>
          </Stack>
        }
      />

      <DataTable columns={columns} rows={locations} loading={isLoading} emptyMessage="No locations configured yet" />

      <WarehouseFormDialog open={warehouseFormOpen} onClose={() => setWarehouseFormOpen(false)} />
      <LocationFormDialog open={locationFormOpen} onClose={() => setLocationFormOpen(false)} warehouses={warehouses} />

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate Location"
        message={`Deactivate "${deactivating?.location_code}"? It will no longer be selectable for new stock movements.`}
        confirmLabel="Deactivate"
        danger
        loading={setLocationActive.isPending}
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </Box>
  );
}
