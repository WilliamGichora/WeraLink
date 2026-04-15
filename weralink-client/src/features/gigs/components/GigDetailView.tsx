import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { gigHooks } from '../api/gig.api';
import { 
    Briefcase, MapPin, Clock, CheckCircle2, 
    ArrowLeft, AlertCircle, Building2, UserCircle, Star, 
    ArrowRight
} from 'lucide-react';

// STUB function. Later, map this to worker's actual skills context vs gig's skills.
const calculateMatchScore = (gigSkillIds: string[], workerSkills: string[] = ['s1', 's4', 's6']) => {
    if (!gigSkillIds || gigSkillIds.length === 0) return 100;
    const matched = gigSkillIds.filter(id => workerSkills.includes(id));
    return Math.round((matched.length / gigSkillIds.length) * 100);
};

interface GigDetailViewProps {
    viewerRole?: 'worker' | 'employer';
}

export const GigDetailView: React.FC<GigDetailViewProps> = ({ viewerRole = 'worker' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Auth & Skills data
    const { data: gig, isLoading, isError } = gigHooks.useGetGigById(id);

    const [isApplying, setIsApplying] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-accent-dark">
                <div className="w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold">Loading gig details...</p>
            </div>
        );
    }

    if (isError || !gig) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Gig not found</h2>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    // Match score mapping with real skill data
    const gigSkillIds = gig.skills?.map((s: any) => s.skillId) || [];
    const matchScore = calculateMatchScore(gigSkillIds);

    const handleApply = () => {
        setIsApplying(true);
        setTimeout(() => {
            setIsApplying(false);
            navigate('/worker/applications'); // Mock redirect after apply
        }, 1500);
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans bg-background-light min-h-screen pb-24">
            {/* Header mapped from Gig Description html */}
            <div className="bg-accent-dark text-white pt-10 pb-28 relative overflow-hidden px-4 md:px-8 mb-10 shadow-md">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera rounded-full blur-3xl"></div>
                    <div className="absolute left-20 bottom-10 w-64 h-64 bg-accent-text rounded-full blur-3xl"></div>
                </div>
                
                <div className="max-w-7xl mx-auto">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white/70 hover:text-white hover:bg-white/10 -ml-4 relative z-10">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Search
                    </Button>
 
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-white/10 text-gray-200 px-2 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-white/10">
                                    {gig.category.replace('_', ' ')}
                                </span>
                                <span className="bg-white/10 text-gray-200 px-2 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-white/10">
                                    {gig.workType === 'REMOTE' ? 'Remote' : 'On-Site'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{gig.title}</h1>
                            <p className="text-gray-400 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> {gig.employer?.name || 'WeraLink Member'}
                                <span className="w-1 h-1 bg-gray-500 rounded-full mx-1"></span>
                                <MapPin className="w-4 h-4" /> {gig.location}
                            </p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 min-w-[200px]">
                            <p className="text-gray-400 text-sm font-medium mb-1 flex items-center justify-between">
                                Total Pay
                                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-[10px] border-green-500/30">VERIFIED</Badge>
                            </p>
                            <h3 className="text-3xl font-bold text-primary-wera">{gig.currency} {Number(gig.payAmount).toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 md:px-8 relative z-20 -mt-20">
                {/* Main Content Column */}
                <div className="w-full lg:w-2/3 space-y-6">
                    {/* Description */}
                    <Card className="bg-white rounded-xl shadow-sm border border-primary-wera/10 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-primary-wera/5 pb-4">
                            <CardTitle className="text-xl font-bold text-accent-dark flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary-wera" /> Job Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose prose-slate max-w-none text-text-main/80 whitespace-pre-wrap leading-relaxed">
                                {gig.description}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline & Location */}
                    <Card className="bg-white rounded-xl shadow-sm border border-primary-wera/10">
                        <CardHeader className="bg-slate-50/50 border-b border-primary-wera/5 pb-4">
                            <CardTitle className="text-xl font-bold text-accent-dark flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-wera" /> Timeline & Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="bg-primary-wera/10 p-3 rounded-lg h-12 w-12 flex items-center justify-center shrink-0">
                                        <Clock className="w-6 h-6 text-primary-wera" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-main/60 font-medium">Expires At</p>
                                        <p className="font-bold text-text-main">{new Date(gig.expiresAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-primary-wera/10 p-3 rounded-lg h-12 w-12 flex items-center justify-center shrink-0">
                                        <MapPin className="w-6 h-6 text-primary-wera" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-main/60 font-medium">Location</p>
                                        <p className="font-bold text-text-main">{gig.location}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Employer Info Inside Main Column */}
                    <Card className="bg-white rounded-xl shadow-sm border border-primary-wera/10">
                        <div className="p-6 flex items-center justify-between pb-0 mb-4">
                            <h2 className="text-xl font-bold text-accent-dark flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary-wera" /> About the Employer
                            </h2>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">Verified</span>
                        </div>
                        <CardContent className="p-6 border-t border-slate-50">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                                    <UserCircle className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-main text-lg">{gig.employer?.name || 'WeraLink Member'}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 my-1">
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" opacity={0.5} />
                                        <span className="font-bold text-text-main text-sm ml-1">4.5 Rating</span>
                                    </div>
                                    <p className="text-sm text-text-main/60 mt-1">
                                        Frequent hirer on WeraLink with high completion and payment rates.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Evidence Requirements Card */}
                    <Card className="bg-accent-dark rounded-xl shadow-lg p-6 text-white relative overflow-hidden border-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-wera/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                        <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-primary-wera" /> Evidence Required
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 relative z-10">To get paid, you must provide the following proof of work upon completion:</p>
                        
                        <div className="space-y-3 relative z-10">
                            {(gig.evidenceTemplate as any[] || []).map((ev, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
                                    <div className="bg-primary-wera/20 p-2 rounded-full shrink-0 text-primary-wera">
                                        <FileIcon type={ev.type} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{ev.label}</p>
                                        <p className="text-xs text-gray-400">{ev.required ? 'Verification' : 'Optional'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-primary-wera" /> Funds released immediately after verification.
                        </div>
                    </Card>

                    {/* Skills Required Card */}
                    <Card className="bg-white rounded-xl shadow-sm border border-primary-wera/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-accent-dark flex items-center justify-between">
                                Skills Required
                                <span className={`text-sm px-2 py-1 rounded bg-slate-100 font-bold ${matchScore >= 80 ? "text-green-600" : "text-amber-600"}`}>
                                    {matchScore}% Match
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {gig.skills?.map((s: any) => {
                                    const haveSkill = Math.random() > 0.5; // Mock user skill check
                                    return (
                                        <span key={s.skillId} className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${haveSkill ? 'bg-primary-wera/10 text-primary-wera border border-primary-wera/20' : 'bg-slate-100 text-text-main/70 border border-slate-200'}`}>
                                            {s.skill?.name || 'Unknown Skill'}
                                            {haveSkill && <CheckCircle2 className="w-3 h-3" />}
                                        </span>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Safety Notice */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <div className="text-blue-500 shrink-0 mt-0.5">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-800">Safety First</h4>
                            <p className="text-xs text-blue-700 mt-1">Always verify the employer's identity and stay in public areas. Report any suspicious activity immediately.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom sticky action bar mimicking html */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 p-4 md:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Job Offer Expires In</p>
                        <p className="text-lg font-bold text-accent-text flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {Math.ceil((new Date(gig.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {viewerRole === 'employer' ? (
                            <>
                                <Button variant="outline" className="flex-1 md:flex-none h-12 border-slate-300 text-slate-700 px-6 rounded-lg font-bold hover:bg-slate-50" onClick={() => navigate('/employer/gigs')}>
                                    Close
                                </Button>
                                {gig.status === 'OPEN' && (
                                    <Button 
                                        className="flex-1 md:flex-none h-12 bg-primary-wera text-white px-8 rounded-lg font-bold text-lg shadow-lg shadow-primary-wera/30 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                        onClick={() => navigate(`/employer/gigs/${gig.id}/edit`)}
                                    >
                                        Edit Gig 
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="flex-1 md:flex-none h-12 border-slate-300 text-slate-700 px-6 rounded-lg font-bold hover:bg-slate-50" onClick={() => navigate(-1)}>
                                    Decline
                                </Button>
                                <Button 
                                    className="flex-1 md:flex-none h-12 bg-primary-wera text-white px-8 rounded-lg font-bold text-lg shadow-lg shadow-primary-wera/30 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    onClick={handleApply}
                                    disabled={isApplying}
                                >
                                    {isApplying ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...</>
                                    ) : (
                                        <>Accept Job <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'LINK': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
        case 'IMAGE': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
        default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    }
}
