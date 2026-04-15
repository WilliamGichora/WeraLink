import { useState } from 'react';
import { Search, Map, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MarketplaceFilterSidebar } from '@/features/gigs/components/MarketplaceFilterSidebar';
import { GigCard } from '@/features/gigs/components/GigCard';
import { gigHooks } from '@/features/gigs/api/gig.api';

export default function MarketplacePage() {
    const [filters, setFilters] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    
    const { data: gigs, isLoading } = gigHooks.useGetMarketplaceGigs(filters);

    const filteredGigs = (gigs || []).filter((gig: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return gig.title.toLowerCase().includes(query) || 
               gig.category.toLowerCase().includes(query) || 
               (gig.location && gig.location.toLowerCase().includes(query));
    });

    const handleFilterChange = (newFilters: any) => {
        setFilters((prev: any) => {
             if (newFilters.category === 'ALL') {
                 const { category, ...rest } = prev;
                 return rest;
             }
             return { ...prev, ...newFilters };
        });
    };

    return (
        <div className="min-h-screen bg-background-light pb-16 font-sans text-text-main">
            {/* Search Hero Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-8">
                <div className="text-center md:text-left mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-accent-dark mb-2">Find your next micro-gig</h1>
                    <p className="text-text-main/70 text-lg mb-8">Short tasks, instant pay. Start earning today.</p>
                    
                    <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto md:mx-0">
                        <div className="relative grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-main/40" />
                            <Input 
                                className="pl-12 h-14 rounded-xl border-2 border-primary-wera/10 bg-white text-text-main focus:border-primary-wera focus:ring-0 text-base shadow-sm"
                                placeholder="Search for micro-gigs (e.g., 'delivery', 'typing')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="h-14 bg-primary-wera hover:bg-primary-dark text-white px-10 rounded-xl font-bold shadow-lg shadow-primary-wera/20 transition-all active:scale-95">
                            Search Gigs
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden w-full flex justify-end">
                        <Button 
                            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                            variant="outline"
                            className="bg-white border-primary-wera/20 text-text-main h-12 w-full"
                        >
                            {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </div>

                    {/* Sidebar */}
                    <div className={`w-full lg:w-64 shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                        <MarketplaceFilterSidebar 
                            onFilterChange={handleFilterChange} 
                            onClose={() => setIsMobileFilterOpen(false)}
                        />
                    </div>

                    {/* Grid */}
                    <div className="grow">
                        <div className="bg-white border border-primary-wera/10 rounded-xl p-4 flex justify-between items-center mb-6 shadow-sm">
                            <span className="text-text-main font-semibold">Showing {filteredGigs.length} gigs</span>
                            <span className="text-sm text-text-main/60">Sorted by: <strong className="text-text-main">Newest</strong></span>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1,2,3,4].map(n => (
                                    <div key={n} className="bg-white rounded-2xl h-64 border border-primary-wera/5 animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredGigs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredGigs.map((gig: any) => (
                                    <GigCard key={gig.id} gig={gig} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-16 bg-white border border-primary-wera/10 rounded-2xl shadow-sm">
                                <Search className="w-12 h-12 text-primary-wera/40 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-accent-dark mb-2">No gigs found</h3>
                                <p className="text-text-main/70 max-w-md mx-auto">We couldn't find any gigs matching your current filters and search query. Try adjusting them.</p>
                                <Button 
                                    variant="outline" 
                                    className="mt-6 border-primary-wera text-primary-wera font-bold hover:bg-primary-wera/5"
                                    onClick={() => { setSearchQuery(''); setFilters({}); }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                        
                        {filteredGigs.length > 0 && (
                            <div className="mt-12 flex justify-center">
                                <Button variant="outline" className="h-12 px-8 border-2 border-primary-wera/20 text-primary-wera font-bold rounded-xl hover:bg-primary-wera/5 transition-all flex items-center gap-2">
                                    Load More Gigs
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Map View Quick Access */}
            <div className="fixed bottom-8 right-8 z-40">
                <Button className="h-14 bg-accent-dark hover:bg-accent-dark/90 text-white px-6 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    <span className="font-semibold text-lg">Map View</span>
                </Button>
            </div>
        </div>
    );
}
