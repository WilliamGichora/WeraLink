import { format } from 'date-fns';
import { Star } from 'lucide-react';

export function EmployerAssignmentReport({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div>
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">{data.gig?.title}</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">Assignment Completion Report</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Worker Details</h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Name:</span>
              <span className="text-xs font-bold text-[#211112]">{data.worker?.name}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Email:</span>
              <span className="text-xs font-bold text-[#211112]">{data.worker?.email}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Phone:</span>
              <span className="text-xs font-bold text-[#211112]">{data.worker?.profile?.phone || '—'}</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Financials</h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Amount Paid:</span>
              <span className="text-xs font-black text-[#EF626C]">{data.gig?.currency} {data.gig?.payAmount?.toLocaleString()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-xs text-[#211112]/60 font-bold">Payment Date:</span>
              <span className="text-xs font-bold text-[#211112]">{data.timeline?.paid ? format(new Date(data.timeline.paid), 'MMM dd, yyyy') : '—'}</span>
            </li>
            {data.payment && (
              <li className="flex justify-between">
                <span className="text-xs text-[#211112]/60 font-bold">M-Pesa Ref:</span>
                <span className="text-[10px] font-mono font-bold text-[#211112]">{data.payment.receiptNumber || '—'}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Performance Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Completion Time</p>
            <p className="text-2xl font-black text-[#211112]">{data.metrics?.timeToCompleteHours || 0} hrs</p>
          </div>
          <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Revisions Needed</p>
            <p className="text-2xl font-black text-[#211112]">{data.metrics?.hadRevisions ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-[#F6E8EA] rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Deadline</p>
            <p className="text-2xl font-black text-[#211112]">{data.metrics?.deadlineMet === false ? 'Missed' : 'Met'}</p>
          </div>
        </div>
      </div>

      {data.rating && (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-3">Worker Rating</h3>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-lg font-black text-[#211112]">{data.rating.score}/5</span>
          </div>
          {data.rating.comment && (
            <p className="text-xs text-[#211112]/80 italic mt-2">"{data.rating.comment}"</p>
          )}
        </div>
      )}
    </div>
  );
}
