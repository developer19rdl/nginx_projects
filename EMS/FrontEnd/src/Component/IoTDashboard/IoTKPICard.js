import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const toChartData = (arr) => arr.map((v) => ({ v }));

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
);

const IoTKPICard = ({
  icon, iconBg, iconColor,
  title, value, unit,
  percentage, trendUp = true,
  sparkValues, extra,
  loading = false,
}) => {
  const chartData = useMemo(
    () => toChartData(sparkValues || [30, 40, 35, 50, 45, 60, 55, 65, 60, 70]),
    [sparkValues]
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
      <div className="p-5 flex flex-col gap-3 flex-1">

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}>
          <span style={{ color: iconColor, display: 'flex' }}>{icon}</span>
        </div>

        {/* Title */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide leading-none">
          {title}
        </p>

        {/* Value — shimmer while loading */}
        {loading ? (
          <div className="flex flex-col gap-2">
            <Shimmer className="h-7 w-24" />
            <Shimmer className="h-4 w-14" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-800 leading-none">{value}</span>
              {unit && <span className="text-sm text-gray-400 font-medium">{unit}</span>}
            </div>

            {extra && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                  {extra.label}
                </span>
                <span className="text-xs text-gray-400">{extra.sub}</span>
              </div>
            )}

            {percentage !== undefined && (
              <div className={`flex items-center gap-0.5 text-sm font-semibold
                ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp
                  ? <ArrowUpwardIcon style={{ fontSize: 14 }} />
                  : <ArrowDownwardIcon style={{ fontSize: 14 }} />
                }
                <span>{percentage}%</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={iconColor} stopOpacity={loading ? 0.05 : 0.25} />
                <stop offset="100%" stopColor={iconColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={loading ? '#e5e7eb' : iconColor}
              strokeWidth={2}
              fill={`url(#spark-${title.replace(/\s/g, '')})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IoTKPICard;
