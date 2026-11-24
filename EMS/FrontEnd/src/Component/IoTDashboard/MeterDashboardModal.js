import React, { useState, useEffect, useCallback } from 'react';
import BoltIcon from '@mui/icons-material/Bolt';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import MeterGraphCard  from './MeterGraphCard';
import MeterAlertsCard from './MeterAlertsCard';
import { GetMeterDashboard } from '../../Services/NodeJsApiServices';

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={{
    background: '#252535', borderRadius: 12, border: '1px solid #2a2a4a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 240,
  }}>
    <div style={{ textAlign: 'center', color: '#4b5563' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '2px solid #2a2a4a', borderTopColor: '#22d3ee',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 10px',
      }} />
      <p style={{ fontSize: 11 }}>Loading...</p>
    </div>
  </div>
);

// ─── Main modal ───────────────────────────────────────────────────────────────
const MeterDashboardModal = ({ open, meterId, meterName, onClose }) => {
  const [dashData,   setDashData]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboard = useCallback(() => {
    if (!open || !meterId) return;
    setLoading(true);
    GetMeterDashboard(
      meterId,
      (res) => {
        setDashData(res?.success ? res : null);
        setLoading(false);
      },
      () => { setLoading(false); }
    );
  }, [open, meterId]);

  useEffect(() => { loadDashboard(); }, [loadDashboard, refreshKey]);

  // Reset when meter changes
  useEffect(() => {
    if (open) { setDashData(null); }
  }, [meterId, open]);

  if (!open) return null;

  const meter  = dashData?.meter;
  const graphs = dashData?.defaultGraphs   || [];
  const params = dashData?.allocatedParameters || [];
  const slaves = dashData?.availableSlaveIds   || [];
  const alerts = dashData?.alerts              || [];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1400,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: '#1a1a2e',
        borderRadius: 14,
        width: '96vw', maxWidth: 1200,
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        border: '1px solid #2a2a4a',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #2a2a4a', flexShrink: 0,
          background: 'linear-gradient(90deg, #1a1a2e 0%, #1e1e3a 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(167,139,250,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BoltIcon style={{ fontSize: 22, color: '#a78bfa' }} />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: 9, textTransform: 'uppercase',
                letterSpacing: '0.1em', margin: 0, fontWeight: 600 }}>
                METER DASHBOARD
              </p>
              <p style={{ color: '#f3f4f6', fontSize: 16, fontWeight: 700, margin: 0 }}>
                {meter?.name || meterName}
              </p>
            </div>
            {/* Param count badge */}
            {params.length > 0 && (
              <span style={{
                background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)',
                color: '#22d3ee', fontSize: 10, fontWeight: 600,
                padding: '3px 10px', borderRadius: 20,
              }}>
                {params.length} parameters
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid #3a3a5c',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                color: '#9ca3af', fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <RefreshIcon style={{
                fontSize: 14,
                animation: loading ? 'spin 0.8s linear infinite' : 'none',
              }} />
              Refresh
            </button>
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
        </div>

        {/* ── Body — fixed 2×2 grid ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(2, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {loading && !dashData ? (
            // Skeleton all 4 cards while loading
            [1,2,3,4].map(i => <Skeleton key={i} />)
          ) : (
            <>
              {/* Card 1 */}
              {graphs[0]?.tagId ? (
                <MeterGraphCard
                  key={`graph-1-${refreshKey}`}
                  position={1}
                  meterId={meterId}
                  deviceId={meter?.deviceId}
                  slaveId={meter?.slaveId}
                  defaultTagId={graphs[0].tagId}
                  defaultDisplayName={graphs[0].displayName}
                  allocatedParameters={params}
                  availableSlaveIds={slaves}
                  onSettingsSaved={() => setRefreshKey(k => k + 1)}
                />
              ) : (
                <NoParamCard position={1} />
              )}

              {/* Card 2 */}
              {graphs[1]?.tagId ? (
                <MeterGraphCard
                  key={`graph-2-${refreshKey}`}
                  position={2}
                  meterId={meterId}
                  deviceId={meter?.deviceId}
                  slaveId={meter?.slaveId}
                  defaultTagId={graphs[1].tagId}
                  defaultDisplayName={graphs[1].displayName}
                  allocatedParameters={params}
                  availableSlaveIds={slaves}
                  onSettingsSaved={() => setRefreshKey(k => k + 1)}
                />
              ) : (
                <NoParamCard position={2} />
              )}

              {/* Card 3 */}
              {graphs[2]?.tagId ? (
                <MeterGraphCard
                  key={`graph-3-${refreshKey}`}
                  position={3}
                  meterId={meterId}
                  deviceId={meter?.deviceId}
                  slaveId={meter?.slaveId}
                  defaultTagId={graphs[2].tagId}
                  defaultDisplayName={graphs[2].displayName}
                  allocatedParameters={params}
                  availableSlaveIds={slaves}
                  onSettingsSaved={() => setRefreshKey(k => k + 1)}
                />
              ) : (
                <NoParamCard position={3} />
              )}

              {/* Card 4 — Alerts (fixed) */}
              <MeterAlertsCard alerts={alerts} loading={loading} />
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Placeholder when no parameter is assigned to a slot ─────────────────────
const NoParamCard = ({ position }) => (
  <div style={{
    background: '#252535', borderRadius: 12, border: '1px dashed #3a3a5c',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    color: '#4b5563', minHeight: 240,
  }}>
    <BoltIcon style={{ fontSize: 36 }} />
    <p style={{ fontSize: 12, margin: 0, fontWeight: 500 }}>Graph {position} — No parameter</p>
    <p style={{ fontSize: 10, margin: 0 }}>
      Click ⚙ on a chart to assign a default parameter
    </p>
  </div>
);

export default MeterDashboardModal;
