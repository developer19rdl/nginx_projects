import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

const HOUR_WIDTH = 32; // px per hour column
const ROW_HEIGHT = 52;

/**
 * Visual planning board (spec section 13): one row per machine, a continuous hour ruler
 * across the selected date range, and colored blocks for each scheduled entry positioned
 * by absolute start/end time. Click a block to select it (drag-and-drop reschedule can be
 * layered on top of the same block geometry later).
 */
export default function GanttBoard({ rangeStart, rangeEnd, machines, blocksByMachine, onBlockClick }) {
  const theme = useTheme();
  // Colors referenced live off theme.palette (not literal hex) so this stays in sync with the
  // design-system palette automatically instead of silently drifting whenever theme.js changes.
  const STATUS_COLOR = {
    Draft: theme.palette.secondary.main, // Steel Gray - neutral "not yet active"
    Validated: theme.palette.info.main,
    Confirmed: theme.palette.success.main,
    Cancelled: theme.palette.error.main,
    Maintenance: theme.palette.warning.main,
    Breakdown: theme.palette.error.main,
  };
  const start = dayjs(rangeStart).startOf('day');
  const end = dayjs(rangeEnd).endOf('day');
  const totalHours = Math.max(1, end.diff(start, 'hour'));
  const hourMarks = Array.from({ length: totalHours + 1 }, (_, i) => start.add(i, 'hour'));

  const offsetHours = (isoTime) => dayjs(isoTime).diff(start, 'minute') / 60;

  return (
    <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: (totalHours + 1) * HOUR_WIDTH + 160 }}>
        {/* Hour ruler */}
        <Box sx={{ display: 'flex', pl: '160px', borderBottom: '1px solid', borderColor: 'divider' }}>
          {hourMarks.map((h, i) => (
            <Box
              key={i}
              sx={{
                width: HOUR_WIDTH,
                flexShrink: 0,
                fontSize: 11,
                color: 'text.secondary',
                borderLeft: h.hour() === 0 ? '2px solid' : '1px solid',
                borderColor: h.hour() === 0 ? 'primary.main' : 'divider',
                pl: 0.5,
              }}
            >
              {h.format('HH:mm')}
              {h.hour() === 0 && (
                <Typography variant="caption" display="block" color="primary.main" fontWeight={700}>
                  {h.format('DD MMM')}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Machine rows */}
        {machines.map((machine) => {
          const blocks = blocksByMachine[machine.id] || [];
          return (
            <Box key={machine.id} sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box
                sx={{
                  width: 160,
                  flexShrink: 0,
                  p: 1,
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'background.paper',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {machine.machine_code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {machine.machine_name}
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', height: ROW_HEIGHT, width: (totalHours + 1) * HOUR_WIDTH }}>
                {blocks.map((block) => {
                  const left = Math.max(0, offsetHours(block.start_time)) * HOUR_WIDTH;
                  const width = Math.max(4, (offsetHours(block.end_time) - offsetHours(block.start_time)) * HOUR_WIDTH);
                  return (
                    <Tooltip
                      key={block.id}
                      title={`${block.item_code} - Qty ${block.planned_quantity ?? block.scheduled_quantity} (${block.status})`}
                    >
                      <Box
                        onClick={() => onBlockClick?.(block)}
                        sx={{
                          position: 'absolute',
                          left,
                          width,
                          top: 6,
                          height: ROW_HEIGHT - 12,
                          bgcolor: STATUS_COLOR[block.status] || theme.palette.primary.main,
                          borderRadius: 1,
                          color: theme.palette.common.white,
                          fontSize: 11,
                          px: 0.75,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          cursor: onBlockClick ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {block.item_code} · {block.planned_quantity ?? block.scheduled_quantity}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
