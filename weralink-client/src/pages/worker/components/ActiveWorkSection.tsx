import React from 'react';
import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, PlayCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ActiveWorkSection: React.FC = () => {
    const { data: assignmentsData, isLoading } = useGetWorkerAssignments(['ACCEPTED', 'REVISION_REQUESTED']);
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(n => (
                    <div key={n} className="h-32 bg-slate-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!assignments || assignments.length === 0) {
        return (
            <Card className="bg-slate-50 dark:bg-gray-800/50 border-dashed border-2 border-slate-200 dark:border-gray-700 rounded-[32px] overflow-hidden">
                <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-primary-wera/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-6 h-6 text-primary-wera" />
                    </div>
                    <h3 className="font-bold text-accent-dark dark:text-white mb-1">No active work</h3>
                    <p className="text-sm text-text-main/60 dark:text-gray-400 mb-6">You don't have any ongoing assignments at the moment.</p>
                    <Button asChild variant="outline" className="rounded-xl border-primary-wera text-primary-wera hover:bg-primary-wera/5">
                        <Link to="/worker/gigs">Browse Marketplace</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.slice(0, 3).map((assignment: any) => {
                const isRevision = assignment.status === 'REVISION_REQUESTED';
                const daysLeft = assignment.deadlineAt 
                    ? Math.max(0, Math.ceil((new Date(assignment.deadlineAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : 0;

                return (
                    <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                    >
                        <Card className={`bg-white dark:bg-gray-800 border-2 rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-xl ${isRevision ? 'border-amber-200 dark:border-amber-900/50' : 'border-transparent hover:border-primary-wera/20'}`}>
                            <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isRevision ? 'bg-amber-100 text-amber-600' : 'bg-primary-wera/10 text-primary-wera'}`}>
                                        {isRevision ? <AlertCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-accent-dark dark:text-white line-clamp-1">{assignment.gig.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${daysLeft < 2 ? 'bg-red-50 text-red-600' : 'bg-slate-100 dark:bg-gray-700 text-slate-500'}`}>
                                                {daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                                            </span>
                                            <span className="text-xs text-text-main/50 dark:text-gray-400">
                                                {assignment.gig.currency} {Number(assignment.gig.payAmount).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <Button asChild size="sm" className="grow md:grow-0 bg-primary-wera hover:bg-primary-dark text-white rounded-xl font-bold transition-transform active:scale-95">
                                        <Link to={`/worker/assignments/${assignment.id}/submit`}>
                                            {isRevision ? 'Fix & Resubmit' : 'Submit Work'}
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700">
                                        <Link to={`/worker/assignments/${assignment.id}`}>
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}
            {assignments.length > 3 && (
                <Link to="/worker/assignments" className="block text-center text-sm font-bold text-primary-wera hover:underline mt-2">
                    View all {assignments.length} assignments
                </Link>
            )}
        </div>
    );
};
