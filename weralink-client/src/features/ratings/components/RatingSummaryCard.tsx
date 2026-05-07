import { memo } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { useGetRatingSummary } from '@/features/ratings/api/rating.api';

interface RatingSummaryCardProps {
  userId: string | undefined;
  /** Compact mode for inline display (e.g., in Applicant Review sidebar) */
  compact?: boolean;
  className?: string;
}

/**
 * Displays an aggregate rating summary for a user.
 * Features: average score with stars, distribution bar chart, dimension breakdown.
 * 
 * Performance: Memoized to prevent re-renders from parent state changes.
 * Data: Uses staleTime of 5min via useGetRatingSummary hook.
 */
export const RatingSummaryCard = memo(function RatingSummaryCard({
  userId,
  compact = false,
  className = '',
}: RatingSummaryCardProps) {
  const { data: summary, isLoading } = useGetRatingSummary(userId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${compact ? 'h-16' : 'h-40'} bg-slate-100 rounded-2xl ${className}`} />
    );
  }

  if (!summary || summary.totalRatings === 0) {
    return (
      <div className={`bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center ${className}`}>
        <Star className="w-5 h-5 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-text-main/30">No ratings yet</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-5 h-5 fill-current" />
          <span className="text-xl font-black text-accent-dark">{summary.avgScore}</span>
        </div>
        <div className="text-xs text-text-main/50">
          <span className="font-bold">{summary.totalRatings}</span> rating{summary.totalRatings !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(summary.distribution as Record<string, number>));

  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-primary-wera" />
        <h4 className="text-xs font-black text-accent-dark/40 uppercase tracking-[0.15em]">Rating Summary</h4>
      </div>

      <div className="flex gap-8">
        {/* Left: Big Score */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="text-5xl font-black text-accent-dark leading-none mb-2">{summary.avgScore}</div>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(summary.avgScore) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-text-main/40">
            {summary.totalRatings} review{summary.totalRatings !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Right: Distribution */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (summary.distribution as Record<string, number>)?.[star] || 0;
            const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-text-main/50 w-3 text-right">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-text-main/30 w-4">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dimensions */}
      {summary.avgDimensions && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-[10px] font-black text-text-main/30 uppercase tracking-[0.15em] mb-3">
            Detailed Scores
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'quality', label: 'Quality' },
              { key: 'communication', label: 'Comm.' },
              { key: 'timeliness', label: 'Timely' },
            ].map(({ key, label }) => {
              const val = summary.avgDimensions?.[key];
              return val != null ? (
                <div key={key} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-accent-dark">{val}</p>
                  <p className="text-[10px] font-bold text-text-main/40 uppercase tracking-wider">{label}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
});
