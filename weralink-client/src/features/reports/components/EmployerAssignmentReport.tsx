import { format } from 'date-fns';
import { Star, ShieldCheck, User, Building } from 'lucide-react';

export function EmployerAssignmentReport({ data }: { data: any }) {
  if (!data) return null;

  // Extremely robust extraction logic with fallback keys to ensure data is never missing
  const worker = data.workerProfile || data.worker || data.assignment?.worker || data;
  const employer = data.employerProfile || data.gig?.employer || data.employer || data.assignment?.gig?.employer;
  const rating = data.rating || (data.ratings && data.ratings[0]);
  const gig = data.gig || data.assignment?.gig;

  // Clean date parsing with safety fallbacks
  const parseAndFormatDate = (dateStr: any) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="font-sans text-slate-800 p-2">
      {/* Header Section */}
      <div className="mb-8 text-center border-b-2 border-slate-100 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified Completion Report
        </div>
        <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">{gig?.title || 'Gig Assignment'}</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">WeraLink Digital Gig Platform</p>
      </div>

      {/* Parties Involved Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Worker Details */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <User className="w-3.5 h-3.5 text-primary-wera" /> Worker Details
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Name:</span>
              <span className="font-black text-slate-900">{worker?.name || '—'}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Email:</span>
              <span className="font-semibold text-slate-700">{worker?.email || '—'}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Phone:</span>
              <span className="font-bold text-slate-900">{worker?.phone || worker?.profile?.phone || '—'}</span>
            </li>
            {worker?.location && (
              <li className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Location:</span>
                <span className="font-medium text-slate-800">{worker.location}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Employer Details */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Building className="w-3.5 h-3.5 text-blue-500" /> Employer Details
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Client Name:</span>
              <span className="font-black text-slate-900">{employer?.name || '—'}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Company:</span>
              <span className="font-bold text-slate-800">{employer?.companyName || employer?.profile?.companyName || '—'}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Email:</span>
              <span className="font-semibold text-slate-700">{employer?.email || '—'}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Phone:</span>
              <span className="font-bold text-slate-900">{employer?.phone || '—'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Financials & Timeline Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Financial Summary</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Amount Paid:</span>
              <span className="text-sm font-black text-emerald-600">{gig?.currency || 'KES'} {gig?.payAmount?.toLocaleString() || '0'}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Payment Date:</span>
              <span className="font-bold text-slate-800">{parseAndFormatDate(data.timeline?.paid)}</span>
            </li>
            {data.payment && (
              <li className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">M-Pesa Reference:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">{data.payment.receiptNumber || '—'}</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Milestone Timeline</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Assigned:</span>
              <span className="font-medium text-slate-800">{parseAndFormatDate(data.timeline?.accepted)}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Submitted:</span>
              <span className="font-medium text-slate-800">{parseAndFormatDate(data.timeline?.submitted)}</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Completed & Paid:</span>
              <span className="font-medium text-slate-800">{parseAndFormatDate(data.timeline?.paid)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Performance Summary Metrics */}
      <div className="mb-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Performance Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time to Complete</p>
            <p className="text-xl font-black text-slate-900">{data.metrics?.timeToCompleteHours || 0} hrs</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revisions Requested</p>
            <p className="text-xl font-black text-slate-900">{data.metrics?.hadRevisions ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline Adherence</p>
            <p className={`text-xl font-black ${data.metrics?.deadlineMet === false ? 'text-rose-600' : 'text-emerald-600'}`}>
              {data.metrics?.deadlineMet === false ? 'Missed' : 'Met'}
            </p>
          </div>
        </div>
      </div>

      {/* Rating & Employer Feedback Section */}
      {rating && (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client Feedback & Review</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-black text-slate-900">{rating.score}/5.0</span>
          </div>
          {rating.comment && (
            <p className="text-xs text-slate-600 italic bg-white border border-slate-100 p-3 rounded-xl mt-2 leading-relaxed">
              "{rating.comment}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
