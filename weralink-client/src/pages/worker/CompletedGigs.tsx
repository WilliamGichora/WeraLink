import React from 'react';
import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Building2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompletedGigs() {
  const { data: assignments, isLoading } = useGetWorkerAssignments(['SUBMITTED', 'APPROVED', 'PAID', 'DISPUTED']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'SUBMITTED':
        return { label: 'Under Review', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock className="w-4 h-4" /> };
      case 'APPROVED':
        return { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'PAID':
        return { label: 'Paid', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'DISPUTED':
        return { label: 'Disputed', color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> };
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: null };
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-dark">Completed Gigs</h1>
        <p className="text-text-main/70 mt-2">History of your submitted work and payments.</p>
      </div>

      {assignments?.length === 0 ? (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-primary-wera/10 text-primary-wera rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-accent-dark mb-2">No History Yet</h3>
            <p className="text-text-main/60 mb-6">You haven't completed any gigs.</p>
            <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary-wera/20">
              <Link to="/worker/assignments">View Active Assignments</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments?.map((assignment: any) => {
            const statusConfig = getStatusConfig(assignment.status);
            
            return (
              <Card key={assignment.id} className="bg-white hover:border-primary-wera/30 transition-colors shadow-sm overflow-hidden border-slate-200">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-accent-dark">{assignment.gig.title}</h3>
                      <Badge variant="outline" className={`${statusConfig.color} font-bold shrink-0 flex items-center gap-1`}>
                        {statusConfig.icon} {statusConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-main/70 mb-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> {assignment.gig.employer?.name || 'WeraLink Employer'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {assignment.gig.location}
                      </span>
                      {assignment.submittedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-primary-wera" /> Submitted {new Date(assignment.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-main/80 line-clamp-2">
                      {assignment.gig.description}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center">
                    <p className="text-xs text-text-main/50 uppercase font-bold tracking-wider mb-1">Earned Amount</p>
                    <p className={`text-2xl font-black mb-4 ${assignment.status === 'PAID' ? 'text-primary-wera' : 'text-slate-600'}`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
