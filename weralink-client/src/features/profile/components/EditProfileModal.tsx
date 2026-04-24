import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '../hooks/useProfile';
import type { ProfileData } from '../types';
import { Loader2, User, Phone, MapPin, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: ProfileData;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile }) => {
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const [formData, setFormData] = useState({
        name: profile.user.name || '',
        phone: profile.user.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
    });

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: profile.user.name || '',
                phone: profile.user.phone || '',
                location: profile.location || '',
                bio: profile.bio || '',
            });
        }
    }, [isOpen, profile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        updateProfile(formData, {
            onSuccess: () => {
                toast.success("Profile updated successfully!");
                onClose();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.errors?.[0]?.message || "Failed to update profile");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-stitch-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-stitch-primary/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                
                <DialogHeader className="relative z-10 pt-4 pb-2 px-6">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-6 h-1 bg-stitch-primary rounded-full"></span>
                        Edit Profile Details
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Update your public information to stand out to employers.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6 relative z-10">
                    <div className="space-y-5">
                        <div className="space-y-2 relative group">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <Input 
                                    id="name" 
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-xl focus-visible:ring-stitch-primary/30 text-base"
                                    placeholder="Enter your full name" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <Input 
                                    id="phone" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-xl focus-visible:ring-stitch-primary/30 text-base"
                                    placeholder="+254 7XX XXX XXX" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <Input 
                                    id="location" 
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-xl focus-visible:ring-stitch-primary/30 text-base"
                                    placeholder="e.g. Nairobi, Kenya" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional Bio</Label>
                            <div className="relative">
                                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                                <textarea 
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full flex min-h-[120px] pl-12 pr-4 pt-4 pb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-primary/30 text-base resize-none"
                                    placeholder="Tell clients about your expertise, experience, and what makes you unique..."
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
