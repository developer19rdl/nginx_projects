import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const APP_VERSION = 'v1.0.0'; // mirrors package.json

/** Minimal, subtle - a thin top border (matching MuiPaper's border convention) rather than a
 * shadowed bar, and no fixed positioning so it never overlaps short-content pages. Rendered once
 * inside MainLayout's main content column, after <Outlet/>. */
export default function Footer() {
  return (
    <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" flexWrap="wrap" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Copyright © 2026 RDL Technologies Pvt Ltd - All Rights Reserved.
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              System Operational
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {APP_VERSION}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
