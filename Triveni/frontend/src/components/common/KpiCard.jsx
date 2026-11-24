import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

/**
 * Shared KPI tile: icon chip + big number + caption, tinted with a theme palette color.
 * Promoted out of ProductionPlanUpload.jsx's private StatTile (same visual idiom, same props)
 * so other screens (Quality's Pending list, CAPA tracker, Phase 2 dashboards) can reuse it
 * instead of redefining it locally.
 */
export default function KpiCard({ icon, color, label, caption, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        p: 2,
        borderColor: `${color}.main`,
        bgcolor: (theme) => alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.16 : 0.07),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" fontWeight={700} color={`${color}.main`} sx={{ mt: 1 }}>
        {value}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      )}
    </Paper>
  );
}
