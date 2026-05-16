import { format } from 'date-fns';

export function ManageGigsReport({ gigs, filters, employerName }: { gigs: any[]; filters?: any; employerName: string }) {
  if (!gigs) return null;

  return (
    <div className="font-sans">
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">Gigs Portfolio Report</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
          {employerName} • Generated on {format(new Date(), 'MMM dd, yyyy')}
        </p>
      </div>

      {filters && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-2">Applied Filters</h3>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#211112]/80">
            {filters.status && <span>Status: {filters.status}</span>}
            {filters.category && <span>Category: {filters.category}</span>}
            {filters.startDate && <span>From: {format(new Date(filters.startDate), 'MMM dd, yyyy')}</span>}
            {filters.endDate && <span>To: {format(new Date(filters.endDate), 'MMM dd, yyyy')}</span>}
            {!filters.status && !filters.category && !filters.startDate && !filters.endDate && <span>None</span>}
          </div>
        </div>
      )}

      <div className="mb-4 text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
        Total Gigs: {gigs.length}
      </div>

      <div className="space-y-4">
        {gigs.map((gig) => (
          <div key={gig.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-black text-[#211112] text-sm">{gig.title}</h4>
                <p className="text-[10px] font-bold text-[#211112]/60 uppercase tracking-wider mt-1">
                  {gig.category.replace(/_/g, ' ')} • {gig.workType.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase
                  ${gig.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' :
                    gig.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-700' :
                    gig.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    gig.status === 'CLOSED' ? 'bg-slate-200 text-slate-700' :
                    'bg-slate-100 text-slate-600'}
                `}>
                  {gig.status}
                </span>
                <p className="text-xs font-black text-[#EF626C] mt-1">{gig.currency} {gig.payAmount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Posted</p>
                <p className="text-xs font-bold text-[#211112]">{format(new Date(gig.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Assignments</p>
                <p className="text-xs font-bold text-[#211112]">{gig._count?.assignments || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Difficulty</p>
                <p className="text-xs font-bold text-[#211112]">{gig.difficulty}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
