import React from 'react';
import { gigHooks } from '@/features/gigs/api/gig.api';
import { Briefcase, FileEdit, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GigsSummarySection: React.FC = () => {
    const { data: gigsData, isLoading } = gigHooks.useGetMyGigs();
    const gigs = Array.isArray(gigsData) ? gigsData : [];

    if (isLoading) {
        return <div className="grid grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-20 bg-slate-100 dark:bg-gray-800 rounded-2xl" />)}
        </div>;
    }

    const openCount = gigs?.filter((g: any) => g.status === 'OPEN').length || 0;
    const assignedCount = gigs?.filter((g: any) => g.status === 'ASSIGNED').length || 0;
    const draftCount = gigs?.filter((g: any) => g.status === 'DRAFT').length || 0;

    const stats = [
        { label: 'Active', count: openCount, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'In Progress', count: assignedCount, icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Drafts', count: draftCount, icon: FileEdit, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20' },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <Link key={i} to="/employer/gigs" className={`p-4 rounded-[24px] ${stat.bg} group border border-transparent hover:border-slate-200 dark:hover:border-gray-700 transition-all`}>
                    <div className="flex flex-col items-center text-center">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <span className="text-xl font-black text-accent-dark dark:text-white tracking-tighter">{stat.count}</span>
                        <span className="text-[10px] font-bold text-text-main/40 dark:text-gray-500 uppercase tracking-tighter">{stat.label}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
};
