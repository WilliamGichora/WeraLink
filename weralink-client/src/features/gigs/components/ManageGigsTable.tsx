import React, { useState, useRef } from 'react';
import { gigHooks } from '../api/gig.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, MoreVertical, Edit, Eye, Trash2, Filter, ArrowUpRight, RotateCcw, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { ManageGigsReport } from '@/features/reports/components/ManageGigsReport';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';
import { useAuth } from '@/features/auth/context/AuthContext';

type GigStatus = 'ALL' | 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CLOSED' | 'CANCELLED' | 'DRAFT';

export const ManageGigsTable: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState<GigStatus>('ALL');
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [downloading, setDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const { data: gigs, isLoading } = gigHooks.useGetMyGigs({
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });
    const deleteMutation = gigHooks.useDeleteGig();
    const repostMutation = gigHooks.useRepostGig();
    const [gigToDelete, setGigToDelete] = useState<any>(null);
    const [gigToRepost, setGigToRepost] = useState<any>(null);

    const filteredGigs = (gigs || []).filter((gig: any) => {
        const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = statusTab === 'ALL' || gig.status === statusTab;
        return matchesSearch && matchesTab;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-50 text-blue-600 border-blue-200 font-bold';
            case 'ASSIGNED': return 'bg-amber-50 text-amber-600 border-amber-200 font-bold';
            case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-200 font-bold';
            case 'DRAFT': return 'bg-slate-100 text-text-main/70 border-slate-200 font-bold';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-200 font-bold';
            case 'CLOSED': return 'bg-slate-200 text-slate-700 border-slate-300 font-bold';
            default: return 'bg-slate-100 text-text-main/70 border-slate-200 font-bold';
        }
    };

    const handleDownloadReport = async () => {
        if (!reportRef.current || filteredGigs.length === 0) {
            toast.error('No gigs to export.');
            return;
        }
        setDownloading(true);
        try {
            await downloadReportAsPdf(reportRef.current, `WeraLink-Gigs-Report`);
            toast.success('Report downloaded successfully!');
        } catch (error) {
            toast.error('Failed to generate PDF.');
        } finally {
            setDownloading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusTab('ALL');
        setCategory('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="w-full space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-accent-dark">Manage Gigs</h2>
                    <p className="text-text-main/70 text-base mt-1">View and manage all your posted opportunities.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleDownloadReport}
                        disabled={downloading || filteredGigs.length === 0}
                        className="bg-white border-slate-200 text-accent-dark rounded-xl px-4 h-12 font-bold transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {downloading ? <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />}
                        Export Data
                    </Button>
                    <Button asChild className="bg-primary-wera hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary-wera/20 px-6 h-12 font-bold transition-transform active:scale-95">
                        <Link to="/employer/gigs/new">Post New Gig</Link>
                    </Button>
                </div>
            </div>

            <div className="absolute -left-[9999px] top-0 opacity-0 overflow-hidden" aria-hidden="true">
                <ReportShell ref={reportRef} title="Manage Gigs Report">
                    <ManageGigsReport 
                        gigs={filteredGigs} 
                        employerName={user?.name || 'Employer'} 
                        filters={{ status: statusTab !== 'ALL' ? statusTab : undefined, category, startDate, endDate }} 
                    />
                </ReportShell>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="p-6 md:p-8">
                    <Tabs defaultValue="ALL" onValueChange={(val) => setStatusTab(val as GigStatus)} value={statusTab} className="w-full">
                        <div className="flex flex-col gap-6 mb-8">
                            {/* Tabs Row */}
                            <div className="w-full overflow-x-auto pb-2 -mb-2 hide-scrollbar">
                                <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-xl h-auto inline-flex min-w-max">
                                    <TabsTrigger value="ALL" className="rounded-lg data-[state=active]:bg-primary-wera/10 data-[state=active]:text-primary-wera text-text-main/70 font-bold px-4 py-2">All Gigs</TabsTrigger>
                                    <TabsTrigger value="OPEN" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-text-main/70 font-bold px-4 py-2">Active</TabsTrigger>
                                    <TabsTrigger value="ASSIGNED" className="rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600 text-text-main/70 font-bold px-4 py-2">In Progress</TabsTrigger>
                                    <TabsTrigger value="COMPLETED" className="rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-600 text-text-main/70 font-bold px-4 py-2">Completed</TabsTrigger>
                                    <TabsTrigger value="CLOSED" className="rounded-lg data-[state=active]:bg-slate-200 data-[state=active]:text-accent-dark text-text-main/70 font-bold px-4 py-2">Closed</TabsTrigger>
                                    <TabsTrigger value="CANCELLED" className="rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-600 text-text-main/70 font-bold px-4 py-2">Cancelled</TabsTrigger>
                                    <TabsTrigger value="DRAFT" className="rounded-lg data-[state=active]:bg-slate-200 data-[state=active]:text-accent-dark text-text-main/70 font-bold px-4 py-2">Drafts</TabsTrigger>
                                </TabsList>
                            </div>
                            
                            {/* Filters Row */}
                            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <div className="relative w-full lg:flex-1 lg:min-w-[200px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-main/40" />
                                    <Input 
                                        placeholder="Search by title..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 bg-white border-slate-200 text-text-main focus:border-primary-wera focus:ring-primary-wera h-12 rounded-xl text-base shadow-inner w-full"
                                    />
                                </div>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="bg-white border border-slate-200 text-text-main h-12 rounded-xl px-4 font-medium focus:border-primary-wera focus:ring-primary-wera outline-none w-full lg:w-48"
                                >
                                    <option value="">All Categories</option>
                                    <option value="TRANSLATION">Translation</option>
                                    <option value="MARKETING">Marketing</option>
                                    <option value="DATA_ENTRY">Data Entry</option>
                                    <option value="BUG_HUNTING">Bug Hunting</option>
                                    <option value="AI_LABELING">AI Labeling</option>
                                    <option value="RESEARCH">Research</option>
                                </select>
                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-white border-slate-200 text-text-main h-12 rounded-xl px-3 font-medium focus:border-primary-wera focus:ring-primary-wera flex-1 lg:w-36"
                                    />
                                    <span className="text-text-main/50 font-medium px-1">to</span>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-white border-slate-200 text-text-main h-12 rounded-xl px-3 font-medium focus:border-primary-wera focus:ring-primary-wera flex-1 lg:w-36"
                                    />
                                </div>
                                {(searchQuery || category || startDate || endDate || statusTab !== 'ALL') && (
                                    <button 
                                        onClick={clearFilters}
                                        className="text-sm font-bold text-red-500 hover:text-red-700 hover:underline transition-all flex items-center gap-1 w-full lg:w-auto justify-center lg:justify-start pt-2 lg:pt-0 lg:ml-2"
                                    >
                                        <X className="w-4 h-4" /> Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-accent-dark/70 uppercase tracking-widest">
                                <div className="col-span-1 pl-2"></div>
                                <div className="col-span-4">Gig Details</div>
                                <div className="col-span-2 text-right">Pay</div>
                                <div className="col-span-2 text-center">Applicants</div>
                                <div className="col-span-2 text-center">Status</div>
                                <div className="col-span-1 text-center">Actions</div>
                            </div>
                            
                            <div className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <div className="p-12 text-center text-text-main/60 font-semibold">Loading gigs...</div>
                                ) : filteredGigs.length === 0 ? (
                                    <div className="p-16 text-center text-text-main/50">
                                        <p className="mb-2 text-lg font-bold">No gigs found matching your criteria.</p>
                                    </div>
                                ) : (
                                    filteredGigs.map((gig: any) => (
                                        <div key={gig.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-3 items-center hover:bg-pink-50 transition-colors group">
                                            
                                            {/* List Decorator */}
                                            <div className="hidden md:flex col-span-1 justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-primary-wera transition-colors"></div>
                                            </div>

                                            {/* Mobile: Top Row / Desktop: Col 4 */}
                                            <div className="col-span-1 md:col-span-4 pl-0 md:pl-2">
                                                <h3 className="font-bold text-accent-dark line-clamp-1 text-lg mb-1">{gig.title}</h3>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-text-main/50">
                                                    <span>Posted: {new Date(gig.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>Due: {new Date(gig.expiresAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Mobile: Middle Row / Desktop: Col 2, 2, 2 */}
                                            <div className="col-span-1 md:col-span-6 flex flex-row md:grid md:grid-cols-6 items-center justify-between gap-4 mt-3 md:mt-0">
                                                <div className="md:col-span-2 md:text-right font-black text-green-400 text-lg md:text-base">
                                                    {gig.currency} {gig.payAmount?.toLocaleString()}
                                                </div>
                                                <div className="md:col-span-2 text-center">
                                                    <Link 
                                                        to={`/employer/gigs/${gig.id}/applicants`}
                                                        className="inline-flex items-center justify-center bg-slate-50 text-text-main/70 rounded-lg px-3 py-1 text-sm border border-slate-200 font-bold shadow-sm hover:bg-primary-wera/10 hover:text-primary-wera hover:border-primary-wera/30 transition-all cursor-pointer group/badge"
                                                    >
                                                        {gig._count?.assignments ?? 0} <span className="hidden sm:inline ml-1">Applied</span>
                                                        <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                                                    </Link>
                                                </div>
                                                <div className="md:col-span-2 text-center">
                                                    <Badge variant="outline" className={`ml-auto md:mx-auto shadow-sm px-3 py-1 ${getStatusColor(gig.status)}`}>
                                                        {gig.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Mobile: Action / Desktop: Col 1 */}
                                            <div className="hidden md:flex col-span-1 justify-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-text-main/40 hover:text-accent-dark hover:bg-slate-200 rounded-xl transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white border-slate-200 text-accent-dark shadow-xl rounded-xl p-2 min-w-[160px]">
                                                        <DropdownMenuItem onClick={() => navigate(`/employer/gigs/${gig.id}`)} className="hover:bg-slate-50 cursor-pointer rounded-lg font-bold">
                                                            <Eye className="w-4 h-4 mr-3 text-slate-400" /> View Details
                                                        </DropdownMenuItem>
                                                        {gig.status === 'OPEN' || gig.status === 'DRAFT' ? (
                                                            <DropdownMenuItem onClick={() => navigate(`/employer/gigs/${gig.id}/edit`)} className="hover:bg-slate-50 cursor-pointer rounded-lg font-bold">
                                                                <Edit className="w-4 h-4 mr-3 text-slate-400" /> Edit Gig
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        {(gig.status === 'CANCELLED' || gig.status === 'COMPLETED') && (
                                                            <DropdownMenuItem onClick={() => setGigToRepost(gig)} className="hover:bg-slate-50 cursor-pointer rounded-lg font-bold text-primary-wera">
                                                                <RotateCcw className="w-4 h-4 mr-3" /> Repost Gig
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(gig.status === 'OPEN' || gig.status === 'DRAFT') && (
                                                            <DropdownMenuItem onClick={() => setGigToDelete(gig)} className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer mt-1 border-t border-slate-100 pt-2 rounded-lg font-bold">
                                                                <Trash2 className="w-4 h-4 mr-3" /> Cancel Gig
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            {/* Mobile-only Action Row */}
                                            <div className="flex md:hidden justify-end pt-3 border-t border-slate-100 mt-2">
                                                 <Button variant="outline" size="sm" className="border-slate-200 text-accent-dark font-bold rounded-xl active:scale-95 transition-transform">
                                                    Manage Gig
                                                 </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            <AlertDialog open={!!gigToDelete} onOpenChange={(open) => !open && setGigToDelete(null)}>
                <AlertDialogContent className="bg-white border-slate-200 rounded-2xl p-6 sm:max-w-md shadow-2xl">
                    <AlertDialogHeader>
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-accent-dark text-center">
                            Cancel Gig?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-text-main/70 text-center text-sm">
                            Are you absolutely sure you want to cancel <strong className="text-accent-dark">"{gigToDelete?.title}"</strong>? 
                            This action cannot be undone and will permanently remove it from the active WeraLink marketplace.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel disabled={deleteMutation.isPending} className="mt-0 w-full rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-text-main/70 active:scale-95 transition-transform">
                            Keep Gig
                        </AlertDialogCancel>
                        <Button 
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                                if (gigToDelete) {
                                    await deleteMutation.mutateAsync(gigToDelete.id);
                                    setGigToDelete(null);
                                }
                            }}
                            className="w-full rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            {deleteMutation.isPending ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Canceling...</>
                            ) : (
                                "Yes, Cancel It"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!gigToRepost} onOpenChange={(open) => !open && setGigToRepost(null)}>
                <AlertDialogContent className="bg-white border-slate-200 rounded-2xl p-6 sm:max-w-md shadow-2xl">
                    <AlertDialogHeader>
                        <div className="mx-auto w-12 h-12 bg-primary-wera/10 rounded-full flex items-center justify-center mb-4">
                            <RotateCcw className="w-6 h-6 text-primary-wera" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-accent-dark text-center">
                            Repost Gig?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-text-main/70 text-center text-sm">
                            {gigToRepost?.status === 'CANCELLED' ? (
                                <>This will move <strong className="text-accent-dark">"{gigToRepost?.title}"</strong> back to the active marketplace with a new 30-day deadline. Previous applications will be kept for history, and you can accept new ones.</>
                            ) : (
                                <>This will create a <strong className="text-accent-dark">new copy</strong> of the gig <strong className="text-accent-dark">"{gigToRepost?.title}"</strong> as a fresh opportunity. This preserves your historical data while allowing you to hire again for the same task.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex flex-col md:flex-col gap-3">
                        <AlertDialogCancel disabled={repostMutation.isPending} className="mt-0 w-full rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-text-main/70 active:scale-95 transition-transform">
                            Cancel
                        </AlertDialogCancel>
                        <Button 
                            disabled={repostMutation.isPending}
                            onClick={async () => {
                                if (gigToRepost) {
                                    try {
                                        const result = await repostMutation.mutateAsync(gigToRepost.id);
                                        toast.success(result.action === 'RENEWED' ? 'Gig renewed successfully!' : 'Gig cloned successfully!');
                                        setGigToRepost(null);
                                    } catch (err: any) {
                                        toast.error(err.response?.data?.message || 'Failed to repost gig');
                                    }
                                }
                            }}
                            className="w-full rounded-xl bg-primary-wera text-white font-bold hover:bg-primary-dark active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            {repostMutation.isPending ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Reposting...</>
                            ) : (
                                "Confirm Repost"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
