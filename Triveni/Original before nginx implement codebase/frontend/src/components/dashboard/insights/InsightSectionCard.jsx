import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/** Shared chrome for the 4 Machine Insights panel sections - flat white card, icon + title
 * header, consistent padding - so Live Production/Runtime/Trend/Shift Performance all read as
 * one family instead of four differently-styled widgets bolted together. */
export default function InsightSectionCard({ icon, title, action, children }) {
  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(15,23,42,0.06)'),
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}
