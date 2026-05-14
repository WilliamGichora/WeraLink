import { useState, useMemo } from 'react';
import { LifeBuoy, Search, ChevronDown, Clock, CheckCircle, MessageSquare, X } from 'lucide-react';
import { useAdminListTickets, useAdminUpdateTicket } from '@/features/admin/api/admin.api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700 border-red-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  ACCOUNT_CHANGE: '👤 Account Change',
  PAYMENT_ISSUE: '💳 Payment Issue',
  DISPUTE_HELP: '⚖️ Dispute Help',
  BUG_REPORT: '🐛 Bug Report',
  GENERAL: '💬 General',
};

export default function AdminSupport() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const debouncedSearch = useDebounce(search, 400);
  const params = useMemo(() => ({
    page, limit: 15, search: debouncedSearch || undefined,
    status: statusFilter || undefined, category: categoryFilter || undefined,
  }), [page, debouncedSearch, statusFilter, categoryFilter]);

  const { data, isLoading } = useAdminListTickets(params);
  const updateMutation = useAdminUpdateTicket();

  const tickets = data?.tickets || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ ticketId, status, adminNotes: adminNotes || undefined });
      toast.success(`Ticket marked as ${status.toLowerCase().replace('_', ' ')}`);
      setSelectedTicket(null);
      setAdminNotes('');
    } catch (err: any) { toast.error(err.message); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-2.5 rounded-xl"><LifeBuoy className="w-6 h-6 text-emerald-600" /></div>
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">Support Tickets</h1>
          <p className="text-text-main/50 text-sm font-medium">Manage and respond to user support inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
          <input type="text" placeholder="Search by subject or message..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium cursor-pointer outline-none">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium cursor-pointer outline-none">
            <option value="">All Categories</option>
            <option value="ACCOUNT_CHANGE">Account Change</option>
            <option value="PAYMENT_ISSUE">Payment Issue</option>
            <option value="DISPUTE_HELP">Dispute Help</option>
            <option value="BUG_REPORT">Bug Report</option>
            <option value="GENERAL">General</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <LifeBuoy className="w-10 h-10 text-text-main/20 mx-auto mb-3" />
            <p className="text-text-main/40 font-medium">No tickets found.</p>
          </div>
        ) : (
          tickets.map((t: any) => (
            <div key={t.id} onClick={() => setSelectedTicket(t)}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-primary-wera/20 transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-accent-dark truncate">{t.subject}</h3>
                    <span className={`shrink-0 inline-flex px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg border ${STATUS_COLORS[t.status]}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-text-main/50 line-clamp-1">{t.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-main/40 font-medium">
                    <span>{CATEGORY_LABELS[t.category] || t.category}</span>
                    <span>By: <b className="text-text-main/60">{t.user?.name}</b> ({t.user?.role})</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <MessageSquare className="w-5 h-5 text-text-main/20 group-hover:text-primary-wera transition-colors shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-text-main/40 font-medium">{pagination.total} tickets total</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30">Prev</button>
            <span className="text-xs font-bold text-text-main/60">{page} / {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30">Next</button>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-accent-dark">Ticket Detail</h2>
              <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-3 py-1 text-xs font-black uppercase rounded-lg border ${STATUS_COLORS[selectedTicket.status]}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-medium text-text-main/40">{CATEGORY_LABELS[selectedTicket.category]}</span>
              </div>
              <div>
                <h3 className="font-bold text-accent-dark text-lg">{selectedTicket.subject}</h3>
                <p className="text-sm text-text-main/60 mt-2 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-text-main/40">Submitted by</p>
                <p className="font-bold text-accent-dark">{selectedTicket.user?.name}</p>
                <p className="text-xs text-text-main/40">{selectedTicket.user?.email} · {selectedTicket.user?.role}</p>
              </div>
              {selectedTicket.adminNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-600">Admin Notes</p>
                  <p className="text-sm text-text-main/70">{selectedTicket.adminNotes}</p>
                </div>
              )}

              {/* Status Actions */}
              {!['RESOLVED', 'CLOSED'].includes(selectedTicket.status) && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Admin notes or response..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none h-20 focus:ring-2 focus:ring-primary-wera/30 outline-none" />
                  <div className="flex gap-2">
                    {selectedTicket.status === 'OPEN' && (
                      <button onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                        disabled={updateMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-100 disabled:opacity-50">
                        <Clock className="w-4 h-4" /> Mark In Progress
                      </button>
                    )}
                    <button onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                      disabled={updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" /> Resolve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
