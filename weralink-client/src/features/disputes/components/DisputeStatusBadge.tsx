interface DisputeStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  OPEN: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Dispute Open' },
  IN_REVIEW: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Under Review' },
  RESOLVED_FOR_WORKER: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Resolved (Worker)' },
  RESOLVED_FOR_EMPLOYER: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Resolved (Employer)' },
  CLOSED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Closed' },
  DISPUTED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Disputed' },
};

export function DisputeStatusBadge({ status, size = 'sm' }: DisputeStatusBadgeProps) {
  const config = CONFIG[status] || CONFIG.OPEN;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex ${sizeClasses} font-black uppercase tracking-wider rounded-lg border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
