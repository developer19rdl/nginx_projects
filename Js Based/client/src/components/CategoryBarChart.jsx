import { useMemo } from "react";
import { formatCurrency } from "../utils";

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 24, right: 16, bottom: 32, left: 48 };
const BAR_MAX_WIDTH = 24;

const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)"];

function niceMax(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value || 1));
  return Math.ceil(value / magnitude) * magnitude;
}

export default function CategoryBarChart({ data }) {
  const { bars, yTicks, maxValue } = useMemo(() => {
    const max = niceMax(Math.max(...data.map((d) => d.value)) * 1.15);
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const slot = innerWidth / data.length;
    const barWidth = Math.min(BAR_MAX_WIDTH, slot * 0.5);

    const computed = data.map((d, i) => {
      const barHeight = (d.value / max) * innerHeight;
      const x = PADDING.left + slot * i + slot / 2 - barWidth / 2;
      const y = PADDING.top + innerHeight - barHeight;
      return { ...d, x, y, width: barWidth, height: barHeight, labelX: PADDING.left + slot * i + slot / 2 };
    });

    const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
    return { bars: computed, yTicks: ticks, maxValue: max };
  }, [data]);

  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const yFor = (v) => PADDING.top + innerHeight - (v / maxValue) * innerHeight;
  const baseline = HEIGHT - PADDING.bottom;

  return (
    <div className="chart">
      <div className="chart__header">
        <h3>Sales by category</h3>
        <span className="chart__subtitle">Current period</span>
      </div>
      <div className="chart__svg-wrap">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Bar chart of sales by product category">
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                className="chart__gridline"
              />
              <text x={PADDING.left - 8} y={yFor(tick)} className="chart__axis-label" textAnchor="end" dy="0.32em">
                {formatCurrency(tick)}
              </text>
            </g>
          ))}

          <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={baseline} y2={baseline} className="chart__baseline" />

          {bars.map((bar, i) => (
            <g key={bar.category}>
              <path
                d={roundedTopRect(bar.x, bar.y, bar.width, bar.height, 4)}
                fill={SERIES_COLORS[i % SERIES_COLORS.length]}
              />
              <text x={bar.labelX} y={bar.y - 8} textAnchor="middle" className="chart__bar-value">
                {formatCurrency(bar.value)}
              </text>
              <text x={bar.labelX} y={baseline + 18} textAnchor="middle" className="chart__axis-label">
                {bar.category}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// A rect with rounded top corners and a square baseline edge.
function roundedTopRect(x, y, width, height, radius) {
  const r = Math.min(radius, height, width / 2);
  return `
    M${x},${y + r}
    Q${x},${y} ${x + r},${y}
    L${x + width - r},${y}
    Q${x + width},${y} ${x + width},${y + r}
    L${x + width},${y + height}
    L${x},${y + height}
    Z
  `;
}
