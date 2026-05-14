import { useState, useEffect, ChangeEvent } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, MessageSquare, Clock, Download, ExternalLink, FileText, Camera, Info, X, Star, RefreshCcw } from 'lucide-react';
import { useGetAssignmentById, useReviewWork, useGetDownloadUrl, useGetTransactionByAssignment, useRetryPayout } from '@/features/execution/api/execution.api';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ReceiptModal } from '@/components/execution/ReceiptModal';
import { RatingModal } from '@/features/ratings/components/RatingModal';
import { useCheckRating } from '@/features/ratings/api/rating.api';
import { RaiseDisputeModal } from '@/features/disputes/components/RaiseDisputeModal';

import { ReportShell } from '@/features/reports/components/ReportShell';
import { EmployerAssignmentReport } from '@/features/reports/components/EmployerAssignmentReport';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';
import { useRef } from 'react';
import { api } from '@/lib/api';

export default function ReviewSubmission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assignment, isLoading, isError, refetch } = useGetAssignmentById(id);
  const { mutateAsync: reviewWork, isPending } = useReviewWork();
  const { mutateAsync: getDownloadUrl } = useGetDownloadUrl();
  const { mutateAsync: retryPayout, isPending: isRetrying } = useRetryPayout();
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState<'REVISE' | 'APPROVE' | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const { data: transaction } = useGetTransactionByAssignment(assignment?.id);
  const { data: ratingStatus } = useCheckRating(assignment?.status === 'PAID' ? assignment?.id : undefined);

  // Report state
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleDownloadReport = async (assignmentId: string, gigTitle: string) => {
    setDownloadingReport(true);
    try {
      const res = await api.get(`/reports/employer/assignment-report/${assignmentId}`);
      setReportData(res.data.data);
      
      // Allow React to render the hidden report component before capturing PDF
      setTimeout(async () => {
        if (reportRef.current) {
          try {
            await downloadReportAsPdf(reportRef.current, `WeraLink-Assignment-${gigTitle.replace(/\s+/g, '-')}`);
            toast.success('Report downloaded successfully!');
          } catch (e) {
            toast.error('PDF generation failed.');
          }
        }
        setDownloadingReport(false);
        setReportData(null);
      }, 800);
    } catch (err) {
      toast.error('Failed to fetch report data.');
      setDownloadingReport(false);
      setReportData(null);
    }
  };

  const handleDownload = async (assignmentId: string, filePath: string) => {
    try {
      const url = await getDownloadUrl({ assignmentId, filePath });
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to generate secure download link');
    }
  };

  // Poll for status changes while APPROVED
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (assignment?.status === 'APPROVED') {
      interval = setInterval(() => {
        refetch();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [assignment?.status, refetch]);

  const handleRetryPayout = async () => {
    try {
      await retryPayout(id!);
      toast.success('Payout retry initiated successfully');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to retry payout');
    }
  };

  const handleAction = async (action: 'APPROVE' | 'REVISE') => {
    if (action === 'REVISE' && !showReasonInput) {
      setShowReasonInput(action);
      return;
    }
    
    try {
      await reviewWork({ assignmentId: id!, action, reason });
      toast.success(`Assignment ${action.toLowerCase()}d successfully`);
      navigate('/employer/reviews');
    } catch (error) {
      console.error('Review failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-accent-dark bg-background-light">
        <div className="w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Loading submission...</p>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Submission not found</h2>
        <Button onClick={() => navigate('/employer/reviews')}>Go Back</Button>
      </div>
    );
  }

  const autoApproveDate = assignment.autoApproveAt ? new Date(assignment.autoApproveAt).toLocaleDateString() : 'N/A';

  return (
    <div className="h-screen flex flex-col bg-background-light overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <div className="bg-accent-dark h-18 flex items-center justify-between px-6 shrink-0 z-10 shadow-xl border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
           <div className="absolute right-0 top-0 w-32 h-32 bg-primary-wera rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <Button 
            variant="ghost"
            onClick={() => navigate('/employer/reviews')}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-white tracking-tight text-lg">{assignment.gig.title}</h1>
            <p className="text-xs font-medium text-gray-400">Reviewing submission from worker</p>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 text-primary-wera px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">Auto-approves on {autoApproveDate}</span>
          </div>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="grow flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANE: Evidence Viewer */}
        <div className="w-full md:w-7/12 lg:w-2/3 bg-slate-50 p-8 overflow-y-auto border-r border-slate-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold text-accent-dark tracking-tight">Proof of Work</h2>
               <Badge className="bg-primary-wera/10 text-primary-wera border-primary-wera/20">
                  {assignment.evidence?.length || 0} Evidence Items
               </Badge>
            </div>
            
            <div className="space-y-6">
              {assignment.evidence && assignment.evidence.length > 0 ? (
                assignment.evidence.map((ev: any, idx: number) => (
                  <Card key={idx} className="border-slate-200 shadow-sm overflow-hidden hover:border-primary-wera/30 transition-colors bg-white">
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-wera/10 p-2 rounded text-primary-wera">
                          {ev.evidenceType === 'FILE' || ev.evidenceType === 'IMAGE' ? <Camera className="w-4 h-4" /> : 
                           ev.evidenceType === 'LINK' ? <ExternalLink className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-sm text-accent-dark">
                          {ev.requirementTag || 'Evidence Item'} ({ev.evidenceType})
                        </span>
                      </div>
                      {(ev.evidenceType === 'FILE' || ev.evidenceType === 'IMAGE') && (
                        <button 
                          onClick={() => handleDownload(id!, ev.fileUrl)}
                          className="text-slate-400 hover:text-primary-wera transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          <Download className="w-4 h-4" /> Open Original
                        </button>
                      )}
                    </div>
                    <CardContent className="p-6">
                      {ev.evidenceType === 'IMAGE' ? (
                        <EvidenceImage 
                          assignmentId={id!} 
                          filePath={ev.fileUrl} 
                          getDownloadUrl={getDownloadUrl} 
                        />
                      ) : ev.evidenceType === 'LINK' ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <ExternalLink className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700 truncate max-w-md">{ev.fileUrl}</span>
                           </div>
                           <Button asChild variant="outline" size="sm" className="rounded-lg border-slate-200">
                              <a href={ev.fileUrl} target="_blank" rel="noreferrer">Visit Link</a>
                           </Button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed italic">
                           "{ev.fileUrl}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No evidence files provided</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Review & Actions */}
        <div className="w-full md:w-5/12 lg:w-1/3 bg-white p-8 overflow-y-auto flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          
          <div className="grow space-y-10">
            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-wera" /> Worker Submission Notes
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed text-sm italic shadow-inner">
                "{assignment.completionNotes || 'No notes provided by worker.'}"
              </div>
            </div>

            {/* Checklist Validation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Requirements</h3>
              <ul className="space-y-3">
                {(assignment.gig.evidenceTemplate as any[] || []).map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-accent-dark">
                    <CheckCircle className={`w-5 h-5 shrink-0 ${assignment.evidence?.find((e:any) => e.requirementTag === req.id) ? 'text-green-500' : 'text-slate-200'}`} />
                    {req.label}
                    {req.required && <span className="text-red-400 text-[10px] ml-1">REQUIRED</span>}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Reason Input (Conditional) */}
            {showReasonInput && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-bold uppercase tracking-widest text-amber-600`}>
                    Feedback for Revision
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowReasonInput(null)} className="h-6 w-6 p-0 rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea 
                  value={reason}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                  className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:bg-white transition-all p-5 resize-none text-sm min-h-[150px]"
                  placeholder={`Explain to the worker why you are requesting a revision...`}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-slate-100 mt-10 space-y-4">
            
            {assignment.status === 'PAID' ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-black text-emerald-900 mb-1">Payment Released</h3>
                  <p className="text-sm text-emerald-700">The worker has been paid via M-Pesa B2C.</p>
                </div>
                <Button 
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="w-full bg-accent-dark hover:bg-black text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" /> View Transaction Receipt
                </Button>
                <Button 
                  onClick={() => handleDownloadReport(assignment.id, assignment.gig.title)}
                  disabled={downloadingReport}
                  className="w-full bg-primary-wera hover:bg-primary-dark text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2"
                >
                  {downloadingReport ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                  ) : (
                    <><Download className="w-5 h-5" /> Download Report</>
                  )}
                </Button>
                {ratingStatus?.hasRated ? (
                  <div className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-amber-600 bg-amber-50 rounded-2xl border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    You rated this worker {ratingStatus.rating?.score}/5
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsRatingModalOpen(true)}
                    variant="outline"
                    className="w-full h-14 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold rounded-2xl"
                  >
                    <Star className="w-5 h-5 mr-2" /> Rate Worker
                  </Button>
                )}
              </div>
            ) : assignment.status === 'APPROVED' ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                  <Clock className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-lg font-black text-amber-900 mb-1">Payment Processing</h3>
                  <p className="text-sm text-amber-700 mb-4">Waiting for M-Pesa B2C confirmation...</p>
                  
                  <div className="bg-white/50 rounded-xl p-4 border border-amber-200/50">
                    <p className="text-xs text-amber-800 font-medium mb-3">
                      Taking too long? M-Pesa might have failed or dropped the request.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleRetryPayout}
                      disabled={isRetrying}
                      className="w-full bg-white border-amber-200 text-amber-700 hover:bg-amber-100 font-bold"
                    >
                      {isRetrying ? (
                        <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mr-2"></div>
                      ) : (
                        <RefreshCcw className="w-4 h-4 mr-2" />
                      )}
                      Retry Failed Payout
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {!showReasonInput || showReasonInput === 'APPROVE' ? (
                  <Button 
                    onClick={() => handleAction('APPROVE')}
                    disabled={isPending}
                    className="w-full bg-primary-wera hover:bg-primary-dark text-white font-bold h-16 rounded-2xl shadow-lg shadow-primary-wera/20 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    {isPending ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Approve & Release {assignment.gig.currency} {assignment.gig.payAmount.toLocaleString()}
                      </>
                    )}
                  </Button>
                ) : null}

                <div className="flex gap-4">
                  {(!showReasonInput || showReasonInput === 'REVISE') && (
                    <Button 
                      variant="outline"
                      onClick={() => handleAction('REVISE')}
                      disabled={isPending || (showReasonInput === 'REVISE' && !reason)}
                      className={`flex-1 h-14 rounded-2xl font-bold transition-all ${
                        showReasonInput === 'REVISE' ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700' : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      Request Revision
                    </Button>
                  )}
                  
                  {(!showReasonInput) && (
                    <Button 
                      variant="outline"
                      onClick={() => setIsDisputeModalOpen(true)}
                      className={`flex-1 h-14 rounded-2xl font-bold transition-all border-red-200 text-red-600 hover:bg-red-50`}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Dispute
                    </Button>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 border border-slate-100">
                  <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Approving will instantly trigger an M-Pesa B2C payout to the worker. This action is irreversible.
                  </p>
                </div>
              </>
            )}
          </div>
          
        </div>
      </div>

      <ReceiptModal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        transaction={transaction} 
      />

      {assignment && assignment.status === 'PAID' && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          assignmentId={assignment.id}
          rateeName={assignment.worker?.name || 'Worker'}
          gigTitle={assignment.gig.title}
          rateeRole="worker"
        />
      )}

      {assignment && (
        <RaiseDisputeModal
          assignmentId={assignment.id}
          gigTitle={assignment.gig.title}
          open={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Hidden Report Container for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {reportData && (
          <ReportShell 
            ref={reportRef} 
            title="Assignment Completion Report" 
            subtitle="Employer Assignment Summary"
          >
            <EmployerAssignmentReport data={reportData} />
          </ReportShell>
        )}
      </div>
    </div>
  );
}

const Badge = ({ children, className }: any) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${className}`}>
    {children}
  </span>
);

/**
 * Secure component to load images from Supabase Private Buckets
 */
const EvidenceImage = ({ assignmentId, filePath, getDownloadUrl }: any) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUrl = async () => {
      try {
        const signedUrl = await getDownloadUrl({ assignmentId, filePath });
        if (mounted) setUrl(signedUrl);
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUrl();
    return () => { mounted = false; };
  }, [assignmentId, filePath, getDownloadUrl]);

  if (loading) {
    return (
      <div className="bg-slate-100 rounded-xl flex items-center justify-center min-h-[300px] animate-pulse border border-slate-200">
        <div className="w-8 h-8 border-3 border-primary-wera/30 border-t-primary-wera rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl flex flex-col items-center justify-center min-h-[300px] border border-red-100 p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-sm font-medium text-red-800">Failed to load evidence image</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 rounded-xl overflow-hidden flex justify-center items-center min-h-[300px] border border-slate-200 group">
      <img 
        src={url!} 
        alt="Evidence" 
        className="max-w-full max-h-[500px] object-contain group-hover:scale-[1.02] transition-transform duration-500" 
      />
    </div>
  );
};
