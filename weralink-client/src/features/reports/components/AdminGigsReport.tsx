import { format } from 'date-fns';

export function AdminGigsReport({ gigs, filters }: { gigs: any[]; filters?: any }) {
  if (!gigs) return null;

  return (
    <div className="font-sans">
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">Gigs Directory & Audit Report</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
          Platform-Wide Administration • Generated on {format(new Date(), 'MMM dd, yyyy')}
        </p>
      </div>

      {filters && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-2">Applied Filters</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[#211112]/80">
            {filters.status && <span>Status: {filters.status}</span>}
            {filters.category && <span>Category: {filters.category.replace(/_/g, ' ')}</span>}
            {filters.difficulty && <span>Difficulty: {filters.difficulty}</span>}
            {filters.employerName && <span>Employer: {filters.employerName}</span>}
            {filters.workerName && <span>Worker: {filters.workerName}</span>}
            {filters.startDate && <span>From: {format(new Date(filters.startDate), 'MMM dd, yyyy')}</span>}
            {filters.endDate && <span>To: {format(new Date(filters.endDate), 'MMM dd, yyyy')}</span>}
            {!filters.status && !filters.category && !filters.difficulty && !filters.employerName && !filters.workerName && !filters.startDate && !filters.endDate && <span>None</span>}
          </div>
        </div>
      )}

      <div className="mb-4 text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
        Total Gigs Audited: {gigs.length}
      </div>

      <div className="space-y-4">
        {gigs.map((gig) => (
          <div key={gig.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-black text-[#211112] text-sm">{gig.title}</h4>
                <p className="text-xs text-[#211112]/60 mt-0.5">
                  Category: <span className="font-bold">{gig.category.replace(/_/g, ' ')}</span> • Difficulty: <span className="font-bold">{gig.difficulty}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase mb-1
                  ${gig.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                    gig.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-700' :
                    gig.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    gig.status === 'CLOSED' ? 'bg-slate-200 text-slate-700' :
                    'bg-red-100 text-red-700'}
                `}>
                  {gig.status}
                </span>
                <p className="text-xs font-black text-[#EF626C]">{gig.currency} {gig.payAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Employer Details</p>
                <p className="text-xs font-bold text-[#211112]">{gig.employer?.name}</p>
                <p className="text-[10px] text-[#211112]/60">{gig.employer?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-right">
                <div>
                  <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Posted</p>
                  <p className="text-xs font-bold text-[#211112]">{format(new Date(gig.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Assignments</p>
                  <p className="text-xs font-bold text-[#211112]">{gig._count?.assignments || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
