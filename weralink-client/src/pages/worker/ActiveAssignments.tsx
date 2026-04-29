import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Building2, AlertCircle, PlayCircle, RefreshCcw } from 'lucide-react';
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
      <div className="max-w-5xl mx-auto p-8 flex flex-col items-center justify-center text-center">
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-dark">Active Assignments</h1>
        <p className="text-text-main/70 mt-2">Work you need to complete and submit evidence for.</p>
      </div>

      {assignments?.length === 0 ? (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-primary-wera/10 text-primary-wera rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-accent-dark mb-2">No Active Work</h3>
            <p className="text-text-main/60 mb-6">You don't have any accepted gigs at the moment.</p>
            <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary-wera/20">
              <Link to="/worker/applications">Check Applications</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assignments?.map((assignment: any) => {
            const isRevision = assignment.status === 'REVISION_REQUESTED';
            const daysLeft = assignment.deadlineAt 
                ? Math.max(0, Math.ceil((new Date(assignment.deadlineAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : 0;
            
            return (
              <Card key={assignment.id} className={`bg-white shadow-sm overflow-hidden border-2 ${isRevision ? 'border-amber-200' : 'border-slate-200 hover:border-primary-wera/30'} transition-colors`}>
                {isRevision && (
                  <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-amber-800 text-sm">Revision Requested</span>
                    <span className="text-amber-700 text-sm ml-auto">Deadline extended</span>
                  </div>
                )}
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-accent-dark">{assignment.gig.title}</h3>
                      <Badge variant="outline" className={`${isRevision ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'} font-bold shrink-0`}>
                        {isRevision ? 'Needs Revision' : 'In Progress'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-main/70 mb-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> {assignment.gig.employer?.name || 'WeraLink Employer'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-accent-dark">
                        <Clock className={`w-4 h-4 ${daysLeft < 2 ? 'text-red-500' : 'text-primary-wera'}`} /> 
                        {daysLeft} days left
                      </span>
                    </div>

                    <p className="text-sm text-text-main/80 line-clamp-2">
                      {assignment.gig.description}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center">
                    <p className="text-xs text-text-main/50 uppercase font-bold tracking-wider mb-1">Escrowed Pay</p>
                    <p className="text-2xl font-black text-green-600 mb-4 flex items-center gap-2">
                      {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </p>
                    <Button asChild className="w-full bg-primary-wera hover:bg-primary-dark text-white font-bold rounded-xl shadow-md shadow-primary-wera/20">
                      <Link to={`/worker/assignments/${assignment.id}/submit`}>
                        Submit Work <PlayCircle className="w-4 h-4 ml-2" />
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
  );
}

function Briefcase(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
