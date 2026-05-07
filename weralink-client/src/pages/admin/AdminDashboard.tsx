import { lazy, Suspense } from 'react';
import { Users, Briefcase, DollarSign, Star, AlertTriangle, Shield } from 'lucide-react';
import { useAdminAnalytics } from '@/features/analytics/api/analytics.api';
import { MetricCard } from '@/features/analytics/components/MetricCard';

const TrendChart = lazy(() => import('@/features/analytics/components/TrendChart').then(m => ({ default: m.TrendChart })));
const StatusPieChart = lazy(() => import('@/features/analytics/components/StatusPieChart').then(m => ({ default: m.StatusPieChart })));

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
    <div className="h-4 w-32 bg-slate-100 rounded mb-6" />
    <div className="h-64 bg-slate-50 rounded-xl" />
  </div>
);

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useAdminAnalytics(6);

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100" />)}
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-wera/10 p-2.5 rounded-xl">
          <Shield className="w-6 h-6 text-primary-wera" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">Platform Overview</h1>
          <p className="text-text-main/50 text-sm font-medium">Real-time platform metrics and insights</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total GMV" value={`KES ${(kpis.totalGMV || 0).toLocaleString()}`} subtitle={`${kpis.totalTransactions || 0} transactions`} icon={<DollarSign className="w-5 h-5" />} accentColor="bg-emerald-100 text-emerald-600" />
        <MetricCard title="Workers" value={kpis.totalWorkers || 0} icon={<Users className="w-5 h-5" />} accentColor="bg-blue-100 text-blue-600" />
        <MetricCard title="Employers" value={kpis.totalEmployers || 0} icon={<Users className="w-5 h-5" />} accentColor="bg-purple-100 text-purple-600" />
        <MetricCard title="Total Gigs" value={kpis.totalGigs || 0} subtitle={`${kpis.completedGigs || 0} completed`} icon={<Briefcase className="w-5 h-5" />} accentColor="bg-amber-100 text-amber-600" />
        <MetricCard title="Avg Rating" value={kpis.avgPlatformRating || '—'} subtitle={`${kpis.totalRatings || 0} reviews`} icon={<Star className="w-5 h-5" />} accentColor="bg-amber-100 text-amber-600" />
        <MetricCard title="Escrow Balance" value={`KES ${(kpis.escrowBalance || 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} accentColor="bg-primary-wera/10 text-primary-wera" />
        <MetricCard title="Total Disputes" value={kpis.totalDisputes || 0} subtitle={`${kpis.openDisputes || 0} open`} icon={<AlertTriangle className="w-5 h-5" />} accentColor="bg-red-100 text-red-600" />
        <MetricCard title="Dispute Rate" value={`${kpis.disputeRate || 0}%`} subtitle="Of all assignments" icon={<AlertTriangle className="w-5 h-5" />} accentColor="bg-slate-100 text-slate-600" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <TrendChart data={analytics?.transactionTrend || []} title="Transaction Volume & Value" dataKey="amount" color="#10b981" currency="KES" />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          {analytics?.categoryDistribution && (
            <StatusPieChart
              data={Object.fromEntries(analytics.categoryDistribution.map((c: any) => [c.category, c.count]))}
              title="Gig Category Distribution"
            />
          )}
        </Suspense>
      </div>

      {/* User Growth */}
      <Suspense fallback={<ChartSkeleton />}>
        <TrendChart data={analytics?.userGrowth || []} title="User Growth (Monthly Registrations)" dataKey="count" color="#8b5cf6" />
      </Suspense>
    </div>
  );
}
