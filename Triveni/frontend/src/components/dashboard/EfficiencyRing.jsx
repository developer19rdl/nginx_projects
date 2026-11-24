import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

/**
 * Lightweight SVG progress ring for a machine's efficiency % - no charting library needed for a
 * single stroke-dasharray circle. Rotated -90deg so the arc starts at 12 o'clock and fills
 * clockwise, which reads more naturally as "progress" than the SVG default 3-o'clock start.
 */
export default function EfficiencyRing({ value, color = 'primary', size = 92, thickness = 6, label, sub, glow = false }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {glow && (
        <Box
          sx={{
            position: 'absolute',
            inset: '10%',
            borderRadius: '50%',
            boxShadow: `0 0 32px 6px var(--ring-glow-${color})`,
          }}
        />
      )}
      <svg width={size} height={size} style={{ position: 'relative', transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          style={{ stroke: 'var(--ring-track)' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ stroke: `var(--ring-${color})`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ lineHeight: 1.1, color: color === 'default' ? 'text.disabled' : `${color}.main` }}
        >
          {label ?? `${Math.round(clamped)}%`}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** CSS custom properties the ring's inline `var(--ring-*)` strokes resolve against - set once on
 * a wrapping element via sx so the actual theme colors (which need `theme.palette.x.main`, not
 * available inside a plain SVG attribute) can still reach the SVG. */
export function ringColorVars(theme) {
  return {
    '--ring-track': alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.14 : 0.08),
    '--ring-primary': theme.palette.primary.main,
    '--ring-success': theme.palette.success.main,
    '--ring-warning': theme.palette.warning.main,
    '--ring-error': theme.palette.error.main,
    '--ring-info': theme.palette.info.main,
    '--ring-default': theme.palette.grey[400],
    '--ring-glow-primary': alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.5 : 0.35),
    '--ring-glow-success': alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.5 : 0.35),
    '--ring-glow-warning': alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.5 : 0.35),
    '--ring-glow-error': alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.5 : 0.35),
    '--ring-glow-default': alpha(theme.palette.grey[400], 0.25),
  };
}
