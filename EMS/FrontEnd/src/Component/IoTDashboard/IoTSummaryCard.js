import React from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BoltIcon from '@mui/icons-material/Bolt';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const StatRow = ({ label, value, color = '#22d3ee' }) => (
  <div style={{
    background: '#3a3a3a', borderRadius: 8,
    padding: '10px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flex: 1,
    // Flex items default to min-height:auto, which refuses to shrink below
    // content size — without this, a squeezed card pushes this row past the
    // card's bottom edge instead of shrinking to fit, overlapping the section below.
    minHeight: 0,
  }}>
    <span style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase',
      letterSpacing: '0.06em', fontWeight: 600 }}>
      {label}
    </span>
    <span style={{ color, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
      {value}
    </span>
  </div>
);

const IoTSummaryCard = ({ nodeData = {}, nodeName = '—', nodeType = '' }) => {
  const power       = nodeData.power       ?? 0;
  const energyToday = nodeData.energyToday ?? 0;
  const energyMonth = nodeData.energyMonth ?? 0;
  const childCount  = (nodeData.children   || []).length;

  const daysInMonth = new Date().getDate();
  const avgDaily    = daysInMonth > 1 ? (energyMonth / daysInMonth).toFixed(0) : energyToday;
  const efficiency  = avgDaily > 0
    ? Math.min(100, Math.round((energyToday / avgDaily) * 100))
    : 0;

  const gaugeColor =
    efficiency >= 80 ? '#22c55e' :
    efficiency >= 50 ? '#facc15' : '#ef4444';

  return (
    <div style={{
      backgroundColor: '#525252',
      borderRadius: 12,
      padding: '14px 18px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      height: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarMonthIcon style={{ color: '#f97316', fontSize: 20 }} />
        <span style={{
          color: '#f97316', fontWeight: 700, fontSize: 14,
          letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1,
        }}>
          Energy Summary
        </span>
        <div style={{
          width: 9, height: 9, borderRadius: '50%',
          backgroundColor: '#22c55e',
          animation: 'pulse 2s infinite',
        }} />
      </div>

      {/* Efficiency ring + Demand / Units */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
          <circle cx={40} cy={40} r={33} fill="none" stroke="#2a2a2a" strokeWidth={8} />
          <circle
            cx={40} cy={40} r={33}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={8}
            strokeDasharray={`${(efficiency / 100) * 207.3} 207.3`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dasharray 600ms ease' }}
          />
          <text x={40} y={40} textAnchor="middle" dominantBaseline="central"
            fill={gaugeColor} style={{ fontSize: 16, fontWeight: 800, fontFamily: 'system-ui' }}>
            {efficiency}%
          </text>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BoltIcon style={{ fontSize: 16, color: '#facc15' }} />
            <span style={{ color: '#9ca3af', fontSize: 12 }}>Demand</span>
            <span style={{ color: '#facc15', fontSize: 22, fontWeight: 800, marginLeft: 6 }}>
              {power}
            </span>
            <span style={{ color: '#9ca3af', fontSize: 11 }}>kW</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DeviceHubIcon style={{ fontSize: 16, color: '#a78bfa' }} />
            <span style={{ color: '#9ca3af', fontSize: 12 }}>Units</span>
            <span style={{ color: '#a78bfa', fontSize: 22, fontWeight: 800, marginLeft: 6 }}>
              {childCount}
            </span>
          </div>
        </div>
      </div>

      {/* kWh Today / Month — grow to fill remaining height */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
        <StatRow label="kWh / Today" value={Number(energyToday).toLocaleString()} color="#22d3ee" />
        <StatRow label="kWh / Month" value={Number(energyMonth).toLocaleString()} color="#a3e635" />
      </div>
    </div>
  );
};

export default IoTSummaryCard;
