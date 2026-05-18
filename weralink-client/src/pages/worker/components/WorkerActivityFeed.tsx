import React from 'react';
import { useGetNotifications } from '@/features/execution/api/execution.api';
import { Bell, Clock, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export const WorkerActivityFeed: React.FC = () => {
    const { data: notificationsData, isLoading } = useGetNotifications(3);
    const notifications = Array.isArray(notificationsData) ? notificationsData : [];

    if (isLoading) {
        return <div className="space-y-4 py-4 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-12 bg-slate-100 dark:bg-gray-800 rounded-lg" />)}
        </div>;
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="w-10 h-10 bg-slate-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-text-main/50 dark:text-gray-400">No recent activity</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'ASSIGNMENT_ACCEPTED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'PAYMENT_RECEIVED': return <Wallet className="w-4 h-4 text-primary-wera" />;
            case 'REVISION_REQUESTED': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-4">
            {notifications.slice(0, 3).map((notif: any, index: number) => (
                <motion.div 
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 relative"
                >
                    {index !== notifications.slice(0, 5).length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-[-16px] w-px bg-slate-100 dark:bg-gray-700"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-slate-100 dark:border-gray-600 flex items-center justify-center shrink-0 z-10">
                        {getIcon(notif.type)}
                    </div>
                    <div className="pb-4">
                        <p className="text-sm text-text-main dark:text-gray-200 leading-tight">{notif.message}</p>
                        <p className="text-[10px] text-text-main/40 dark:text-gray-500 mt-1 flex items-center gap-1 font-bold">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
