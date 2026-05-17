import React from 'react';
import { useGetEmployerApplicants } from '@/features/execution/api/execution.api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const NewApplicantsSection: React.FC = () => {
    // We only want pending applications (NOT_STARTED status in Assignment)
    const { data: applicantsData, isLoading } = useGetEmployerApplicants({ status: 'NOT_STARTED' });
    const applicants = Array.isArray(applicantsData) ? applicantsData : [];

    if (isLoading) {
        return <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2].map(n => <div key={n} className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl" />)}
        </div>;
    }

    if (!applicants || applicants.length === 0) {
        return (
            <div className="py-6 text-center border-t border-slate-50 dark:border-gray-700">
                <p className="text-sm text-text-main/40 dark:text-gray-500">No new applicants at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-gray-700">
            {applicants.slice(0, 3).map((app: any, index: number) => (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-800">
                            <AvatarImage src={app.worker?.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-black">
                                {app.worker?.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h5 className="text-xs font-bold text-accent-dark dark:text-white group-hover:text-primary-wera transition-colors truncate max-w-[120px]">
                                {app.worker?.name}
                            </h5>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-[10px] font-black text-slate-500">{app.worker?.avgRating || 'New'}</span>
                            </div>
                        </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="h-8 px-2 rounded-lg hover:bg-primary-wera/10 text-primary-wera group-hover:bg-primary-wera group-hover:text-white transition-all">
                        <Link to={`/employer/gigs/${app.gigId}/applicants`}>
                            <UserCheck className="w-4 h-4" />
                        </Link>
                    </Button>
                </motion.div>
            ))}
            <Link to="/employer/applicants-global" className="block text-[10px] font-black text-slate-400 hover:text-primary-wera text-center uppercase tracking-widest mt-4">
                Manage All Applicants
            </Link>
        </div>
    );
};
