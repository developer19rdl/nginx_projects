import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import EnergyInsideKEB from '../EnergyMonitoring/EnergyInsideKEB/EnergyInsideKEB';

const EnergyInsideKEBModal = ({ open, onClose, meterId = null, meterName = null }) => {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Modal container */}
      <div style={{
        background: '#1e1e2e',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '24px',
        borderRadius: 14,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#252535',
          borderRadius: '14px 14px 0 0',
          flexShrink: 0,
        }}>
          <ElectricalServicesIcon style={{ color: '#22d3ee', fontSize: 20, marginRight: 10 }} />
          <div style={{ flex: 1 }}>
            <p style={{
              color: '#9ca3af', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              margin: 0, lineHeight: 1,
            }}>Electric Board</p>
            <h2 style={{
              color: '#f3f4f6', fontSize: 16, fontWeight: 800,
              margin: '3px 0 0 0', lineHeight: 1,
            }}>Energy Dashboard{meterName ? ` — ${meterName}` : ''}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#3a3a4a', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: '#9ca3af', gap: 5, fontSize: 12, fontWeight: 600,
            }}
          >
            <CloseIcon style={{ fontSize: 15 }} />
            Close
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#1e1e2e' }}>
          <EnergyInsideKEB meterId={meterId} />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EnergyInsideKEBModal;
