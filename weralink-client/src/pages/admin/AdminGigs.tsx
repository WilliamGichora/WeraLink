import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { Wrench, Search, ChevronDown, Eye, X, Download, Loader2, Calendar, DollarSign, Award, Tag, Briefcase, FileText } from 'lucide-react';
import { useAdminListGigs, useAdminGigDetail, useAdminListUsers } from '@/features/admin/api/admin.api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { AdminGigsReport } from '@/features/reports/components/AdminGigsReport';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';

const CATEGORIES = ['TRANSLATION', 'MARKETING', 'DATA_ENTRY', 'BUG_HUNTING', 'AI_LABELING', 'RESEARCH'];
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
const STATUSES = ['OPEN', 'ASSIGNED', 'COMPLETED', 'CLOSED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-50 text-green-700 border-green-200',
  INTERMEDIATE: 'bg-amber-50 text-amber-700 border-amber-200',
  EXPERT: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminGigs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [employerId, setEmployerId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch Gigs
  const params = useMemo(() => ({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    status: status || undefined,
    category: category || undefined,
    difficulty: difficulty || undefined,
    employerId: employerId || undefined,
    workerId: workerId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [page, debouncedSearch, status, category, difficulty, employerId, workerId, startDate, endDate]);

  const { data: gigsData, isLoading } = useAdminListGigs(params);
  const { data: gigDetail, isLoading: detailLoading } = useAdminGigDetail(selectedGigId);

  // Fetch Users for filtering lists (e.g. Employers and Workers)
  const { data: employersData } = useAdminListUsers({ role: 'EMPLOYER', limit: 100 });
  const { data: workersData } = useAdminListUsers({ role: 'WORKER', limit: 100 });

  const gigs = gigsData?.gigs || [];
  const pagination = gigsData?.pagination || { page: 1, totalPages: 1, total: 0 };
  const employers = employersData?.users || [];
  const workers = workersData?.users || [];

  // Find names of active filter items for PDF headers
  const selectedEmployerName = useMemo(() => {
    if (!employerId) return '';
    return employers.find((e: any) => e.id === employerId)?.name || 'Employer ID: ' + employerId;
  }, [employerId, employers]);

  const selectedWorkerName = useMemo(() => {
    if (!workerId) return '';
    return workers.find((w: any) => w.id === workerId)?.name || 'Worker ID: ' + workerId;
  }, [workerId, workers]);

  const handleDownloadReport = async () => {
    if (!reportRef.current || gigs.length === 0) {
      toast.error('No gigs to export.');
      return;
    }
    setDownloading(true);
    try {
      await downloadReportAsPdf(reportRef.current, `WeraLink-Admin-Gigs`);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setDifficulty('');
    setEmployerId('');
    setWorkerId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary-wera/10 p-2.5 rounded-xl border border-primary-wera/20">
            <Wrench className="w-6 h-6 text-primary-wera" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-accent-dark tracking-tight">Gig Portfolio</h1>
            <p className="text-text-main/50 text-sm font-medium">Monitor marketplace postings, assignments, and payments</p>
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading || gigs.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-wera text-white text-sm font-bold rounded-xl shadow hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Portfolio
        </button>
      </div>

      {/* Filters Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
            <input
              type="text"
              placeholder="Search by gig title, keywords..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Employer filter */}
          <div className="relative">
            <select
              value={employerId}
              onChange={(e) => { setEmployerId(e.target.value); setPage(1); }}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Employers</option>
              {employers.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.profile?.companyName || 'No Company'})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Worker filter */}
          <div className="relative">
            <select
              value={workerId}
              onChange={(e) => { setWorkerId(e.target.value); setPage(1); }}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">All Engaged Workers</option>
              {workers.map((wrk: any) => (
                <option key={wrk.id} value={wrk.id}>{wrk.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Start Date filter */}
          <div className="flex items-center gap-2 col-span-1 md:col-span-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer transition-all"
              />
            </div>
            <span className="text-text-main/40 text-xs font-bold uppercase tracking-wider">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:bg-white outline-none cursor-pointer transition-all"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(search || status || category || difficulty || employerId || workerId || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Clear Applied Filters
            </button>
          </div>
        )}
      </div>

      {/* Hidden Print Wrapper */}
      <div className="absolute -left-[9999px] top-0 opacity-0 overflow-hidden" aria-hidden="true">
        <ReportShell ref={reportRef} title="Admin Gigs Portfolio Report">
          <AdminGigsReport gigs={gigs} filters={{ status, category, difficulty, employerName: selectedEmployerName, workerName: selectedWorkerName, startDate, endDate }} />
        </ReportShell>
      </div>

      {/* Gigs Table / List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Gig Opportunity</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Employer</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Category</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Difficulty</th>
                <th className="text-right px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Compensation</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Status</th>
                <th className="text-center px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Hired</th>
                <th className="text-center px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-100 rounded ml-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-8 bg-slate-100 rounded mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-16 bg-slate-100 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : gigs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-main/40 font-medium">
                    No gigs found matching your filters.
                  </td>
                </tr>
              ) : (
                gigs.map((gig: any) => (
                  <tr key={gig.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-accent-dark group-hover:text-primary-wera transition-colors">{gig.title}</p>
                      <p className="text-[10px] text-text-main/40 uppercase tracking-wider mt-0.5">
                        Posted {format(new Date(gig.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-text-main/80 text-xs">
                        {gig.employer?.name}
                      </p>
                      <p className="text-[10px] text-text-main/40">
                        {gig.employer?.profile?.companyName || 'Personal'}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-text-main/70">
                      {gig.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${DIFFICULTY_COLORS[gig.difficulty]}`}>
                        {gig.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-black text-accent-dark text-xs">{gig.currency} {gig.payAmount.toLocaleString()}</p>
                      <p className="text-[9px] text-text-main/40 font-semibold uppercase">{gig.workType}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${STATUS_COLORS[gig.status]}`}>
                        {gig.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-slate-50 rounded-lg text-xs font-black text-text-main/70 border border-slate-100">
                        {gig._count?.assignments || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedGigId(gig.id)}
                        className="p-2 rounded-lg hover:bg-primary-wera/10 text-text-main/40 hover:text-primary-wera transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-text-main/40 font-medium">{pagination.total} gigs total</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-text-main/60">{page} / {pagination.totalPages}</span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gig Audit Detail Drawer */}
      {selectedGigId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedGigId(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-accent-dark flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-wera" /> Gig Inspection
              </h2>
              <button onClick={() => setSelectedGigId(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {detailLoading ? (
              <div className="p-6 animate-pulse space-y-4">
                {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded w-full" />)}
              </div>
            ) : gigDetail ? (
              <div className="p-6 space-y-6">
                {/* Basic Gig Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl font-black text-accent-dark max-w-[80%] leading-snug">{gigDetail.title}</h3>
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${STATUS_COLORS[gigDetail.status]}`}>
                      {gigDetail.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-main/70 whitespace-pre-wrap bg-slate-50 p-4 border border-slate-100 rounded-xl leading-relaxed">
                    {gigDetail.description}
                  </p>
                </div>

                {/* Grid Attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-text-main/40 uppercase text-[9px] font-bold tracking-wider mb-1">
                      <Tag className="w-3.5 h-3.5" /> Category
                    </div>
                    <p className="text-xs font-bold text-accent-dark">{gigDetail.category.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-text-main/40 uppercase text-[9px] font-bold tracking-wider mb-1">
                      <Award className="w-3.5 h-3.5" /> Difficulty
                    </div>
                    <p className="text-xs font-bold text-accent-dark">{gigDetail.difficulty}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-text-main/40 uppercase text-[9px] font-bold tracking-wider mb-1">
                      <DollarSign className="w-3.5 h-3.5" /> Pay Offer
                    </div>
                    <p className="text-xs font-black text-[#EF626C]">{gigDetail.currency} {gigDetail.payAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-text-main/40 uppercase text-[9px] font-bold tracking-wider mb-1">
                      <Briefcase className="w-3.5 h-3.5" /> Gig Type
                    </div>
                    <p className="text-xs font-bold text-accent-dark">{gigDetail.workType} ({gigDetail.location || 'Remote'})</p>
                  </div>
                </div>

                {/* Employer Context */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-main/40 mb-3">Posting Employer</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-main/50">Name</span>
                      <span className="font-bold text-accent-dark">{gigDetail.employer?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-main/50">Company</span>
                      <span className="font-bold text-accent-dark">{gigDetail.employer?.profile?.companyName || 'No Company'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-main/50">Email</span>
                      <span className="font-bold text-accent-dark">{gigDetail.employer?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-main/50">Phone</span>
                      <span className="font-bold text-accent-dark">{gigDetail.employer?.phone || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills Requirements */}
                {gigDetail.skills && gigDetail.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-main/40 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {gigDetail.skills.map((s: any) => (
                        <span key={s.skill.id} className="px-2.5 py-1 bg-primary-wera/10 text-primary-wera text-xs font-bold rounded-lg border border-primary-wera/10">
                          {s.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments Oversight */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-main/40 mb-3">Worker Assignments ({gigDetail.assignments?.length || 0})</h4>
                  {gigDetail.assignments?.length === 0 ? (
                    <p className="text-xs text-text-main/40 font-semibold italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                      No assignments have been established for this gig yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {gigDetail.assignments.map((assignment: any) => (
                        <div key={assignment.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-black text-accent-dark text-xs">{assignment.worker?.name}</p>
                              <p className="text-[10px] text-text-main/40">{assignment.worker?.email}</p>
                            </div>
                            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border bg-white border-slate-200 text-text-main/60">
                              {assignment.status}
                            </span>
                          </div>

                          {/* Escrow Escrow / Transaction details if applicable */}
                          {assignment.transactions && assignment.transactions.length > 0 && (
                            <div className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-1.5">
                              <p className="text-[9px] font-black text-text-main/40 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-500" /> Escrow Audits
                              </p>
                              <div className="space-y-1">
                                {assignment.transactions.map((tx: any) => (
                                  <div key={tx.id} className="flex justify-between items-center text-[10px] font-semibold text-text-main/60">
                                    <span>{tx.type.replace(/_/g, ' ')}</span>
                                    <span className={tx.status === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-amber-500'}>
                                      {tx.currency} {tx.amount.toLocaleString()} ({tx.status})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Evidence logs if submitted */}
                          {assignment.evidence && (
                            <div className="bg-white border border-slate-100 rounded-lg p-2.5">
                              <p className="text-[9px] font-black text-text-main/40 uppercase tracking-widest flex items-center gap-1 mb-1">
                                <FileText className="w-3.5 h-3.5 text-blue-500" /> Worker Evidence Submissions
                              </p>
                              <p className="text-[10px] text-text-main/60 font-semibold italic">"{assignment.evidence.textEvidence}"</p>
                              {assignment.evidence.attachments && assignment.evidence.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {assignment.evidence.attachments.map((file: string, index: number) => (
                                    <a key={index} href={file} target="_blank" rel="noreferrer" className="text-[9px] font-black text-primary-wera hover:underline bg-primary-wera/5 px-2 py-0.5 rounded border border-primary-wera/10">
                                      Attachment {index + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dispute records if disputed */}
                          {assignment.dispute && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                                ⚠️ ACTIVE DISPUTE RAISED
                              </p>
                              <p className="text-[10px] text-red-700 font-bold">Reason: {assignment.dispute.reason}</p>
                              <p className="text-[9px] text-red-500">Status: {assignment.dispute.status} • Raised By: {assignment.dispute.raisedBy}</p>
                            </div>
                          )}

                          {/* Feedback ratings */}
                          {assignment.ratings && assignment.ratings.length > 0 && (
                            <div className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-1">
                              <p className="text-[9px] font-black text-text-main/40 uppercase tracking-widest">Feedback & Reviews</p>
                              {assignment.ratings.map((rating: any) => (
                                <div key={rating.id} className="text-[10px] text-text-main/60">
                                  <span className="font-bold text-accent-dark">{rating.raterId === assignment.workerId ? 'Worker Rate' : 'Employer Rate'}: </span>
                                  <span className="font-black text-amber-500">★ {rating.score}</span> - "{rating.comment || 'No comment'}"
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
