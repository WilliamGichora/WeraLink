import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Search, Sparkles, TrendingUp, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GigCard } from '@/features/gigs/components/GigCard';
import { gigHooks } from '@/features/gigs/api/gig.api';

type ScoreTier = 'all' | 'perfect' | 'good' | 'explore';

export default function RecommendedGigsPage() {
    const navigate = useNavigate();
    const [activeTier, setActiveTier] = useState<ScoreTier>('all');
    const { data, isLoading, isError, refetch } = gigHooks.useGetRecommendedGigs(30);

    const recommendations = data?.recommendations || [];
    
    // Filter by score tier
    const filteredRecs = recommendations.filter((rec: any) => {
        switch (activeTier) {
            case 'perfect': return rec.matchScore >= 80;
            case 'good': return rec.matchScore >= 60 && rec.matchScore < 80;
            case 'explore': return rec.matchScore < 60;
            default: return true;
        }
    });

    // Compute summary stats
    const perfectCount = recommendations.filter((r: any) => r.matchScore >= 80).length;
    const goodCount = recommendations.filter((r: any) => r.matchScore >= 60 && r.matchScore < 80).length;
    const exploreCount = recommendations.filter((r: any) => r.matchScore < 60).length;

    // Find strongest category among recommendations
    const categoryCount: Record<string, number> = {};
    recommendations.forEach((r: any) => {
        const cat = r.gig?.category;
        if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

    const tierOptions: { key: ScoreTier; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: recommendations.length },
        { key: 'perfect', label: 'Perfect Match ≥80%', count: perfectCount },
        { key: 'good', label: 'Good Match ≥60%', count: goodCount },
        { key: 'explore', label: 'Explore', count: exploreCount },
    ];

    return (
        <div className="min-h-screen bg-background-light pb-16 font-sans text-text-main animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="bg-accent-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera/15 rounded-full blur-3xl" />
                    <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-primary-wera/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-primary-wera/20 p-2 rounded-lg">
                                    <Target className="w-5 h-5 text-primary-wera" />
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">
                                    Algorithm Matches
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Recommended for You</h1>
                            <p className="text-gray-400 text-lg max-w-xl">
                                Gigs handpicked by our algorithm based on your skills, experience, and performance history.
                            </p>
                        </div>

                        {/* Stats Summary Cards */}
                        {!isLoading && recommendations.length > 0 && (
                            <div className="flex gap-3">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[100px]">
                                    <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-primary-wera" /> Matches
                                    </p>
                                    <p className="text-2xl font-bold text-white">{recommendations.length}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[100px]">
                                    <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-green-400" /> Perfect
                                    </p>
                                    <p className="text-2xl font-bold text-green-400">{perfectCount}</p>
                                </div>
                                {topCategory && (
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[100px] hidden md:block">
                                        <p className="text-xs text-gray-400 font-medium mb-0.5">Top Category</p>
                                        <p className="text-lg font-bold text-white capitalize">
                                            {topCategory[0].replace('_', ' ').toLowerCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
                {/* Score Tier Tabs */}
                <div className="bg-white border border-primary-wera/10 rounded-xl p-2 flex flex-wrap gap-1 shadow-sm mb-8">
                    {tierOptions.map(tier => (
                        <button
                            key={tier.key}
                            onClick={() => setActiveTier(tier.key)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                                activeTier === tier.key
                                    ? 'bg-accent-dark text-white shadow-md'
                                    : 'text-text-main/70 hover:bg-slate-50'
                            }`}
                        >
                            {tier.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTier === tier.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-text-main/50'
                            }`}>
                                {tier.count}
                            </span>
                        </button>
                    ))}

                    <div className="ml-auto flex items-center">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-text-main/50 hover:text-text-main text-xs gap-1"
                            onClick={() => refetch()}
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="bg-white rounded-2xl h-80 border border-primary-wera/5 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <div className="text-center p-16 bg-white border border-red-100 rounded-2xl shadow-sm">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-accent-dark mb-2">Couldn't load recommendations</h3>
                        <p className="text-text-main/60 max-w-md mx-auto mb-6">
                            Something went wrong while computing your matches. Please try again.
                        </p>
                        <Button 
                            className="bg-primary-wera text-white font-bold hover:bg-primary-dark"
                            onClick={() => refetch()}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Retry
                        </Button>
                    </div>
                )}

                {/* Results Grid */}
                {!isLoading && !isError && filteredRecs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRecs.map((rec: any) => (
                            <GigCard
                                key={rec.gig.id}
                                gig={rec.gig}
                                recommendation={{
                                    matchScore: rec.matchScore,
                                    matchReasons: rec.matchReasons || [],
                                    matchedSkills: rec.matchedSkills || [],
                                    missingSkills: rec.missingSkills || [],
                                    tags: rec.tags || [],
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredRecs.length === 0 && (
                    <div className="text-center p-16 bg-white border border-primary-wera/10 rounded-2xl shadow-sm">
                        <div className="w-16 h-16 bg-primary-wera/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-primary-wera/60" />
                        </div>
                        
                        {recommendations.length === 0 ? (
                            <>
                                <h3 className="text-xl font-bold text-accent-dark mb-2">No recommendations yet</h3>
                                <p className="text-text-main/60 max-w-md mx-auto mb-6">
                                    Complete your profile and add skills so our algorithm can start matching you with the perfect gigs.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button 
                                        className="bg-primary-wera text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary-wera/20"
                                        onClick={() => navigate('/worker/profile')}
                                    >
                                        <User className="w-4 h-4 mr-2" /> Complete Profile
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="border-primary-wera text-primary-wera font-bold hover:bg-primary-wera/5"
                                        onClick={() => navigate('/worker/gigs')}
                                    >
                                        <Search className="w-4 h-4 mr-2" /> Browse All Gigs
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-accent-dark mb-2">
                                    No gigs in this tier
                                </h3>
                                <p className="text-text-main/60 max-w-md mx-auto mb-4">
                                    No gigs match the "{tierOptions.find(t => t.key === activeTier)?.label}" filter. Try a different tier or view all matches.
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="border-primary-wera text-primary-wera font-bold hover:bg-primary-wera/5"
                                    onClick={() => setActiveTier('all')}
                                >
                                    View All Matches
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {/* Footer info */}
                {!isLoading && !isError && recommendations.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-xs text-text-main/40 font-medium">
                            Powered by WeraLink Matching Algorithm v1.0 • Based on your skills, experience, and performance
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
