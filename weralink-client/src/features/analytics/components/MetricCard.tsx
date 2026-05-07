import { memo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
  className?: string;
}

/**
 * Animated KPI card with optional trend indicator.
 * Replaces hardcoded dashboard stat cards with real data.
 * 
 * Performance: Memoized to prevent re-renders when sibling charts update.
 */
export const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'bg-primary-wera/10 text-primary-wera',
  className = '',
}: MetricCardProps) {
  const trendDirection = trend ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : null;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${accentColor} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              trendDirection === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : trendDirection === 'down'
                ? 'bg-red-50 text-red-500'
                : 'bg-slate-50 text-slate-500'
            }`}
          >
            {trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
            {trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
            {trendDirection === 'neutral' && <Minus className="w-3 h-3" />}
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-black text-text-main/40 uppercase tracking-[0.15em] mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-accent-dark tracking-tight leading-none mb-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-text-main/50 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
});
