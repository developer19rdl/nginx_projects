import React from 'react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const SEV_COLOR = {
  High:    { bg: '#2d1515', border: '#7f1d1d', text: '#ef4444' },
  Medium:  { bg: '#2d2515', border: '#92400e', text: '#f59e0b' },
  Low:     { bg: '#132012', border: '#14532d', text: '#22c55e' },
  Info:    { bg: '#0c1a2e', border: '#1e3a5f', text: '#38bdf8' },
};

const SevBadge = ({ severity }) => {
  const c = SEV_COLOR[severity] || SEV_COLOR.Info;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 9, fontWeight: 700, padding: '2px 7px',
      borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span style={{
    background: status === 'Active' ? '#2d1515' : '#132012',
    border: `1px solid ${status === 'Active' ? '#7f1d1d' : '#14532d'}`,
    color: status === 'Active' ? '#ef4444' : '#22c55e',
    fontSize: 9, fontWeight: 700, padding: '2px 7px',
    borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em',
  }}>
    {status}
  </span>
);

const MeterAlertsCard = ({ alerts = [], loading = false }) => (
  <div style={{
    background: '#252535', borderRadius: 12, padding: '14px 16px',
    border: '1px solid #3a3a5c', boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box',
  }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <NotificationsActiveIcon style={{ fontSize: 16, color: '#ef4444' }} />
      <span style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 13 }}>Alerts</span>
      {alerts.length > 0 && (
        <span style={{
          background: '#7f1d1d', color: '#fca5a5', fontSize: 9, fontWeight: 700,
          padding: '1px 7px', borderRadius: 20, marginLeft: 4,
        }}>
          {alerts.length}
        </span>
      )}
    </div>

    {/* Table or empty state */}
    {loading ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '2px solid #3a3a5c', borderTopColor: '#ef4444',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    ) : alerts.length === 0 ? (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4b5563',
      }}>
        <NotificationsActiveIcon style={{ fontSize: 36 }} />
        <p style={{ fontSize: 12, margin: 0, fontWeight: 500 }}>No active alerts</p>
        <p style={{ fontSize: 10, margin: 0, color: '#374151' }}>System operating normally</p>
      </div>
    ) : (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 70px 60px',
          gap: 8, padding: '0 4px 6px',
          borderBottom: '1px solid #2a2a4a', marginBottom: 4,
        }}>
          {['Alert Time', 'Message', 'Severity', 'Status'].map(h => (
            <span key={h} style={{
              color: '#6b7280', fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>{h}</span>
          ))}
        </div>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 70px 60px',
            gap: 8, padding: '7px 4px',
            borderBottom: i < alerts.length - 1 ? '1px solid #1e1e2e' : 'none',
            alignItems: 'center',
          }}>
            <span style={{ color: '#9ca3af', fontSize: 10 }}>
              {a.alertTime || a.createdAt || '—'}
            </span>
            <span style={{ color: '#e5e7eb', fontSize: 11, fontWeight: 500 }}>
              {a.message || a.alertType || '—'}
            </span>
            <SevBadge  severity={a.severity || 'Info'} />
            <StatusBadge status={a.status || 'Active'} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default MeterAlertsCard;
