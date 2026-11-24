import React from 'react';

const IoTGaugeCard = ({ power = 0, energyToday = 0, energyMonth = 0 }) => {
  const min = 0, max = 3000;
  const pct = Math.max(0, Math.min(1, (power - min) / (max - min)));

  // SVG geometry — semicircle centered at (200,188), r=140
  // viewBox height 165 shows the kW text (y=168) while clipping the arc baseline (y=188)
  const cx = 200, cy = 188, r = 140;
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  const needleAngle = Math.PI * pct;
  const innerR = r * 0.52;
  const outerR = r * 0.88;
  const nx1 = cx - innerR * Math.cos(needleAngle);
  const ny1 = cy - innerR * Math.sin(needleAngle);
  const nx2 = cx - outerR * Math.cos(needleAngle);
  const ny2 = cy - outerR * Math.sin(needleAngle);

  const ticks = [0, 500, 1000, 1500, 2000, 2500, 3000];
  const tickOffset = 22;

  const valueColor =
    pct < 0.33 ? '#4ade80' :
    pct < 0.55 ? '#facc15' :
    pct < 0.75 ? '#fb923c' : '#f87171';

  return (
    <div style={{
      backgroundColor: '#5f5f5f',
      borderRadius: 12,
      padding: '10px 16px 8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* EB / GEN indicator dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22d3ee', display: 'inline-block' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
      </div>

      {/* SVG Gauge — viewBox height 165 ensures kW text (y=168) is fully visible */}
      <svg viewBox="0 0 400 165" style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="iotGaugeGrad" x1={cx - r} y1="0" x2={cx + r} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#22c55e" />
            <stop offset="22%"  stopColor="#84cc16" />
            <stop offset="44%"  stopColor="#facc15" />
            <stop offset="66%"  stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <path d={arcPath} fill="none" stroke="#2a2a2a" strokeWidth={16} strokeLinecap="round" />
        <path d={arcPath} fill="none" stroke="url(#iotGaugeGrad)" strokeWidth={16} strokeLinecap="round" />

        {ticks.map((v, i) => {
          const p = (v - min) / (max - min);
          const a = Math.PI * p;
          const lx = cx - (r + tickOffset) * Math.cos(a);
          const ly = cy - (r + tickOffset) * Math.sin(a);
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fill="#9ca3af" style={{ fontSize: 9.5, fontFamily: 'system-ui' }}>
              {v >= 1000 ? `${v / 1000}k` : v}
            </text>
          );
        })}

        <line x1={nx1} y1={ny1} x2={nx2} y2={ny2}
          stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round"
          style={{ transition: 'x1 500ms ease, y1 500ms ease, x2 500ms ease, y2 500ms ease' }} />
        <circle cx={cx} cy={cy} r={5} fill="#9ca3af" />

        {/* kW value — y=168 is inside the 165-height viewBox (just within range) */}
        <text x={cx} y={cy - 22} textAnchor="middle" fill={valueColor}
          style={{ fontSize: 28, fontWeight: 700, fontFamily: 'system-ui, sans-serif',
            transition: 'fill 400ms ease' }}>
          {Number(power).toFixed(0)} kW
        </text>
      </svg>

      {/* kWh/Day | kWh/Month — below SVG, no overlap */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 2 }}>kWh/Day</p>
          <p style={{ color: '#22d3ee', fontWeight: 700, fontSize: 13, margin: 0 }}>
            {Number(energyToday).toLocaleString()}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 2 }}>kWh/Month</p>
          <p style={{ color: '#a3e635', fontWeight: 700, fontSize: 13, margin: 0 }}>
            {Number(energyMonth).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IoTGaugeCard;
