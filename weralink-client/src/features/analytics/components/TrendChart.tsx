import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  data: { month: string; amount?: number; count?: number }[];
  title: string;
  dataKey?: 'amount' | 'count';
  color?: string;
  currency?: string;
  className?: string;
}

/**
 * Earnings/spending trend line chart with gradient fill.
 * Uses Recharts AreaChart for smooth, branded visualization.
 * 
 * Performance: Memoized data processing, lazy ResponsiveContainer.
 */
export const TrendChart = memo(function TrendChart({
  data,
  title,
  dataKey = 'amount',
  color = '#EF626C',
  currency = 'KES',
  className = '',
}: TrendChartProps) {
  const formatValue = useMemo(() => {
    return (value: number) => {
      if (dataKey === 'amount') {
        return `${currency} ${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    };
  }, [dataKey, currency]);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 p-6 ${className}`}>
        <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-4">{title}</h4>
        <div className="h-48 flex items-center justify-center text-sm text-text-main/30">No data available</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm ${className}`}>
      <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-6">{title}</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: '#211112',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
              itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}
              formatter={(value: number) => [formatValue(value), title]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#gradient-${color.replace('#', '')})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
