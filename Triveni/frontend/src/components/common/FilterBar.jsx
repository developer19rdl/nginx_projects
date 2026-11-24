import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

/** Simple horizontal container for filter controls (search box, selects, date pickers). Below
 * `sm`, each control drops to its own full-width row instead of wrapping into an uneven jumble
 * of whatever-width each field happens to be. */
export default function FilterBar({ children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        sx={{ '& > *': { flex: { xs: '1 1 100%', sm: '0 1 auto' } } }}
      >
        {children}
      </Stack>
    </Paper>
  );
}
