import { useMemo, useRef, useState } from "react";
import { formatCurrency, formatShortDate } from "../utils";

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 48 };

function niceMax(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value || 1));
  return Math.ceil(value / magnitude) * magnitude;
}

export default function RevenueTrendChart({ data }) {
  const containerRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const { points, yTicks, maxValue } = useMemo(() => {
    const max = niceMax(Math.max(...data.map((d) => d.value)) * 1.15);
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

    const pts = data.map((d, i) => ({
      ...d,
      x: PADDING.left + (i / (data.length - 1)) * innerWidth,
      y: PADDING.top + innerHeight - (d.value / max) * innerHeight,
    }));

    const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));

    return { points: pts, yTicks: ticks, maxValue: max };
  }, [data]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT - PADDING.bottom} L${points[0].x},${HEIGHT - PADDING.bottom} Z`;

  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const yFor = (v) => PADDING.top + innerHeight - (v / maxValue) * innerHeight;

  const active = hoverIndex !== null ? points[hoverIndex] : null;

  function handleMove(e) {
    const svg = containerRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  return (
    <div className="chart">
      <div className="chart__header">
        <h3>Revenue trend</h3>
        <span className="chart__subtitle">Last 14 days</span>
      </div>
      <div className="chart__svg-wrap">
        <svg
          ref={containerRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Line chart of daily revenue over the last 14 days"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
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

          <path d={areaPath} fill="var(--series-1-wash)" stroke="none" />
          <path d={linePath} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <circle
              key={p.date}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 || i === hoverIndex ? 4 : 0}
              fill="var(--series-1)"
              stroke="var(--surface)"
              strokeWidth="2"
            />
          ))}

          <text
            x={points[points.length - 1].x}
            y={points[points.length - 1].y - 12}
            textAnchor="end"
            className="chart__end-label"
          >
            {formatCurrency(points[points.length - 1].value)}
          </text>

          {active && (
            <line
              x1={active.x}
              x2={active.x}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              className="chart__crosshair"
            />
          )}
        </svg>

        {active && (
          <div
            className="chart__tooltip"
            style={{
              left: `${(active.x / WIDTH) * 100}%`,
              top: `${(active.y / HEIGHT) * 100}%`,
            }}
          >
            <div className="chart__tooltip-date">{formatShortDate(active.date)}</div>
            <div className="chart__tooltip-value">{formatCurrency(active.value)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
