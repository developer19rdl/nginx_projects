import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PageHeader({ title, subtitle, actions, onBack, icon }) {
  return (
    // Title block and actions (often several buttons) sit side-by-side down to `sm`, then stack -
    // squeezing both into one row at phone width either wraps actions into a jumble mid-title or
    // pushes the title off-screen, neither of which reads well.
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      spacing={1.5}
      sx={{ mb: 3 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
        {onBack && (
          <IconButton onClick={onBack} size="small" sx={{ mt: 0.5, flexShrink: 0 }} aria-label="Back">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
