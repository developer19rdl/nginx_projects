import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { GetIoTSensorGraph, GetDeviceParams, UpdateMeterDefaultSettings } from '../../Services/NodeJsApiServices';

// ─── Constants ────────────────────────────────────────────────────────────────
const LAST_OPTS        = ['8hr', '1day', '1week', '15days', '30days'];
const AGG_OPTS         = ['min', 'max', 'avg'];
const INTERVAL_OPTS    = ['15min', '30min', '1hr', '1day'];
const LINE_PALETTE     = ['#22d3ee', '#a78bfa', '#f97316', '#22c55e', '#fbbf24', '#f43f5e'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mergeByTime = (datasets) => {
  const map = {};
  datasets.forEach(({ tagName, points }) => {
    points.forEach(({ dateTime, value }) => {
      if (!map[dateTime]) map[dateTime] = { dateTime };
      map[dateTime][tagName] = value;
    });
  });
  return Object.values(map).sort((a, b) => String(a.dateTime).localeCompare(String(b.dateTime)));
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid #3a3a5c',
      borderRadius: 8, padding: '8px 12px', fontSize: 11,
    }}>
      <p style={{ color: '#9ca3af', margin: '0 0 5px', fontSize: 10 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, margin: '2px 0' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Overlay wrapper ──────────────────────────────────────────────────────────
const CardOverlay = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(0,0,0,0.6)', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#1e1e2e', borderRadius: 12, padding: '18px 20px',
        width: 280, border: '1px solid #3a3a5c',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 13 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Styled Select ────────────────────────────────────────────────────────────
const StyledSelect = ({ label, value, options, onChange, getLabel, getValue }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5, fontWeight: 600 }}>{label}</p>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: '#2a2a3e', border: '1px solid #444',
        borderRadius: 8, color: '#f3f4f6', fontSize: 12,
        padding: '8px 10px', outline: 'none', cursor: 'pointer',
      }}
    >
      {options.map(o => {
        const v = getValue ? getValue(o) : o;
        const l = getLabel ? getLabel(o) : o;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  </div>
);

// ─── StyledInput ──────────────────────────────────────────────────────────────
const StyledInput = ({ label, value, onChange, maxLength, readOnly }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5, fontWeight: 600 }}>{label}</p>
    <input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      maxLength={maxLength}
      readOnly={readOnly}
      style={{
        width: '100%', background: readOnly ? '#1a1a2e' : '#2a2a3e',
        border: '1px solid #444', borderRadius: 8,
        color: readOnly ? '#6b7280' : '#f3f4f6', fontSize: 12,
        padding: '8px 10px', outline: 'none', boxSizing: 'border-box',
      }}
    />
    {maxLength && !readOnly && (
      <p style={{ color: '#4b5563', fontSize: 9, marginTop: 3 }}>
        Max {maxLength} characters
      </p>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MeterGraphCard = ({
  position,
  meterId,
  deviceId,
  slaveId,
  defaultTagId,
  defaultDisplayName,
  allocatedParameters = [],
  availableSlaveIds   = [],
  onSettingsSaved,
}) => {
  // ── Chart state ──
  const [selectedTagIds, setSelectedTagIds] = useState(() =>
    defaultTagId ? [String(defaultTagId)] : []
  );
  const [last,        setLast]        = useState('15days');
  const [aggregation, setAggregation] = useState('min');
  const [interval,    setInterval]    = useState('1hr');
  const [chartData,   setChartData]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const displayNameRef = useRef(defaultDisplayName || '');
  const [displayLabel, setDisplayLabel] = useState(defaultDisplayName || allocatedParameters.find(p => String(p.tagId) === String(defaultTagId))?.tagName || '—');

  // ── Settings overlay state ──
  const [showSettings,   setShowSettings]   = useState(false);
  const [settingsSlaveId,  setSettingsSlaveId]  = useState(slaveId);
  const [settingsParams,   setSettingsParams]   = useState(allocatedParameters);
  const [settingsTagId,    setSettingsTagId]    = useState(String(defaultTagId || ''));
  const [settingsName,     setSettingsName]     = useState(defaultDisplayName || '');
  const [loadingParams,    setLoadingParams]    = useState(false);
  const [saving,           setSaving]           = useState(false);

  // ── Multi-select overlay state ──
  const [showSelect,  setShowSelect]  = useState(false);
  const [tempTags,    setTempTags]    = useState(() =>
    defaultTagId ? [String(defaultTagId)] : []
  );

  // ── Filter overlay state ──
  const [showFilter,  setShowFilter]  = useState(false);
  const [tmpLast,     setTmpLast]     = useState('15days');
  const [tmpAgg,      setTmpAgg]      = useState('min');
  const [tmpInterval, setTmpInterval] = useState('1hr');

  // ── Fetch sensor data for all selectedTagIds ──
  const fetchData = useCallback(() => {
    if (!selectedTagIds.length || !deviceId) { setChartData([]); return; }
    setLoading(true);
    const fetches = selectedTagIds.map(tagId =>
      new Promise(resolve => {
        const param = allocatedParameters.find(p => String(p.tagId) === String(tagId));
        GetIoTSensorGraph(
          { deviceId, slaveId, tagId, last, aggregation, interval },
          res => resolve({ tagId, tagName: param?.tagName || `Tag ${tagId}`, points: res?.data || [] }),
          ()  => resolve({ tagId, tagName: `Tag ${tagId}`, points: [] })
        );
      })
    );
    Promise.all(fetches).then(datasets => {
      setChartData(mergeByTime(datasets));
      setLoading(false);
    });
  }, [selectedTagIds, deviceId, slaveId, last, aggregation, interval, allocatedParameters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── When settingsSlaveId changes, reload available params ──
  useEffect(() => {
    if (!showSettings || !deviceId) return;
    if (settingsSlaveId === slaveId) {
      setSettingsParams(allocatedParameters);
      return;
    }
    setLoadingParams(true);
    GetDeviceParams(
      { deviceId, slaveId: settingsSlaveId },
      res => { setSettingsParams(res?.data || []); setLoadingParams(false); },
      ()  => { setLoadingParams(false); }
    );
  }, [showSettings, settingsSlaveId, deviceId, slaveId, allocatedParameters]);

  // ── Memoised line keys ──
  const lineKeys = useMemo(() => {
    if (!chartData.length) return [];
    return Object.keys(chartData[0]).filter(k => k !== 'dateTime');
  }, [chartData]);

  // ── Apply filter ──
  const applyFilter = () => {
    setLast(tmpLast);
    setAggregation(tmpAgg);
    setInterval(tmpInterval);
    setShowFilter(false);
  };

  // ── Apply multi-select ──
  const applySelect = () => {
    setSelectedTagIds(tempTags.length ? tempTags : (defaultTagId ? [String(defaultTagId)] : []));
    setShowSelect(false);
  };

  // ── Save settings ──
  const saveSettings = () => {
    const chosen = settingsParams.find(p => String(p.tagId) === settingsTagId);
    setSaving(true);
    UpdateMeterDefaultSettings(
      meterId,
      { position, tagId: settingsTagId, displayName: settingsName || chosen?.tagName },
      () => {
        setDisplayLabel(settingsName || chosen?.tagName || '—');
        setSelectedTagIds([settingsTagId]);
        setTempTags([settingsTagId]);
        setSaving(false);
        setShowSettings(false);
        onSettingsSaved?.();
      },
      () => { setSaving(false); }
    );
  };

  return (
    <div style={{
      background: '#252535', borderRadius: 12, padding: '12px 14px',
      border: '1px solid #3a3a5c', boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      position: 'relative', display: 'flex', flexDirection: 'column',
      height: '100%', boxSizing: 'border-box',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <p style={{ color: '#f3f4f6', fontWeight: 700, fontSize: 13, margin: 0 }}>{displayLabel}</p>
          <p style={{ color: '#6b7280', fontSize: 9, margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
            <AccessTimeIcon style={{ fontSize: 10 }} />
            Real Time · Last {last} · {aggregation.toUpperCase()} · {interval}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {/* Multi-select button */}
          <button
            onClick={() => { setTmpLast(last); setTmpAgg(aggregation); setTmpInterval(interval); setShowFilter(true); }}
            style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: 6, padding: '4px 9px', cursor: 'pointer',
              color: '#a78bfa', fontSize: 10, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            <FilterListIcon style={{ fontSize: 13 }} /> Select
          </button>
          {/* Settings button */}
          <button
            onClick={() => {
              setSettingsSlaveId(slaveId);
              setSettingsTagId(String(defaultTagId || selectedTagIds[0] || ''));
              setSettingsName(displayLabel !== '—' ? displayLabel : '');
              setSettingsParams(allocatedParameters);
              setShowSettings(true);
            }}
            style={{
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)',
              borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: '#22d3ee',
              display: 'flex', alignItems: 'center',
            }}
          >
            <SettingsIcon style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ flex: 1, minHeight: 130 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '2px solid #2a2a4a', borderTopColor: '#22d3ee',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#4b5563', fontSize: 11 }}>
            No sensor data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={155}>
            <LineChart data={chartData} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="dateTime"
                tick={{ fontSize: 8, fill: '#6b7280' }}
                tickFormatter={v => v ? String(v).slice(11, 16) : ''}
                interval="preserveStartEnd"
                axisLine={{ stroke: '#2a2a4a' }} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#6b7280' }}
                axisLine={{ stroke: '#2a2a4a' }} tickLine={false} width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              {lineKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 9, color: '#9ca3af' }} />}
              {lineKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={LINE_PALETTE[i % LINE_PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Filter overlay ── */}
      <CardOverlay open={showFilter} onClose={() => setShowFilter(false)} title="Time Filter">
        <StyledSelect label="Last"              value={tmpLast}     options={LAST_OPTS}     onChange={setTmpLast} />
        <StyledSelect label="Data Aggregations" value={tmpAgg}      options={AGG_OPTS}      onChange={setTmpAgg} />
        <StyledSelect label="Grouping Interval" value={tmpInterval} options={INTERVAL_OPTS} onChange={setTmpInterval} />
        <button
          onClick={applyFilter}
          style={{
            width: '100%', background: '#6366f1', border: 'none', borderRadius: 8,
            color: '#fff', fontWeight: 700, fontSize: 12, padding: '9px 0', cursor: 'pointer', marginTop: 4,
          }}
        >
          Apply
        </button>
      </CardOverlay>

      {/* ── Multi-select overlay ── */}
      <CardOverlay open={showSelect} onClose={() => setShowSelect(false)} title="Select Parameters">
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
          {allocatedParameters.map(p => {
            const id = String(p.tagId);
            const checked = tempTags.includes(id);
            return (
              <label key={id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 4px', cursor: 'pointer', borderRadius: 6,
              }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setTempTags(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    );
                  }}
                  style={{ accentColor: '#22d3ee', width: 14, height: 14 }}
                />
                <span style={{ color: checked ? '#22d3ee' : '#d1d5db', fontSize: 12 }}>
                  {p.tagName}
                </span>
              </label>
            );
          })}
        </div>
        <button
          onClick={applySelect}
          style={{
            width: '100%', background: '#22d3ee', border: 'none', borderRadius: 8,
            color: '#111', fontWeight: 700, fontSize: 12, padding: '9px 0', cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </CardOverlay>

      {/* ── Settings overlay ── */}
      <CardOverlay open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <StyledSelect
          label="Slave Id"
          value={settingsSlaveId}
          options={availableSlaveIds.length ? availableSlaveIds : [slaveId]}
          onChange={setSettingsSlaveId}
        />
        <StyledInput
          label="Tag Description"
          value={settingsParams.find(p => String(p.tagId) === settingsTagId)?.tagDescription || settingsTagId}
          readOnly
        />
        {loadingParams ? (
          <div style={{ color: '#6b7280', fontSize: 11, textAlign: 'center', padding: '10px 0' }}>
            Loading parameters...
          </div>
        ) : (
          <StyledSelect
            label="Default Sensor"
            value={settingsTagId}
            options={settingsParams}
            onChange={setSettingsTagId}
            getValue={p => String(p.tagId)}
            getLabel={p => p.tagName}
          />
        )}
        <StyledInput
          label="Display Name"
          value={settingsName}
          onChange={setSettingsName}
          maxLength={20}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              flex: 1, background: saving ? '#374151' : '#22d3ee',
              border: 'none', borderRadius: 8, color: '#111',
              fontWeight: 700, fontSize: 12, padding: '9px 0',
              cursor: saving ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
          >
            <SaveIcon style={{ fontSize: 14 }} />
            {saving ? 'Saving...' : 'UPDATE'}
          </button>
          <button
            onClick={() => setShowSettings(false)}
            style={{
              flex: 1, background: 'none', border: '1px solid #444',
              borderRadius: 8, color: '#9ca3af',
              fontWeight: 600, fontSize: 12, padding: '9px 0', cursor: 'pointer',
            }}
          >
            CLOSE
          </button>
        </div>
      </CardOverlay>

      {/* ── Select params button (bottom of card) ── */}
      <button
        onClick={() => { setTempTags([...selectedTagIds]); setShowSelect(true); }}
        style={{
          marginTop: 6, background: 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.3)', borderRadius: 6,
          color: '#a78bfa', fontSize: 10, fontWeight: 600, padding: '4px 8px',
          cursor: 'pointer', alignSelf: 'flex-start',
        }}
      >
        ☑ Select View Parameters ({selectedTagIds.length})
      </button>
    </div>
  );
};

export default React.memo(MeterGraphCard);
