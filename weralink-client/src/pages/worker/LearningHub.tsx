import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, PlayCircle, Award, CheckCircle2, XCircle, Search, RefreshCw, GraduationCap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trainingHooks } from '@/features/training/api/training.api';
import type { TrainingModule } from '@/features/training/api/training.api';

export default function LearningHubPage() {
    const navigate = useNavigate();
    const { data: modules, isLoading, isError, refetch } = trainingHooks.useGetModules();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredModules = modules?.filter(mod => 
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        mod.skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const stats = {
        total: modules?.length || 0,
        passed: modules?.filter(m => m.status === 'PASSED').length || 0,
        pending: modules?.filter(m => m.status !== 'PASSED').length || 0,
    };

    return (
        <div className="min-h-screen bg-background-light pb-16 font-sans text-text-main animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="bg-accent-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-stitch-primary/20 rounded-full blur-3xl" />
                    <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-stitch-primary/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-stitch-primary/20 p-2 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-stitch-primary" />
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase text-stitch-primary">
                                    Verification Gate
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Learning Hub</h1>
                            <p className="text-gray-400 text-lg max-w-xl">
                                Level up your skills, complete verification assessments, and earn system badges to unlock higher-paying gigs.
                            </p>
                        </div>

                        {/* Stats Summary Cards */}
                        {!isLoading && modules && modules.length > 0 && (
                            <div className="flex gap-3">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[100px]">
                                    <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3 text-stitch-primary" /> Available
                                    </p>
                                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[100px]">
                                    <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-green-400" /> Verified
                                    </p>
                                    <p className="text-2xl font-bold text-green-400">{stats.passed}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
                
                {/* Search & Filter Bar */}
                <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col md:flex-row gap-4 shadow-sm mb-8 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stitch-primary/30 text-sm"
                        />
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 hover:text-slate-900 text-xs gap-1 whitespace-nowrap"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white rounded-2xl h-64 border border-slate-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <div className="text-center p-16 bg-white border border-red-100 rounded-2xl shadow-sm">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Couldn't load modules</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Something went wrong while fetching your learning modules.
                        </p>
                        <Button className="bg-stitch-primary hover:bg-stitch-primary/90 text-white font-bold" onClick={() => refetch()}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Retry
                        </Button>
                    </div>
                )}

                {/* Grid */}
                {!isLoading && !isError && filteredModules.length > 0 && (
                    <div className="space-y-12">
                        {/* Recommended Section */}
                        {filteredModules.some(m => m.isRecommended) && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-stitch-primary/10 p-1.5 rounded-lg">
                                        <Target className="w-5 h-5 text-stitch-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">Recommended for Your Skills</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredModules.filter(m => m.isRecommended).map((mod) => (
                                        <ModuleCard key={mod.id} mod={mod} navigate={navigate} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Other Modules Section */}
                        {filteredModules.some(m => !m.isRecommended) && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 pt-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Explore Other Skills</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredModules.filter(m => !m.isRecommended).map((mod) => (
                                        <ModuleCard key={mod.id} mod={mod} navigate={navigate} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredModules.length === 0 && (
                    <div className="text-center p-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No modules found</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Try searching for something else or add more skills to your profile.
                        </p>
                        <Button onClick={() => navigate('/worker/profile')} className="bg-stitch-primary hover:bg-stitch-primary/90 text-white font-bold">
                            Go to Profile
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ModuleCard({ mod, navigate }: { mod: TrainingModule, navigate: (path: string) => void }) {
    return (
        <div key={mod.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-stitch-primary/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                        <Award className="w-6 h-6 text-stitch-primary" />
                    </div>
                    {mod.status === 'PASSED' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Level {mod.skillLevel}
                        </span>
                    ) : mod.status === 'FAILED' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                            <XCircle className="w-3.5 h-3.5" /> Retake Available
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            Not Started
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {mod.title}
                </h3>
                <p className="text-sm font-medium text-stitch-primary mb-4">
                    {mod.skill.name} • {mod.skill.category}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6">
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Pass Score: {mod.passScore}%
                    </span>
                    {mod.bestScore !== null && (
                        <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" /> Best: {mod.bestScore}%
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <Button 
                    onClick={() => navigate(`/worker/learning-hub/${mod.id}`)}
                    className={`w-full font-bold shadow-sm ${mod.status === 'PASSED' ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-stitch-primary hover:bg-stitch-primary/90 text-white'}`}
                >
                    <PlayCircle className="w-4 h-4 mr-2" /> 
                    {mod.status === 'PASSED' ? 'Review Module' : 'Start Assessment'}
                </Button>
            </div>
        </div>
    );
}
