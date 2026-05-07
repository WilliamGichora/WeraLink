import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, FileText, Download, Loader2, Wallet, Briefcase, CreditCard, Activity, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEmployerHiredWorkers } from '@/features/execution/api/execution.api';

const EMPLOYER_REPORTS = [
  { id: 'spending', title: 'Spending Summary', desc: 'Expense breakdown by gig and category', icon: Wallet, endpoint: '/reports/employer/spending', color: 'bg-primary-wera/10 text-primary-wera' },
  { id: 'gig-activity', title: 'Gig Activity Report', desc: 'All posted gigs with applicant and status data', icon: Briefcase, endpoint: '/reports/employer/gig-activity', color: 'bg-blue-100 text-blue-600' },
  { id: 'payment-ledger', title: 'Payment Ledger', desc: 'Full M-Pesa transaction history', icon: CreditCard, endpoint: '/reports/employer/payment-ledger', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'hiring-efficiency', title: 'Hiring Efficiency', desc: 'Applicants-to-hire ratio and time metrics', icon: Activity, endpoint: '/reports/employer/hiring-efficiency', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'worker-review', title: 'Worker Performance Review', desc: 'Per-worker reliability and ratings', icon: Star, endpoint: '/reports/employer/worker-review', color: 'bg-amber-100 text-amber-600', requiresId: true },
];

export default function EmployerReports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingReport, setPendingReport] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateReport = useCallback(async (report: any, workerId?: string) => {
    let finalEndpoint = report.endpoint;
    
    if (report.requiresId) {
      if (!workerId) {
        setPendingReport(report);
        setModalOpen(true);
        return;
      }
      finalEndpoint = `${report.endpoint}/${workerId}`;
    }

    setLoading(true);
    try {
      const res = await api.get(finalEndpoint);
      setReportData(res.data.data);
      setActiveReport(report.id);
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
      <div className="flex items-center gap-3 mb-8">
        <Link to="/employer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
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

      {!activeReport && (
        <div className="grid md:grid-cols-3 gap-4">
          {EMPLOYER_REPORTS.map((report) => (
            <button
              key={report.id}
              onClick={() => generateReport(report)}
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
            <ReportShell ref={reportRef} title={EMPLOYER_REPORTS.find(r => r.id === activeReport)?.title || ''} subtitle="Employer Report">
              {activeReport === 'spending' && <SpendingReport data={reportData} />}
              {activeReport === 'gig-activity' && <GigActivityReport data={reportData} />}
              {activeReport === 'payment-ledger' && <PaymentLedgerReport data={reportData} />}
              {activeReport === 'hiring-efficiency' && <HiringEfficiencyReport data={reportData} />}
              {activeReport === 'worker-review' && <WorkerReviewReport data={reportData} />}
            </ReportShell>
          </div>
        </div>
      )}

      {modalOpen && pendingReport && (
        <WorkerSelectModal 
          isOpen={modalOpen} 
          onClose={() => { setModalOpen(false); setPendingReport(null); }} 
          onSelect={(workerId) => {
            setModalOpen(false);
            generateReport(pendingReport, workerId);
            setPendingReport(null);
          }} 
        />
      )}
    </div>
  );
}

function WorkerSelectModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (workerId: string) => void }) {
  const { data: workers, isLoading } = useEmployerHiredWorkers();
  const [search, setSearch] = useState('');

  const filteredWorkers = workers?.filter((w: any) => 
    w.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Worker</DialogTitle>
          <DialogDescription>
            Choose a worker from your past hires to generate their performance review.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <input 
            type="text" 
            placeholder="Search workers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-wera text-sm"
          />
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-wera" /></div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">No workers found.</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {filteredWorkers.map((worker: any) => (
                <button
                  key={worker.id}
                  onClick={() => onSelect(worker.id)}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3 shrink-0">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#211112]">{worker.name}</p>
                    {worker.profile?.location && <p className="text-xs text-slate-500">{worker.profile.location}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SpendingReport({ data }: { data: any }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Spend</p>
          <p className="text-2xl font-black text-[#211112]">KES {data.summary?.totalSpending?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Transactions</p>
          <p className="text-2xl font-black text-[#211112]">{data.summary?.totalTransactions || 0}</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Worker</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Date</th>
          <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Amount</th>
        </tr></thead>
        <tbody>
          {data.transactions?.map((t: any) => (
            <tr key={t.id} className="border-b border-slate-100">
              <td className="py-2.5 font-bold text-[#211112] text-xs">{t.gigTitle}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{t.workerName}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{t.date ? format(new Date(t.date), 'MMM dd, yyyy') : '—'}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">KES {t.amount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GigActivityReport({ data }: { data: any }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#211112]/60 mb-6">Total Gigs: <span className="text-[#211112] font-black">{data.totalGigs}</span></p>
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Title</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Category</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Status</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Applicants</th>
          <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Pay</th>
        </tr></thead>
        <tbody>
          {data.gigs?.map((g: any) => (
            <tr key={g.id} className="border-b border-slate-100">
              <td className="py-2.5 font-bold text-[#211112] text-xs">{g.title}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{g.category?.replace(/_/g, ' ')}</td>
              <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-[#211112]/60">{g.status}</span></td>
              <td className="py-2.5 text-center font-bold text-xs text-[#211112]">{g.totalApplicants}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">KES {g.payAmount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentLedgerReport({ data }: { data: any }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#211112]/60 mb-6">Total Transactions: <span className="text-[#211112] font-black">{data.totalTransactions}</span></p>
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Type</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Status</th>
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">M-Pesa Ref</th>
          <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Amount</th>
        </tr></thead>
        <tbody>
          {data.transactions?.map((t: any) => (
            <tr key={t.id} className="border-b border-slate-100">
              <td className="py-2.5 text-[10px] font-bold text-[#211112]">{t.type?.replace(/_/g, ' ')}</td>
              <td className="py-2.5 text-xs text-[#211112]/60">{t.gigTitle}</td>
              <td className="py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.status === 'SUCCESS' || t.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700' : t.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{t.status}</span></td>
              <td className="py-2.5 text-[10px] text-[#211112]/40 font-mono">{t.receiptNumber || t.mpesaRef || '—'}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">KES {t.amount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HiringEfficiencyReport({ data }: { data: any }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Gigs</p>
          <p className="text-2xl font-black text-[#211112]">{data.totalGigs || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Hires</p>
          <p className="text-2xl font-black text-[#211112]">{data.totalHires || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Hire Ratio</p>
          <p className="text-xl font-black text-[#211112] mt-1">{data.hireRatio || '—'}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Avg Time to Hire</p>
          <p className="text-xl font-black text-[#211112] mt-1">{data.avgTimeToHireHours || 0} hrs</p>
        </div>
      </div>
      
      <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Top Categories by Hires</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Category</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gigs Posted</th>
          <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Total Hires</th>
        </tr></thead>
        <tbody>
          {data.topCategories?.map((c: any, i: number) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2.5 font-bold text-[#211112] text-xs">{c.category?.replace(/_/g, ' ')}</td>
              <td className="py-2.5 text-center text-xs text-[#211112]/60">{c.gigs}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">{c.hires}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkerReviewReport({ data }: { data: any }) {
  return (
    <div>
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">{data.workerName}</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">Worker Performance Review</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Gigs</p>
          <p className="text-2xl font-black text-[#211112]">{data.totalGigs || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Spend</p>
          <p className="text-2xl font-black text-[#211112]">KES {data.totalSpend?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Reliability Score</p>
          <p className="text-2xl font-black text-[#211112]">{data.reliabilityScore || 0}%</p>
        </div>
      </div>
      
      <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Assignment History</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b-2 border-[#211112]/10">
          <th className="text-left py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Gig Title</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Date</th>
          <th className="text-center py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Rating</th>
          <th className="text-right py-3 text-[10px] font-black text-[#211112]/40 uppercase tracking-wider">Paid Amount</th>
        </tr></thead>
        <tbody>
          {data.history?.map((h: any) => (
            <tr key={h.id} className="border-b border-slate-100">
              <td className="py-2.5 font-bold text-[#211112] text-xs">{h.gigTitle}</td>
              <td className="py-2.5 text-center text-xs text-[#211112]/60">{h.paidAt ? format(new Date(h.paidAt), 'MMM dd, yyyy') : '—'}</td>
              <td className="py-2.5 text-center text-xs font-bold text-amber-600">{h.rating?.score ? `${h.rating.score}/5` : '—'}</td>
              <td className="py-2.5 text-right font-black text-[#EF626C] text-xs">KES {h.payAmount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
