import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useInventoryTransaction } from '../../hooks/useInventory';

const TYPE_LABELS = {
  QUALITY_ACCEPTANCE: 'Quality Acceptance',
  DISPATCH: 'Dispatch',
  TRANSFER_OUT: 'Transfer Out',
  TRANSFER_IN: 'Transfer In',
  ADJUSTMENT_IN: 'Adjustment In',
  ADJUSTMENT_OUT: 'Adjustment Out',
  HOLD: 'Hold',
  RELEASE: 'Hold Release',
};

function InfoField({ label, value, xs = 6, sm = 3 }) {
  return (
    <Grid item xs={xs} sm={sm}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value ?? '—'}
      </Typography>
    </Grid>
  );
}

/** A bordered, titled group of fields - a shaded header bar over a plain content area, so Item
 * Details/References/Coil Info/Audit read as distinct blocks instead of one long undifferentiated
 * grid of fields. `overflow: hidden` lets the header bar's background respect the box's own
 * rounded top corners instead of squaring them off. */
function Section({ title, children }) {
  return (
    <Box
      sx={{
        border: '1.5px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.18) : 'grey.300'),
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.06) : 'grey.100'),
          borderBottom: '1.5px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.18) : 'grey.300'),
        }}
      >
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 0.6, color: 'text.secondary', lineHeight: 1.6 }}>
          {title}
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ p: 2, m: 0, width: '100%' }}>
        {children}
      </Grid>
    </Box>
  );
}

/** Self-contained "one transaction's detail" dialog - used from the Quality Report's "View
 * Inventory Transaction" link, and from the Inventory module's Transactions and Ledger lists. */
export default function InventoryTransactionDialog({ transactionId, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: txn, isLoading } = useInventoryTransaction(transactionId);
  // Coil identity as it stood at inspection time (only ever set on a QUALITY_ACCEPTANCE
  // transaction, via its linked Quality Report) - the whole section is omitted for every other
  // transaction type, and for a lot that simply never had Coil Info entered against it.
  const hasCoilInfo = txn && (txn.coil_no || txn.grade || txn.coil_size || txn.coil_wt != null);

  return (
    <Dialog open={!!transactionId} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Inventory Transaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View the complete details of this inventory transaction
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, mr: -1 }} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {isLoading || !txn ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Transaction No
                </Typography>
                <Typography variant="subtitle1" fontWeight={800}>
                  {txn.transaction_no}
                </Typography>
              </Box>
              <Chip
                label={TYPE_LABELS[txn.transaction_type] || txn.transaction_type.replace(/_/g, ' ')}
                sx={{ bgcolor: 'text.primary', color: 'background.paper', fontWeight: 700 }}
              />
            </Stack>

            <Section title="Item Details">
              <InfoField label="Item" value={txn.item_code} />
              <InfoField label="Size" value={txn.size || '—'} />
              <InfoField label="Lot No" value={txn.lot_no || '—'} />
              <InfoField label="Quantity" value={txn.quantity} />
            </Section>

            <Section title="References">
              <InfoField label="Production Order" value={txn.order_no} />
              <InfoField label="Quality Report" value={txn.inspection_no} />
              <InfoField label="Machine" value={txn.machine_code} />
              <InfoField label="Warehouse" value={txn.warehouse_name} />
            </Section>

            {hasCoilInfo && (
              <Section title="Coil Info">
                <InfoField label="Coil No" value={txn.coil_no} />
                <InfoField label="Coil Grade" value={txn.grade} />
                <InfoField label="Coil Size" value={txn.coil_size} />
                <InfoField label="Coil Wt" value={txn.coil_wt} />
              </Section>
            )}

            <Section title="Audit">
              <InfoField label="Posted By" value={txn.created_by_name} />
              <InfoField label="Posted At" value={dayjs(txn.created_at).format('DD-MMM-YYYY HH:mm')} />
              <InfoField label="Location" value={txn.location_code} />
              <InfoField label="Remarks" value={txn.remarks} />
            </Section>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
