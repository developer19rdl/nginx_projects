import React from 'react';

const arcColor = (pct) =>
  pct < 0.33 ? '#22c55e' : pct < 0.67 ? '#f59e0b' : '#ef4444';

// noData: true when the caller has nothing valid to show (as opposed to a
// legitimately low/zero reading) — renders the arc/value in neutral gray with
// "—" instead of a possibly-misleading "0", so "no data" reads as visually
// distinct from "actually 0". Also treats a missing/non-numeric `value` the
// same way even when the caller doesn't pass `noData` explicitly.
// trackColor: the unfilled/remaining portion of the ring (has nothing to do
// with whether there's data — it's the background the colored arc sits on).
// Defaults to the original near-black so existing callers (Energy Dashboard's
// IoTGaugeCard.js/IoTDashboard.js, on a dark card background there) render
// identically to before; the sensor dashboards (GaugeCard.js, white cards)
// pass a light gray explicitly.
// minLimit/maxLimit: optional client-configured safe-range limits (e.g.
// utility_meters.minLimit/maxLimit). When both are set, the value fill/text is a
// single color — green when the current value sits inside that range, red when
// it doesn't — replacing the default percentage-of-axis coloring. Either limit
// left null preserves today's exact behavior.
const IoTGauge = ({ value, min = 0, max = 3000, unit = 'kW', noData = false, trackColor = '#2a2a2a', minLimit = null, maxLimit = null }) => {
  const hasValue = !noData && value != null && !isNaN(value);
  const clamped = hasValue ? Math.max(min, Math.min(max, value)) : min;
  const pct = hasValue ? (clamped - min) / ((max - min) || 1) : 0;

  const hasZones = minLimit != null && maxLimit != null && !isNaN(minLimit) && !isNaN(maxLimit);
  const inRange = hasZones && value >= Math.min(minLimit, maxLimit) && value <= Math.max(minLimit, maxLimit);
  const color = hasValue
    ? (hasZones ? (inRange ? '#16a34a' : '#dc2626') : arcColor(pct))
    : '#9ca3af';

  const cx = 100, cy = 105, r = 78;
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - pct);

  const tickVals = [0, 0.25, 0.5, 0.75, 1].map((p) => {
    const angle = Math.PI * p;
    const val = Math.round(min + p * (max - min));
    return {
      cx: cx - (r + 18) * Math.cos(angle),
      cy: cy - (r + 18) * Math.sin(angle),
      label: val >= 1000 ? `${val / 1000}k` : String(val),
    };
  });

  return (
    <svg viewBox="0 0 200 118" style={{ width: '100%', height: '100%' }}>
      {/* Track — the unfilled remainder of the ring, independent of hasValue */}
      <path d={arcPath} fill="none" stroke={hasValue ? trackColor : '#d1d5db'} strokeWidth={13}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={0} />
      {/* Arc */}
      <path d={arcPath} fill="none" stroke={color} strokeWidth={13}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 700ms ease, stroke 300ms ease' }} />
      {/* Ticks */}
      {tickVals.map(({ cx: tx, cy: ty, label }, i) => (
        <text key={i} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
          fill="#6b7280" style={{ fontSize: 7, fontFamily: 'system-ui' }}>
          {label}
        </text>
      ))}
      {/* Value */}
      <text x={cx} y={cy - 12} textAnchor="middle" fill={color}
        style={{ fontSize: 22, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
        {hasValue ? Number(value).toFixed(0) : '—'}
      </text>
      <text x={cx} y={cy + 7} textAnchor="middle" fill="#9ca3af"
        style={{ fontSize: 10, fontFamily: 'system-ui' }}>
        {unit}
      </text>
    </svg>
  );
};

export default IoTGauge;
