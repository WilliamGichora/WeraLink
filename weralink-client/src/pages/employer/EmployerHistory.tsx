import { useGetEmployerHistory, useGetTransactionByAssignment, useGetTransactionStatus, useRetryPayout } from '@/features/execution/api/execution.api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  User, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  History,
  Briefcase,
  RefreshCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReceiptModal } from '@/components/execution/ReceiptModal';
import { RatingModal } from '@/features/ratings/components/RatingModal';
import { useCheckRating } from '@/features/ratings/api/rating.api';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EmployerHistory() {
  const { data: assignments, isLoading, refetch } = useGetEmployerHistory(['APPROVED', 'PAID', 'DISPUTED']);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { data: transaction } = useGetTransactionByAssignment(selectedAssignmentId || undefined);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Grouping logic: Assignments by Gig
  const groupedHistory = useMemo(() => {
    if (!assignments) return [];
    
    const groups: Record<string, any> = {};
    
    assignments.forEach((assignment: any) => {
      const gigId = assignment.gig.id;
      if (!groups[gigId]) {
        groups[gigId] = {
          ...assignment.gig,
          assignments: []
        };
      }
      groups[gigId].assignments.push(assignment);
    });
    
    return Object.values(groups).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [assignments]);

  // Rating state
  const [ratingTarget, setRatingTarget] = useState<{
    assignmentId: string;
    workerName: string;
    gigTitle: string;
  } | null>(null);

  const handleViewReceipt = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsReceiptModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full shadow-lg shadow-primary-wera/10 mb-4"></div>
        <p className="text-text-main/50 font-bold animate-pulse">Retrieving history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-24">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary-wera/10 p-1.5 rounded-lg">
              <History className="w-4 h-4 text-primary-wera" />
            </div>
            <span className="text-[10px] font-black text-primary-wera uppercase tracking-[0.2em]">Archive</span>
          </div>
          <h1 className="text-4xl font-black text-accent-dark tracking-tight">Hiring History</h1>
          <p className="text-text-main/60 font-medium text-lg mt-1">Review your past collaborations and manage feedback.</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-6">
          <div className="text-center border-r border-slate-100 pr-6">
            <p className="text-[10px] font-black text-text-main/30 uppercase tracking-widest mb-1">Total Gigs</p>
            <p className="text-2xl font-black text-accent-dark">{groupedHistory.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-text-main/30 uppercase tracking-widest mb-1">Total Hires</p>
            <p className="text-2xl font-black text-accent-dark">{assignments?.length || 0}</p>
          </div>
        </div>
      </div>

      {groupedHistory.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[3rem] p-16 text-center border-dashed border-2">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100 text-slate-300">
              <Briefcase className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-accent-dark mb-4 tracking-tight">No History Found</h2>
            <p className="text-text-main/60 font-medium leading-relaxed mb-8">
              You haven't completed any gigs or hired any workers yet. Your hiring record will appear here once work is finished and approved.
            </p>
            <Button asChild className="rounded-2xl h-12 px-8 font-black bg-primary-wera hover:bg-primary-dark text-white shadow-lg shadow-primary-wera/20">
              <Link to="/employer/gigs">Manage Active Gigs</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-12">
          {groupedHistory.map((gigGroup: any) => (
            <GigHistoryGroup 
              key={gigGroup.id} 
              gig={gigGroup} 
              onRate={(target) => setRatingTarget(target)}
              onViewReceipt={handleViewReceipt}
              onRefresh={refetch}
            />
          ))}
        </div>
      )}

      <ReceiptModal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        transaction={transaction} 
      />

      {ratingTarget && (
        <RatingModal
          isOpen={!!ratingTarget}
          onClose={() => setRatingTarget(null)}
          assignmentId={ratingTarget.assignmentId}
          rateeName={ratingTarget.workerName}
          gigTitle={ratingTarget.gigTitle}
          rateeRole="worker"
        />
      )}
    </div>
  );
}

/**
 * Renders a Gig header and its associated workers/assignments.
 */
function GigHistoryGroup({ gig, onRate, onViewReceipt, onRefresh }: { gig: any, onRate: (t: any) => void, onViewReceipt: (id: string) => void, onRefresh: () => void }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Gig Header Card */}
      <div className={`bg-accent-dark text-white p-6 md:p-8 rounded-t-[2.5rem] shadow-xl relative overflow-hidden transition-all duration-300 ${!isExpanded ? 'rounded-b-[2.5rem]' : ''}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-wera/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-primary-wera text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg shadow-primary-wera/20">
                {gig.category.replace('_', ' ')}
              </Badge>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">• Posted {format(new Date(gig.createdAt), 'MMM do, yyyy')}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{gig.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary-wera" /> {gig.location}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> {gig.assignments.length} {gig.assignments.length === 1 ? 'Worker' : 'Workers'} Hired</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              asChild 
              variant="outline" 
              className="grow md:grow-0 h-12 border-white/20 text-white hover:bg-white/10 rounded-xl font-bold"
            >
              <Link to={`/employer/gigs/${gig.id}`}>
                View Post <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-12 w-12 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl flex items-center justify-center p-0 transition-all"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Workers List (Assignments) */}
      {isExpanded && (
        <div className="bg-white border border-slate-200 border-t-0 rounded-b-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40">
          <div className="divide-y divide-slate-100">
            {gig.assignments.map((assignment: any) => (
              <WorkerAssignmentRow 
                key={assignment.id} 
                assignment={assignment} 
                onRate={onRate}
                onViewReceipt={onViewReceipt}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Worker row within a Gig group.
 */
function WorkerAssignmentRow({ assignment, onRate, onViewReceipt, onRefresh }: { assignment: any, onRate: (t: any) => void, onViewReceipt: (id: string) => void, onRefresh: () => void }) {
  const { data: ratingStatus } = useCheckRating(assignment.id);
  const { mutateAsync: retryPayout, isPending: isInitiating } = useRetryPayout();
  const [pollingId, setPollingId] = useState<string | null>(null);

  // Poll for status if we have a tracking ID
  const { data: mpesaStatus } = useGetTransactionStatus(pollingId);

  // Handle polling completion
  useEffect(() => {
    if (mpesaStatus?.status === 'SUCCESS') {
      toast.success('Payment verified successfully!');
      setPollingId(null);
      onRefresh();
    } else if (mpesaStatus?.status === 'FAILED') {
      toast.error('Payment failed. Please try again.');
      setPollingId(null);
    }
  }, [mpesaStatus, onRefresh]);

  const handleRetry = async () => {
    try {
      const response = await retryPayout(assignment.id);
      const conversationId = response.data?.conversationId;
      
      if (conversationId) {
        setPollingId(conversationId);
        toast.info('Verifying payout with M-Pesa...');
      } else {
        toast.success('Payout retry initiated successfully');
        onRefresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to retry payout');
    }
  };

  const getStatusConfig = (status: string) => {
    if (pollingId) return { label: 'Verifying...', color: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' };
    
    switch(status) {
      case 'APPROVED': return { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'PAID': return { label: 'Paid & Closed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'DISPUTED': return { label: 'Disputed', color: 'bg-red-50 text-red-700 border-red-200' };
      default: return { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const status = getStatusConfig(assignment.status);

  return (
    <div className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-xl font-black text-accent-dark shadow-sm group-hover:border-primary-wera group-hover:text-primary-wera transition-all uppercase">
          {assignment.worker.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-lg font-black text-accent-dark mb-1">{assignment.worker.name}</h4>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${status.color} font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 border-none rounded-lg`}>
              {status.label}
            </Badge>
            <span className="text-[10px] font-black text-text-main/30 uppercase tracking-[0.15em]">
              {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {assignment.status === 'PAID' && !pollingId && (
          <Button 
            onClick={() => onViewReceipt(assignment.id)}
            variant="ghost" 
            className="h-11 px-4 text-text-main/60 hover:text-accent-dark hover:bg-white border border-transparent hover:border-slate-200 rounded-xl font-bold gap-2"
          >
            <FileText className="w-4 h-4" /> View Receipt
          </Button>
        )}
        
        {assignment.status === 'PAID' && !pollingId && (
          ratingStatus?.hasRated ? (
            <div className="bg-amber-50 text-amber-700 px-4 h-11 rounded-xl flex items-center gap-2 border border-amber-100 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Rated {ratingStatus.rating?.score}/5
            </div>
          ) : (
            <Button 
              onClick={() => onRate({
                assignmentId: assignment.id,
                workerName: assignment.worker.name,
                gigTitle: assignment.gig.title
              })}
              className="h-11 px-6 bg-accent-dark hover:bg-black text-white rounded-xl font-black shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
            >
              <Star className="w-4 h-4" /> Rate Worker
            </Button>
          )
        )}
        
        {assignment.status === 'APPROVED' && (
          <Button 
            onClick={handleRetry}
            disabled={isInitiating || !!pollingId}
            variant="outline" 
            className="h-11 px-4 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold gap-2 rounded-xl transition-all"
          >
            {isInitiating || !!pollingId ? (
              <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            {pollingId ? 'Verifying...' : 'Retry B2C Payout'}
          </Button>
        )}
        
        <Button variant="outline" asChild title="View Submission" className="h-11 w-11 p-0 rounded-xl border-slate-200 hover:bg-white hover:border-primary-wera hover:text-primary-wera transition-all">
          <Link to={`/employer/assignments/review/${assignment.id}`}>
            <FileText className="w-5 h-5" />
          </Link>
        </Button>
        
        <Button variant="outline" asChild title="View Global Applicants" className="h-11 w-11 p-0 rounded-xl border-slate-200 hover:bg-white hover:border-primary-wera hover:text-primary-wera transition-all">
          <Link to={`/employer/applicants-global`}>
            <User className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
