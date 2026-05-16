import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetAssignmentById, useRejectApplication } from '@/features/execution/api/execution.api';
import { MpesaModal } from '@/features/execution/components/MpesaModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  Briefcase,
  Award,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export default function ApplicantReview() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assignment, isLoading, error } = useGetAssignmentById(assignmentId);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { mutate: rejectApp, isPending: isRejecting } = useRejectApplication();

  const handleReject = () => {
    if (!assignmentId) return;
    
    rejectApp({ assignmentId }, {
      onSuccess: () => {
        toast.success('Application rejected successfully');
        setIsRejectModalOpen(false);
        navigate(`/employer/gigs/${assignment?.gigId}/applicants`);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to reject application');
        setIsRejectModalOpen(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full shadow-lg shadow-primary-wera/10"></div>
          <p className="text-text-main/50 font-bold animate-pulse">Analyzing Candidate Fit...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-xl mx-auto p-12 mt-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-accent-dark mb-4">Review Unavailable</h2>
        <p className="text-text-main/60 mb-8 font-medium leading-relaxed">{error instanceof Error ? error.message : 'We encountered an error retrieving this application.'}</p>
        <Button asChild className="rounded-xl px-8 h-12 bg-accent-dark hover:bg-black font-bold">
          <Link to="/employer/applicants">Return to Applicant Feed</Link>
        </Button>
      </div>
    );
  }

  const { worker, gig, matchScore, matchBreakdown, matchTags } = assignment;

  const averageRating = worker.ratingsRecv?.length > 0 
    ? (worker.ratingsRecv.reduce((acc: number, r: any) => acc + r.score, 0) / worker.ratingsRecv.length).toFixed(1)
    : 'New';

  const completedAssignments = worker.assignments?.filter((a: any) => a.status === 'APPROVED' || a.status === 'PAID').length || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans pb-24">
      {/* Back & Breadcrumb */}
      <div className="mb-10">
        <Link 
          to={`/employer/gigs/${gig.id}/applicants`} 
          className="inline-flex items-center gap-2 text-primary-wera hover:text-primary-dark font-bold text-sm transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Applicants
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-accent-dark tracking-tight mb-2">Review Application</h1>
            <p className="text-text-main/70 font-medium text-lg">Evaluating candidate for <span className="font-bold text-accent-dark underline decoration-primary-wera/30 underline-offset-4">"{gig.title}"</span></p>
          </div>
          {/*<div className="flex flex-wrap gap-4">
            <Button variant="outline" className="rounded-2xl border-slate-200 h-14 px-8 font-bold text-accent-dark hover:bg-slate-50 shadow-sm active:scale-95 transition-all">
              <MessageSquare className="w-5 h-5 mr-3" /> Message
            </Button>
            <Button 
              onClick={() => setIsMpesaModalOpen(true)}
              className="bg-primary-wera hover:bg-primary-dark text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-primary-wera/20 transition-all active:scale-95 flex items-center gap-3"
            >
              Hire & Fund Escrow <Zap className="w-5 h-5 fill-current" />
            </Button>
          </div>*/}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Worker Profile & Fit */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Main Profile Info */}
          <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
            <div className="h-40 bg-linear-to-r from-accent-dark to-slate-900 relative">
               <div className="absolute -bottom-14 left-10">
                  <div className="w-32 h-32 bg-white p-2.5 rounded-[2rem] shadow-2xl">
                    <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-4xl font-black text-accent-dark uppercase shadow-inner border border-slate-100">
                      {worker.name.charAt(0)}
                    </div>
                  </div>
               </div>
               <div className="absolute top-6 right-8 flex gap-3">
                  <Badge className="bg-primary-wera/90 backdrop-blur-md text-white border-none font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-lg">Verified Worker</Badge>
                  {matchScore >= 90 && (
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-lg">Top Tier Match</Badge>
                  )}
               </div>
            </div>
            <CardContent className="pt-20 px-10 pb-10">
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                <div>
                  <h2 className="text-4xl font-black text-accent-dark mb-3">{worker.name}</h2>
                  <div className="flex flex-wrap items-center gap-6 text-text-main/60 font-bold">
                    <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-wera" /> {worker.profile?.location || 'Remote'}</span>
                    <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary-wera" /> {completedAssignments} Gigs Completed</span>
                  </div>
                </div>
                <div className="flex flex-col items-end md:text-right">
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    <Star className="w-6 h-6 fill-current" />
                    <span className="text-2xl font-black text-accent-dark ml-2">{averageRating}</span>
                  </div>
                  <span className="text-xs font-black text-text-main/30 uppercase tracking-[0.2em]">Overall Reputation</span>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-[2rem] p-8 mb-10 relative">
                <div className="absolute -top-3 left-8 bg-white border border-slate-100 px-4 py-1 rounded-full text-[10px] font-black text-accent-dark/40 uppercase tracking-widest">Candidate Bio</div>
                <p className="text-text-main/80 leading-relaxed font-medium text-lg italic">
                  "{worker.profile?.bio || 'Highly dedicated professional with expertise in delivering high-quality results. Ready to tackle this project with a focus on excellence and attention to detail.'}"
                </p>
              </div>

              <div className="mt-12">
                <h4 className="text-xs font-black text-accent-dark/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Core Competencies & Skills
                </h4>
                <div className="flex flex-wrap gap-3">
                  {(worker.skills || []).map((ws: any) => (
                    <div key={ws.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl pl-4 pr-5 py-2.5 group hover:border-primary-wera transition-all shadow-sm hover:shadow-md cursor-default">
                      <div className={`w-2 h-2 rounded-full ${ws.verified ? 'bg-primary-wera' : 'bg-slate-300'} group-hover:scale-125 transition-transform`}></div>
                      <span className="text-sm font-black text-accent-dark">{ws.skill?.name || 'Skill'}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-black text-slate-500 uppercase tracking-tight">Level {ws.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Analysis */}
          <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-wera/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-wera" />
                </div>
                <h3 className="text-3xl font-black text-accent-dark tracking-tight">Match Intelligence</h3>
              </div>
              <Badge variant="outline" className="bg-slate-50 border-slate-200 text-accent-dark px-4 py-1.5 rounded-full font-bold text-xs">
                Powered by WeraMatch v1.0
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Score Visualization */}
               <div className="flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary-wera/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
                  <div className="relative z-10 text-center">
                    <span className="text-xs font-black text-text-main/40 uppercase tracking-[0.3em] mb-6 block">Algorithm Compatibility</span>
                    <div className="text-8xl font-black text-primary-wera leading-none mb-6 tracking-tighter drop-shadow-sm">
                      {matchScore}<span className="text-3xl font-black">%</span>
                    </div>
                    <div className="flex items-center gap-2.5 justify-center bg-white border border-slate-100 rounded-full px-6 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <Zap className="w-4 h-4 fill-primary-wera text-primary-wera" />
                        {matchScore > 80 && <Zap className="w-4 h-4 fill-primary-wera text-primary-wera" />}
                        {matchScore > 90 && <Zap className="w-4 h-4 fill-primary-wera text-primary-wera" />}
                      </div>
                      <span className="text-xs font-black text-accent-dark uppercase tracking-widest">
                        {matchScore >= 90 ? 'Ideal Choice' : matchScore >= 75 ? 'Strong Candidate' : 'Verified Match'}
                      </span>
                    </div>
                  </div>
               </div>

               {/* Breakdown List */}
               <div className="space-y-8 flex flex-col justify-center">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-black text-accent-dark uppercase tracking-wider">Skill Alignment</span>
                      <span className="text-sm font-black text-primary-wera">{Math.round((matchBreakdown?.skillScore || 0) * 45)}/45</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary-wera rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-1000 ease-out" 
                        style={{ width: `${(matchBreakdown?.skillScore || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-black text-accent-dark uppercase tracking-wider">Category Affinity</span>
                      <span className="text-sm font-black text-primary-wera">{Math.round((matchBreakdown?.categoryAffinity || 0) * 25)}/25</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary-wera rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-1000 ease-out" 
                        style={{ width: `${(matchBreakdown?.categoryAffinity || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-black text-accent-dark uppercase tracking-wider">Location Fit</span>
                      <span className="text-sm font-black text-primary-wera">{Math.round((matchBreakdown?.locationScore || 0) * 15)}/15</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary-wera rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-1000 ease-out" 
                        style={{ width: `${(matchBreakdown?.locationScore || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-black text-accent-dark uppercase tracking-wider">Availability</span>
                      <span className="text-sm font-black text-primary-wera">{Math.round((matchBreakdown?.availabilityScore || 0) * 15)}/15</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary-wera rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-1000 ease-out" 
                        style={{ width: `${(matchBreakdown?.availabilityScore || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-100">
               <h4 className="text-xs font-black text-accent-dark/40 uppercase tracking-widest mb-6">Expert Recommendation</h4>
               <div className="flex items-start gap-6 bg-slate-50 border border-slate-100 rounded-[2rem] p-8">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-lg">
                    <ShieldCheck className="text-primary-wera w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-accent-dark mb-2">
                      {matchScore >= 90 ? 'Perfect Technical Alignment' : matchScore >= 70 ? 'Strong Candidate' : 'Verified Applicant'}
                    </p>
                    <p className="text-text-main/70 leading-relaxed font-medium">
                      Based on current metrics, this worker has a {matchScore}% compatibility with your project requirements. 
                      {matchTags?.includes('expert-skill-match') && ' Their specialized skill set exactly matches your gig requirements. '}
                      {matchTags?.includes('local-talent') && ' Being locally based reduces coordination overhead. '}
                      {matchTags?.includes('proven-track-record') && ' They have a consistent history of successful completions in this category. '}
                      Overall, WeraMatch recommends moving forward with this selection.
                    </p>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Hiring Actions & Stats */}
        <div className="lg:col-span-4 space-y-8">

          {/* Payment & Funding */}
          <Card className="bg-accent-dark text-white rounded-3xl p-8 border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-6">Secured Hiring</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4">
                  <span className="text-sm font-medium opacity-70">Project Budget</span>
                  <span className="text-xl font-black">{gig.currency} {Number(gig.payAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4">
                  <span className="text-sm font-medium opacity-70">Escrow Status</span>
                  <span className="text-sm font-black text-amber-400 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Unfunded</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-wera shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed opacity-80">
                    Funds will be held securely by WeraLink Escrow and only released after your explicit approval of the work evidence.
                  </p>
                </div>
              </div>

              {gig.status === 'OPEN' && assignment.status === 'OFFERED' ? (
                <>
                  <Button
                    onClick={() => setIsMpesaModalOpen(true)}
                    className="w-full bg-primary-wera hover:bg-white hover:text-primary-wera text-white font-black text-lg py-8 rounded-2xl transition-all shadow-xl shadow-primary-wera/20 group"
                  >
                    <Zap className="w-6 h-6 mr-3 fill-current group-hover:animate-bounce" /> Fund & Accept
                  </Button>
                  <p className="text-[10px] text-center mt-4 opacity-50 uppercase tracking-[0.15em] font-bold">Powered by Daraja M-Pesa API</p>
                </>
              ) : (
                <div className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl text-center mt-4">
                  <p className="text-sm font-black text-white/80 mb-1">
                    {assignment.status === 'ACCEPTED' ? 'Candidate Hired' : 'Action Unavailable'}
                  </p>
                  <p className="text-xs font-medium text-white/50">
                    {assignment.status === 'ACCEPTED' 
                      ? 'You have successfully hired this candidate for the gig.' 
                      : 'This gig is no longer open or the application is no longer active.'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-6">
            <h4 className="text-xs font-black text-accent-dark/40 uppercase tracking-widest mb-6">Candidate Stats</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary-wera" />
                </div>
                <div>
                  <p className="text-sm font-black text-accent-dark">
                    {assignment.workerAnalytics?.kpis?.totalGigsCompleted > 0 
                      ? Math.round((assignment.workerAnalytics.kpis.periodGigsCompleted / assignment.workerAnalytics.kpis.totalGigsCompleted) * 100) 
                      : 100}%
                  </p>
                  <p className="text-xs text-text-main/50 font-medium">Completion Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-wera" />
                </div>
                <div>
                  <p className="text-sm font-black text-accent-dark">
                    {worker.badges?.length > 0 ? 'Verified Elite' : 'Standard'}
                  </p>
                  <p className="text-xs text-text-main/50 font-medium">Trust Badge Level</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-wera" />
                </div>
                <div>
                  <p className="text-sm font-black text-accent-dark">
                    {assignment.workerAnalytics?.kpis?.avgRating ? `${(5 - assignment.workerAnalytics.kpis.avgRating).toFixed(1)} Hours` : '< 2 Hours'}
                  </p>
                  <p className="text-xs text-text-main/50 font-medium">Est. Response Time</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Actions */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-accent-dark hover:bg-slate-50">
              <ExternalLink className="w-4 h-4 mr-2" /> View Full Portfolio
            </Button>
            {gig.status === 'OPEN' && assignment.status === 'OFFERED' && (
              <Button 
                variant="outline" 
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isRejecting}
                className="w-full h-12 rounded-xl border-slate-200 font-bold text-red-600 hover:bg-red-50 hover:border-red-100 disabled:opacity-50"
              >
                {isRejecting ? 'Rejecting...' : 'Reject Application'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <MpesaModal
        isOpen={isMpesaModalOpen}
        onClose={() => setIsMpesaModalOpen(false)}
        assignmentId={assignment.id}
        amount={Number(gig.payAmount)}
        onSuccess={() => {
          setIsMpesaModalOpen(false);
          navigate(`/employer/gigs`);
        }}
      />

      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject Application?"
        description="Are you sure you want to decline this application? This worker will be notified, and this action cannot be undone."
        confirmText="Yes, Reject"
        cancelText="Keep Reviewing"
        type="danger"
        isLoading={isRejecting}
      />
    </div>
  );
}
