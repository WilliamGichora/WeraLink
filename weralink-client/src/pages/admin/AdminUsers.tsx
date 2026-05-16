import { useState, useCallback, useMemo, useRef } from 'react';
import { Users, Search, ChevronDown, Ban, UserCheck, Eye, Edit, X, CheckCircle, Download, Loader2 } from 'lucide-react';
import { useAdminListUsers, useAdminUserDetail, useAdminSuspendUser, useAdminUnsuspendUser, useAdminEditUser } from '@/features/admin/api/admin.api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { AdminUsersReport } from '@/features/reports/components/AdminUsersReport';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';

const ROLES = ['', 'WORKER', 'EMPLOYER', 'ADMIN'];
const STATUSES = ['', 'ACTIVE', 'SUSPENDED', 'PENDING_OTP'];
const ROLE_COLORS: Record<string, string> = {
  WORKER: 'bg-blue-50 text-blue-700 border-blue-200',
  EMPLOYER: 'bg-purple-50 text-purple-700 border-purple-200',
  ADMIN: 'bg-primary-wera/10 text-primary-wera border-primary-wera/30',
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
  PENDING_OTP: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);
  const params = useMemo(() => ({
    page, limit: 15, search: debouncedSearch || undefined, role: role || undefined, status: status || undefined,
    startDate: startDate || undefined, endDate: endDate || undefined,
  }), [page, debouncedSearch, role, status, startDate, endDate]);

  const { data: usersData, isLoading } = useAdminListUsers(params);
  const { data: userDetail, isLoading: detailLoading } = useAdminUserDetail(selectedUserId);
  const suspendMutation = useAdminSuspendUser();
  const unsuspendMutation = useAdminUnsuspendUser();
  const editMutation = useAdminEditUser();

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleSuspend = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      await suspendMutation.mutateAsync({ userId: selectedUserId, reason: suspendReason });
      toast.success('User suspended successfully');
      setShowSuspendDialog(false);
      setSuspendReason('');
    } catch (err: any) { toast.error(err.message); }
  }, [selectedUserId, suspendReason, suspendMutation]);

  const handleUnsuspend = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      await unsuspendMutation.mutateAsync(selectedUserId);
      toast.success('User reactivated');
    } catch (err: any) { toast.error(err.message); }
  }, [selectedUserId, unsuspendMutation]);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      await editMutation.mutateAsync({ userId: selectedUserId, updates: editData });
      toast.success('User details updated');
      setEditMode(false);
    } catch (err: any) { toast.error(err.message); }
  }, [selectedUserId, editData, editMutation]);

  const openDetail = (userId: string) => {
    setSelectedUserId(userId);
    setEditMode(false);
  };

  const startEdit = () => {
    if (userDetail) {
      setEditData({ name: userDetail.name, email: userDetail.email, phone: userDetail.phone });
      setEditMode(true);
    }
  };

  const handleDownloadReport = async () => {
    if (!reportRef.current || !users || users.length === 0) {
      toast.error('No users to export.');
      return;
    }
    setDownloading(true);
    try {
      await downloadReportAsPdf(reportRef.current, `WeraLink-Admin-Users`);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2.5 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
        <div>
          <h1 className="text-3xl font-black text-accent-dark tracking-tight">User Management</h1>
          <p className="text-text-main/50 text-sm font-medium">Manage platform users, suspensions, and profile edits</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleDownloadReport}
            disabled={downloading || users.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-wera text-white text-sm font-bold rounded-xl shadow hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
          <input
            type="text" placeholder="Search by name, email, or phone..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 outline-none cursor-pointer">
            <option value="">All Roles</option>
            {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 outline-none cursor-pointer">
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 outline-none cursor-pointer"
          />
          <span className="text-text-main/50 font-medium">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-wera/30 outline-none cursor-pointer"
          />
        </div>
        {(search || role || status || startDate || endDate) && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-all flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      <div className="absolute -left-[9999px] top-0 opacity-0 overflow-hidden" aria-hidden="true">
        <ReportShell ref={reportRef} title="Admin Users Report">
          <AdminUsersReport users={users} filters={{ role, status, startDate, endDate }} />
        </ReportShell>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">User</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Role</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Status</th>
                <th className="text-left px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Location</th>
                <th className="text-center px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Activity</th>
                <th className="text-center px-4 py-4 font-bold text-text-main/60 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-10 bg-slate-100 rounded mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-16 bg-slate-100 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-main/40 font-medium">No users found matching your filters.</td></tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-accent-dark">{user.name}</p>
                      <p className="text-xs text-text-main/40 mt-0.5">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${STATUS_COLORS[user.status] || 'bg-slate-100 text-slate-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-main/60 text-xs font-medium">{user.profile?.location || '—'}</td>
                    <td className="px-4 py-4 text-center text-xs text-text-main/50">
                      {user.role === 'WORKER' ? `${user._count?.assignments || 0} gigs` : `${user._count?.postedGigs || 0} posted`}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => openDetail(user.id)}
                        className="p-2 rounded-lg hover:bg-primary-wera/10 text-text-main/40 hover:text-primary-wera transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-text-main/40 font-medium">{pagination.total} users total</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors">
                Prev
              </button>
              <span className="text-xs font-bold text-text-main/60">{page} / {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedUserId(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-accent-dark">User Detail</h2>
              <button onClick={() => setSelectedUserId(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {detailLoading ? (
              <div className="p-6 animate-pulse space-y-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded w-full" />)}
              </div>
            ) : userDetail ? (
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  {editMode ? (
                    <div className="space-y-3">
                      <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" placeholder="Name" />
                      <input value={editData.email} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" placeholder="Email" />
                      <input value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" placeholder="Phone" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} disabled={editMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 bg-primary-wera text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-wera/90 transition-colors disabled:opacity-50">
                          <CheckCircle className="w-4 h-4" /> Save
                        </button>
                        <button onClick={() => setEditMode(false)}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-accent-dark">{userDetail.name}</h3>
                        <button onClick={startEdit} className="p-2 rounded-lg hover:bg-slate-100"><Edit className="w-4 h-4 text-text-main/40" /></button>
                      </div>
                      <p className="text-sm text-text-main/50">{userDetail.email} · {userDetail.phone}</p>
                      <div className="flex gap-2">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${ROLE_COLORS[userDetail.role]}`}>{userDetail.role}</span>
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${STATUS_COLORS[userDetail.status]}`}>{userDetail.status}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-accent-dark">{userDetail._count?.assignments || 0}</p>
                    <p className="text-[10px] font-bold text-text-main/40 uppercase">Assignments</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-accent-dark">{userDetail._count?.postedGigs || 0}</p>
                    <p className="text-[10px] font-bold text-text-main/40 uppercase">Posted Gigs</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-accent-dark">{userDetail._count?.supportTickets || 0}</p>
                    <p className="text-[10px] font-bold text-text-main/40 uppercase">Tickets</p>
                  </div>
                </div>

                {/* Assignment Status Summary */}
                {userDetail.assignmentStatusSummary && Object.keys(userDetail.assignmentStatusSummary).length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-main/40 mb-2">Assignment Breakdown</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(userDetail.assignmentStatusSummary).map(([status, count]) => (
                        <span key={status} className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-text-main/60">
                          {status}: {String(count)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {userDetail.status === 'ACTIVE' && userDetail.role !== 'ADMIN' && (
                    <button onClick={() => setShowSuspendDialog(true)}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                      <Ban className="w-4 h-4" /> Suspend User
                    </button>
                  )}
                  {userDetail.status === 'SUSPENDED' && (
                    <button onClick={handleUnsuspend} disabled={unsuspendMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50">
                      <UserCheck className="w-4 h-4" /> Reactivate User
                    </button>
                  )}
                </div>

                {/* Suspend Dialog */}
                {showSuspendDialog && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-red-700">⚠️ Confirm Suspension</p>
                    <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                      placeholder="Reason for suspension (required)..."
                      className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm resize-none h-20" />
                    <div className="flex gap-2">
                      <button onClick={handleSuspend} disabled={!suspendReason.trim() || suspendMutation.isPending}
                        className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50">
                        Confirm Suspend
                      </button>
                      <button onClick={() => setShowSuspendDialog(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {userDetail.recentActivity?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-main/40 mb-3">Recent Activity</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userDetail.recentActivity.slice(0, 10).map((a: any) => (
                        <div key={a.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-wera" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-text-main/70 truncate">{a.action}</p>
                            <p className="text-[10px] text-text-main/30">{new Date(a.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
