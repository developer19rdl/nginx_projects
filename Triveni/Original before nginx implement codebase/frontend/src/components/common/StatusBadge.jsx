import Chip from '@mui/material/Chip';
import { useTheme, alpha } from '@mui/material/styles';
import { STATUS_COLORS } from '../../constants';

/**
 * Soft, "pill" status badge: tinted background + solid text in the same hue,
 * rather than MUI's default solid-filled Chip (which reads as too heavy when
 * a table has a status chip in nearly every row).
 */
export default function StatusBadge({ status }) {
  const theme = useTheme();
  const colorKey = STATUS_COLORS[status] || 'default';

  if (colorKey === 'default') {
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.text.secondary, 0.1),
          color: theme.palette.text.secondary,
          border: `1px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
        }}
      />
    );
  }

  const paletteColor = theme.palette[colorKey]?.main || theme.palette.primary.main;
  const darkColor = theme.palette[colorKey]?.dark || paletteColor;

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: alpha(paletteColor, 0.14),
        color: darkColor,
        border: `1px solid ${alpha(paletteColor, 0.3)}`,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  );
}
