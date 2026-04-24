import React from 'react';
import { Star, CheckCircle2, Sparkles, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkerMatch {
    workerId: string;
    workerName: string;
    matchScore: number;
    tags: string[];
    matchReason: string;
    matchedSkills: string[];
    missingSkills: string[];
    profile: {
        location: string | null;
        bio: string | null;
        avgRating: number;
        completedGigs: number;
        badges: number;
    };
}

interface RecommendedWorkerCardProps {
    match: WorkerMatch;
    rank: number;
}

export const RecommendedWorkerCard: React.FC<RecommendedWorkerCardProps> = ({ match, rank }) => {
    const getScoreTier = (score: number) => {
        if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (score >= 60) return { label: 'Good', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        return { label: 'Potential', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    const getTagStyle = (tag: string) => {
        switch (tag) {
            case 'top-rated': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'verified-skills': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'fresh-talent': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'early-career': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getTagLabel = (tag: string) => {
        switch (tag) {
            case 'top-rated': return '⭐ Top Rated';
            case 'verified-skills': return '✅ Verified Skills';
            case 'fresh-talent': return '🌱 Fresh Talent';
            case 'early-career': return '🚀 Early Career';
            default: return tag;
        }
    };

    const tier = getScoreTier(match.matchScore);

    return (
        <div className="p-4 bg-white rounded-xl border border-primary-wera/10 hover:border-primary-wera/30 hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
                {/* Rank + Avatar */}
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-wera/20 to-accent-dark/10 flex items-center justify-center border border-primary-wera/10">
                        <User className="w-6 h-6 text-primary-wera/70" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-accent-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {rank}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-text-main text-sm truncate">{match.workerName}</h4>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold shrink-0 ${tier.color}`}>
                            {Math.round(match.matchScore)}%
                        </Badge>
                    </div>

                    {/* Match reason */}
                    <p className="text-xs text-text-main/60 mb-2 line-clamp-1">{match.matchReason}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-[11px] text-text-main/50 mb-2">
                        {match.profile.avgRating > 0 && (
                            <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {match.profile.avgRating}
                            </span>
                        )}
                        <span className="flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            {match.profile.completedGigs} gig{match.profile.completedGigs !== 1 ? 's' : ''}
                        </span>
                        {match.profile.badges > 0 && (
                            <span className="flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3" />
                                {match.profile.badges} badge{match.profile.badges !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Tags + Matched skills */}
                    <div className="flex flex-wrap gap-1">
                        {match.tags.slice(0, 2).map(tag => (
                            <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getTagStyle(tag)}`}>
                                {getTagLabel(tag)}
                            </span>
                        ))}
                        {match.matchedSkills.slice(0, 2).map(skill => (
                            <span key={skill} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-wera/5 text-primary-wera border border-primary-wera/15">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Score bar */}
            <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                        match.matchScore >= 80 ? 'bg-green-500' : match.matchScore >= 60 ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(match.matchScore, 100)}%` }}
                />
            </div>
        </div>
    );
};
