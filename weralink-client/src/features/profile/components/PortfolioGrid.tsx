import { useState } from 'react';
import type { ProfileData } from '@/features/profile/types';
import { FolderGit2, Plus, ExternalLink, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '../hooks/useProfile';
import { EditPortfolioModal } from './EditPortfolioModal';
import { toast } from 'sonner';

export const PortfolioGrid = ({ profile }: { profile: ProfileData }) => {
    // In our Prisma schema, profile.portfolio is a Json type mapping to an array of items.
    const portfolioItems: any[] = Array.isArray(profile.portfolio) ? profile.portfolio : [];
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { mutate: updateProfile } = useUpdateProfile();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setDeletingId(id);
        const newPortfolio = portfolioItems.filter(item => item.id !== id);
        
        updateProfile({ portfolio: newPortfolio }, {
            onSuccess: () => {
                toast.success("Portfolio item removed");
                setDeletingId(null);
            },
            onError: () => {
                toast.error("Failed to remove item");
                setDeletingId(null);
            }
        });
    };

    return (
        <section className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-stitch-primary/10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-8 h-1 bg-stitch-primary rounded-full"></span>
                    Portfolio
                </h2>
                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    variant="ghost" 
                    size="sm" 
                    className="text-stitch-primary hover:bg-stitch-primary/10 rounded-full h-8 px-3 text-xs font-bold gap-1"
                >
                    <Plus className="w-4 h-4" /> Upload Work
                </Button>
            </div>

            {portfolioItems.length === 0 ? (
                <div className="p-8 md:p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-stitch-primary/50 hover:bg-stitch-card-pink transition-all">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-stitch-primary/10 transition-transform">
                        <FolderGit2 className="w-8 h-8 text-slate-400 group-hover:text-stitch-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Build your showcase</h3>
                    <p className="text-slate-500 max-w-sm mb-6 text-sm">Upload images, documents, or links to previous projects to attract more clients.</p>
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-xl px-6"
                    >
                        Add Portfolio Item
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolioItems.map((item, idx) => (
                        <div key={item.id || idx} className="group relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900/50 hover:border-stitch-primary/30 transition-all">
                            
                            {/* Delete Button */}
                            <Button 
                                onClick={(e) => handleDelete(item.id, e)}
                                disabled={deletingId === item.id}
                                variant="destructive" 
                                className="absolute top-2 right-2 w-8 h-8 rounded-full p-0 z-10 shadow hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            >
                                {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            </Button>

                            <div className="h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                {item.type === 'IMAGE' ? (
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                            </div>
                            {item.url && (
                                <a href={item.url} target="_blank" rel="noreferrer" aria-label={`View ${item.title}`} className="absolute top-12 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                                    <ExternalLink className="w-4 h-4 text-slate-800" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <EditPortfolioModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                profile={profile} 
            />
        </section>
    );
};
