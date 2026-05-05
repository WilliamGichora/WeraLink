import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetEmployerPendingReviews } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Clock, 
    FileCheck, 
    User, 
    ArrowRight, 
    AlertCircle, 
    Inbox,
    Calendar,
    CircleDollarSign,
    Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewListPage() {
    const navigate = useNavigate();
    const { data: reviews, isLoading, error } = useGetEmployerPendingReviews();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full mb-4 shadow-lg shadow-primary-wera/10"></div>
                <p className="text-text-main/50 font-bold animate-pulse">Scanning for submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto p-12 mt-10 text-center bg-white rounded-3xl border border-slate-200 shadow-xl">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-accent-dark mb-2">Error Loading Reviews</h2>
                <p className="text-text-main/60 mb-6">{(error as Error).message}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl md:mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans pb-24">
            {/* Header */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary-wera/10 text-primary-wera border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                                Pending Review
                            </Badge>
                            <span className="text-text-main/30 text-xs font-bold uppercase tracking-widest">• {reviews?.length || 0} Submissions</span>
                        </div>
                        <h1 className="text-4xl font-black text-accent-dark tracking-tight">Work Reviews</h1>
                        <p className="text-text-main/60 font-medium text-lg mt-1">Review evidence and release payments for completed gigs.</p>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-4 bg-white border border-slate-200 rounded-[2rem] p-4 shadow-sm">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                            ))}
                        </div>
                        <div className="pr-4">
                            <p className="text-xs font-black text-text-main/40 uppercase tracking-widest">Active Talent</p>
                            <p className="text-sm font-bold text-accent-dark">Verified Professionals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            {(!reviews || reviews.length === 0) ? (
                <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[3rem] p-16 text-center border-dashed border-2">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                            <Inbox className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-3xl font-black text-accent-dark mb-4 tracking-tight">Your Inbox is Clean</h2>
                        <p className="text-text-main/60 font-medium leading-relaxed mb-8">
                            There are no submissions waiting for your approval right now. We'll notify you as soon as a worker uploads evidence.
                        </p>
                        <Button asChild variant="outline" className="rounded-2xl h-12 px-8 font-bold border-slate-200 hover:bg-slate-50">
                            <Link to="/employer">Return to Dashboard</Link>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review: any) => (
                        <Card 
                            key={review.id} 
                            className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden group hover:border-primary-wera/30 transition-all duration-300"
                        >
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left Panel: Worker & Gig Info */}
                                    <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-accent-dark shadow-md border border-slate-100 uppercase">
                                                {review.worker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-accent-dark">{review.worker.name}</h3>
                                                <p className="text-xs font-bold text-text-main/50 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> Submitted {format(new Date(review.submittedAt), 'MMM do')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-accent-dark text-white text-[10px] uppercase font-black px-3 py-1 rounded-lg">
                                                    {review.gig.category.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-text-main/70 font-bold">
                                                <Calendar className="w-4 h-4 text-primary-wera" />
                                                <span className="text-sm">Deadline was {format(new Date(review.deadlineAt), 'MMM do')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel: Content & Action */}
                                    <div className="p-8 flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-wera/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                                        
                                        <div className="relative z-10">
                                            <h4 className="text-2xl font-black text-accent-dark mb-2 group-hover:text-primary-wera transition-colors">
                                                {review.gig.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-text-main/30 uppercase tracking-[0.2em] mb-1">Contract Amount</span>
                                                    <span className="text-xl font-black text-accent-dark flex items-center gap-1.5">
                                                        <CircleDollarSign className="w-5 h-5 text-green-500" />
                                                        {review.gig.currency} {Number(review.gig.payAmount).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-text-main/30 uppercase tracking-[0.2em] mb-1">Evidence Files</span>
                                                    <span className="text-xl font-black text-accent-dark flex items-center gap-1.5">
                                                        <FileCheck className="w-5 h-5 text-blue-500" />
                                                        {review.evidence?.length || 0} Files
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
                                            <Button 
                                                onClick={() => navigate(`/employer/assignments/review/${review.id}`)}
                                                className="h-16 px-10 bg-primary-wera hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary-wera/20 group/btn transition-all active:scale-95"
                                            >
                                                Start Review
                                                <ArrowRight className="w-5 h-5 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <p className="text-[10px] text-center font-black text-text-main/30 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                                <Sparkles className="w-3 h-3 text-primary-wera" /> Secured by WeraLock
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
