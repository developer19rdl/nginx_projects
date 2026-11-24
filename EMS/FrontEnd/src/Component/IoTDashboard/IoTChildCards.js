import React from 'react';
import TimelineIcon from '@mui/icons-material/Timeline';

const STATUS_COLOR = {
  Online: '#22c55e', Offline: '#ef4444',
  Running: '#22c55e', Stopped: '#ef4444', Standby: '#f59e0b', Off: '#f59e0b',
};

// A meter/node is "offline" (silent past the global threshold) — not to be confused
// with a live 0 kW reading, which is a real value and stays Online/Running.
export const isOfflineStatus = (status) => status === 'Offline' || status === 'Stopped';

const CARD = {
  backgroundColor: '#525252',
  borderRadius: 12,
  padding: '14px 16px',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  position: 'relative',
};

// Grey/dim treatment applied on top of CARD when the node is offline, so a stale
// last-known reading is never mistaken for a live one.
const OFFLINE_CARD = {
  backgroundColor: '#3a3a3a',
  filter: 'grayscale(0.7)',
  opacity: 0.7,
};

// Replaces the live value block when offline — shows last-seen time instead of
// a stale (but real-looking) number.
const LastSeen = ({ lastUpdated }) => (
  <p style={{ color: '#9ca3af', fontSize: 11, fontStyle: 'italic', margin: 0 }}>
    {lastUpdated ? `Last seen: ${lastUpdated}` : 'No data received yet'}
  </p>
);

const Badge = ({ status }) => (
  <span style={{
    background: (STATUS_COLOR[status] || '#6b7280') + '22',
    color: STATUS_COLOR[status] || '#6b7280',
    border: `1px solid ${(STATUS_COLOR[status] || '#6b7280')}44`,
    fontSize: 9, fontWeight: 700, padding: '2px 8px',
    borderRadius: 20, letterSpacing: '0.04em', textTransform: 'uppercase',
  }}>{status}</span>
);

const TypeTag = ({ label, color }) => (
  <p style={{ color, fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 2, margin: 0 }}>{label}</p>
);

const Spark = ({ values, color = '#22d3ee' }) => {
  if (!values?.length) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const W = 72, H = 26;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color}
        strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// Graph icon button — appears in card top-right, stops propagation so card click still navigates
const GraphBtn = ({ onGraphClick }) => {
  if (!onGraphClick) return null;
  return (
    <button
      onClick={e => { e.stopPropagation(); onGraphClick(); }}
      title="View Sensor Graph"
      style={{
        position: 'absolute', bottom: 10, left: 16,
        background: 'rgba(34,211,238,0.12)',
        border: '1px solid rgba(34,211,238,0.3)',
        borderRadius: 6, width: 24, height: 24,
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <TimelineIcon style={{ fontSize: 14, color: '#22d3ee' }} />
    </button>
  );
};

const CardShell = ({ children, style = {}, offline, onClick, onGraphClick }) => (
  <div
    style={{ ...CARD, ...style, ...(offline ? OFFLINE_CARD : {}), cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
    }}
  >
    <GraphBtn onGraphClick={onGraphClick} />
    {children}
  </div>
);

// Runtime/kWh footer row shared by CategoryCard/IncomerCard/DistributorCard/
// FeederCard — same shape/labels as IncomerMeterCard's footer below, so a
// grouped/aggregate card reads the same way as a single meter card.
const RuntimeKwhFooter = ({ runtime, kWhDay }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 8, borderTop: '1px solid #4b4b4b' }}>
    <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>
      Runtime: <span style={{ color: '#fbbf24', fontWeight: 600 }}>
        {runtime !== undefined && runtime !== null ? `${Number(runtime).toFixed(1)} h` : '—'}
      </span>
    </p>
    {kWhDay !== undefined && (
      <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>
        <span style={{ color: '#a3e635', fontWeight: 600 }}>{Number(kWhDay).toFixed(1)}</span> kWh
      </p>
    )}
  </div>
);

export const CategoryCard = ({ name, kW, pf, status = 'Online', lastUpdated, trend, runtime, kWhDay, onClick, onGraphClick }) => {
  const offline = isOfflineStatus(status);
  return (
    <CardShell onClick={onClick} onGraphClick={onGraphClick} offline={offline}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <TypeTag label="Category" color="#9ca3af" />
          <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13, margin: 0 }}>{name}</p>
        </div>
        <Badge status={status} />
      </div>
      {offline ? (
        <LastSeen lastUpdated={lastUpdated} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: '#10b981', fontSize: 19, fontWeight: 700, lineHeight: 1, margin: 0 }}>
                {Number(kW || 0).toFixed(1)} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>kW</span>
              </p>
              <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 600, marginTop: 5, marginBottom: 0, marginLeft: onGraphClick ? 32 : 0 }}>PF {pf}</p>
            </div>
            <Spark values={trend} color="#10b981" />
          </div>
          <RuntimeKwhFooter runtime={runtime} kWhDay={kWhDay} />
        </>
      )}
    </CardShell>
  );
};

export const IncomerCard = ({ name, kW, pf, status = 'Online', lastUpdated, trend, runtime, kWhDay, onClick, onGraphClick }) => {
  const offline = isOfflineStatus(status);
  return (
    <CardShell onClick={onClick} onGraphClick={onGraphClick} offline={offline}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <TypeTag label="Incomer" color="#9ca3af" />
          <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13, margin: 0 }}>{name}</p>
        </div>
        <Badge status={status} />
      </div>
      {offline ? (
        <LastSeen lastUpdated={lastUpdated} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: '#22d3ee', fontSize: 19, fontWeight: 700, lineHeight: 1, margin: 0 }}>
                {Number(kW).toFixed(1)} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>kW</span>
              </p>
              <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 600, marginTop: 5, marginBottom: 0, marginLeft: onGraphClick ? 32 : 0 }}>PF {pf}</p>
            </div>
            <Spark values={trend} color="#22d3ee" />
          </div>
          <RuntimeKwhFooter runtime={runtime} kWhDay={kWhDay} />
        </>
      )}
    </CardShell>
  );
};

export const DistributorCard = ({ name, kW, pf, status = 'Online', lastUpdated, trend, runtime, kWhDay, onClick, onGraphClick }) => {
  const offline = isOfflineStatus(status);
  return (
    <CardShell onClick={onClick} onGraphClick={onGraphClick} offline={offline}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <TypeTag label="Distributor" color="#9ca3af" />
          <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13, margin: 0 }}>{name}</p>
        </div>
        <Badge status={status} />
      </div>
      {offline ? (
        <LastSeen lastUpdated={lastUpdated} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: '#fb923c', fontSize: 19, fontWeight: 700, lineHeight: 1, margin: 0 }}>
                {Number(kW).toFixed(1)} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>kW</span>
              </p>
              <p style={{ color: '#a3e635', fontSize: 12, fontWeight: 600, marginTop: 5, marginBottom: 0, marginLeft: onGraphClick ? 32 : 0 }}>PF {pf}</p>
            </div>
            <Spark values={trend} color="#fb923c" />
          </div>
          <RuntimeKwhFooter runtime={runtime} kWhDay={kWhDay} />
        </>
      )}
    </CardShell>
  );
};

export const FeederCard = ({ name, kW, pf, voltage, status = 'Running', lastUpdated, trend, runtime, kWhDay, onClick, onGraphClick }) => {
  const offline = isOfflineStatus(status);
  return (
    <CardShell onClick={onClick} onGraphClick={onGraphClick} offline={offline}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <TypeTag label="Feeder" color="#9ca3af" />
          <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13, margin: 0 }}>{name}</p>
        </div>
        <Badge status={status} />
      </div>
      {offline ? (
        <LastSeen lastUpdated={lastUpdated} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: '#a78bfa', fontSize: 19, fontWeight: 700, lineHeight: 1, margin: 0 }}>
                {Number(kW).toFixed(1)} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>kW</span>
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 5, marginLeft: onGraphClick ? 32 : 0 }}>
                <span style={{ color: '#a3e635', fontSize: 11, fontWeight: 600 }}>PF {pf}</span>
                <span style={{ color: '#4b5563' }}>·</span>
                <span style={{ color: '#fbbf24', fontSize: 11 }}>{Number(voltage).toFixed(1)}V</span>
              </div>
            </div>
            <Spark values={trend} color="#a78bfa" />
          </div>
          <RuntimeKwhFooter runtime={runtime} kWhDay={kWhDay} />
        </>
      )}
    </CardShell>
  );
};

// Both voltage and current triplets are tagged line-to-line: RY, YB, BR.
const PHASE_COLOR = { RY: '#f87171', YB: '#facc15', BR: '#60a5fa' };

// Voltage/current phase-triplet — R/Y/B mini-cells under one labeled row
const PhaseTriplet = ({ title, values }) => (
  <div style={{ flex: 1 }}>
    <p style={{ color: '#9ca3af', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em', margin: '0 0 4px' }}>{title}</p>
    <div style={{ display: 'flex', gap: 6 }}>
      {values.map(([ph, val]) => (
        <div key={ph} style={{ flex: 1, background: '#3a3a3a', borderRadius: 6,
          padding: '5px 0', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: 8, fontWeight: 700, margin: 0 }}>{ph}</p>
          <p style={{ color: PHASE_COLOR[ph], fontSize: 15, fontWeight: 700, margin: '2px 0 0' }}>
            {val !== undefined && val !== null ? Number(val).toFixed(1) : '—'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export const IncomerMeterCard = ({
  name, kW, status = 'Running', lastUpdated, runtime, kWhDay,
  vRy, vYb, vRb, iRp, iYp, iBp,
  onClick, onGraphClick,
}) => {
  const offline = isOfflineStatus(status);
  return (
    <CardShell onClick={onClick} onGraphClick={onGraphClick} offline={offline} style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <TypeTag label="Incomer Meter" color="#9ca3af" />
          <p style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 14, margin: 0 }}>{name}</p>
        </div>
        <Badge status={status} />
      </div>

      {offline ? (
        <LastSeen lastUpdated={lastUpdated} />
      ) : (
        <>
          <p style={{ color: '#22d3ee', fontSize: 27, fontWeight: 800, lineHeight: 1, margin: '0 0 12px' }}>
            {Number(kW || 0).toFixed(1)} <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>kW</span>
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <PhaseTriplet title="Voltage (V)" values={[['RY', vRy], ['YB', vYb], ['BR', vRb]]} />
            <PhaseTriplet title="Current (A)" values={[['RY', iRp], ['YB', iYp], ['BR', iBp]]} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 10, borderTop: '1px solid #4b4b4b' }}>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
              Runtime: <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                {runtime !== undefined && runtime !== null ? `${Number(runtime).toFixed(1)} h` : '—'}
              </span>
            </p>
            {kWhDay !== undefined && (
              <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                <span style={{ color: '#a3e635', fontWeight: 600 }}>{Number(kWhDay).toFixed(1)}</span> kWh
              </p>
            )}
          </div>
        </>
      )}

      {onClick && (
        <p style={{ color: '#6b7280', fontSize: 9, marginTop: 8, marginBottom: 0,
          textAlign: 'right', letterSpacing: '0.04em' }}>
          TAP FOR DETAILS →
        </p>
      )}
    </CardShell>
  );
};

export const MachineCard = ({ name, kW, pf, status = 'Running', lastUpdated, runtime, kWhDay, onClick, onGraphClick }) => {
  const offline = isOfflineStatus(status);
  return (
    <CardShell onClick={onClick} onGraphClick={onGraphClick} offline={offline}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <TypeTag label="Device" color="#9ca3af" />
          <p style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13, margin: 0 }}>{name}</p>
        </div>
        <Badge status={status} />
      </div>
      {offline ? (
        <LastSeen lastUpdated={lastUpdated} />
      ) : (
        <>
          <p style={{ color: '#22d3ee', fontSize: 19, fontWeight: 700, lineHeight: 1, margin: 0 }}>
            {Number(kW).toFixed(1)} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>kW</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>
              Runtime: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{Number(runtime).toFixed(1)} h</span>
            </p>
            {kWhDay !== undefined && (
              <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>
                <span style={{ color: '#a3e635', fontWeight: 600 }}>{Number(kWhDay).toFixed(1)}</span> kWh
              </p>
            )}
          </div>
        </>
      )}
      {onClick && (
        <p style={{ color: '#6b7280', fontSize: 9, marginTop: 8, marginBottom: 0,
          textAlign: 'right', letterSpacing: '0.04em' }}>
          TAP FOR DETAILS →
        </p>
      )}
    </CardShell>
  );
};
