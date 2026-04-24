import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '../hooks/useProfile';
import type { ProfileData, PortfolioItem } from '../types';
import { Loader2, Link2, Type, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface EditPortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: ProfileData;
}

export const EditPortfolioModal: React.FC<EditPortfolioModalProps> = ({ isOpen, onClose, profile }) => {
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.url) {
            toast.error("Title and URL are required");
            return;
        }

        const newItem: PortfolioItem = {
            id: crypto.randomUUID(),
            title: formData.title,
            description: formData.description,
            url: formData.url,
            type: 'LINK'
        };

        const currentPortfolio = profile.portfolio || [];
        const newPortfolio = [...currentPortfolio, newItem];

        updateProfile({ portfolio: newPortfolio }, {
            onSuccess: () => {
                toast.success("Portfolio item added!");
                setFormData({ title: '', description: '', url: '' });
                onClose();
            },
            onError: () => {
                toast.error("Failed to add portfolio item");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-stitch-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-stitch-primary/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                
                <DialogHeader className="pt-6 px-6 pb-2 relative z-10 shrink-0">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-6 h-1 bg-stitch-primary rounded-full"></span>
                        Add Portfolio Item
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Link to your past work, GitHub, Dribbble, or live websites.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6 relative z-10">
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2 relative group">
                            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-500">Project Title</Label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <Input 
                                    id="title" 
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-stitch-primary/30 text-base"
                                    placeholder="e.g. E-commerce Website Design" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <Label htmlFor="url" className="text-xs font-bold uppercase tracking-widest text-slate-500">Project URL</Label>
                            <div className="relative">
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <Input 
                                    id="url" 
                                    value={formData.url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-stitch-primary/30 text-base"
                                    placeholder="https://" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-500">Short Description</Label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <textarea 
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full flex min-h-[100px] pl-12 pr-4 pt-4 pb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-stitch-primary/30 text-base resize-none"
                                    placeholder="Briefly explain your role in this project..."
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-0 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="rounded-xl h-12 font-bold px-6">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="rounded-xl h-12 font-bold px-8 bg-stitch-primary hover:bg-stitch-primary/90 text-white shadow-lg">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                </>
                            ) : "Add Portfolio Item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
