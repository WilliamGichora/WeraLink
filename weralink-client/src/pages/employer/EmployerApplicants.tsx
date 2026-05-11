import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetEmployerApplicants } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  Briefcase, 
  Star, 
  Clock, 
  ChevronRight, 
  LayoutGrid, 
  List,
  ArrowUpDown,
  TrendingUp,
  X} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export default function EmployerApplicants() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'score',
    order: 'desc',
    minScore: undefined as number | undefined,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { data: applications, isLoading, refetch } = useGetEmployerApplicants(filters);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 95) return 'Perfect Match';
    if (score >= 90) return 'Top Rated';
    if (score >= 75) return 'Strong Candidate';
    if (score >= 50) return 'Potential Fit';
    return 'Review Required';
  };

  if (isLoading && !applications) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full shadow-lg"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Talent...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary-wera/10 p-1.5 rounded-lg">
                    <Users className="w-5 h-5 text-primary-wera" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-primary-wera">Talent Discovery</span>
            </div>
            <h1 className="text-4xl font-black text-accent-dark tracking-tight">Active Applications</h1>
            <p className="text-text-main/70 mt-2 font-medium">
                We've found <span className="text-accent-dark font-black">{applications?.length || 0}</span> candidates matching your current criteria.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg h-9 w-9 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg h-9 w-9 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </Button>
             </div>
             <Button asChild className="bg-accent-dark hover:bg-black text-white rounded-xl font-bold h-11 px-6 shadow-xl transition-transform active:scale-95">
               <Link to="/employer/gigs/new">Post New Gig</Link>
             </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[32px] p-4 flex flex-col md:flex-row gap-4 items-center mb-10 border relative z-30">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-wera transition-colors" />
            <Input 
              placeholder="Search by worker name or gig title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-wera/20 h-14 text-base font-medium transition-all"
            />
            {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* Sort Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-2xl border-slate-200 h-14 px-6 gap-2 font-bold hover:bg-slate-50 transition-all flex-1 md:flex-none">
                        <ArrowUpDown className="w-4 h-4 text-primary-wera" /> 
                        {filters.sortBy === 'score' ? 'Top Match' : 'Recent'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
                    <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-slate-400">Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={filters.sortBy} onValueChange={(v) => setFilters(prev => ({ ...prev, sortBy: v }))}>
                        <DropdownMenuRadioItem value="score" className="rounded-xl font-bold p-3 cursor-pointer">
                            Matching Score
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="recent" className="rounded-xl font-bold p-3 cursor-pointer">
                            Application Date
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Score Filter Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`rounded-2xl h-14 px-6 gap-2 font-bold transition-all flex-1 md:flex-none ${filters.minScore ? 'border-primary-wera bg-primary-wera/5 text-primary-wera' : 'border-slate-200'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> 
                        {filters.minScore ? `Score ${filters.minScore}+` : 'Quality Filter'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
                    <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-slate-400">Minimum Score</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={filters.minScore?.toString() || '0'} onValueChange={(v) => setFilters(prev => ({ ...prev, minScore: v === '0' ? undefined : Number(v) }))}>
                        <DropdownMenuRadioItem value="90" className="rounded-xl font-bold p-3 cursor-pointer">
                            Top Rated (90%+)
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="75" className="rounded-xl font-bold p-3 cursor-pointer">
                            High Quality (75%+)
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="50" className="rounded-xl font-bold p-3 cursor-pointer">
                            Fair Match (50%+)
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="0" className="rounded-xl font-bold p-3 cursor-pointer">
                            All Applicants
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>

      {/* Content */}
      {applications?.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner">
           <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
             <Search className="w-12 h-12" />
           </div>
           <h3 className="text-2xl font-black text-accent-dark mb-2">No Talent Found</h3>
           <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">We couldn't find any applicants matching your current filters. Try broadening your search.</p>
           <Button 
             variant="outline" 
             onClick={() => { setSearchQuery(''); setFilters({ search: '', sortBy: 'score', order: 'desc', minScore: undefined }); }}
             className="rounded-2xl border-primary-wera text-primary-wera font-black h-12 px-8 hover:bg-primary-wera/5"
           >
             Clear All Filters
           </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
          {applications?.map((app: any) => {
            const score = Math.round(app.matchScore || 0);
            const statusClass = getMatchScoreColor(score);
            const statusLabel = getMatchScoreLabel(score);

            return (
              <Card 
                key={app.id} 
                className={`group bg-white border-slate-200 hover:border-primary-wera transition-all duration-500 rounded-[32px] overflow-hidden ${viewMode === 'list' ? 'hover:shadow-2xl' : 'hover:shadow-3xl shadow-lg shadow-slate-200/40'}`}
              >
                <CardContent className={viewMode === 'list' ? "p-6 flex items-center gap-8" : "p-8"}>
                  
                  {/* Profile Pic / Initial */}
                  <div className={`shrink-0 bg-slate-50 border-4 border-white rounded-3xl flex items-center justify-center font-black text-accent-dark uppercase shadow-xl ${viewMode === 'list' ? 'w-20 h-20 text-3xl' : 'w-24 h-24 text-4xl mb-6 mx-auto'}`}>
                    {app.worker.name.charAt(0)}
                  </div>

                  <div className="grow min-w-0 text-center md:text-left">
                    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 ${viewMode === 'list' ? 'mb-3' : 'mb-6'}`}>
                      <div>
                        <h3 className="font-black text-accent-dark text-2xl truncate group-hover:text-primary-wera transition-colors tracking-tight">
                            {app.worker.name}
                        </h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2 justify-center md:justify-start">
                            <MapPin className="w-3 h-3" /> {app.worker.profile?.location || 'Remote'}
                        </p>
                      </div>
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <Badge variant="outline" className={`font-black text-[10px] uppercase px-3 py-1 rounded-full border-2 ${statusClass} shadow-sm`}>
                            {statusLabel}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-base font-black tracking-tighter">4.9</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex flex-wrap items-center justify-center md:justify-start gap-y-3 gap-x-6 text-sm text-slate-500 ${viewMode === 'list' ? 'mb-2' : 'mb-8'}`}>
                      <span className="flex items-center gap-2 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Briefcase className="w-4 h-4 text-primary-wera shrink-0" /> {app.gig.title}
                      </span>
                      <span className="flex items-center gap-2 font-bold">
                        <Clock className="w-4 h-4 text-slate-300 shrink-0" /> {new Date(app.offeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5 font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                         {app.gig.currency} {Number(app.gig.payAmount).toLocaleString()}
                      </span>
                    </div>

                    {/* Score Bar Visualization */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Alignment</span>
                            <span className={`text-sm font-black ${statusClass.split(' ')[0]}`}>{score}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${score}%` }}
                            />
                        </div>
                    </div>
                  </div>

                  <div className={viewMode === 'list' ? "shrink-0 ml-auto flex gap-3" : "mt-2 pt-6 border-t border-slate-50"}>
                    <Button 
                      onClick={() => navigate(`/employer/applicants/${app.id}/review`)}
                      variant={viewMode === 'list' ? 'outline' : 'default'}
                      className={`rounded-2xl font-black transition-all active:scale-95 ${viewMode === 'list' ? 'h-14 px-8 border-2 border-slate-200 hover:border-primary-wera hover:text-primary-wera text-accent-dark' : 'w-full bg-accent-dark hover:bg-black text-white h-14 shadow-xl'}`}
                    >
                      {viewMode === 'list' ? "View Details" : "Review Candidate"}
                      <ChevronRight className={`w-5 h-5 ml-2 ${viewMode === 'list' ? 'text-primary-wera' : 'text-white/50'}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MapPin(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
}
