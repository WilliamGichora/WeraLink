import { useState, lazy, Suspense } from 'react';
import { Wallet, Briefcase, Star, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkerAnalytics } from '@/features/analytics/api/analytics.api';
import { MetricCard } from '@/features/analytics/components/MetricCard';

// Lazy load heavy chart components (code splitting for performance)
const TrendChart = lazy(() =>
  import('@/features/analytics/components/TrendChart').then(m => ({ default: m.TrendChart }))
);
const StatusPieChart = lazy(() =>
  import('@/features/analytics/components/StatusPieChart').then(m => ({ default: m.StatusPieChart }))
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
    <div className="h-4 w-32 bg-slate-100 rounded mb-6" />
    <div className="h-64 bg-slate-50 rounded-xl" />
  </div>
);

export default function WorkerAnalytics() {
  const [months, setMonths] = useState(6);
  const { data: analytics, isLoading } = useWorkerAnalytics(months);

  if (isLoading) {
    return (
      <div className="w-full p-4 md:p-8 font-sans animate-in fade-in duration-500">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="w-full p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/worker"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-accent-dark" />
            </Link>
            <div className="bg-primary-wera/10 p-2 rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary-wera" />
            </div>
            <h1 className="text-3xl font-black text-accent-dark tracking-tight">Analytics</h1>
          </div>
          <p className="text-text-main/50 text-sm font-medium ml-12">
            Your performance insights and earnings overview
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center self-start sm:self-auto gap-1 bg-slate-100 rounded-xl p-1">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                months === m
                  ? 'bg-accent-dark text-white shadow-md'
                  : 'text-text-main/50 hover:text-text-main'
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Earnings"
          value={`KES ${(kpis.totalEarnings || 0).toLocaleString()}`}
          subtitle={`KES ${(kpis.periodEarnings || 0).toLocaleString()} this period`}
          icon={<Wallet className="w-5 h-5" />}
          accentColor="bg-emerald-100 text-emerald-600"
        />
        <MetricCard
          title="Gigs Completed"
          value={kpis.totalGigsCompleted || 0}
          subtitle={`${kpis.periodGigsCompleted || 0} this period`}
          icon={<Briefcase className="w-5 h-5" />}
          accentColor="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Average Rating"
          value={kpis.avgRating || '—'}
          subtitle={`${kpis.totalRatings || 0} reviews`}
          icon={<Star className="w-5 h-5" />}
          accentColor="bg-amber-100 text-amber-600"
        />
        <MetricCard
          title="Period Earnings"
          value={`KES ${(kpis.periodEarnings || 0).toLocaleString()}`}
          subtitle={`Last ${months} months`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="bg-primary-wera/10 text-primary-wera"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <TrendChart
            data={analytics?.earningsTrend || []}
            title="Earnings Trend"
            dataKey="amount"
            color="#10b981"
            currency="KES"
          />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <StatusPieChart
            data={analytics?.statusDistribution || {}}
            title="Assignment Status Breakdown"
          />
        </Suspense>
      </div>

      {/* Category Breakdown */}
      {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8">
          <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-6">
            Category Performance
          </h4>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((cat: any) => {
              const maxCount = Math.max(...analytics.categoryBreakdown.map((c: any) => c.count));
              const width = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;

              return (
                <div key={cat.category} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-accent-dark w-28 truncate">
                    {cat.category.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-wera rounded-full transition-all duration-700"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="text-right shrink-0 w-24">
                    <span className="text-sm font-black text-accent-dark">{cat.count}</span>
                    <span className="text-[10px] text-text-main/40 ml-1">gigs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Completed */}
      {analytics?.recentAssignments && analytics.recentAssignments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-6">
            Recent Completed Gigs
          </h4>
          <div className="space-y-3">
            {analytics.recentAssignments.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-bold text-accent-dark truncate">{a.gig.title}</p>
                  <p className="text-[10px] text-text-main/40 font-bold uppercase truncate">
                    {a.gig.category.replace(/_/g, ' ')} · {a.paidAt ? new Date(a.paidAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span className="text-sm font-black text-emerald-600 shrink-0">
                  {a.gig.currency} {Number(a.gig.payAmount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
