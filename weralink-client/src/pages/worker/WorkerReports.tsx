import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, FileText, Download, Loader2, Wallet, Briefcase, Award, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';
import { format } from 'date-fns';

const WORKER_REPORTS = [
  { id: 'earnings', title: 'Earnings Statement', desc: 'Monthly earnings breakdown with payment details', icon: Wallet, endpoint: '/reports/worker/earnings', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'history', title: 'Gig Completion History', desc: 'All completed gigs with ratings and evidence', icon: Briefcase, endpoint: '/reports/worker/history', color: 'bg-blue-100 text-blue-600' },
  { id: 'performance', title: 'Performance Report Card', desc: 'Ratings summary, completion rate, and skills', icon: Award, endpoint: '/reports/worker/performance', color: 'bg-amber-100 text-amber-600' },
  { id: 'skills', title: 'Skills & Training Certificate', desc: 'Verified skills, training modules passed, badges', icon: FileText, endpoint: '/reports/worker/skills', color: 'bg-indigo-100 text-indigo-600' },
];

export default function WorkerReports() {
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
      toast.error('Failed to generate report data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      await downloadReportAsPdf(reportRef.current, `WeraLink-${activeReport}-${format(new Date(), 'yyyy-MM-dd')}`);
      toast.success('Report downloaded!');
    } catch {
      toast.error('PDF generation failed.');
    } finally {
      setDownloading(false);
    }
  }, [activeReport]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/worker" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-accent-dark" />
        </Link>
        <div className="bg-primary-wera/10 p-2 rounded-xl">
          <FileText className="w-5 h-5 text-primary-wera" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">Reports</h1>
          <p className="text-text-main/50 text-sm font-medium">Generate and download branded reports</p>
        </div>
      </div>

      {/* Report Gallery */}
      {!activeReport && (
        <div className="grid md:grid-cols-3 gap-4">
          {WORKER_REPORTS.map((report) => (
            <button
              key={report.id}
              onClick={() => generateReport(report.id, report.endpoint)}
              disabled={loading}
              className="bg-white rounded-2xl border border-slate-100 p-6 text-left hover:border-primary-wera/30 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-xl ${report.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <report.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-accent-dark mb-1">{report.title}</h3>
              <p className="text-xs text-text-main/50">{report.desc}</p>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-primary-wera mt-3" />}
            </button>
          ))}
        </div>
      )}

      {/* Report Preview */}
      {activeReport && reportData && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => { setActiveReport(null); setReportData(null); }} className="rounded-xl font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
            </Button>
            <Button onClick={handleDownload} disabled={downloading} className="bg-primary-wera hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary-wera/20">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-lg">
            <ReportShell ref={reportRef} title={WORKER_REPORTS.find(r => r.id === activeReport)?.title || ''} subtitle="Worker Report">
              {activeReport === 'earnings' && <EarningsReport data={reportData} />}
              {activeReport === 'history' && <HistoryReport data={reportData} />}
              {activeReport === 'performance' && <PerformanceReport data={reportData} />}
              {activeReport === 'skills' && <SkillsCertificateReport data={reportData} />}
            </ReportShell>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Individual Report Renderers ──────────────────────────

function EarningsReport({ data }: { data: any }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Earnings</p>
          <p className="text-2xl font-black text-[#211112]">KES {data.summary?.totalEarnings?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Payouts</p>
          <p className="text-2xl font-black text-[#211112]">{data.summary?.totalPayouts || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Currency</p>
          <p className="text-2xl font-black text-[#211112]">{data.summary?.currency || 'KES'}</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#211112]/10">
            <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig</th>
            <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Employer</th>
            <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Date</th>
            <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.transactions?.map((t: any) => (
            <tr key={t.id} className="border-b border-slate-100">
              <td className="py-2.5 font-bold text-[#211112] text-xs">{t.gigTitle}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{t.employerName}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{t.date ? format(new Date(t.date), 'MMM dd, yyyy') : '—'}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">KES {t.amount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryReport({ data }: { data: any }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#211112]/60 mb-6">Total Completed: <span className="text-[#211112] font-black">{data.totalCompleted}</span></p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#211112]/10">
            <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig</th>
            <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Category</th>
            <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Employer</th>
            <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Rating</th>
            <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Pay</th>
          </tr>
        </thead>
        <tbody>
          {data.assignments?.map((a: any) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="py-2.5 font-bold text-[#211112] text-xs">{a.gigTitle}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{a.category?.replace(/_/g, ' ')}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{a.employerName}</td>
              <td className="py-2.5 text-center text-xs font-bold text-amber-600">{a.rating?.score ? `${a.rating.score}/5` : '—'}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">{a.currency} {a.payAmount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PerformanceReport({ data }: { data: any }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Avg Rating</p>
          <p className="text-3xl font-black text-[#211112]">{data.avgRating || '—'}<span className="text-sm">/5</span></p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-black text-[#211112]">{data.completionRate || 0}%</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Gigs Completed</p>
          <p className="text-3xl font-black text-[#211112]">{data.gigsCompleted || 0}</p>
        </div>
      </div>

      {data.skills?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s: any, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-[#F6E8EA] rounded-full text-[10px] font-bold text-[#211112]">
                {s.name} · Lvl {s.level} {s.verified ? '✓' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.badges?.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-3">Badges</h3>
          <div className="space-y-2">
            {data.badges.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Award className="w-5 h-5 text-[#EF626C]" />
                <div>
                  <p className="text-xs font-bold text-[#211112]">{b.name}</p>
                  <p className="text-[10px] text-[#211112]/40">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillsCertificateReport({ data }: { data: any }) {
  return (
    <div>
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">{data.workerInfo?.name}</h2>
        <p className="text-xs font-bold text-[#211112]/60">
          Member since {data.workerInfo?.joinedAt ? format(new Date(data.workerInfo.joinedAt), 'MMMM yyyy') : '—'}
        </p>
        {data.workerInfo?.verified && (
          <span className="inline-block mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
            Verified Worker ✓
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Verified Skills</h3>
          {data.skills?.length > 0 ? (
            <ul className="space-y-3">
              {data.skills.map((s: any, i: number) => (
                <li key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-xs font-bold text-[#211112]">{s.name}</span>
                  <span className="text-[10px] font-bold bg-[#F6E8EA] text-[#211112] px-2 py-1 rounded">Level {s.level}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#211112]/40 italic">No skills verified yet.</p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Training Modules</h3>
          {data.training?.length > 0 ? (
            <ul className="space-y-3">
              {data.training.map((t: any, i: number) => (
                <li key={i} className="flex flex-col bg-slate-50 p-2.5 rounded-lg border-l-4 border-emerald-400">
                  <span className="text-xs font-bold text-[#211112]">{t.moduleTitle}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-[#211112]/60">Score: {t.score}%</span>
                    <span className="text-[10px] font-bold text-emerald-600">Passed ✓</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#211112]/40 italic">No training modules completed.</p>
          )}
        </div>
      </div>

      {data.badges?.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.badges.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="bg-[#F6E8EA] p-2 rounded-full">
                  <Award className="w-5 h-5 text-[#EF626C]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#211112]">{b.name}</p>
                  <p className="text-[10px] text-[#211112]/60 mt-0.5">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
