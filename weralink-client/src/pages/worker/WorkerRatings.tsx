import { useProfile } from '@/features/profile/hooks/useProfile';
import { useGetUserRatings } from '@/features/ratings/api/rating.api';
import { RatingSummaryCard } from '@/features/ratings/components/RatingSummaryCard';
import { RatingsList } from '@/features/ratings/components/RatingsList';
import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WorkerRatings() {
  const { data: profile } = useProfile();
  const userId = profile?.user?.id;
  
  const [page] = useState(1);
  const { data: ratingsData, isLoading: loadingRatings } = useGetUserRatings(userId, page, 20);

  const formattedRatings = (ratingsData?.data || []).map((r: any) => ({
    id: r.id,
    score: r.score,
    comment: r.comment,
    createdAt: r.createdAt,
    rater: {
      name: r.rater?.name || 'WeraLink Employer',
    },
    assignment: {
      gig: {
        title: r.assignment?.gig?.title || 'Past Gig',
        category: r.assignment?.gig?.category || 'General',
      }
    }
  }));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Hero Header */}
      <header className="bg-accent-dark text-white pt-12 pb-24 px-4 md:px-8 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-wera/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-wera/5 blur-[80px] rounded-full -ml-20 -mb-20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link 
            to="/worker/profile" 
            className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-8 text-xs font-black uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
                Ratings & <span className="text-primary-wera">Feedback</span>
              </h1>
              <p className="text-white/60 text-lg font-medium max-w-xl leading-relaxed">
                Your reputation is your strongest currency. Here's a detailed breakdown of how employers perceive your work and professionalism.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="bg-primary-wera/20 p-2 rounded-xl">
                <Star className="w-5 h-5 text-primary-wera fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Reputation Score</p>
                <p className="text-sm font-bold text-white">Verified by WeraLink</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Aggregate Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <RatingSummaryCard 
                userId={userId} 
                className="shadow-xl shadow-slate-200/50 rounded-[2.5rem]" 
              />
              
              <div className="mt-6 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-xs font-black text-accent-dark/40 uppercase tracking-widest mb-4">Improve your score</h3>
                <ul className="space-y-3">
                  {[
                    "Meet deadlines consistently",
                    "Maintain clear communication",
                    "Deliver high-quality results"
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-text-main/70">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content: Detailed Feedback List */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-accent-dark tracking-tight flex items-center gap-3">
                Recent Reviews
                <span className="text-xs font-bold text-text-main/30 uppercase tracking-widest">• {formattedRatings.length} total</span>
              </h2>
            </div>

            <RatingsList 
              ratings={formattedRatings} 
              isLoading={loadingRatings}
              emptyMessage="You haven't received any reviews yet. Complete your first gig to start building your reputation!"
            />

            {ratingsData?.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <p className="text-sm font-bold text-text-main/40 uppercase tracking-widest">
                  More reviews coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
