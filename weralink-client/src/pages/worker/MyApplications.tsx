import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Building2, ExternalLink, FileText, Briefcase, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyApplications() {
  const { data: assignments, isLoading } = useGetWorkerAssignments(['OFFERED', 'CANCELLED', 'REJECTED']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const activeApps = assignments?.filter((a: any) => a.status === 'OFFERED').length || 0;

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
                  <FileText className="w-5 h-5 text-primary-wera" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">
                  Application Tracker
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Applications</h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Monitor the status of your gig applications and wait for employers to review your profile.
              </p>
            </div>

            {/* Application Stats */}
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-primary-wera" /> Active
                </p>
                <p className="text-2xl font-bold text-white">{activeApps}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" /> Pending Review
                </p>
                <p className="text-2xl font-bold text-amber-400">{activeApps}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        {assignments?.length === 0 ? (
          <Card className="bg-white border-dashed border-2 border-slate-200 rounded-[32px] shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-primary-wera/10 text-primary-wera rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-accent-dark mb-2">No Active Applications</h3>
              <p className="text-text-main/60 mb-8 max-w-md">You haven't applied to any gigs recently. Build your portfolio by finding gigs in the marketplace.</p>
              <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white h-12 px-8 rounded-xl shadow-lg shadow-primary-wera/20 font-bold">
                <Link to="/worker/gigs">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-primary-wera flex items-center gap-2">
                Sent Applications
                <span className="text-sm font-medium text-primary-wera bg-primary-wera/10 px-2 py-0.5 rounded-full">
                  {assignments?.length}
                </span>
              </h2>
            </div>

            <div className="grid gap-5">
              {assignments?.map((assignment: any) => (
                <Card key={assignment.id} className="bg-white hover:border-primary-wera/30 transition-all shadow-md overflow-hidden border-slate-200 rounded-3xl group">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-8 flex-1">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-accent-dark leading-tight group-hover:text-primary-wera transition-colors">{assignment.gig.title}</h3>
                        {assignment.status === 'CANCELLED' ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold shrink-0 px-3 py-1 rounded-lg">
                            Cancelled
                          </Badge>
                        ) : assignment.status === 'REJECTED' ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 font-bold shrink-0 px-3 py-1 rounded-lg">
                            Declined
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold shrink-0 px-3 py-1 rounded-lg">
                            Pending Review
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-text-main/70 mb-6">
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                          <Building2 className="w-4 h-4 text-slate-400" /> {assignment.gig.employer?.name || 'WeraLink Employer'}
                        </span>
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                          <MapPin className="w-4 h-4 text-slate-400" /> {assignment.gig.location}
                        </span>
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                          <Clock className="w-4 h-4 text-slate-400" /> Applied {new Date(assignment.offeredAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-base text-text-main/80 line-clamp-2 leading-relaxed">
                        {assignment.gig.description}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50/50 p-8 md:w-72 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center items-center text-center">
                      <p className="text-xs text-text-main/50 uppercase font-bold tracking-wider mb-2">Fixed Pay</p>
                      <p className="text-3xl font-black text-primary-wera mb-6">
                        {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
                      </p>
                      <Button variant="outline" asChild className="w-full h-12 border-slate-300 text-accent-dark hover:bg-white hover:border-primary-wera/50 font-bold rounded-xl shadow-sm transition-all">
                        <Link to={`/worker/gigs/${assignment.gigId}`} className="flex items-center justify-center gap-2">
                          View Details <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
