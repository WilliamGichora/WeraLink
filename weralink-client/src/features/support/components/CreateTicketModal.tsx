import { useState } from 'react';
import { X, Send, LifeBuoy } from 'lucide-react';
import { useCreateTicket } from '@/features/support/api/support.api';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'ACCOUNT_CHANGE', label: 'Account Change' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
  { value: 'DISPUTE_HELP', label: 'Dispute Help' },
  { value: 'BUG_REPORT', label: 'Bug Report' },
  { value: 'GENERAL', label: 'General Inquiry' }
];

export function CreateTicketModal({ open, onClose, onSuccess }: CreateTicketModalProps) {
  const [category, setCategory] = useState(CATEGORIES[4].value);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const createTicket = useCreateTicket();

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    
    try {
      await createTicket.mutateAsync({ category, subject: subject.trim(), message: message.trim() });
      toast.success('Support ticket created successfully. We will get back to you soon.');
      setSubject('');
      setMessage('');
      setCategory(CATEGORIES[4].value);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create support ticket');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <LifeBuoy className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-black text-accent-dark">Contact Support</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-accent-dark mb-2">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none bg-white appearance-none cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-accent-dark mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-accent-dark mb-2">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue in detail so we can help you faster..."
              rows={5}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none transition-all"
            />
          </div>

          <button onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim() || createTicket.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary-wera text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-wera/90 transition-colors disabled:opacity-50">
            <Send className="w-4 h-4" /> {createTicket.isPending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
