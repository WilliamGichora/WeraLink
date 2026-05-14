import { Link } from "react-router-dom";
import { Wallet, ClipboardCheck, Briefcase, PlusCircle, Sheet, Loader2, Users, ArrowRight, FileCheck } from "lucide-react";
import { useEmployerAnalytics } from "@/features/analytics/api/analytics.api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PendingReviewsSection } from "./components/PendingReviewsSection";
import { NewApplicantsSection } from "./components/NewApplicantsSection";
import { GigsSummarySection } from "./components/GigsSummarySection";
import { EmployerActivityFeed } from "./components/EmployerActivityFeed";

export default function EmployerDashboard() {
    const { user } = useAuth();
    const { data: analytics, isLoading } = useEmployerAnalytics(1);
    
    const kpis = analytics?.kpis || {};
    const activeGigs = (kpis.totalGigsPosted || 0) - (kpis.totalGigsCompleted || 0);
    const completionRate = kpis.totalGigsPosted ? Math.round((kpis.totalGigsCompleted / kpis.totalGigsPosted) * 100) : 0;

    return (
        <div className="min-h-screen bg-background-light dark:bg-black font-sans">
            <header className="bg-accent-dark text-white pt-12 pb-12 dark:bg-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera rounded-full blur-3xl"></div>
                    <div className="absolute left-20 bottom-10 w-64 h-64 bg-accent-text rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome, {user?.name?.split(' ')[0] || 'Employer'}!</h1>
                            <p className="text-gray-400 text-lg">Your hiring and management hub.</p>
                        </div>
                        <div className="mt-6 md:mt-0 flex gap-3">
                            <Link to="/employer/reports" className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-all backdrop-blur-md active:scale-95">
                                <Sheet className="w-4 h-4 mr-2" />
                                Reports
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 group shadow-2xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Spent (Month)</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-primary-wera transition-colors tracking-tighter">
                                      {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : `KES ${(kpis.periodSpending || 0).toLocaleString()}`}
                                    </h3>
                                </div>
                                <div className="bg-primary-wera/20 p-3 rounded-2xl">
                                    <Wallet className="w-6 h-6 text-primary-wera" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 group shadow-2xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Active Gigs</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter">
                                      {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : activeGigs}
                                    </h3>
                                </div>
                                <div className="bg-blue-500/20 p-3 rounded-2xl">
                                    <Briefcase className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 group shadow-2xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Completion Rate</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-green-400 transition-colors tracking-tighter">
                                      {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : `${completionRate}%`}
                                    </h3>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-2xl">
                                    <ClipboardCheck className="w-6 h-6 text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="grow pb-24 z-20 relative mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Management */}
                        <div className="w-full lg:w-3/4 space-y-8">
                            {/* Pending Work Reviews */}
                            <section>
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h2 className="text-2xl font-black text-accent-dark dark:text-white tracking-tight flex items-center gap-2">
                                        Needs Review
                                        <span className="bg-primary-wera/10 text-primary-wera text-xs px-2 py-0.5 rounded-full uppercase tracking-widest font-black animate-pulse">Action Required</span>
                                    </h2>
                                    <Link to="/employer/reviews" className="text-primary-wera text-sm font-bold hover:underline flex items-center group">
                                        Full Queue
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <PendingReviewsSection />
                            </section>

                            {/* My Gigs Status Overview */}
                            <section>
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h2 className="text-2xl font-black text-accent-dark dark:text-white tracking-tight">Gig Portfolio Summary</h2>
                                    <Link to="/employer/gigs" className="text-primary-wera text-sm font-bold hover:underline flex items-center group">
                                        Manage All
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <GigsSummarySection />
                            </section>
                        </div>

                        {/* Right Column: Applicants & Actions */}
                        <aside className="w-full lg:w-1/4 space-y-6">
                            {/* Post New Gig Action */}
                            <Link to="/employer/gigs/new" className="w-full bg-primary-wera hover:bg-primary-dark text-white p-6 rounded-[32px] font-black shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-2 text-xl group shadow-primary-wera/30">
                                <PlusCircle className="w-10 h-10 text-white mb-1 group-hover:rotate-90 transition-transform duration-500" />
                                Post a New Gig
                            </Link>

                            {/* Smart Navigation Workflows */}
                            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl border border-slate-100 dark:border-gray-700 p-8">
                                <h3 className="font-black text-accent-dark dark:text-white text-lg mb-6 uppercase tracking-widest border-b border-slate-50 dark:border-gray-700 pb-4">Quick Actions</h3>
                                <div className="space-y-4">
                                    <Link to="/employer/applicants-global" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Manage Applicants</span>
                                        </div>
                                    </Link>
                                    
                                    <Link to="/employer/history" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Hiring History</span>
                                        </div>
                                    </Link>

                                    <Link to="/employer/reviews" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                                <FileCheck className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Work Reviews</span>
                                        </div>
                                    </Link>

                                    <Link to="/employer/analytics" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                                <Sheet className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Performance Insights</span>
                                        </div>
                                    </Link>
                                </div>

                                {/* New Applicants List Preview */}
                                <NewApplicantsSection />
                            </div>

                            {/* Recent Activity Feed */}
                            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl border border-slate-100 dark:border-gray-700 p-8">
                                <h3 className="font-black text-accent-dark dark:text-white text-lg mb-6 uppercase tracking-widest">Platform Activity</h3>
                                <EmployerActivityFeed />
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
