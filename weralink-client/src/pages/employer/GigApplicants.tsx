import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetGigApplicants } from '@/features/execution/api/execution.api';
import { gigHooks } from '@/features/gigs/api/gig.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Filter, 
  ChevronRight, 
  Zap, 
  AlertCircle 
} from 'lucide-react';

export default function GigApplicants() {
  const { id: gigId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Layer 1: Fetch Applicants
  const { data: applicants, isLoading: applicantsLoading, error: applicantsError } = useGetGigApplicants(gigId);
  
  // Layer 2: Fetch Gig Details (Independently for the header)
  const { data: gig, isLoading: gigLoading } = gigHooks.useGetGigById(gigId);

  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);

  const filteredApplicants = (applicants || []).filter((app: any) => {
    const matchesSearch = app.worker.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = app.matchScore >= minScore;
    return matchesSearch && matchesScore;
  });

  const isLoading = applicantsLoading || gigLoading;
  const error = applicantsError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full shadow-lg"></div>
        <p className="text-text-main/50 font-bold animate-pulse">Loading Candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-accent-dark mb-3">Failed to load applicants</h2>
        <p className="text-text-main/60 mb-8 font-medium">{error instanceof Error ? error.message : 'Something went wrong while fetching data.'}</p>
        <Button asChild className="rounded-xl px-8 h-12 bg-accent-dark hover:bg-black font-bold">
          <Link to="/employer/gigs">Return to Manage Gigs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <Link to="/employer/gigs" className="flex items-center gap-2 text-primary-wera hover:text-primary-dark font-bold text-sm mb-4 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Gigs
          </Link>
          <h1 className="text-4xl font-black text-accent-dark tracking-tight mb-2">Review Applicants</h1>
          <p className="text-text-main/70 font-medium text-lg">
            Candidates for <span className="text-accent-dark font-bold underline decoration-primary-wera/30 underline-offset-4">"{gig?.title || 'this gig'}"</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/40" />
            <Input 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 rounded-xl focus:ring-primary-wera h-11"
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 h-11 gap-2 font-bold text-accent-dark">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      {gig?.status === 'CANCELLED' && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 text-lg">This gig has been cancelled</h3>
            <p className="text-red-700 font-medium">You can no longer hire or review candidates for this gig. Active applications have been nullified.</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      {filteredApplicants.length === 0 ? (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Star className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-accent-dark mb-2">No Candidates Found</h3>
            <p className="text-text-main/60 mb-8 font-medium">
              {gig?.status === 'CANCELLED' 
                ? 'There are no active candidates because this gig was cancelled.' 
                : 'No workers have applied to this gig yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplicants.map((app: any) => (
            <Card key={app.id} className="group relative bg-white border-slate-200 hover:border-primary-wera transition-all duration-300 hover:shadow-2xl hover:shadow-primary-wera/10 rounded-3xl overflow-hidden flex flex-col">
              
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-lg border-2 ${
                  app.matchScore >= 85 ? 'bg-primary-wera text-white border-white/20' : 
                  app.matchScore >= 70 ? 'bg-accent-dark text-white border-white/10' : 
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <span className="text-xs font-black leading-none opacity-80 uppercase">Fit</span>
                  <span className="text-lg font-black leading-none">{app.matchScore}%</span>
                </div>
              </div>

              <CardContent className="p-6 grow">
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-accent-dark font-black text-xl shadow-inner uppercase shrink-0">
                    {app.worker.name.charAt(0)}
                  </div>
                  <div className="min-w-0 pr-12">
                    <h3 className="font-bold text-accent-dark text-lg truncate group-hover:text-primary-wera transition-colors">{app.worker.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-black tracking-tight">{app.matchBreakdown?.ratingMultiplier > 1 ? '4.8' : '4.2'}</span>
                      <span className="text-text-main/40 text-xs font-bold ml-1">(12 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Match Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {app.matchTags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                      {tag.replace('-', ' ')}
                    </Badge>
                  ))}
                  {app.matchedSkills.length > 0 && (
                    <Badge variant="outline" className="bg-primary-wera/5 text-primary-wera border-primary-wera/20 px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                      {app.matchedSkills.length} Skills Matched
                    </Badge>
                  )}
                </div>

                {/* Meta Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-text-main/70">
                    <MapPin className="w-4 h-4 text-primary-wera" />
                    <span className="font-medium truncate">{app.worker.profile?.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-main/70">
                    <Clock className="w-4 h-4 text-primary-wera" />
                    <span className="font-medium">Applied {new Date(app.offeredAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Summary Bio */}
                <p className="text-sm text-text-main/60 line-clamp-3 bg-slate-50 p-4 rounded-2xl italic border border-slate-100 group-hover:bg-white group-hover:border-primary-wera/20 transition-colors">
                  "{app.worker.profile?.bio || 'Highly skilled professional ready to deliver quality results for your project...'}"
                </p>
              </CardContent>

              {/* Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 group-hover:bg-primary-wera/5 transition-colors">
                <Button 
                  onClick={() => navigate(`/employer/applicants/${app.id}/review`)}
                  className="w-full bg-accent-dark hover:bg-black text-white rounded-xl font-bold h-12 shadow-md hover:shadow-xl transition-all group-hover:bg-primary-wera"
                >
                  Review Details <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
