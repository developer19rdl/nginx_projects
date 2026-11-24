import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function BottomBar() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 1.25,
        px: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Version 1.0.0
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Triveni Production Planning
      </Typography>
    </Box>
  );
}
