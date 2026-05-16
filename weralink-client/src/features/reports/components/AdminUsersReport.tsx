import { format } from 'date-fns';

export function AdminUsersReport({ users, filters }: { users: any[]; filters?: any }) {
  if (!users) return null;

  return (
    <div className="font-sans">
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">Users Directory Report</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
          Generated on {format(new Date(), 'MMM dd, yyyy')}
        </p>
      </div>

      {filters && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-2">Applied Filters</h3>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#211112]/80">
            {filters.role && <span>Role: {filters.role}</span>}
            {filters.status && <span>Status: {filters.status}</span>}
            {filters.startDate && <span>From: {format(new Date(filters.startDate), 'MMM dd, yyyy')}</span>}
            {filters.endDate && <span>To: {format(new Date(filters.endDate), 'MMM dd, yyyy')}</span>}
            {!filters.role && !filters.status && !filters.startDate && !filters.endDate && <span>None</span>}
          </div>
        </div>
      )}

      <div className="mb-4 text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
        Total Users: {users.length}
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-black text-[#211112] text-sm">{user.name}</h4>
                <p className="text-xs text-[#211112]/60">{user.email} • {user.phone}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase mb-1
                  ${user.role === 'EMPLOYER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}
                `}>
                  {user.role}
                </span>
                <br />
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase
                  ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    user.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'}
                `}>
                  {user.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Joined</p>
                <p className="text-xs font-bold text-[#211112]">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              {user.role === 'WORKER' && (
                <div>
                  <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Assignments</p>
                  <p className="text-xs font-bold text-[#211112]">{user._count?.assignments || 0}</p>
                </div>
              )}
              {user.role === 'EMPLOYER' && (
                <div>
                  <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Gigs Posted</p>
                  <p className="text-xs font-bold text-[#211112]">{user._count?.postedGigs || 0}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Support Tickets</p>
                <p className="text-xs font-bold text-[#211112]">{user._count?.supportTickets || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
