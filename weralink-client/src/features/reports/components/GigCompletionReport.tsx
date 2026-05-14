import { format } from 'date-fns';
import { Star } from 'lucide-react';

export function GigCompletionReport({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div>
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">{data.gig?.title}</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">Gig Completion Report</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Gig Details</h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Employer:</span>
              <span className="text-xs font-bold text-[#211112]">{data.gig?.employer?.name}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Category:</span>
              <span className="text-xs font-bold text-[#211112]">{data.gig?.category?.replace(/_/g, ' ')}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Work Type:</span>
              <span className="text-xs font-bold text-[#211112]">{data.gig?.workType?.replace(/_/g, ' ')}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Difficulty:</span>
              <span className="text-xs font-bold text-[#211112]">{data.gig?.difficulty}</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Financials</h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Agreed Pay:</span>
              <span className="text-xs font-black text-[#EF626C]">{data.gig?.currency} {data.gig?.payAmount?.toLocaleString()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Paid On:</span>
              <span className="text-xs font-bold text-[#211112]">{data.timeline?.paid ? format(new Date(data.timeline.paid), 'MMM dd, yyyy') : '—'}</span>
            </li>
            {data.payment && (
              <li className="flex justify-between">
                <span className="text-xs text-[#211112]/60 font-bold">Receipt No:</span>
                <span className="text-[10px] font-mono font-bold text-[#211112]">{data.payment.receiptNumber || '—'}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Performance Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Time to Complete</p>
            <p className="text-2xl font-black text-[#211112]">{data.metrics?.timeToCompleteHours || 0} hrs</p>
          </div>
          <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Revisions</p>
            <p className="text-2xl font-black text-[#211112]">{data.metrics?.hadRevisions ? 'Yes' : 'None'}</p>
          </div>
          <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Deadline</p>
            <p className="text-2xl font-black text-[#211112]">{data.metrics?.deadlineMet === false ? 'Missed' : 'Met'}</p>
          </div>
        </div>
      </div>

      {data.rating && (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-3">Employer Rating</h3>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-lg font-black text-[#211112]">{data.rating.score}/5</span>
          </div>
          {data.rating.comment && (
            <p className="text-xs text-[#211112]/80 italic mt-2">"{data.rating.comment}"</p>
          )}
        </div>
      )}

      {data.evidence?.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Submitted Evidence</h3>
          <ul className="space-y-2">
            {data.evidence.map((ev: any, i: number) => (
              <li key={i} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs">
                <span className="font-bold text-[#211112]">{ev.requirementTag || 'Evidence'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#211112]/60">{ev.evidenceType}</span>
                  {ev.validated && <span className="text-emerald-600 font-bold bg-emerald-100 px-2 rounded">Validated</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
