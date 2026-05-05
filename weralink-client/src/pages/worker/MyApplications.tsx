import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyApplications() {
  const { data: assignments, isLoading } = useGetWorkerAssignments(['OFFERED', 'CANCELLED']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-dark">My Applications</h1>
        <p className="text-text-main/70 mt-2">Track the status of gigs you've applied for.</p>
      </div>

      {assignments?.length === 0 ? (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-primary-wera/10 text-primary-wera rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-accent-dark mb-2">No Active Applications</h3>
            <p className="text-text-main/60 mb-6">You haven't applied to any gigs recently.</p>
            <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary-wera/20">
              <Link to="/worker/gigs">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments?.map((assignment: any) => (
            <Card key={assignment.id} className="bg-white hover:border-primary-wera/30 transition-colors shadow-sm overflow-hidden border-slate-200">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold text-accent-dark">{assignment.gig.title}</h3>
                    {assignment.status === 'CANCELLED' ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold shrink-0">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold shrink-0">
                        Pending Review
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-main/70 mb-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> {assignment.gig.employer?.name || 'WeraLink Employer'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {assignment.gig.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Applied {new Date(assignment.offeredAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-text-main/80 line-clamp-2">
                    {assignment.gig.description}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center">
                  <p className="text-xs text-text-main/50 uppercase font-bold tracking-wider mb-1">Fixed Pay</p>
                  <p className="text-2xl font-black text-primary-wera mb-4">
                    {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
                  </p>
                  <Button variant="outline" asChild className="w-full border-slate-300 text-accent-dark hover:bg-slate-100 font-bold">
                    <Link to={`/worker/gigs/${assignment.gigId}`}>
                      View Details <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Needed to avoid undefined error above
function FileText(props: any) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
