import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, ChevronRight, Loader2, ArrowLeft, Zap, ShieldCheck, Award, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trainingHooks } from '@/features/training/api/training.api';

export default function ModuleViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: module, isLoading, isError } = trainingHooks.useGetModule(id!);
    const { mutate: submitQuiz, isPending: isSubmitting } = trainingHooks.useSubmitQuiz(id!);

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<any>(null);

    // Ensure we start at top of page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-stitch-primary" />
            </div>
        );
    }

    if (isError || !module) {
        return (
            <div className="text-center p-16">
                <p className="text-slate-500 mb-4">Module not found or an error occurred.</p>
                <Button onClick={() => navigate('/worker/learning-hub')} variant="outline">Back to Hub</Button>
            </div>
        );
    }

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleAutoFill = (scoreTarget: 'perfect' | 'intermediate' | 'fail') => {
        if (!module.cheatSheet) return;
        
        const newAnswers: Record<string, string> = {};
        const total = module.questions.length;
        
        // Determine how many to get right based on target
        let targetCorrect = 0;
        if (scoreTarget === 'perfect') targetCorrect = total;
        else if (scoreTarget === 'intermediate') targetCorrect = Math.floor(total * 0.85); // e.g. ~85%
        else targetCorrect = Math.floor(total * 0.5); // 50% = fail
        
        let correctAssigned = 0;
        
        module.questions.forEach((q) => {
            const cheat = module.cheatSheet?.find(c => c.questionId === q.id);
            if (cheat && correctAssigned < targetCorrect) {
                newAnswers[q.id] = cheat.correctOptionId;
                correctAssigned++;
            } else {
                // Assign a wrong answer
                const wrongOption = q.options.find(o => o.id !== cheat?.correctOptionId);
                newAnswers[q.id] = wrongOption ? wrongOption.id : q.options[0].id;
            }
        });
        
        setAnswers(newAnswers);
        toast.success(`Demo Auto-Filled for ~${Math.round((targetCorrect / total) * 100)}% score`);
    };

    const handleSubmit = () => {
        const payload = Object.entries(answers).map(([questionId, optionId]) => ({
            questionId, optionId
        }));

        if (payload.length < module.questions.length) {
            toast.error("Please answer all questions before submitting.");
            return;
        }

        submitQuiz(payload, {
            onSuccess: (data) => {
                setResult(data);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (data.passed) {
                    toast.success("Congratulations! Assessment passed.");
                } else {
                    toast.error("Assessment failed. You can review the material and try again.");
                }
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to submit assessment.");
            }
        });
    };

    if (result) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-8">
                    {result.passed ? (
                        <>
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 mb-4">Verification Passed!</h1>
                            <p className="text-xl text-slate-600 mb-8">
                                You scored <span className="font-bold text-green-600">{result.score}%</span> and have earned Level {result.newLevel} ({result.newLevel === 3 ? 'Expert' : 'Intermediate'}).
                            </p>
                            
                            {result.badgeAwarded && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Badge Unlocked</p>
                                    <div className="w-16 h-16 bg-stitch-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Award className="w-8 h-8 text-stitch-primary" />
                                    </div>
                                    <p className="font-bold text-slate-900">{result.badgeAwarded.name}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 mb-4">Assessment Failed</h1>
                            <p className="text-xl text-slate-600 mb-8">
                                You scored <span className="font-bold text-red-600">{result.score}%</span>. The passing score is {module.passScore}%.
                            </p>
                            <p className="text-slate-500 mb-8">
                                Don't worry! You can review the material and try again immediately.
                            </p>
                        </>
                    )}
                    
                    <div className="flex justify-center gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('/worker/learning-hub')}
                            className="rounded-xl h-12 px-8 font-bold"
                        >
                            Back to Hub
                        </Button>
                        {!result.passed && (
                            <Button 
                                onClick={() => { setResult(null); setAnswers({}); }}
                                className="bg-stitch-primary hover:bg-stitch-primary/90 text-white rounded-xl h-12 px-8 font-bold"
                            >
                                Try Again
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/worker/learning-hub')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="font-bold text-sm truncate max-w-[200px] md:max-w-md">
                        {module.title}
                    </div>
                    {module.isDemoMode && (
                        <div className="flex gap-2">
                            <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                <Zap className="w-3 h-3" /> Demo Mode
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
                
                {/* Intro Section */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-stitch-primary bg-stitch-primary/10 px-3 py-1 rounded-full">
                            {module.skill.name} Verification
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">{module.title}</h1>
                    <p className="text-slate-500 mb-6">Review the video and documentation below, then complete the assessment to verify your skills.</p>
                    
                    {module.isDemoMode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                            <div className="text-sm text-amber-800">
                                <strong>Presenter Tools:</strong> Instantly fill answers to demonstrate specific scenarios.
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 bg-white hover:bg-amber-100" onClick={() => handleAutoFill('perfect')}>90-100% (Expert)</Button>
                                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 bg-white hover:bg-amber-100" onClick={() => handleAutoFill('intermediate')}>80-89% (Int)</Button>
                                <Button size="sm" variant="outline" className="border-red-300 text-red-700 bg-white hover:bg-red-50" onClick={() => handleAutoFill('fail')}>Fail</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section: Video */}
                {module.videoUrl && (
                    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-800 aspect-video relative group">
                        <iframe 
                            src={module.videoUrl} 
                            title="Training Video"
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Content Section: Document */}
                {module.docUrl && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Quality Standard Document</h3>
                                <p className="text-sm text-slate-500">Read this before taking the assessment</p>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl" onClick={() => window.open(module.docUrl || '', '_blank')}>
                            Open PDF/website
                        </Button>
                    </div>
                )}

                {/* Assessment Section */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-stitch-primary" />
                            Assessment Quiz
                        </h2>
                        <p className="text-slate-500">Passing score: {module.passScore}%. All questions are required.</p>
                    </div>

                    <div className="space-y-10">
                        {module.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <h4 className="font-bold text-lg text-slate-900 flex items-start gap-3">
                                    <span className="text-stitch-primary shrink-0">{idx + 1}.</span>
                                    {q.text}
                                </h4>
                                <div className="space-y-3 pl-7">
                                    {q.options.map(opt => {
                                        const isSelected = answers[q.id] === opt.id;
                                        return (
                                            <div 
                                                key={opt.id} 
                                                onClick={() => handleOptionSelect(q.id, opt.id)}
                                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                                    isSelected 
                                                    ? 'bg-stitch-primary/5 border-stitch-primary shadow-sm' 
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="pt-0.5 shrink-0">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        isSelected ? 'border-stitch-primary' : 'border-slate-300'
                                                    }`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 bg-stitch-primary rounded-full" />}
                                                    </div>
                                                </div>
                                                <span className={`text-sm ${isSelected ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                                    {opt.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500">
                            {Object.keys(answers).length} of {module.questions.length} answered
                        </span>
                        <Button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(answers).length < module.questions.length}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 px-8 font-bold shadow-lg"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Evaluating...</>
                            ) : (
                                <>Submit Assessment <ChevronRight className="w-5 h-5 ml-2" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
