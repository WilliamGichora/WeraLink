import { useState, useMemo } from 'react';
import { Scale, Search, ChevronDown, Eye, X, CheckCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { useAdminListDisputes, useAdminDisputeDetail, useAdminResolveDispute } from '@/features/admin/api/admin.api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const DISPUTE_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700 border-red-200',
  IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED_FOR_WORKER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESOLVED_FOR_EMPLOYER: 'bg-blue-50 text-blue-700 border-blue-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminDisputes() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolveForm, setResolveForm] = useState({ resolution: '', resolvedFor: '' as '' | 'WORKER' | 'EMPLOYER', adminNotes: '' });

  const debouncedSearch = useDebounce(search, 400);
  const params = useMemo(() => ({
    page, limit: 15, search: debouncedSearch || undefined, status: statusFilter || undefined,
  }), [page, debouncedSearch, statusFilter]);

  const { data, isLoading } = useAdminListDisputes(params);
  const { data: detail, isLoading: detailLoading } = useAdminDisputeDetail(selectedId);
  const resolveMutation = useAdminResolveDispute();

  const disputes = data?.disputes || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleResolve = async () => {
    if (!selectedId || !resolveForm.resolvedFor) return;
    try {
      await resolveMutation.mutateAsync({
        disputeId: selectedId,
        resolution: resolveForm.resolution,
        resolvedFor: resolveForm.resolvedFor as 'WORKER' | 'EMPLOYER',
        adminNotes: resolveForm.adminNotes || undefined,
      });
      toast.success('Dispute resolved successfully');
      setSelectedId(null);
      setResolveForm({ resolution: '', resolvedFor: '', adminNotes: '' });
    } catch (err: any) { toast.error(err.message); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-100 p-2.5 rounded-xl"><Scale className="w-6 h-6 text-amber-600" /></div>
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">Dispute Management</h1>
          <p className="text-text-main/50 text-sm font-medium">Review, mediate, and resolve platform disputes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
          <input type="text" placeholder="Search by gig title or reason..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 outline-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED_FOR_WORKER">Resolved (Worker)</option>
            <option value="RESOLVED_FOR_EMPLOYER">Resolved (Employer)</option>
            <option value="CLOSED">Closed</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)
        ) : disputes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Scale className="w-10 h-10 text-text-main/20 mx-auto mb-3" />
            <p className="text-text-main/40 font-medium">No disputes found.</p>
          </div>
        ) : (
          disputes.map((d: any) => (
            <div key={d.id} onClick={() => setSelectedId(d.id)}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-primary-wera/20 transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-accent-dark truncate">{d.assignment?.gig?.title || 'Unknown Gig'}</h3>
                    <span className={`shrink-0 inline-flex px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg border ${DISPUTE_STATUS_COLORS[d.status]}`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-text-main/50 line-clamp-1">{d.reason}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-main/40 font-medium">
                    <span>Raised by: <b className="text-text-main/60">{d.raisedBy?.name}</b> ({d.raisedBy?.role})</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(d.createdAt)}</span>
                    {d.assignment?.gig?.payAmount && (
                      <span>KES {Number(d.assignment.gig.payAmount).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <Eye className="w-5 h-5 text-text-main/20 group-hover:text-primary-wera transition-colors shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-text-main/40 font-medium">{pagination.total} disputes total</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30">Prev</button>
            <span className="text-xs font-bold text-text-main/60">{page} / {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30">Next</button>
          </div>
        </div>
      )}

      {/* Dispute Detail / Resolve Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-accent-dark">Dispute Details</h2>
              <button onClick={() => setSelectedId(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {detailLoading ? (
              <div className="p-6 animate-pulse space-y-4">{[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
            ) : detail ? (
              <div className="p-6 space-y-6">
                {/* Dispute Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-black uppercase rounded-lg border ${DISPUTE_STATUS_COLORS[detail.status]}`}>
                      {detail.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-accent-dark">{detail.assignment?.gig?.title}</p>
                  <p className="text-sm text-text-main/60">{detail.reason}</p>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider mb-1">Worker</p>
                    <p className="font-bold text-accent-dark">{detail.assignment?.worker?.name}</p>
                    <p className="text-xs text-text-main/40">{detail.assignment?.worker?.email}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-[10px] font-black uppercase text-purple-600 tracking-wider mb-1">Employer (Gig Owner)</p>
                    <p className="font-bold text-accent-dark">ID: {detail.assignment?.gig?.employerId?.slice(0, 8)}...</p>
                    <p className="text-xs text-text-main/40">KES {Number(detail.assignment?.gig?.payAmount || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Raised By */}
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-text-main/50">Raised by</p>
                    <p className="text-sm font-bold text-accent-dark">{detail.raisedBy?.name} ({detail.raisedBy?.role})</p>
                  </div>
                </div>

                {/* Evidence */}
                {detail.evidenceUrls && Array.isArray(detail.evidenceUrls) && detail.evidenceUrls.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-main/40 mb-2">Evidence</h4>
                    <div className="space-y-2">
                      {detail.evidenceUrls.map((e: any, i: number) => (
                        <a key={i} href={e.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-medium text-primary-wera hover:bg-primary-wera/5 transition-colors">
                          📎 {e.label || `Evidence ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {detail.resolution && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">Resolution</p>
                    <p className="text-sm text-text-main/70">{detail.resolution}</p>
                    {detail.adminNotes && <p className="text-xs text-text-main/40 mt-2">Admin Notes: {detail.adminNotes}</p>}
                  </div>
                )}

                {/* Resolve Form — only for OPEN/IN_REVIEW */}
                {['OPEN', 'IN_REVIEW'].includes(detail.status) && (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h4 className="text-sm font-black text-accent-dark flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Resolve Dispute</h4>
                    
                    <div className="flex gap-3">
                      <button onClick={() => setResolveForm(f => ({ ...f, resolvedFor: 'WORKER' }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${resolveForm.resolvedFor === 'WORKER' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-text-main/40 hover:bg-slate-50'}`}>
                        Resolve for Worker
                      </button>
                      <button onClick={() => setResolveForm(f => ({ ...f, resolvedFor: 'EMPLOYER' }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${resolveForm.resolvedFor === 'EMPLOYER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-text-main/40 hover:bg-slate-50'}`}>
                        Resolve for Employer
                      </button>
                    </div>

                    <textarea value={resolveForm.resolution} onChange={e => setResolveForm(f => ({ ...f, resolution: e.target.value }))}
                      placeholder="Resolution decision..." rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-wera/30 outline-none" />
                    <textarea value={resolveForm.adminNotes} onChange={e => setResolveForm(f => ({ ...f, adminNotes: e.target.value }))}
                      placeholder="Internal admin notes (optional)..." rows={2}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-wera/30 outline-none" />
                    
                    <button onClick={handleResolve}
                      disabled={!resolveForm.resolvedFor || !resolveForm.resolution.trim() || resolveMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-primary-wera text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-wera/90 transition-colors disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" /> {resolveMutation.isPending ? 'Resolving...' : 'Submit Resolution'}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
