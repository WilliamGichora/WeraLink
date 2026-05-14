import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { useRaiseDispute } from '@/features/disputes/api/dispute.api';
import { toast } from 'sonner';

interface RaiseDisputeModalProps {
  assignmentId: string;
  gigTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RaiseDisputeModal({ assignmentId, gigTitle, open, onClose, onSuccess }: RaiseDisputeModalProps) {
  const [reason, setReason] = useState('');
  const raiseDispute = useRaiseDispute();

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await raiseDispute.mutateAsync({ assignmentId, reason: reason.trim() });
      toast.success('Dispute raised successfully. An admin will review it shortly.');
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to raise dispute');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-accent-dark">Raise a Dispute</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Regarding</p>
            <p className="text-sm font-bold text-accent-dark">{gigTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-accent-dark mb-2">Reason for Dispute</label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Describe the issue in detail. What happened? What outcome are you seeking?"
              rows={5}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-wera/30 focus:border-primary-wera outline-none transition-all"
            />
            <p className="text-xs text-text-main/30 mt-1.5">Be specific. Include dates, screenshots, and any relevant context.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-text-main/40">
              ⚠️ Disputes are reviewed by WeraLink administrators. Both parties will be notified and may submit additional evidence. Resolution typically takes 24-48 hours.
            </p>
          </div>

          <button onClick={handleSubmit}
            disabled={!reason.trim() || raiseDispute.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary-wera text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-wera/90 transition-colors disabled:opacity-50">
            <Send className="w-4 h-4" /> {raiseDispute.isPending ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  );
}
