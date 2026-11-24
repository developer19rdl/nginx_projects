import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import { GetIoTSensorGraph } from '../../Services/NodeJsApiServices';

// ─── Options ─────────────────────────────────────────────────────────────────
const LAST_OPTIONS        = ['8hr', '1day', '1week', '15days', '30days'];
const AGGREGATION_OPTIONS = ['min', 'max', 'avg'];
const INTERVAL_OPTIONS    = ['15min', '30min', '1hr', '1day'];

// ─── Tiny tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, tagName }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid #3a3a5c',
      borderRadius: 8, padding: '8px 12px', fontSize: 11,
    }}>
      <p style={{ color: '#9ca3af', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#22d3ee', fontWeight: 700, margin: 0 }}>
        {tagName}: {payload[0]?.value}
      </p>
    </div>
  );
};

// ─── Small dropdown select ────────────────────────────────────────────────────
const Select = ({ label, value, options, onChange }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase',
      letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>{label}</p>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: '#2a2a3e', border: '1px solid #444',
        borderRadius: 8, color: '#f3f4f6', fontSize: 13,
        padding: '8px 12px', outline: 'none', cursor: 'pointer',
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ─── Inline dialog overlay ────────────────────────────────────────────────────
const Overlay = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'rgba(0,0,0,0.55)', borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1e1e2e', borderRadius: 12, padding: '20px 22px',
        width: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        border: '1px solid #3a3a5c',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16 }}>
          <p style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 13, margin: 0 }}>{title}</p>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#6b7280',
            fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>
        {children}
        <button onClick={onClose} style={{
          width: '100%', marginTop: 4,
          background: '#22d3ee', border: 'none', borderRadius: 8,
          color: '#111', fontWeight: 700, fontSize: 13, padding: '9px 0',
          cursor: 'pointer',
        }}>Close</button>
      </div>
    </div>
  );
};

// ─── Main panel ───────────────────────────────────────────────────────────────
const SensorChartPanel = ({ deviceId, slaveId, tagId, tagName, meterName, lineColor = '#22d3ee' }) => {
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [last,        setLast]        = useState('15days');
  const [aggregation, setAggregation] = useState('min');
  const [interval,    setInterval]    = useState('1hr');
  const [displayName, setDisplayName] = useState(tagName);
  const [showFilter,  setShowFilter]  = useState(false);
  const [showSettings,setShowSettings]= useState(false);

  const fetchData = useCallback(() => {
    if (!deviceId || !tagId) return;
    setLoading(true);
    GetIoTSensorGraph(
      { deviceId, slaveId, tagId, last, aggregation, interval },
      (res) => { setData(res?.data || []); setLoading(false); },
      ()    => { setLoading(false); }
    );
  }, [deviceId, slaveId, tagId, last, aggregation, interval]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyFilter = (newLast, newAgg, newInt) => {
    setLast(newLast);
    setAggregation(newAgg);
    setInterval(newInt);
    setShowFilter(false);
  };

  return (
    <div style={{
      background: '#252535', borderRadius: 12, padding: '14px 16px',
      position: 'relative', border: '1px solid #3a3a5c',
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <p style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 13, margin: 0 }}>{displayName}</p>
          <p style={{ color: '#6b7280', fontSize: 10, margin: '2px 0 0' }}>
            Real Time · Last {last} · {aggregation.toUpperCase()} · {interval}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Filter button */}
          <button
            onClick={() => setShowFilter(true)}
            style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
              color: '#a78bfa', fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <FilterListIcon style={{ fontSize: 14 }} />
            Select
          </button>
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)',
              borderRadius: 7, padding: '5px 7px', cursor: 'pointer',
              color: '#22d3ee', display: 'flex', alignItems: 'center',
            }}
          >
            <SettingsIcon style={{ fontSize: 15 }} />
          </button>
        </div>
      </div>

      {/* Chart area */}
      <div style={{ height: 150 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #3a3a5c', borderTopColor: '#22d3ee',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#6b7280', fontSize: 12 }}>
            No sensor data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis
                dataKey="dateTime"
                tick={{ fontSize: 9, fill: '#6b7280' }}
                tickFormatter={v => v ? String(v).slice(11, 16) : ''}
                interval="preserveStartEnd"
                axisLine={{ stroke: '#3a3a5c' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#6b7280' }}
                axisLine={{ stroke: '#3a3a5c' }}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip tagName={displayName} />} />
              <Line
                type="monotone"
                dataKey="value"
                name={displayName}
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: lineColor, strokeWidth: 2, fill: '#fff' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Filter overlay ── */}
      <Overlay open={showFilter} onClose={() => setShowFilter(false)} title="Time Filter">
        <FilterForm
          last={last} aggregation={aggregation} interval={interval}
          onApply={applyFilter}
        />
      </Overlay>

      {/* ── Settings overlay ── */}
      <Overlay open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>Slave Id</p>
            <div style={{
              background: '#2a2a3e', border: '1px solid #444',
              borderRadius: 8, color: '#f3f4f6', fontSize: 13, padding: '8px 12px',
            }}>
              {slaveId || '—'}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>Default Sensor</p>
            <div style={{
              background: '#2a2a3e', border: '1px solid #444',
              borderRadius: 8, color: '#22d3ee', fontSize: 13, padding: '8px 12px',
              fontWeight: 600,
            }}>
              {tagName}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>Display Name</p>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={20}
              style={{
                width: '100%', background: '#2a2a3e', border: '1px solid #444',
                borderRadius: 8, color: '#f3f4f6', fontSize: 13,
                padding: '8px 12px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <p style={{ color: '#6b7280', fontSize: 9, marginTop: 4 }}>
              Max allowed character length 20
            </p>
          </div>
        </div>
      </Overlay>
    </div>
  );
};

// ─── Filter form (inside overlay) ─────────────────────────────────────────────
const FilterForm = ({ last, aggregation, interval, onApply }) => {
  const [l, setL] = useState(last);
  const [a, setA] = useState(aggregation);
  const [i, setI] = useState(interval);
  return (
    <div>
      <Select label="Last"              value={l} options={LAST_OPTIONS}        onChange={setL} />
      <Select label="Data Aggregations" value={a} options={AGGREGATION_OPTIONS} onChange={setA} />
      <Select label="Grouping Interval" value={i} options={INTERVAL_OPTIONS}    onChange={setI} />
      <button
        onClick={() => onApply(l, a, i)}
        style={{
          width: '100%', background: '#6366f1', border: 'none', borderRadius: 8,
          color: '#fff', fontWeight: 700, fontSize: 13, padding: '9px 0',
          cursor: 'pointer', marginBottom: 8,
        }}
      >
        Apply
      </button>
    </div>
  );
};

export default SensorChartPanel;
