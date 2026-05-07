import { useAuth } from '@/features/auth/context/AuthContext';
import { useGetUserRatings } from '@/features/ratings/api/rating.api';
import { RatingSummaryCard } from '@/features/ratings/components/RatingSummaryCard';
import { RatingsList } from '@/features/ratings/components/RatingsList';
import { ArrowLeft, Award, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * EmployerRatings Page
 * 
 * Allows employers to view their reputation as perceived by workers.
 * Essential for transparency and trust building in the marketplace.
 */
export default function EmployerRatings() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [page] = useState(1);
  const { data: ratingsData, isLoading: loadingRatings } = useGetUserRatings(userId, page, 20);

  // Map the backend structure to what RatingsList expects
  const formattedRatings = (ratingsData?.data || []).map((r: any) => ({
    id: r.id,
    score: r.score,
    comment: r.comment,
    createdAt: r.createdAt,
    rater: {
      name: r.rater?.name || 'WeraLink Worker',
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
            to="/employer" 
            className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-8 text-xs font-black uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
                Your <span className="text-primary-wera">Reputation</span>
              </h1>
              <p className="text-white/60 text-lg font-medium max-w-xl leading-relaxed">
                A strong employer brand attracts high-quality talent. Monitor your feedback to understand how you can improve your collaboration experience.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="bg-primary-wera/20 p-2 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-primary-wera" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Employer Trust</p>
                <p className="text-sm font-bold text-white">Verified Identity</p>
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
              
              <div className="mt-6 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-accent-dark mb-2">Build Your Brand</h3>
                <p className="text-sm font-medium text-text-main/60 leading-relaxed mb-6">
                  Employers with higher ratings get up to 40% more high-quality applications.
                </p>
                <div className="text-[10px] font-black text-primary-wera uppercase tracking-widest bg-primary-wera/5 py-2 rounded-lg">
                  Top 10% Employer
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Detailed Feedback List */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-accent-dark tracking-tight flex items-center gap-3">
                Worker Feedback
                <span className="text-xs font-bold text-text-main/30 uppercase tracking-widest">• {formattedRatings.length} total</span>
              </h2>
            </div>

            <RatingsList 
              ratings={formattedRatings} 
              isLoading={loadingRatings}
              emptyMessage="You haven't received any feedback from workers yet. Once a gig is completed, workers can rate their experience with you."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
