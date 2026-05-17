import { useState, lazy, Suspense } from 'react';
import { Wallet, Briefcase, Users, BarChart3, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEmployerAnalytics } from '@/features/analytics/api/analytics.api';
import { MetricCard } from '@/features/analytics/components/MetricCard';

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

export default function EmployerAnalytics() {
  const [months, setMonths] = useState(6);
  const { data: analytics, isLoading } = useEmployerAnalytics(months);

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
            <Link to="/employer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <ArrowLeft className="w-4 h-4 text-accent-dark" />
            </Link>
            <div className="bg-primary-wera/10 p-2 rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary-wera" />
            </div>
            <h1 className="text-3xl font-black text-accent-dark tracking-tight">Analytics</h1>
          </div>
          <p className="text-text-main/50 text-sm font-medium ml-12">Your hiring and spending insights</p>
        </div>

        <div className="flex items-center self-start sm:self-auto gap-1 bg-slate-100 rounded-xl p-1">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                months === m ? 'bg-accent-dark text-white shadow-md' : 'text-text-main/50 hover:text-text-main'
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
          title="Total Spending"
          value={`KES ${(kpis.totalSpending || 0).toLocaleString()}`}
          subtitle={`KES ${(kpis.periodSpending || 0).toLocaleString()} this period`}
          icon={<Wallet className="w-5 h-5" />}
          accentColor="bg-primary-wera/10 text-primary-wera"
        />
        <MetricCard
          title="Gigs Posted"
          value={kpis.totalGigsPosted || 0}
          subtitle={`${kpis.totalGigsCompleted || 0} completed`}
          icon={<Briefcase className="w-5 h-5" />}
          accentColor="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Avg Applicants/Gig"
          value={kpis.avgApplicantsPerGig || 0}
          subtitle="Per gig average"
          icon={<Users className="w-5 h-5" />}
          accentColor="bg-purple-100 text-purple-600"
        />
        <MetricCard
          title="Revision Rate"
          value={`${kpis.revisionRate || 0}%`}
          subtitle={kpis.avgRatingGiven ? `Avg rating given: ${kpis.avgRatingGiven}/5` : 'No ratings yet'}
          icon={<RotateCcw className="w-5 h-5" />}
          accentColor="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <TrendChart
            data={analytics?.spendingTrend || []}
            title="Spending Trend"
            dataKey="amount"
            color="#EF626C"
            currency="KES"
          />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <StatusPieChart
            data={analytics?.gigStatusDistribution || {}}
            title="Gig Status Distribution"
          />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <StatusPieChart
            data={analytics?.assignmentStatusDistribution || {}}
            title="Assignment Status Breakdown"
          />
        </Suspense>

        {/* Applicant Stats Table */}
        {analytics?.applicantStats && analytics.applicantStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h4 className="text-xs font-black text-text-main/40 uppercase tracking-[0.15em] mb-6">
              Applicants per Gig
            </h4>
            <div className="space-y-3">
              {analytics.applicantStats.map((gig: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-accent-dark truncate">{gig.title}</p>
                    <p className="text-[10px] text-text-main/40 font-bold uppercase truncate">{gig.category.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-primary-wera">{gig.applicants}</span>
                    <span className="text-[10px] text-text-main/40 ml-1">applicants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
