import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GigCardProps {
  gig: any;
  className?: string;
}

export const GigCard: React.FC<GigCardProps> = ({ gig, className = '' }) => {
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

    const images = [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    ];
    const imageToUse = images[gig.title.length % images.length];

    return (
        <Card 
            className={`group bg-[linear-gradient(to_bottom,#ffffff,#F6E8EA)] rounded-2xl overflow-hidden border border-transparent hover:border-primary-wera/30 hover:shadow-xl transition-all flex flex-col cursor-pointer ${className}`}
            onClick={() => navigate(`/worker/gigs/${gig.id}`)}
        >
            <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                <img 
                    alt={gig.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    src={imageToUse}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(gig.status)} shadow-sm`}>
                        {gig.status.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-xl font-bold text-accent-dark leading-tight line-clamp-2">{gig.title}</h3>
                    <span className="text-primary-wera font-bold text-lg whitespace-nowrap">
                        {gig.currency} {Number(gig.payAmount).toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 mt-auto pt-4">
                    {gig.workType && (
                        <span className="px-3 py-1 bg-white/80 rounded-lg text-xs font-semibold text-text-main shadow-sm border border-black/5">
                            {gig.workType.replace('_', ' ')}
                        </span>
                    )}
                    {(gig.skills || []).slice(0, 3).map((s: any) => (
                        <span key={s.skillId} className="px-3 py-1 bg-white/80 rounded-lg text-xs font-semibold text-text-main shadow-sm border border-black/5">
                            {s.skill?.name || 'Skill'}
                        </span>
                    ))}
                    {(gig.skills || []).length > 3 && (
                        <span className="px-3 py-1 bg-white/80 rounded-lg text-xs font-semibold text-text-main shadow-sm border border-black/5">
                            +{(gig.skills || []).length - 3} more
                        </span>
                    )}
                </div>

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
