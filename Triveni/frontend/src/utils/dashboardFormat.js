import dayjs from 'dayjs';

/** '95' -> '1h 35m', '0' -> '0m' - shared by every dashboard card/panel that shows a duration. */
export function formatDuration(totalMinutes) {
  const mins = Math.max(0, Math.round(totalMinutes || 0));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** 'a couple of minutes ago', in the app's own relative-time vocabulary rather than dayjs's
 * default English (matches what MachineCard already showed before this was extracted). */
export function formatRelative(dateStr, now) {
  if (!dateStr) return 'No activity yet';
  const then = dayjs(dateStr);
  const diffSec = Math.max(0, now.diff(then, 'second'));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ${diffMin % 60}m ago`;
  return then.format('DD MMM, HH:mm');
}

export function formatClockTime(dateStr) {
  return dateStr ? dayjs(dateStr).format('HH:mm') : '—';
}
