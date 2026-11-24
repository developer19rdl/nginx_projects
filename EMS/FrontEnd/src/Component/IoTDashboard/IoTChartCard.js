import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CARD = { backgroundColor: '#525252', borderRadius: 12, padding: '14px 16px', height: '100%' };
const TITLE = { color: '#d1d5db', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 };

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #3f3f3f', borderRadius: 8, padding: '6px 10px' }}>
      <p style={{ color: '#9ca3af', fontSize: 9, margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 700, margin: 0 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const axisProps = { tick: { fill: '#6b7280', fontSize: 8 }, tickLine: false, axisLine: false };
const gridProps = { strokeDasharray: '3 3', stroke: '#404040', vertical: false };

export const BarChartCard = ({ title, data, dataKey = 'energy', color = '#22d3ee', unit = 'kWh', height = 110 }) => (
  <div style={CARD}>
    <p style={TITLE}>{title}</p>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<TooltipBox />} />
        <Bar dataKey={dataKey} name={unit} fill={color} radius={[3, 3, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const LineChartCard = ({ title, data, lines = [], height = 110 }) => (
  <div style={CARD}>
    <p style={TITLE}>{title}</p>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<TooltipBox />} />
        {lines.length > 1 && <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 9, color: '#9ca3af', paddingTop: 4 }} />}
        {lines.map(({ key, color, name }) => (
          <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2}
            dot={false} name={name} activeDot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const AreaChartCard = ({ title, data, dataKey = 'power', color = '#22d3ee', height = 110 }) => (
  <div style={CARD}>
    <p style={TITLE}>{title}</p>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={`ag-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<TooltipBox />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
          fill={`url(#ag-${dataKey})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
