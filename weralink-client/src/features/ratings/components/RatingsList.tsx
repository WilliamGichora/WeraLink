import { Star, User, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { memo } from 'react';

interface Rating {
  id: string;
  score: number;
  comment?: string;
  createdAt: string;
  rater: {
    name: string;
    profile?: {
      location?: string;
    };
  };
  assignment: {
    gig: {
      title: string;
      category: string;
    };
  };
}

interface RatingsListProps {
  ratings: Rating[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * A beautiful, standardized list of ratings and feedback.
 * Used in both Worker and Employer profile/ratings views.
 */
export const RatingsList = memo(function RatingsList({ 
  ratings, 
  isLoading, 
  emptyMessage = "No ratings or feedback received yet." 
}: RatingsListProps) {
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white border-slate-100 rounded-2xl animate-pulse">
            <CardContent className="p-6 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <Card className="bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-accent-dark mb-1">Silence is Golden...</h3>
          <p className="text-text-main/50 max-w-xs">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {ratings.map((rating) => (
        <Card 
          key={rating.id} 
          className="bg-white border-slate-100 hover:border-primary-wera/30 transition-all duration-300 rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary-wera/5"
        >
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Left: Rater & Score */}
              <div className="p-6 md:w-56 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-lg font-black text-accent-dark shadow-sm border border-slate-100 mb-4 uppercase">
                  {rating.rater.name.charAt(0)}
                </div>
                <h4 className="font-bold text-accent-dark truncate w-full mb-1">{rating.rater.name}</h4>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-3.5 h-3.5 ${s <= rating.score ? 'fill-current' : 'text-slate-200 fill-none'}`} 
                    />
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-text-main/40 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(rating.createdAt), 'MMM yyyy')}
                </div>
              </div>

              {/* Right: Feedback Content */}
              <div className="p-6 flex-1 relative">
                <div className="absolute top-4 right-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <MessageSquare className="w-24 h-24 rotate-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-primary-wera/10 text-primary-wera px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {rating.assignment.gig.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-text-main/40 truncate">
                      for "{rating.assignment.gig.title}"
                    </span>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute -left-2 -top-2 text-4xl text-primary-wera/10 font-serif leading-none">"</span>
                    <p className="text-text-main/80 font-medium leading-relaxed italic pr-4">
                      {rating.comment || "The rater didn't leave a written comment, but gave a high score for performance."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
