import { Receipt, Wallet, ClipboardCheck, Star, Search, ArrowRight, Landmark, ChevronRight, Loader2, History, GraduationCap } from "lucide-react";
import { useWorkerAnalytics } from "@/features/analytics/api/analytics.api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ActiveWorkSection } from "./components/ActiveWorkSection";
import { RecommendedGigsSection } from "./components/RecommendedGigsSection";
import { WorkerActivityFeed } from "./components/WorkerActivityFeed";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useWorkerAnalytics(1); 

  const kpis = analytics?.kpis || {};
  
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
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Habari, {user?.name?.split(' ')[0] || 'Worker'}!</h1>
                    <p className="text-gray-400 text-lg">Your WeraLink performance at a glance.</p>
                </div>
                <div className="mt-6 md:mt-0 flex gap-3">
                    <Link to={"/worker/reports"} className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-all backdrop-blur-md active:scale-95">
                        <Receipt className="w-4 h-4 mr-2" />
                        Reports
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 group shadow-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Monthly Earnings</p>
                            <h3 className="text-4xl font-black text-white group-hover:text-primary-wera transition-colors tracking-tighter">
                              {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : `KES ${(kpis.periodEarnings || 0).toLocaleString()}`}
                            </h3>
                        </div>
                        <div className="bg-primary-wera/20 p-3 rounded-2xl">
                            <Wallet className="w-6 h-6 text-primary-wera" />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center text-xs text-gray-400 font-medium">
                        <span className="bg-white/10 px-2 py-1 rounded-md">Total: KES {(kpis.totalEarnings || 0).toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 group shadow-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Gigs Completed</p>
                            <h3 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter">
                              {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : (kpis.periodGigsCompleted || 0)}
                            </h3>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-2xl">
                            <ClipboardCheck className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center text-xs text-gray-400 font-medium">
                        <span className="bg-white/10 px-2 py-1 rounded-md">All time applied: {kpis.totalGigsCompleted || 0}</span>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-all duration-500 group shadow-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Quality Rating</p>
                            <h3 className="text-4xl font-black text-white group-hover:text-yellow-400 transition-colors tracking-tighter">
                              {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : (
                                <>{kpis.avgRating || '—'}<span className="text-xl text-gray-500 font-normal">/5.0</span></>
                              )}
                            </h3>
                        </div>
                        <div className="bg-yellow-500/20 p-3 rounded-2xl">
                            <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center text-xs text-gray-400 font-medium">
                        <span className="bg-white/10 px-2 py-1 rounded-md">From {kpis.totalRatings || 0} reviews</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <main className="grow pb-24 z-20 relative mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Main Activity */}
                <div className="w-full lg:w-3/4 space-y-8">
                    {/* Active Work Snapshot */}
                    <section>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-2xl font-black text-accent-dark dark:text-white tracking-tight flex items-center gap-2">
                                Active Work Queue
                                <span className="bg-primary-wera/10 text-primary-wera text-xs px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Urgent</span>
                            </h2>
                            <Link to="/worker/assignments" className="text-primary-wera text-sm font-bold hover:underline flex items-center group">
                                View Full Queue
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <ActiveWorkSection />
                    </section>

                    {/* Recommendations Snapshot */}
                    <section>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-2xl font-black text-accent-dark dark:text-white tracking-tight">Top Algorithm Matches</h2>
                            <Link to="/worker/gigs/recommended" className="text-primary-wera text-sm font-bold hover:underline flex items-center group">
                                Explore All
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <RecommendedGigsSection />
                    </section>
                </div>
                
                {/* Right Column: Actions & Feed */}
                <aside className="w-full lg:w-1/4 space-y-6">
                    {/* Primary Workflows */}
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl border border-slate-100 dark:border-gray-700 p-8">
                        <h3 className="font-black text-accent-dark dark:text-white text-lg mb-6 uppercase tracking-widest border-b border-slate-50 dark:border-gray-700 pb-4">Quick Actions</h3>
                        <div className="space-y-4">
                            <Link to="/worker/analytics" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group border border-transparent hover:border-primary-wera/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Earnings & Analytics</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-wera" />
                            </Link>
                            
                            <Link to="/marketplace" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group border border-transparent hover:border-primary-wera/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Browse Marketplace</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-wera" />
                            </Link>

                            <Link to="/worker/learning-hub" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group border border-transparent hover:border-primary-wera/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Learning Hub</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-wera" />
                            </Link>

                            <Link to="/worker/history" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 hover:bg-primary-wera/5 dark:hover:bg-primary-wera/10 transition-all group border border-transparent hover:border-primary-wera/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm group-hover:text-primary-wera transition-colors">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-accent-dark dark:text-gray-200">Work History</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-wera" />
                            </Link>
                        </div>
                    </div>
                    
                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-xl border border-slate-100 dark:border-gray-700 p-8">
                        <h3 className="font-black text-accent-dark dark:text-white text-lg mb-6 uppercase tracking-widest">Activity</h3>
                        <WorkerActivityFeed />
                    </div>

                    {/* Bonus Card */}
                    <div className="bg-linear-to-br from-accent-dark to-black rounded-[32px] shadow-2xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-wera/20 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary-wera/30 transition-colors"></div>
                        <div className="relative z-10">
                            <h3 className="font-black text-2xl mb-2 tracking-tighter">Cold Start Boost</h3>
                            <p className="text-gray-300 text-sm mb-6 leading-relaxed">Complete your next verification module to increase your match score by <span className="text-primary-wera font-black">15%</span>.</p>
                            <Button asChild className="w-full bg-primary-wera hover:bg-primary-dark text-white font-black rounded-2xl py-6 shadow-xl shadow-primary-wera/20 transition-all active:scale-95">
                                <Link to="/worker/learning-hub">Go to Learning Hub</Link>
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
      </main>
    </div>
  );
}
