import React from 'react';
import { useGetEmployerPendingReviews } from '@/features/execution/api/execution.api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const PendingReviewsSection: React.FC = () => {
    const { data: reviewsData, isLoading } = useGetEmployerPendingReviews();
    const reviews = Array.isArray(reviewsData) ? reviewsData : [];

    if (isLoading) {
        return <div className="space-y-4">
            {[1, 2].map(n => <div key={n} className="h-24 bg-slate-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
        </div>;
    }

    if (!reviews || reviews.length === 0) {
        return (
            <Card className="bg-slate-50 dark:bg-gray-800/50 border-dashed border-2 border-slate-200 dark:border-gray-700 rounded-[32px]">
                <CardContent className="p-8 text-center text-text-main/50 dark:text-gray-400">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="font-bold">All clear!</p>
                    <p className="text-xs">No pending work reviews at the moment.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.slice(0, 3).map((review: any, index: number) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-slate-100">
                                    <AvatarImage src={review.worker?.avatar} />
                                    <AvatarFallback className="bg-primary-wera/10 text-primary-wera font-bold">
                                        {review.worker?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-sm font-bold text-accent-dark dark:text-white line-clamp-1">{review.gig.title}</h4>
                                    <p className="text-[10px] text-text-main/50 dark:text-gray-400">Submitted by {review.worker?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-green-600">{review.gig.currency} {Number(review.gig.payAmount).toLocaleString()}</p>
                                    <p className="text-[10px] text-amber-500 flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" /> Awaiting Review
                                    </p>
                                </div>
                                <Button asChild size="sm" className="bg-accent-dark hover:bg-black text-white rounded-xl font-bold transition-all active:scale-95">
                                    <Link to={`/employer/assignments/review/${review.id}`}>
                                        Review
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
            {reviews.length > 3 && (
                <Link to="/employer/reviews" className="block text-center text-xs font-bold text-primary-wera hover:underline">
                    View all {reviews.length} pending reviews
                </Link>
            )}
        </div>
    );
};
