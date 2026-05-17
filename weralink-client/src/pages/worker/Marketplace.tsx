import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Map, RefreshCw, Briefcase, TrendingUp, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MarketplaceFilterSidebar } from '@/features/gigs/components/MarketplaceFilterSidebar';
import { GigCard } from '@/features/gigs/components/GigCard';
import { gigHooks } from '@/features/gigs/api/gig.api';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetWorkerAssignments } from '@/features/execution/api/execution.api';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Parse filters from URL
    const filters = useMemo(() => {
        const params: any = {};
        searchParams.forEach((value, key) => {
            if (value) params[key] = value;
        });
        return params;
    }, [searchParams]);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    
    const { isAuthenticated } = useAuth();
    const { 
        data, 
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = gigHooks.useGetMarketplaceGigs(filters);

    const { data: assignments } = useGetWorkerAssignments([], { enabled: isAuthenticated });

    const filteredGigs = data ? data.pages.flatMap((page: any) => page.gigs) : [];
    const activeGigsCount = data?.pages[0]?.meta?.total || filteredGigs.length;
    const myApplicationsCount = isAuthenticated ? (assignments?.filter((assignment: any) => assignment.status === 'APPLIED')?.length || 0) : 0;

    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            const newParams = new URLSearchParams(searchParams);
            if (debouncedSearch) {
                newParams.set('search', debouncedSearch);
            } else {
                newParams.delete('search');
            }
            setSearchParams(newParams, { replace: true });
        }
    }, [debouncedSearch]);

    const handleFilterChange = (newFilters: any) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, String(value));
            } else {
                newParams.delete(key);
            }
        });
        // preserve search param if it exists and wasn't cleared by newFilters
        if (filters.search && !newFilters.hasOwnProperty('search')) {
             newParams.set('search', filters.search);
        }
        setSearchParams(newParams, { replace: true });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSearchParams(new URLSearchParams(), { replace: true });
    };

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
                                    <Briefcase className="w-5 h-5 text-primary-wera" />
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">
                                    Gig Economy
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Worker Marketplace</h1>
                            <p className="text-gray-400 text-lg max-w-xl">
                                Discover high-performance micro-gigs, complete tasks instantly, and build your reputation on WeraLink.
                            </p>
                        </div>

                        {/* Marketplace Stats */}
                        <div className="flex gap-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-primary-wera" /> Active Gigs
                                </p>
                                <p className="text-2xl font-bold text-white">{activeGigsCount}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[120px]">
                                <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-400" /> My Total Applications
                                </p>
                                <p className="text-2xl font-bold text-green-400">{myApplicationsCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
                
                {/* Search & Mobile Filter Toggle */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row gap-4 shadow-xl mb-10 items-center justify-between">
                    <div className="relative w-full md:w-[500px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                            type="text"
                            placeholder="Search by title, description or employer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-wera/30 text-base"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button 
                            variant="outline" 
                            className="lg:hidden grow h-12 rounded-xl border-slate-200 flex items-center gap-2"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-12 w-12 rounded-xl text-slate-400 hover:text-primary-wera"
                            onClick={() => refetch()}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <MarketplaceFilterSidebar 
                            onFilterChange={handleFilterChange} 
                            initialFilters={filters}
                        />
                    </aside>

                    {/* Mobile Sidebar Overlay */}
                    {isMobileFilterOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                            <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white animate-in slide-in-from-left duration-300">
                                <MarketplaceFilterSidebar 
                                    onFilterChange={handleFilterChange} 
                                    onClose={() => setIsMobileFilterOpen(false)}
                                    initialFilters={filters}
                                />
                            </div>
                        </div>
                    )}

                    {/* Main Grid */}
                    <div className="grow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-accent-dark flex items-center gap-2">
                                Available Gigs 
                                <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {filteredGigs.length}
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Sorted by:</span>
                                <span className="font-bold text-accent-dark">Newest First</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1,2,3,4].map(n => (
                                    <div key={n} className="bg-white rounded-3xl h-64 border border-slate-100 animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : filteredGigs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredGigs.map((gig: any) => (
                                    <GigCard key={gig.id} gig={gig} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-20 bg-white border border-dashed border-slate-200 rounded-[32px]">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-accent-dark mb-2">No gigs match your search</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-8">Try adjusting your filters or search terms to find what you're looking for.</p>
                                <Button 
                                    variant="outline" 
                                    className="h-12 px-8 border-primary-wera text-primary-wera font-bold rounded-xl hover:bg-primary-wera/5"
                                    onClick={clearFilters}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                        
                        {hasNextPage && (
                            <div className="mt-16 flex justify-center">
                                <Button 
                                    variant="outline" 
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="h-14 px-12 border-2 border-primary-wera/10 text-primary-wera font-bold rounded-2xl hover:bg-primary-wera/5 transition-all flex items-center gap-3 shadow-lg shadow-primary-wera/5"
                                >
                                    {isFetchingNextPage ? 'Loading...' : 'Discover More'}
                                    <RefreshCw className={`w-5 h-5 ${isFetchingNextPage ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Map View Toggle Button */}
            <div className="fixed bottom-10 right-10 z-40 group">
                <div className="absolute -inset-4 bg-primary-wera/20 rounded-full blur-xl group-hover:bg-primary-wera/30 transition-colors" />
                <Button className="relative h-16 bg-accent-dark hover:bg-accent-dark/95 text-white px-8 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 border border-white/10">
                    <Map className="w-6 h-6" />
                    <span className="font-bold text-lg">Market Map</span>
                </Button>
            </div>
        </div>
    );
}
