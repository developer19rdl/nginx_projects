import React from 'react';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';

const IoTIncomerCard = ({ data, isLive = false, label = 'Electric Board', onClick }) => {
  const d   = data || {};
  const V   = d.Voltage   ?? '—';
  const A   = d.Current   ?? '—';
  const pf  = d.pF        ?? '—';
  const hz  = d.Frequency ?? '—';
  const kWh = d.kWhDay    ?? d.kWh ?? '—';

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#525252',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        height: '100%',
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, background-color 0.2s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.backgroundColor = '#606060'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.backgroundColor = '#525252'; }}
    >

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ElectricalServicesIcon style={{ color: '#22d3ee', fontSize: 16 }} />
        <span style={{
          color: '#22d3ee', fontWeight: 700, fontSize: 12,
          letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1,
        }}>
          {label}
        </span>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          backgroundColor: isLive ? '#22c55e' : '#6b7280',
          flexShrink: 0,
          animation: isLive ? 'pulse 2s infinite' : 'none',
        }} />
      </div>

      {/* Voltage | Current */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span style={{ color: '#00e5ff', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{V}</span>
          <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 3, fontWeight: 600 }}>V</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#00e5ff', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{A}</span>
          <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 3, fontWeight: 600 }}>A</span>
        </div>
      </div>

      {/* pF | Hz */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span style={{ color: '#facc15', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{pf}</span>
          <span style={{ color: '#9ca3af', fontSize: 10, marginLeft: 3, fontWeight: 600 }}>pF</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#facc15', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{hz}</span>
          <span style={{ color: '#9ca3af', fontSize: 10, marginLeft: 3, fontWeight: 600 }}>Hz</span>
        </div>
      </div>

      {/* kWh — flex-grow fills remaining space */}
      <div style={{
        flex: 1,
        background: '#3a3a3a',
        borderRadius: 8,
        padding: '0 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
      }}>
        <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: 3, marginTop: 0 }}>Today kWh</p>
        <p style={{ color: '#a3e635', fontSize: 20, fontWeight: 800, lineHeight: 1, margin: 0 }}>
          {kWh}
        </p>
      </div>
    </div>
  );
};

export default IoTIncomerCard;
