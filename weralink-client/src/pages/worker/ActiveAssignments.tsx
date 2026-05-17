import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Building2, AlertCircle, PlayCircle, RefreshCcw, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ActiveAssignments() {
  const { 
    data: assignments, 
    isLoading, 
    error,
    refetch 
  } = useGetWorkerAssignments(['ACCEPTED', 'REVISION_REQUESTED']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-accent-dark mb-2">Failed to load assignments</h2>
        <p className="text-text-main/70 mb-6 max-w-md">
          {error instanceof Error ? error.message : "We encountered an issue fetching your active work. This might be due to a network problem."}
        </p>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="border-primary-wera text-primary-wera hover:bg-primary-wera/10 rounded-xl"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const activeCount = assignments?.length || 0;
  const revisionCount = assignments?.filter((a: any) => a.status === 'REVISION_REQUESTED').length || 0;

  return (
    <div className="min-h-screen bg-background-light pb-16 font-sans text-text-main animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Hero Section */}
      <div className="bg-accent-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera/20 rounded-full blur-3xl" />
          <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-primary-wera/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-16 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary-wera/20 p-2 rounded-lg">
                  <PlayCircle className="w-5 h-5 text-primary-wera" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">
                  Work in Progress
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Active Assignments</h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Track your ongoing tasks, manage deadlines, and submit your evidence for approval.
              </p>
            </div>

            {/* Assignment Stats */}
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-primary-wera" /> Total Active
                </p>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
              </div>
              {revisionCount > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-3 min-w-[120px]">
                  <p className="text-xs text-amber-400 font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Needs Revision
                  </p>
                  <p className="text-2xl font-bold text-amber-400">{revisionCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        {assignments?.length === 0 ? (
          <Card className="bg-white border-dashed border-2 border-slate-200 rounded-[32px] shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-primary-wera/10 text-primary-wera rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-accent-dark mb-2">No Active Work</h3>
              <p className="text-text-main/60 mb-8 max-w-md">You don't have any accepted gigs at the moment. Browse the marketplace to find your next opportunity.</p>
              <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white h-12 px-8 rounded-xl shadow-lg shadow-primary-wera/20 font-bold">
                <Link to="/worker/gigs">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-primary-wera flex items-center gap-2">
                Your Work Queue
                <span className="text-sm font-medium text-primary-wera bg-primary-wera/10 px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              </h2>
            </div>
            
            {assignments?.map((assignment: any) => {
              const isRevision = assignment.status === 'REVISION_REQUESTED';
              const daysLeft = assignment.deadlineAt 
                  ? Math.max(0, Math.ceil((new Date(assignment.deadlineAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : 0;
              
              return (
                <Card key={assignment.id} className={`bg-white shadow-lg overflow-hidden border-2 rounded-3xl transition-all hover:translate-y-[-2px] ${isRevision ? 'border-amber-200' : 'border-transparent hover:border-primary-wera/30'}`}>
                  {isRevision && (
                    <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-amber-800 text-sm">Revision Requested</span>
                      <span className="text-amber-700 text-sm ml-auto font-medium">Please review employer feedback</span>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row">
                    <div className="p-8 flex-1">
                      <div className="flex md:flex-row flex-col items-start justify-between gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-accent-dark leading-tight">{assignment.gig.title}</h3>
                        <Badge variant="outline" className={`${isRevision ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'} font-bold shrink-0 px-3 py-1 rounded-lg`}>
                          {isRevision ? 'Needs Revision' : 'In Progress'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-text-main/70 mb-6">
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                          <Building2 className="w-4 h-4 text-slate-400" /> {assignment.gig.employer?.name || 'WeraLink Employer'}
                        </span>
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold ${daysLeft < 2 ? 'bg-red-50 text-red-600' : 'bg-primary-wera/5 text-primary-wera'}`}>
                          <Clock className="w-4 h-4" /> 
                          {daysLeft === 0 ? 'Due Today' : `${daysLeft} days remaining`}
                        </span>
                      </div>

                      <p className="text-base text-text-main/80 line-clamp-2 leading-relaxed">
                        {assignment.gig.description}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50/50 p-8 md:w-72 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center items-center text-center">
                      <p className="text-xs text-text-main/50 uppercase font-bold tracking-wider mb-2">Escrowed Funds</p>
                      <p className="text-3xl font-black text-green-600 mb-6 flex items-center gap-2">
                        {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      </p>
                      <Button asChild className="w-full h-12 bg-primary-wera hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary-wera/20 transition-transform active:scale-95">
                        <Link to={`/worker/assignments/${assignment.id}/submit`} className="flex items-center justify-center gap-2">
                          Submit Work <PlayCircle className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
