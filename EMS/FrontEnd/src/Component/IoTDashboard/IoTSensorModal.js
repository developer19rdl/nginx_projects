import React, { useState, useEffect } from 'react';
import TimelineIcon from '@mui/icons-material/Timeline';
import CloseIcon from '@mui/icons-material/Close';
import SensorChartPanel from './SensorChartPanel';
import { GetIoTSensorParams } from '../../Services/NodeJsApiServices';

// Line colours cycle for multiple charts
const LINE_COLORS = [
  '#22d3ee', '#a78bfa', '#f97316', '#22c55e',
  '#fbbf24', '#f43f5e', '#84cc16', '#06b6d4',
];

const IoTSensorModal = ({ open, nodeType, nodeId, nodeName, onClose }) => {
  const [params,  setParams]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !nodeType || !nodeId) return;
    setParams([]);
    setLoading(true);
    GetIoTSensorParams(
      { nodeType, nodeId },
      (res) => { setParams(res?.data || []); setLoading(false); },
      ()    => { setLoading(false); }
    );
  }, [open, nodeType, nodeId]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1a1a2e',
        borderRadius: 14,
        width: '92vw', maxWidth: 1100,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        border: '1px solid #2a2a4a',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a4a',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(34,211,238,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TimelineIcon style={{ fontSize: 20, color: '#22d3ee' }} />
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase',
                letterSpacing: '0.1em', margin: 0, fontWeight: 600 }}>
                SENSOR DATA
              </p>
              <p style={{ color: '#f3f4f6', fontSize: 16, fontWeight: 700, margin: 0 }}>
                {nodeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid #3a3a5c',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6b7280',
            }}
          >
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px',
        }}>
          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '60px 0', gap: 12, color: '#6b7280' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '3px solid #2a2a4a', borderTopColor: '#22d3ee',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 13 }}>Loading sensor parameters...</span>
            </div>
          )}

          {/* No data */}
          {!loading && params.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <TimelineIcon style={{ fontSize: 48, color: '#3a3a5c', display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                No sensor parameters allocated for this node
              </p>
              <p style={{ fontSize: 12, marginTop: 6 }}>
                Allocate sensor parameters in Machine Parameter Allocation to see graphs
              </p>
            </div>
          )}

          {/* Charts grid */}
          {!loading && params.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 16,
            }}>
              {params.map((p, idx) => (
                <SensorChartPanel
                  key={`${p.deviceId}-${p.slaveId}-${p.tagId}`}
                  deviceId={p.deviceId}
                  slaveId={p.slaveId}
                  tagId={p.tagId}
                  tagName={p.tagName}
                  meterName={p.meterName}
                  lineColor={LINE_COLORS[idx % LINE_COLORS.length]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default IoTSensorModal;
