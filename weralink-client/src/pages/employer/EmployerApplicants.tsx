import { useState } from 'react';
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
  Filter, 
  LayoutGrid, 
  List,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function EmployerApplicants() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useGetEmployerApplicants();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredApps = (applications || []).filter((app: any) => {
    const matchesSearch = 
      app.worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.gig.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-accent-dark tracking-tight">Active Applications</h1>
            <p className="text-text-main/70 mt-2 font-medium flex items-center gap-2">
              Review all workers who applied to your posted gigs.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-1 rounded-xl flex">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('grid')}
                  className="rounded-lg h-9 w-9"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className="rounded-lg h-9 w-9"
                >
                  <List className="w-4 h-4" />
                </Button>
             </div>
             <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white rounded-xl font-bold h-11 px-6 shadow-lg shadow-primary-wera/20">
               <Link to="/employer/manage-gigs">Manage Gigs</Link>
             </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-2xl mb-8">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/40" />
            <Input 
              placeholder="Search by worker name or gig title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-none rounded-xl focus:ring-primary-wera h-12"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl border-slate-200 h-12 gap-2 font-bold flex-1 md:flex-none">
              <Clock className="w-4 h-4" /> Recent
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200 h-12 gap-2 font-bold flex-1 md:flex-none text-primary-wera border-primary-wera/20 bg-primary-wera/5">
              <Filter className="w-4 h-4" /> More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
             <Users className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-bold text-accent-dark mb-2">No Applications Found</h3>
           <p className="text-text-main/60">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredApps.map((app: any) => (
            <Card 
              key={app.id} 
              className={`group bg-white border-slate-200 hover:border-primary-wera transition-all duration-300 rounded-2xl overflow-hidden ${viewMode === 'list' ? 'hover:shadow-lg' : 'hover:shadow-xl'}`}
            >
              <CardContent className={viewMode === 'list' ? "p-4 flex items-center gap-6" : "p-6"}>
                
                {/* Profile Pic / Initial */}
                <div className={`shrink-0 bg-slate-100 rounded-xl flex items-center justify-center font-black text-accent-dark uppercase shadow-inner ${viewMode === 'list' ? 'w-14 h-14 text-xl' : 'w-16 h-16 text-2xl mb-4'}`}>
                  {app.worker.name.charAt(0)}
                </div>

                <div className="grow min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                    <h3 className="font-bold text-accent-dark text-lg truncate group-hover:text-primary-wera transition-colors">
                      {app.worker.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-sm font-black tracking-tight">4.8</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px] uppercase px-2 py-0">
                        New Application
                      </Badge>
                    </div>
                  </div>

                  <div className={`flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-text-main/60 ${viewMode === 'list' ? 'mb-1' : 'mb-4'}`}>
                    <span className="flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                      <Briefcase className="w-4 h-4 text-primary-wera shrink-0" /> {app.gig.title}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-primary-wera shrink-0" /> {new Date(app.offeredAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-black text-green-600">
                       {app.gig.currency} {Number(app.gig.payAmount).toLocaleString()}
                    </span>
                  </div>

                  {viewMode === 'grid' && (
                    <div className="bg-slate-50 p-4 rounded-xl mb-6">
                       <p className="text-xs text-text-main/50 font-bold uppercase tracking-wider mb-2">Worker Skill Match</p>
                       <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-primary-wera shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-slate-200'}`}></div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className={viewMode === 'list' ? "shrink-0 ml-auto flex gap-2" : "mt-2"}>
                  <Button 
                    onClick={() => navigate(`/employer/applicants/${app.id}/review`)}
                    variant={viewMode === 'list' ? 'ghost' : 'default'}
                    className={`rounded-xl font-bold ${viewMode === 'list' ? 'h-11 w-11 p-0 hover:bg-primary-wera/10 hover:text-primary-wera' : 'w-full bg-accent-dark hover:bg-black text-white h-12 shadow-md'}`}
                  >
                    {viewMode === 'list' ? <ChevronRight className="w-6 h-6" /> : "Review Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
