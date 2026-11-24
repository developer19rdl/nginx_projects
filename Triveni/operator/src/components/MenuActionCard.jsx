import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha, useTheme } from '@mui/material/styles';

/** Resolves a color that's either a theme palette key ('primary', 'success', ...) or a literal
 * hex string - every current tile passes a real palette key, but a literal stays supported for a
 * future tile that needs an accent outside the semantic palette, without a component change. */
function resolveColor(theme, color) {
  return theme.palette[color]?.main || color;
}

/**
 * One Home-screen menu tile: a flat card with a crisp outline, a solid-color icon chip + title +
 * short description up top, a "<action> →" call-to-action at the bottom, and a small two-layer
 * illustration (a muted base icon with a solid-color badge icon overlapping its corner) plus a
 * neutral dot-grid for texture in the opposite corner. The whole tile stays clickable - the CTA
 * line is just a visual affordance.
 */
export default function MenuActionCard({
  icon,
  decorIcon: BaseIcon,
  decorIconColor,
  badgeIcon: BadgeIcon,
  color,
  title,
  description,
  actionLabel,
  fullWidth,
  onClick,
}) {
  const theme = useTheme();
  const accent = resolveColor(theme, color);
  const dark = theme.palette.mode === 'dark';
  // Most illustrations are a neutral silver/gray base (calendar, tools, monitor) - Checklist's
  // reference art is green-on-green (its checkmarks are the accent color itself), so it passes
  // decorIconColor to tint the base icon instead of leaving it neutral.
  const baseIconColor = decorIconColor
    ? alpha(resolveColor(theme, decorIconColor), dark ? 0.65 : 0.55)
    : dark
      ? alpha(theme.palette.common.white, 0.4)
      : alpha(theme.palette.common.black, 0.28);

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        gridColumn: fullWidth ? '1 / -1' : undefined,
        borderRadius: '16px',
        p: 2.5,
        cursor: 'pointer',
        bgcolor: 'background.paper',
        border: '1.5px solid',
        borderColor: alpha(theme.palette.text.primary, dark ? 0.22 : 0.14),
        boxShadow: theme.shadows[1],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 148,
        // Hover only lifts + deepens the shadow - the border stays the same neutral color on
        // every card in every state, so no single tile reads as "different" from the rest
        // depending on where the cursor happens to be (an accent-colored hover border used to do
        // exactly that).
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.shadows[6] },
      }}
    >
      {/* Dot-grid texture, top-right corner - neutral, not accent-colored */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          right: 18,
          width: 60,
          height: 44,
          backgroundImage: `radial-gradient(${alpha(theme.palette.text.primary, dark ? 0.3 : 0.22)} 1.4px, transparent 1.4px)`,
          backgroundSize: '9px 9px',
          pointerEvents: 'none',
        }}
      />

      {/* Two-layer illustration, bottom-right: a muted base icon with a solid-color badge icon
          overlapping its corner - approximates the layered illustration look without custom art. */}
      {BaseIcon && (
        <Box sx={{ position: 'absolute', bottom: 8, right: 14, width: 84, height: 68, pointerEvents: 'none' }}>
          <BaseIcon sx={{ fontSize: 74, color: baseIconColor }} />
          {BadgeIcon && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -6,
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: accent,
                color: '#fff',
                boxShadow: theme.shadows[2],
              }}
            >
              <BadgeIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
        </Box>
      )}

      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Neutral "logo" chip - a soft white/elevated squircle with a thin gray outline icon,
            same for every card regardless of its accent color (the accent still shows up in the
            action link and the illustration badge below). */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: dark ? alpha(theme.palette.common.white, 0.06) : theme.palette.common.white,
            boxShadow: dark
              ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.08)}, 0 2px 8px rgba(0,0,0,0.35)`
              : '0 2px 8px rgba(15,23,42,0.12), 0 1px 2px rgba(15,23,42,0.06)',
            color: dark ? alpha(theme.palette.common.white, 0.75) : theme.palette.grey[700],
            flexShrink: 0,
            '& svg': { fontSize: 26 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {description}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: accent }}>
          {actionLabel}
        </Typography>
        <ArrowForwardIcon sx={{ fontSize: 16, color: accent }} />
      </Stack>
    </Box>
  );
}
