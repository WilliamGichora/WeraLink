import { useState, useRef, useCallback } from 'react';
import { FileText, Download, Loader2, Activity, CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';
import { format } from 'date-fns';

const ADMIN_REPORTS = [
  { id: 'platform', title: 'Platform Activity', desc: 'Users, gigs, transactions, and ratings overview', icon: Activity, endpoint: '/reports/admin/platform-activity', color: 'bg-blue-100 text-blue-600' },
  { id: 'financial', title: 'Financial Reconciliation', desc: 'Detailed M-Pesa transaction ledger', icon: CreditCard, endpoint: '/reports/admin/financial-recon', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'trust', title: 'User Trust & Safety', desc: 'Dispute resolution, ratings, and platform health', icon: ShieldCheck, endpoint: '/reports/admin/user-trust', color: 'bg-indigo-100 text-indigo-600' },
];

export default function AdminReports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateReport = useCallback(async (reportId: string, endpoint: string) => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setReportData(res.data.data);
      setActiveReport(reportId);
    } catch {
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      await downloadReportAsPdf(reportRef.current, `WeraLink-Admin-${activeReport}-${format(new Date(), 'yyyy-MM-dd')}`);
      toast.success('Report downloaded!');
    } catch {
      toast.error('PDF generation failed.');
    } finally {
      setDownloading(false);
    }
  }, [activeReport]);

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-wera/10 p-2.5 rounded-xl"><FileText className="w-6 h-6 text-primary-wera" /></div>
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">Admin Reports</h1>
          <p className="text-text-main/50 text-sm font-medium">Generate platform-level reports</p>
        </div>
      </div>

      {!activeReport && (
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
          {ADMIN_REPORTS.map((report) => (
            <button key={report.id} onClick={() => generateReport(report.id, report.endpoint)} disabled={loading} className="bg-white rounded-2xl border border-slate-100 p-6 text-left hover:border-primary-wera/30 hover:shadow-md transition-all group">
              <div className={`p-3 rounded-xl ${report.color} w-fit mb-4 group-hover:scale-110 transition-transform`}><report.icon className="w-6 h-6" /></div>
              <h3 className="text-lg font-black text-accent-dark mb-1">{report.title}</h3>
              <p className="text-xs text-text-main/50">{report.desc}</p>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-primary-wera mt-3" />}
            </button>
          ))}
        </div>
      )}

      {activeReport && reportData && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => { setActiveReport(null); setReportData(null); }} className="rounded-xl font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={handleDownload} disabled={downloading} className="bg-primary-wera hover:bg-primary-dark text-white font-bold rounded-xl">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} Download PDF
            </Button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-lg">
            <ReportShell ref={reportRef} title={ADMIN_REPORTS.find(r => r.id === activeReport)?.title || ''} subtitle="Admin Report">
              {activeReport === 'platform' && <PlatformReport data={reportData} />}
              {activeReport === 'financial' && <FinancialReport data={reportData} />}
              {activeReport === 'trust' && <UserTrustReport data={reportData} />}
            </ReportShell>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformReport({ data }: { data: any }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'New Workers', value: data.users?.newWorkers || 0 },
          { label: 'New Employers', value: data.users?.newEmployers || 0 },
          { label: 'New Gigs', value: data.gigs?.newGigs || 0 },
          { label: 'Completed', value: data.gigs?.completed || 0 },
        ].map((m, i) => (
          <div key={i} className="bg-[#F6E8EA] rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold text-[#211112]/40 uppercase tracking-wider">{m.label}</p>
            <p className="text-xl font-black text-[#211112]">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#F6E8EA] rounded-xl p-3 text-center">
          <p className="text-[9px] font-bold text-[#211112]/40 uppercase">GMV</p>
          <p className="text-xl font-black text-[#211112]">KES {data.transactions?.gmv?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-3 text-center">
          <p className="text-[9px] font-bold text-[#211112]/40 uppercase">Transactions</p>
          <p className="text-xl font-black text-[#211112]">{data.transactions?.count || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-3 text-center">
          <p className="text-[9px] font-bold text-[#211112]/40 uppercase">Avg Rating</p>
          <p className="text-xl font-black text-[#211112]">{data.ratings?.avgScore || '—'}/5</p>
        </div>
      </div>
      <div className="text-center text-xs text-[#211112]/40 pt-4 border-t border-slate-100">
        Total Users: <span className="font-black text-[#211112]">{data.users?.totalUsers || 0}</span> · Total Gigs: <span className="font-black text-[#211112]">{data.gigs?.totalGigs || 0}</span>
      </div>
    </div>
  );
}

function FinancialReport({ data }: { data: any }) {
  return (
    <div>
      {/* Summary by Type */}
      {data.summary?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-3">Summary by Type</h3>
          <div className="space-y-2">
            {data.summary.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#211112] px-2 py-0.5 bg-[#F6E8EA] rounded">{s.type?.replace(/_/g, ' ')}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${s.status === 'SUCCESS' || s.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700' : s.status === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{s.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#211112]">KES {s.total?.toLocaleString()}</span>
                  <span className="text-[10px] text-[#211112]/40 ml-2">({s.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Transaction Ledger */}
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Type</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Parties</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Status</th>
          <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Amount</th>
        </tr></thead>
        <tbody>
          {data.transactions?.slice(0, 50).map((t: any) => (
            <tr key={t.id} className="border-b border-slate-100">
              <td className="py-2 text-[10px] font-bold text-[#211112]">{t.type?.replace(/_/g, ' ')}</td>
              <td className="py-2 text-xs text-[#211112]/60 max-w-[120px] truncate">{t.gigTitle}</td>
              <td className="py-2 text-[10px] text-[#211112]/40">{t.employerName} → {t.workerName}</td>
              <td className="py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${t.status === 'SUCCESS' || t.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700' : t.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{t.status}</span></td>
              <td className="py-2 text-right font-black text-[#EF626C] text-xs">KES {t.amount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserTrustReport({ data }: { data: any }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Avg Platform Rating</p>
          <p className="text-2xl font-black text-[#211112]">{data.trustMetrics?.avgPlatformRating || '—'}/5</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Disputes</p>
          <p className="text-2xl font-black text-[#211112]">{data.disputeStats?.total || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Resolution Rate</p>
          <p className="text-2xl font-black text-[#211112]">{data.disputeStats?.resolutionRate || 0}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">User Growth</h3>
          <ul className="space-y-3">
            {Object.entries(data.userGrowth || {}).map(([role, count]: any) => (
              <li key={role} className="flex justify-between bg-slate-50 p-2.5 rounded-lg">
                <span className="text-xs font-bold text-[#211112]">{role}</span>
                <span className="text-xs font-black text-[#EF626C]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Dispute Resolution</h3>
          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Avg Resolution Time</p>
            <p className="text-3xl font-black text-[#211112] mt-1">{data.disputeStats?.avgResolutionHours || 0}</p>
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider mt-1">Hours</p>
          </div>
        </div>
      </div>

      <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Recent Disputes</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Date</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig Title</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Raised By</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Status</th>
        </tr></thead>
        <tbody>
          {data.recentDisputes?.map((d: any) => (
            <tr key={d.id} className="border-b border-slate-100">
              <td className="py-2.5 text-center text-xs text-[#211112]/60">{d.date ? format(new Date(d.date), 'MMM dd, yyyy') : '—'}</td>
              <td className="py-2.5 font-bold text-[#211112] text-xs">{d.gigTitle}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{d.raisedBy} ({d.role})</td>
              <td className="py-2.5 text-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${d.status.startsWith('RESOLVED') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{d.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
