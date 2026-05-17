import { memo, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StatusPieChartProps {
  data: Record<string, number>;
  title: string;
  colorMap?: Record<string, string>;
  className?: string;
}

const DEFAULT_COLORS: Record<string, string> = {
  OFFERED: '#94a3b8',
  ACCEPTED: '#3b82f6',
  SUBMITTED: '#8b5cf6',
  REVISION_REQUESTED: '#f59e0b',
  APPROVED: '#22c55e',
  PAID: '#10b981',
  DISPUTED: '#ef4444',
  FAILED: '#dc2626',
  CANCELLED: '#6b7280',
  OPEN: '#3b82f6',
  ASSIGNED: '#8b5cf6',
  COMPLETED: '#22c55e',
  CLOSED: '#6b7280',
};

const FALLBACK_COLORS = ['#EF626C', '#211112', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#6b7280', '#10b981'];

/**
 * Status/category distribution donut chart.
 * Automatically maps status values to colors.
 */
export const StatusPieChart = memo(function StatusPieChart({
  data,
  title,
  colorMap = {},
  className = '',
}: StatusPieChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [data]);

  const mergedColorMap = { ...DEFAULT_COLORS, ...colorMap };

  if (chartData.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 p-6 ${className}`}>
        <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-4">{title}</h4>
        <div className="h-48 flex items-center justify-center text-sm text-text-main/30">No data</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm ${className}`}>
      <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-4">{title}</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => {
                const originalName = entry.name.replace(/ /g, '_');
                const color = mergedColorMap[originalName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return <Cell key={entry.name} fill={color} />;
              })}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#211112',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
              itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}
              formatter={(value: any) => [value, '']}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-[10px] font-bold text-text-main/60 uppercase tracking-wider">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
