import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationData {
    matchScore: number;
    matchReasons: string[];
    matchedSkills: string[];
    missingSkills: string[];
    tags: string[];
}

interface GigCardProps {
  gig: any;
  className?: string;
  recommendation?: RecommendationData;
}

export const GigCard: React.FC<GigCardProps> = ({ gig, className = '', recommendation }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-green-100 text-green-700 border-green-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' };
        if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
        return { bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' };
    };

    const images = [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    ];
    const imageToUse = images[(gig?.title || "").length % images.length];

    return (
        <Card 
            className={`group bg-[linear-gradient(to_bottom,#ffffff,#F6E8EA)] rounded-2xl overflow-hidden border border-transparent hover:border-primary-wera/30 hover:shadow-xl transition-all flex flex-col cursor-pointer ${className}`}
            onClick={() => navigate(`/worker/gigs/${gig.id}`)}
        >
            <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                <img 
                    alt={gig?.title || "Gig Image"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    src={imageToUse}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(gig?.status || "OPEN")} shadow-sm`}>
                        {(gig?.status || "OPEN").replace('_', ' ')}
                    </Badge>
                </div>
                {/* Match score badge overlay */}
                {recommendation && (
                    <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-md ${getScoreColor(recommendation.matchScore).bg} ${getScoreColor(recommendation.matchScore).text} border`}>
                            {Math.round(recommendation.matchScore)}% Match
                        </span>
                    </div>
                )}
            </div>

            <CardContent className="p-6 flex flex-col grow">
                <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-xl font-bold text-accent-dark leading-tight line-clamp-2">{gig?.title}</h3>
                    <span className="text-primary-wera font-bold text-lg whitespace-nowrap">
                        {gig?.currency} {Number(gig?.payAmount || 0).toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {gig?.workType && (
                        <span className="px-3 py-1 bg-white/80 rounded-lg text-xs font-semibold text-text-main shadow-sm border border-black/5">
                            {gig.workType.replace('_', ' ')}
                        </span>
                    )}
                    {(gig.skills || []).slice(0, 3).map((s: any) => (
                        <span key={s.skillId || s.skill?.id} className="px-3 py-1 bg-white/80 rounded-lg text-xs font-semibold text-text-main shadow-sm border border-black/5">
                            {s.skill?.name || 'Skill'}
                        </span>
                    ))}
                    {(gig.skills || []).length > 3 && (
                        <span className="px-3 py-1 bg-white/80 rounded-lg text-xs font-semibold text-text-main shadow-sm border border-black/5">
                            +{(gig.skills || []).length - 3} more
                        </span>
                    )}
                </div>

                {/* Match Reason Pills — only shown when recommendation data is provided */}
                {recommendation && recommendation.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 pt-3 border-t border-primary-wera/10">
                        {recommendation.matchReasons.slice(0, 3).map((reason: string, i: number) => (
                            <span 
                                key={i} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                {reason}
                            </span>
                        ))}
                        {recommendation.missingSkills.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertCircle className="w-3 h-3" />
                                {recommendation.missingSkills.length} skill{recommendation.missingSkills.length > 1 ? 's' : ''} to learn
                            </span>
                        )}
                    </div>
                )}

                {recommendation && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-text-main/60">Algorithm Match</span>
                            <span className={`text-xs font-bold ${getScoreColor(recommendation.matchScore).text}`}>
                                {Math.round(recommendation.matchScore)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ${getScoreColor(recommendation.matchScore).bar}`}
                                style={{ width: `${Math.min(recommendation.matchScore, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary-wera/10 relative z-20">
                    <div className="flex items-center gap-1.5 text-text-main/60 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{gig.location || "Remote"}</span>
                    </div>
                    
                    <button className="text-primary-wera font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

