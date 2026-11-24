import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Generic multi-field dialog wrapper - the `ConfirmDialog` of forms. Standardizes the
 * title/content/actions shell (and the "disabled while saving, 'Saving...' label" pattern) that
 * every hand-built form dialog in the app was independently re-implementing; `children` carries
 * the actual field markup, which stays fully custom per dialog.
 */
export default function FormDialog({
  open = true,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  submitColor = 'primary',
  canSubmit = true,
  loading = false,
  error,
  maxWidth = 'sm',
}) {
  const theme = useTheme();
  // MUI's default centered-with-margins dialog leaves ~300px of content width on a phone once the
  // 32px-a-side margin is subtracted - workable for a couple of fields, cramped for the
  // multi-field forms this wraps. Full-screen below `sm` gives every field its full width instead.
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth fullScreen={fullScreen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {children}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" color={submitColor} onClick={onSubmit} disabled={!canSubmit || loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
