import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

/**
 * Single SVG progress ring for the OEE donut - same stroke-dasharray technique as a chart library
 * would use, without pulling one in just for one ring. Rotated -90deg so the arc starts at 12
 * o'clock and fills clockwise.
 */
export default function OeeRing({ value, color = 'primary', size = 140, thickness = 14 }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          style={{ stroke: 'var(--oee-ring-track)' }}
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
          style={{ stroke: `var(--oee-ring-${color})`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1, color: `${color}.main` }}>
          {Math.round(clamped)}%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, mt: 0.5 }}>
          OEE
        </Typography>
      </Box>
    </Box>
  );
}

/** CSS custom properties the ring's inline var(--oee-ring-*) strokes resolve against - a plain
 * SVG stroke attribute can't call theme.palette directly, so this is the bridge (set via sx on a
 * wrapping element, same pattern as the admin dashboard's EfficiencyRing). */
export function oeeRingColorVars(theme) {
  return {
    '--oee-ring-track': alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.14 : 0.08),
    '--oee-ring-success': theme.palette.success.main,
    '--oee-ring-warning': theme.palette.warning.main,
    '--oee-ring-error': theme.palette.error.main,
    '--oee-ring-primary': theme.palette.primary.main,
  };
}

/** World-class(ish) OEE health bands - green >=85%, amber 60-84%, red <60% - shared by the OEE
 * donut and the Availability/Performance/Quality sub-metric bars so they all use one vocabulary. */
export function oeeColor(value) {
  if (value >= 85) return 'success';
  if (value >= 60) return 'warning';
  return 'error';
}
