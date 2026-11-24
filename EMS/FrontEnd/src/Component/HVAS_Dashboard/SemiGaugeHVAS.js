import React, { useMemo } from "react";
/**
 * Semicircle Gauge (SVG) with 30/75% color thresholds.
 *
 * Green  : pct < 0.30
 * Yellow : 0.30 <= pct <= 0.75
 * Red    : pct > 0.75
 */
export default function SemiGaugeHVAS({
  min = 0,
  max = 100,
  value = 0,
  unit = "",
  thickness = 12,
  size = 220,
  trackColor = "#E5E7EB",
  colors = { green: "#22C55E", yellow: "#F59E0B", red: "#EF4444" },
  fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  decimals, // optional number of decimals for the center value
}) {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // For drawing we clamp to [min,max]
  const vDraw = clamp(value, min, max);
  const range = max - min || 1;
  const pctRaw = (value - min) / range;        // can be <0 or >1
  const pctClamped = (vDraw - min) / range;    // 0..1 for drawing
  // --------- COLOR LOGIC (your rule) ----------
  const color =
    pctRaw < 0.30
      ? colors.green
      : pctRaw <= 0.75
      ? colors.yellow
      : colors.red;
  // Geometry (normalized 100x60)
  const cx = 50, cy = 50, r = 38;
  const total = Math.PI * r; // semicircle length
  const arcPath = useMemo(() => {
    const x0 = cx - r, y0 = cy;
    const x1 = cx + r, y1 = cy;
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  }, []);
  const dashOffset = total * (1 - Math.max(0, Math.min(1, pctClamped)));
  const displayValue =
    decimals != null
      ? `${Number(vDraw).toFixed(decimals)} ${unit}`.trim()
      : `${Number(vDraw)} ${unit}`.trim();
  return (
    <div style={{ width: size, height: size / 2 }}>
      <svg
        viewBox="0 0 100 60"
        width={size}
        height={size / 2}
        style={{ display: "block" }}
        role="img"
        aria-label={`${displayValue}`}
      >
        {/* Remainder track */}
        <path
          d={arcPath}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={total}
          strokeDashoffset={0}
        />
        {/* Colored progress */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={total}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
        {/* Center value */}
        <g textAnchor="middle" style={{ fontFamily }}>
          <text
            x="50"
            y="50"
            style={{ fontSize: 12, fontWeight: 600, fill: "#111" }}
          >
            {displayValue}
          </text>
        </g>
      </svg>
    </div>
  );
}