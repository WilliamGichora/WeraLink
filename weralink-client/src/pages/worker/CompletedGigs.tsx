import { useGetWorkerAssignments, useGetTransactionByAssignment } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Building2, CheckCircle2, AlertTriangle, ExternalLink, FileText, Star, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReceiptModal } from '@/components/execution/ReceiptModal';
import { RatingModal } from '@/features/ratings/components/RatingModal';
import { useCheckRating } from '@/features/ratings/api/rating.api';
import { useState, useMemo } from 'react';

export default function CompletedGigs() {
  const { data: assignments, isLoading } = useGetWorkerAssignments(['SUBMITTED', 'APPROVED', 'PAID', 'DISPUTED']);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { data: transaction } = useGetTransactionByAssignment(selectedAssignmentId || undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rating state
  const [ratingTarget, setRatingTarget] = useState<{
    assignmentId: string;
    employerName: string;
    gigTitle: string;
  } | null>(null);

  const handleViewReceipt = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsModalOpen(true);
  };

  const stats = useMemo(() => {
    if (!assignments) return { totalEarned: 0, completedCount: 0 };
    const paidGigs = assignments.filter((a: any) => a.status === 'PAID');
    const total = paidGigs.reduce((sum: number, a: any) => sum + Number(a.gig.payAmount), 0);
    return { totalEarned: total, completedCount: paidGigs.length };
  }, [assignments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'SUBMITTED':
        return { label: 'Under Review', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock className="w-4 h-4" /> };
      case 'APPROVED':
        return { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'PAID':
        return { label: 'Paid', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'DISPUTED':
        return { label: 'Disputed', color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> };
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: null };
    }
  };

  return (
    <div className="min-h-screen bg-background-light pb-16 font-sans text-text-main animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Hero Section */}
      <div className="bg-accent-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera/20 rounded-full blur-3xl" />
          <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-primary-wera/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary-wera/20 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary-wera" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">
                  Earnings History
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Completed Gigs</h1>
              <p className="text-gray-400 text-lg max-w-xl">
                A complete record of your achievements, professional growth, and financial earnings on WeraLink.
              </p>
            </div>

            {/* Completed Stats */}
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-primary-wera" /> Total Earned
                </p>
                <p className="text-2xl font-bold text-white">KES {stats.totalEarned.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" /> Completed
                </p>
                <p className="text-2xl font-bold text-green-400">{stats.completedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        {assignments?.length === 0 ? (
          <Card className="bg-white border-dashed border-2 border-slate-200 rounded-[32px] shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-primary-wera/10 text-primary-wera rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-accent-dark mb-2">No History Yet</h3>
              <p className="text-text-main/60 mb-8 max-w-md">You haven't completed any gigs yet. Start applying to build your professional portfolio.</p>
              <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white h-12 px-8 rounded-xl shadow-lg shadow-primary-wera/20 font-bold">
                <Link to="/worker/gigs">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-primary-wera flex items-center gap-2">
                Work History
                <span className="text-sm font-medium text-primary-wera bg-primary-wera/10 px-2 py-0.5 rounded-full">
                  {assignments?.length}
                </span>
              </h2>
            </div>

            <div className="grid gap-5">
              {assignments?.map((assignment: any) => {
                const statusConfig = getStatusConfig(assignment.status);
                
                return (
                  <Card key={assignment.id} className="bg-white hover:border-primary-wera/30 transition-all shadow-md overflow-hidden border-slate-200 rounded-3xl group">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-8 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-2xl font-bold text-accent-dark leading-tight group-hover:text-primary-wera transition-colors">{assignment.gig.title}</h3>
                          <Badge variant="outline" className={`${statusConfig.color} font-bold shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg shadow-sm`}>
                            {statusConfig.icon} {statusConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6 text-sm text-text-main/70 mb-6">
                          <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                            <Building2 className="w-4 h-4 text-slate-400" /> {assignment.gig.employer?.name || 'WeraLink Employer'}
                          </span>
                          <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                            <MapPin className="w-4 h-4 text-slate-400" /> {assignment.gig.location}
                          </span>
                          {assignment.submittedAt && (
                            <span className="flex items-center gap-2 font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="w-4 h-4" /> Submitted {new Date(assignment.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <p className="text-base text-text-main/80 line-clamp-2 leading-relaxed">
                          {assignment.gig.description}
                        </p>
                      </div>
                      
                      <div className="bg-slate-50/50 p-8 md:w-72 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center items-center text-center">
                        <p className="text-xs text-text-main/50 uppercase font-bold tracking-wider mb-2">Total Earned</p>
                        <p className={`text-3xl font-black mb-6 ${assignment.status === 'PAID' ? 'text-primary-wera' : 'text-slate-600'}`}>
                          {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
                        </p>
                        
                        <div className="w-full space-y-3">
                          <Button variant="outline" asChild className="w-full h-11 border-slate-300 text-accent-dark hover:bg-white hover:border-primary-wera/50 font-bold rounded-xl transition-all">
                            <Link to={`/worker/gigs/${assignment.gigId}`} className="flex items-center justify-center gap-2">
                              Gig Details <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>

                          {assignment.status === 'PAID' && (
                            <Button 
                              onClick={() => handleViewReceipt(assignment.id)}
                              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                              View Receipt <FileText className="w-4 h-4" />
                            </Button>
                          )}

                          {assignment.status === 'PAID' && (
                            <RateEmployerButton
                              assignmentId={assignment.id}
                              employerName={assignment.gig.employer?.name || 'Employer'}
                              gigTitle={assignment.gig.title}
                              onRate={(target) => setRatingTarget(target)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ReceiptModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transaction={transaction} 
      />

      {ratingTarget && (
        <RatingModal
          isOpen={!!ratingTarget}
          onClose={() => setRatingTarget(null)}
          assignmentId={ratingTarget.assignmentId}
          rateeName={ratingTarget.employerName}
          gigTitle={ratingTarget.gigTitle}
          rateeRole="employer"
        />
      )}
    </div>
  );
}

function RateEmployerButton({
  assignmentId,
  employerName,
  gigTitle,
  onRate,
}: {
  assignmentId: string;
  employerName: string;
  gigTitle: string;
  onRate: (target: { assignmentId: string; employerName: string; gigTitle: string }) => void;
}) {
  const { data: ratingStatus } = useCheckRating(assignmentId);

  if (ratingStatus?.hasRated) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-3 text-sm font-bold text-amber-600 bg-amber-50 rounded-xl border border-amber-100">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        Rated {ratingStatus.rating?.score}/5
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => onRate({ assignmentId, employerName, gigTitle })}
      className="w-full h-11 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold rounded-xl transition-all"
    >
      <Star className="w-4 h-4 mr-2" /> Rate Employer
    </Button>
  );
}
