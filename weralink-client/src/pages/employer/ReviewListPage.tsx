import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetEmployerHistory } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Clock, 
    ArrowRight, 
    Inbox,
    CircleDollarSign,
    Sparkles,
    History as HistoryIcon} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'pending' | 'archive';

export default function ReviewListPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    // Fetch pending: SUBMITTED
    // Fetch archive: APPROVED, PAID, REVISION_REQUESTED, DISPUTED
    const pendingStatuses = ['SUBMITTED'];
    const archiveStatuses = ['APPROVED', 'PAID', 'REVISION_REQUESTED', 'DISPUTED'];

    const { data: pendingReviews, isLoading: loadingPending } = useGetEmployerHistory(pendingStatuses);
    const { data: archiveReviews, isLoading: loadingArchive } = useGetEmployerHistory(archiveStatuses);

    const isLoading = loadingPending || loadingArchive;
    const reviews = activeTab === 'pending' ? pendingReviews : archiveReviews;

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return { label: 'Action Required', color: 'bg-primary-wera/10 text-primary-wera border-primary-wera/20' };
            case 'APPROVED': return { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' };
            case 'PAID': return { label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' };
            case 'REVISION_REQUESTED': return { label: 'Revision Needed', color: 'bg-amber-100 text-amber-700 border-amber-200' };
            case 'DISPUTED': return { label: 'In Dispute', color: 'bg-red-100 text-red-700 border-red-200' };
            default: return { label: status, color: 'bg-slate-100 text-slate-500' };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full mb-4 shadow-lg shadow-primary-wera/10"></div>
                <p className="text-text-main/50 font-bold animate-pulse">Scanning submissions...</p>
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
                                Submission Center
                            </Badge>
                            <span className="text-text-main/30 text-xs font-bold uppercase tracking-widest">• {pendingReviews?.length || 0} Pending</span>
                        </div>
                        <h1 className="text-4xl font-black text-accent-dark tracking-tight">Work Reviews</h1>
                        <p className="text-text-main/60 font-medium text-lg mt-1">Manage and track all work submissions from your hired talent.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 w-fit">
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'pending' ? 'bg-white text-accent-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Pending Review
                        </button>
                        <button 
                            onClick={() => setActiveTab('archive')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'archive' ? 'bg-white text-accent-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            History Archive
                        </button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            {(!reviews || reviews.length === 0) ? (
                <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[3rem] p-16 text-center border-dashed border-2">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                            {activeTab === 'pending' ? <Inbox className="w-10 h-10 text-slate-300" /> : <HistoryIcon className="w-10 h-10 text-slate-300" />}
                        </div>
                        <h2 className="text-3xl font-black text-accent-dark mb-4 tracking-tight">
                            {activeTab === 'pending' ? "No pending reviews" : "Archive is empty"}
                        </h2>
                        <p className="text-text-main/60 font-medium leading-relaxed mb-8">
                            {activeTab === 'pending' 
                                ? "There are no submissions waiting for your approval right now. We'll notify you as soon as a worker uploads evidence."
                                : "You haven't reviewed any work submissions yet. Approved or past work records will appear here."}
                        </p>
                        <Button asChild variant="outline" className="rounded-2xl h-12 px-8 font-bold border-slate-200 hover:bg-slate-50">
                            <Link to="/employer">Return to Dashboard</Link>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review: any) => {
                        const statusConfig = getStatusDisplay(review.status);
                        return (
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
                                                        <Clock className="w-3 h-3" /> 
                                                        {review.submittedAt ? `Submitted ${format(new Date(review.submittedAt), 'MMM do')}` : 'Not yet submitted'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={`${statusConfig.color} text-[10px] uppercase font-black px-3 py-1 rounded-lg border`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                    <Badge className="bg-accent-dark text-white text-[10px] uppercase font-black px-3 py-1 rounded-lg border-none">
                                                        {review.gig.category.replace('_', ' ')}
                                                    </Badge>
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
                                                        <span className="text-[10px] font-black text-text-main/30 uppercase tracking-[0.2em] mb-1">Work History</span>
                                                        <span className="text-sm font-bold text-text-main/60">
                                                            {review.status === 'PAID' ? 'Paid & Completed' : review.status === 'APPROVED' ? 'Payment Pending' : 'Review in progress'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
                                                <Button 
                                                    onClick={() => navigate(`/employer/assignments/review/${review.id}`)}
                                                    className={`h-16 px-10 rounded-2xl font-black shadow-xl group/btn transition-all active:scale-95 ${review.status === 'SUBMITTED' ? 'bg-primary-wera hover:bg-primary-dark text-white shadow-primary-wera/20' : 'bg-accent-dark hover:bg-black text-white shadow-slate-900/10'}`}
                                                >
                                                    {review.status === 'SUBMITTED' ? 'Start Review' : 'View Submission'}
                                                    <ArrowRight className="w-5 h-5 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                                <p className="text-[10px] text-center font-black text-text-main/30 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-primary-wera" /> Secured by Supabase Storage
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
