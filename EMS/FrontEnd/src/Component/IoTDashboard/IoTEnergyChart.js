import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

const MAX_BARS = 30;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e1e1e',
      border: '1px solid #444',
      borderRadius: 7,
      padding: '6px 11px',
      fontSize: 11,
      lineHeight: 1.7,
    }}>
      <p style={{ color: '#9ca3af', marginBottom: 2, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff', fontWeight: 700, margin: 0 }}>
          {p.name}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

const IoTEnergyChart = ({ title, data = [] }) => {
  // Trim to last MAX_BARS entries for readability
  const trimmed = data.length > MAX_BARS ? data.slice(-MAX_BARS) : data;

  // Find max energy for highlighting the tallest bar
  const maxEnergy = Math.max(...trimmed.map(d => d.energy || 0), 0);

  return (
    <div style={{
      backgroundColor: '#525252',
      borderRadius: 10,
      padding: '10px 10px 6px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      boxSizing: 'border-box',
    }}>
      {/* Title */}
      <p style={{
        color: '#e5e7eb',
        fontWeight: 700,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: '0.03em',
        fontFamily: 'system-ui, sans-serif',
      }}>
        {title}
      </p>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trimmed}
            margin={{ top: 2, right: 4, left: -30, bottom: 0 }}
            barCategoryGap="12%"
          >
            <XAxis
              dataKey="label"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
            <Bar dataKey="energy" name="Energy (kWh)" radius={[3, 3, 0, 0]}>
              {trimmed.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.energy === maxEnergy ? '#00e5ff' : '#00bcd4'}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="avg"
              name="Avg (kWh)"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#f97316', strokeWidth: 2, fill: '#fff' }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IoTEnergyChart;
