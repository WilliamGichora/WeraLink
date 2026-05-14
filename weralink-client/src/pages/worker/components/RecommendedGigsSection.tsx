import React from 'react';
import { gigHooks } from '@/features/gigs/api/gig.api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, MapPin, ArrowRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const RecommendedGigsSection: React.FC = () => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return { bg: 'bg-green-500/10', text: 'text-green-600' };
        if (score >= 60) return { bg: 'bg-amber-500/10', text: 'text-amber-600' };
        return { bg: 'bg-slate-500/10', text: 'text-slate-600' };
    };

    const { data, isLoading } = gigHooks.useGetRecommendedGigs(3);
    const recommendations = data?.recommendations || [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                    <div key={n} className="h-48 bg-slate-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-800 border-dashed border-2 border-slate-200 dark:border-gray-700 rounded-[32px] overflow-hidden">
                <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-primary-wera/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-6 h-6 text-primary-wera" />
                    </div>
                    <h3 className="font-bold text-accent-dark dark:text-white mb-1">Finding your perfect match</h3>
                    <p className="text-sm text-text-main/60 dark:text-gray-400 mb-6">Complete more profile details or skills to get AI-powered recommendations.</p>
                    <Button asChild variant="outline" className="rounded-xl border-primary-wera text-primary-wera hover:bg-primary-wera/5">
                        <Link to="/worker/profile">Update Skills</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations.map((rec: any, index: number) => (
                <motion.div
                    key={rec.gig.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="group bg-card-bg-wera dark:bg-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-transparent hover:border-primary-wera/20 h-full flex flex-col">
                        <div className="p-6 flex flex-col grow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white/90 dark:bg-gray-700 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black text-accent-text dark:text-primary-wera uppercase tracking-widest shadow-sm border border-slate-100 dark:border-gray-600">
                                    {rec.gig.category?.replace('_', ' ')}
                                </div>
                                <div className={`flex items-center gap-1 ${getScoreColor(rec.matchScore).bg} ${getScoreColor(rec.matchScore).text} px-2 py-1 rounded-full text-xs font-bold`}>
                                    <Sparkles className="w-3 h-3" />
                                    {Math.round(rec.matchScore)}% Match
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-lg dark:text-white line-clamp-2 mb-2 group-hover:text-primary-wera transition-colors">{rec.gig.title}</h3>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-xs text-text-main/60 dark:text-gray-400">
                                    <Briefcase className="w-3.5 h-3.5 mr-2 shrink-0" />
                                    <span className="truncate">{rec.gig.employer?.name || 'WeraLink Employer'}</span>
                                </div>
                                {rec.gig.location && (
                                    <div className="flex items-center text-xs text-text-main/60 dark:text-gray-400">
                                        <MapPin className="w-3.5 h-3.5 mr-2 shrink-0" />
                                        <span className="truncate">{rec.gig.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase tracking-tighter text-text-main/40 dark:text-gray-500 font-bold">Payout</p>
                                    <p className="text-xl font-black text-primary-wera">
                                        {rec.gig.currency} {Number(rec.gig.payAmount).toLocaleString()}
                                    </p>
                                </div>
                                <Button asChild size="sm" className="bg-primary-wera hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary-wera/20 group-hover:translate-x-1 transition-transform">
                                    <Link to={`/worker/gigs/${rec.gig.id}`} state={{ recommendation: rec }}>
                                        Apply <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
