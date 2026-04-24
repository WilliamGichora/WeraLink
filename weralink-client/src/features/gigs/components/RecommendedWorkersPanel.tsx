import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { gigHooks } from '../api/gig.api';
import { RecommendedWorkerCard } from './RecommendedWorkerCard';

interface RecommendedWorkersPanelProps {
    gigId: string;
    gigStatus: string;
}

export const RecommendedWorkersPanel: React.FC<RecommendedWorkersPanelProps> = ({ gigId, gigStatus }) => {
    const { data, isLoading, isError, refetch } = gigHooks.useGetMatchesForGig(
        gigStatus === 'OPEN' ? gigId : undefined
    );

    // Only show for OPEN gigs
    if (gigStatus !== 'OPEN') return null;

    return (
        <Card className="bg-pink-50 rounded-xl shadow-sm border border-primary-wera/10 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-accent-dark to-accent-dark/90 text-white pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary-wera" />
                        Recommended Workers
                    </CardTitle>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
                {data && (
                    <p className="text-xs text-gray-400 mt-1">
                        {data.matchedCandidates} of {data.totalCandidates} workers matched
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-4">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="h-28 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-6">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-sm text-text-main/60">Failed to load recommendations.</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 text-xs"
                            onClick={() => refetch()}
                        >
                            Try Again
                        </Button>
                    </div>
                ) : data?.matches?.length > 0 ? (
                    <div className="space-y-3">
                        {data.matches.slice(0, 5).map((match: any, idx: number) => (
                            <RecommendedWorkerCard key={match.workerId} match={match} rank={idx + 1} />
                        ))}
                        {data.matches.length > 5 && (
                            <p className="text-center text-xs text-text-main/50 pt-2">
                                +{data.matches.length - 5} more matches available
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-text-main/70 mb-1">No matching workers found</h4>
                        <p className="text-xs text-text-main/50 max-w-[200px] mx-auto">
                            Try broadening your gig's skill requirements or check back later.
                        </p>
                    </div>
                )}

                {data && (
                    <div className="mt-4 pt-3 border-t border-primary-wera/10 flex items-center justify-between">
                        <span className="text-[10px] text-text-main/40 font-medium">
                            Algorithm v1.0 • {data ? `${(data as any).__meta?.computeTimeMs || '~'}ms` : ''}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
