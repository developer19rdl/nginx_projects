import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useReleaseStockHold } from '../../hooks/useInventory';

/** Releases a held quantity back to available stock - opened from the Holds tab. `hold` is the
 * full stock_holds row being released, or null when closed. */
export default function ReleaseHoldDialog({ hold, onClose }) {
  const release = useReleaseStockHold();
  const [remarks, setRemarks] = useState('');

  const [wasOpen, setWasOpen] = useState(false);
  if (hold && !wasOpen) {
    setWasOpen(true);
    setRemarks('');
  } else if (!hold && wasOpen) {
    setWasOpen(false);
  }

  const submit = async () => {
    await release.mutateAsync({ id: hold.id, remarks: remarks || null });
    onClose();
  };

  return (
    <Dialog open={!!hold} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Release Stock Hold</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Release {hold?.quantity} units of {hold?.item_code}
          {hold?.size ? ` (${hold.size})` : ''} back to available stock.
        </Typography>
        <TextField
          label="Remarks"
          fullWidth
          multiline
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g. Cleared by QA"
        />
        {release.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {release.error.response?.data?.message || 'Could not release hold'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={release.isPending}>
          {release.isPending ? 'Releasing...' : 'Release'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
