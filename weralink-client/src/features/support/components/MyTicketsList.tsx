import { useState } from 'react';
import { useGetMyTickets } from '@/features/support/api/support.api';
import { CreateTicketModal } from './CreateTicketModal';
import { LifeBuoy, Plus, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700 border-red-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  ACCOUNT_CHANGE: 'Account Change',
  PAYMENT_ISSUE: 'Payment Issue',
  DISPUTE_HELP: 'Dispute Help',
  BUG_REPORT: 'Bug Report',
  GENERAL: 'General',
};

export function MyTicketsList() {
  const { data: tickets, isLoading } = useGetMyTickets();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-accent-dark flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary-wera" /> My Support Tickets
          </h2>
          <p className="text-sm text-text-main/50 mt-1">View and manage your support requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-wera text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-wera/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))
        ) : tickets?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <LifeBuoy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-accent-dark mb-1">No support tickets</h3>
            <p className="text-sm text-text-main/50">You haven't submitted any support requests yet.</p>
          </div>
        ) : (
          tickets?.map((ticket: any) => (
            <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary-wera/30 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${STATUS_COLORS[ticket.status] || STATUS_COLORS.OPEN}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-text-main/40 uppercase tracking-widest">
                      {CATEGORY_LABELS[ticket.category] || ticket.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-accent-dark text-lg mb-1">{ticket.subject}</h3>
                  <p className="text-sm text-text-main/60 line-clamp-1 mb-3">{ticket.message}</p>
                  
                  {ticket.adminNotes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 text-sm">
                      <span className="font-bold text-accent-dark text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary-wera" /> Admin Response
                      </span>
                      <p className="text-text-main/70">{ticket.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-medium text-text-main/40">
                    <Clock className="w-3.5 h-3.5" />
                    Submitted {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateTicketModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
