import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import InsightSectionCard from './InsightSectionCard';
import { formatDuration } from '../../../utils/dashboardFormat';

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} noWrap>
        {value}
      </Typography>
    </Box>
  );
}

/** Section 4: today's produced-vs-target for every configured shift on this machine, with the
 * shift actually happening right now called out in blue - everything else stays neutral so that
 * highlight (not color-coding every card) is what draws the eye. */
export default function ShiftPerformanceSection({ shifts }) {
  if (!shifts) return null;

  return (
    <InsightSectionCard icon={<WbTwilightIcon fontSize="small" />} title="Shift Performance">
      <Stack spacing={1.5}>
        {shifts.map((s) => (
          <Box
            key={s.shiftId}
            sx={{
              p: 1.5,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: s.isCurrent ? 'primary.main' : 'divider',
              bgcolor: (theme) => (s.isCurrent ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.06) : 'transparent'),
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={800}>
                {s.shiftName}
              </Typography>
              {s.isCurrent && <Chip size="small" color="primary" label="Current" sx={{ fontWeight: 700, height: 20, fontSize: 11 }} />}
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              <Field label="Produced / Target" value={s.targetQty > 0 ? `${s.producedQty.toLocaleString()} / ${s.targetQty.toLocaleString()}` : '—'} />
              <Field label="Efficiency" value={s.targetQty > 0 ? `${Math.round(s.efficiencyPercent)}%` : '—'} />
              <Field label="Runtime" value={formatDuration(s.runtimeMinutes)} />
              <Field label="Downtime" value={formatDuration(s.downtimeMinutes)} />
            </Box>
          </Box>
        ))}
      </Stack>
    </InsightSectionCard>
  );
}
