import { useState, lazy, Suspense } from 'react';
import { BarChart3 } from 'lucide-react';
import { useAdminAnalytics } from '@/features/analytics/api/analytics.api';
import { MetricCard } from '@/features/analytics/components/MetricCard';
import { DollarSign, Users, Briefcase, Star } from 'lucide-react';

const TrendChart = lazy(() => import('@/features/analytics/components/TrendChart').then(m => ({ default: m.TrendChart })));
const StatusPieChart = lazy(() => import('@/features/analytics/components/StatusPieChart').then(m => ({ default: m.StatusPieChart })));

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
    <div className="h-4 w-32 bg-slate-100 rounded mb-6" />
    <div className="h-64 bg-slate-50 rounded-xl" />
  </div>
);

export default function AdminAnalytics() {
  const [months, setMonths] = useState(6);
  const { data: analytics, isLoading } = useAdminAnalytics(months);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary-wera/10 p-2.5 rounded-xl">
            <BarChart3 className="w-6 h-6 text-primary-wera" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-accent-dark tracking-tight">Platform Analytics</h1>
            <p className="text-text-main/50 text-sm font-medium">Deep-dive into platform performance</p>
          </div>
        </div>
        <div className="flex items-center self-start sm:self-auto gap-1 bg-slate-100 rounded-xl p-1">
          {[3, 6, 12].map((m) => (
            <button key={m} onClick={() => setMonths(m)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${months === m ? 'bg-accent-dark text-white shadow-md' : 'text-text-main/50 hover:text-text-main'}`}>
              {m}M
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="GMV" value={`KES ${(kpis.totalGMV || 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} accentColor="bg-emerald-100 text-emerald-600" />
        <MetricCard title="Total Users" value={(kpis.totalWorkers || 0) + (kpis.totalEmployers || 0)} subtitle={`${kpis.totalWorkers} workers, ${kpis.totalEmployers} employers`} icon={<Users className="w-5 h-5" />} accentColor="bg-blue-100 text-blue-600" />
        <MetricCard title="Completed Gigs" value={kpis.completedGigs || 0} subtitle={`of ${kpis.totalGigs || 0} total`} icon={<Briefcase className="w-5 h-5" />} accentColor="bg-amber-100 text-amber-600" />
        <MetricCard title="Platform Rating" value={kpis.avgPlatformRating || '—'} subtitle={`${kpis.totalRatings || 0} reviews`} icon={<Star className="w-5 h-5" />} accentColor="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <TrendChart data={analytics?.transactionTrend || []} title="Transaction Volume (Monthly)" dataKey="amount" color="#10b981" currency="KES" />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TrendChart data={analytics?.transactionTrend || []} title="Transaction Count (Monthly)" dataKey="count" color="#3b82f6" />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <TrendChart data={analytics?.userGrowth || []} title="New User Registrations" dataKey="count" color="#8b5cf6" />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          {analytics?.categoryDistribution && (
            <StatusPieChart
              data={Object.fromEntries(analytics.categoryDistribution.map((c: any) => [c.category, c.count]))}
              title="Gig Categories"
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
