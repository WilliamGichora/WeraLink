import { useState, useEffect, type ChangeEvent } from 'react';
import { ArrowLeft, Info, Send, Save, Camera, CheckCircle, UploadCloud, Link as LinkIcon, FileText, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAssignmentById, useSubmitWork, useGetPresignedUrl, uploadFileToPresignedUrl } from '@/features/execution/api/execution.api';
import { WorkflowStepper } from '@/features/execution/components/WorkflowStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RaiseDisputeModal } from '@/features/disputes/components/RaiseDisputeModal';

interface EvidenceItemState {
  id: string;
  type: 'FILE' | 'IMAGE' | 'LINK' | 'TEXT' | 'PDF' | 'SPREADSHEET' | 'GOOGLE_DRIVE' | 'GITHUB' | 'TWITTER' | 'INSTAGRAM';
  label: string;
  required: boolean;
  value: string; // URL or text content
  fileName?: string;
  isUploading?: boolean;
  isCompleted?: boolean;
  accept?: string[];
  maxSizeMB?: number;
  error?: string;
}

export const SubmitEvidence = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [evidenceStates, setEvidenceStates] = useState<EvidenceItemState[]>([]);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  
  const { data: assignment, isLoading, isError, refetch } = useGetAssignmentById(id);
  const { mutateAsync: submitWork, isPending: isSubmitting } = useSubmitWork();
  const { mutateAsync: getPresignedUrl } = useGetPresignedUrl();

  useEffect(() => {
    if (assignment?.gig?.evidenceTemplate) {
      const template = assignment.gig.evidenceTemplate as any[];
      const existingEvidence = assignment.evidence || [];
      
      setEvidenceStates(template.map(item => {
        const existing = existingEvidence.find((ev: any) => ev.requirementTag === item.id);
        return {
          id: item.id || item.tag || Math.random().toString(36).substr(2, 9),
          type: item.type,
          label: item.label,
          required: item.required || false,
          value: existing?.fileUrl || '',
          fileName: existing?.fileUrl ? existing.fileUrl.split('/').pop() : undefined,
          isCompleted: !!existing?.fileUrl,
          accept: item.accept || [],
          maxSizeMB: item.maxSizeMB || 10
        };
      }));

      if (assignment.completionNotes) {
        setNotes(assignment.completionNotes);
      }
    }
  }, [assignment]);

  const handleFileChange = async (index: number, file: File) => {
    const updatedStates = [...evidenceStates];
    const item = updatedStates[index];
    
    // Validate extension if accept list exists
    if (item.accept && item.accept.length > 0) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!item.accept.includes(extension)) {
        toast.error(`Invalid file type. Required: ${item.accept.join(', ')}`);
        return;
      }
    }

    // Validate size if maxSizeMB exists
    const maxSize = item.maxSizeMB || 10;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File is too large. Max size: ${maxSize}MB`);
      return;
    }

    updatedStates[index].isUploading = true;
    updatedStates[index].fileName = file.name;
    updatedStates[index].error = undefined;
    setEvidenceStates(updatedStates);

    try {
      // 1. Get presigned URL
      const { signedUploadUrl, path } = await getPresignedUrl({ 
        assignmentId: id!, 
        fileName: file.name 
      });

      // 2. Upload to Supabase
      await uploadFileToPresignedUrl(file, signedUploadUrl);

      // 3. Update state with the path
      const finalStates = [...evidenceStates];
      finalStates[index].value = path;
      finalStates[index].isUploading = false;
      finalStates[index].isCompleted = true;
      setEvidenceStates(finalStates);
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorStates = [...evidenceStates];
      errorStates[index].isUploading = false;
      setEvidenceStates(errorStates);
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const updatedStates = [...evidenceStates];
    const item = updatedStates[index];
    let isValid = value.trim().length > 0;
    let error = undefined;

    // Pattern Validation for Links
    if (isValid && value.startsWith('http')) {
      if (item.type === 'GOOGLE_DRIVE' && !value.includes('drive.google.com')) {
        error = 'Please provide a valid Google Drive link';
        isValid = false;
      } else if (item.type === 'GITHUB' && !value.includes('github.com')) {
        error = 'Please provide a valid GitHub link';
        isValid = false;
      } else if (item.type === 'TWITTER' && !value.includes('twitter.com') && !value.includes('x.com')) {
        error = 'Please provide a valid Twitter/X link';
        isValid = false;
      } else if (item.type === 'INSTAGRAM' && !value.includes('instagram.com')) {
        error = 'Please provide a valid Instagram link';
        isValid = false;
      }
    }

    updatedStates[index].value = value;
    updatedStates[index].isCompleted = isValid;
    updatedStates[index].error = error;
    setEvidenceStates(updatedStates);
  };

  const handleSubmit = async () => {
    // Check requirements
    const missing = evidenceStates.find(s => s.required && !s.isCompleted);
    if (missing) {
      toast.error(`Please provide ${missing.label}`);
      return;
    }

    try {
      const evidenceData = evidenceStates.map(s => ({
        fileUrl: s.value,
        evidenceType: s.type,
        requirementTag: s.id
      }));

      await submitWork({
        assignmentId: id!,
        completionNotes: notes,
        evidenceData
      });

      toast.success('Work submitted successfully');
      navigate('/worker/assignments');
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to submit work');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-accent-dark bg-background-light">
        <div className="w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Loading assignment...</p>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Assignment not found</h2>
        <Button onClick={() => navigate('/worker/assignments')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="bg-accent-dark rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary-wera rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => navigate('/worker/assignments')}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="hidden md:block h-8 w-px bg-gray-700 mx-2"></div>
              <div>
                <h1 className="text-white font-bold text-2xl tracking-tight">{assignment.gig.title}</h1>
                <p className="text-gray-400 text-sm">Employer: {assignment.gig.employer?.name || 'WeraLink Member'}</p>
              </div>
            </div>
            
            <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="flex items-center text-sm font-bold text-primary-wera">
                <span className="w-2 h-2 rounded-full bg-primary-wera mr-2 animate-pulse"></span>
                {assignment.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {assignment.status === 'REVISION_REQUESTED' && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-amber-900 font-bold text-lg mb-1">Revision Requested</h3>
                <p className="text-amber-800 text-sm leading-relaxed mb-4">
                  The employer has requested changes to your submission. Please review the notes below and resubmit your work.
                </p>
                <div className="bg-white/60 rounded-xl p-4 border border-amber-200/50">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2 opacity-60">Feedback from Employer</p>
                  <p className="text-amber-900 font-medium italic">"{assignment.revisionNotes || 'No specific notes provided.'}"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* Gig Info */}
            <Card className="border-primary-wera/10 shadow-sm overflow-hidden bg-white">
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-accent-dark flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary-wera" /> Evidence Submission
                </h2>
                <Badge variant="outline" className="text-primary-wera border-primary-wera/20">
                  {evidenceStates.length} Requirements
                </Badge>
              </div>
              <CardContent className="p-8 space-y-8">
                {evidenceStates.map((item, index) => (
                  <div key={item.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-accent-dark flex items-center gap-2">
                        {['FILE', 'IMAGE'].includes(item.type) ? <UploadCloud className="w-4 h-4" /> : 
                         item.type === 'PDF' ? <FileText className="w-4 h-4" /> :
                         item.type === 'SPREADSHEET' ? <FileText className="w-4 h-4" /> : // Could use Table or similar
                         ['LINK', 'GOOGLE_DRIVE', 'GITHUB', 'TWITTER', 'INSTAGRAM'].includes(item.type) ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        {item.label}
                        {item.required && <span className="text-red-500">*</span>}
                      </label>
                      {item.isCompleted && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </span>
                      )}
                    </div>

                    {(['FILE', 'IMAGE', 'PDF', 'SPREADSHEET'].includes(item.type)) ? (
                      <div className="relative group">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                          item.isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-primary-wera hover:bg-slate-50'
                        }`}>
                          {item.isUploading ? (
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 border-3 border-primary-wera border-t-transparent rounded-full animate-spin mb-2"></div>
                              <p className="text-sm font-medium text-slate-500">Uploading {item.fileName}...</p>
                            </div>
                          ) : item.isCompleted ? (
                            <div className="flex flex-col items-center">
                              <div className="bg-green-100 p-3 rounded-full mb-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </div>
                              <p className="text-sm font-bold text-green-700">{item.fileName || 'File uploaded'}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 text-slate-400 hover:text-red-500"
                                onClick={() => {
                                  const reset = [...evidenceStates];
                                  reset[index].isCompleted = false;
                                  reset[index].value = '';
                                  setEvidenceStates(reset);
                                }}
                              >
                                <X className="w-4 h-4 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center cursor-pointer">
                              <UploadCloud className="w-10 h-10 text-slate-300 mb-2 group-hover:text-primary-wera transition-colors" />
                              <p className="text-sm font-medium text-slate-500">Click or drag to upload {item.type === 'SPREADSHEET' ? 'data sheet' : item.type.toLowerCase()}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Allowed: {item.accept && item.accept.length > 0 ? item.accept.join(', ') : 'Any file'} (Max 10MB)
                              </p>
                              <input 
                                type="file" 
                                title={`Upload ${item.label}`}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                accept={item.accept && item.accept.length > 0 ? item.accept.join(',') : '*/*'}
                                onChange={(e) => e.target.files?.[0] && handleFileChange(index, e.target.files[0])}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (['LINK', 'GOOGLE_DRIVE', 'GITHUB', 'TWITTER', 'INSTAGRAM'].includes(item.type)) ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            placeholder={
                              item.type === 'GOOGLE_DRIVE' ? 'https://drive.google.com/...' :
                              item.type === 'GITHUB' ? 'https://github.com/...' :
                              item.type === 'TWITTER' ? 'https://x.com/...' :
                              'https://...'
                            } 
                            value={item.value}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            className={`pl-10 h-12 rounded-xl ${item.error ? 'border-red-500 ring-red-500' : ''}`}
                          />
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {item.error && (
                          <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {item.error}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Textarea 
                        placeholder="Type your submission content here..."
                        value={item.value}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleTextChange(index, e.target.value)}
                        className="min-h-[120px] rounded-xl resize-none"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-6 border-t border-slate-100">
                  <label className="text-sm font-bold text-accent-dark block mb-4">Completion Notes</label>
                  <Textarea 
                    placeholder="Add any additional context for the employer..."
                    value={notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3 space-y-6">
            
            {/* Gig Summary Card */}
            <Card className="bg-white border-primary-wera/10 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-accent-dark mb-4">Project Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-wera/10 flex items-center justify-center text-primary-wera">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Gig</p>
                      <p className="font-bold text-accent-dark text-sm">{assignment.gig.title}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Reward</p>
                      <p className="font-bold text-primary-wera">{assignment.gig.currency} {assignment.gig.payAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Category</p>
                      <p className="font-bold text-accent-dark text-xs">{assignment.gig.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stepper */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <WorkflowStepper currentStatus={assignment.status} assignedAt={new Date(assignment.createdAt).toLocaleDateString()} />
            </div>

            {/* Support Notice */}
            <div className="bg-accent-dark rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-wera/10 rounded-full"></div>
              <div className="relative z-10">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-primary-wera" /> Payment Guarantee
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your funds are secured in escrow. Once you submit and the employer approves, the payout will be triggered automatically to your M-Pesa.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="space-y-3">
              {assignment.status === 'DISPUTED' ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-500">
                  <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-sm font-black text-red-900 mb-1">Mediation in Progress</h3>
                  <p className="text-[10px] text-red-700 leading-relaxed">
                    A dispute has been raised for this assignment. Regular submission workflows are locked while an admin mediates the conflict.
                  </p>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary-wera hover:bg-primary-dark text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary-wera/20 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Work <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-500 font-bold"
                    onClick={() => toast.info('Draft saved locally')}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Draft
                  </Button>

                  <div className="pt-4 border-t border-slate-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsDisputeModalOpen(true)}
                      className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Raise Dispute
                    </Button>
                  </div>
                </>
              )}
            </div>

          </aside>
        </div>
      </div>

      <RaiseDisputeModal 
        open={isDisputeModalOpen} 
        onClose={() => setIsDisputeModalOpen(false)}
        assignmentId={id!}
        gigTitle={assignment.gig.title}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

const Badge = ({ children, variant, className }: any) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
    variant === 'outline' ? 'border' : 'bg-slate-100 text-slate-600'
  } ${className}`}>
    {children}
  </span>
);
