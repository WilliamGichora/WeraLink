import type { ProfileData } from '@/features/profile/types';
import { Mail, Phone, Share2, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '@/features/profile/hooks/useProfile';
import { toast } from 'sonner';

export const ProfileContact = ({ profile, onEditClick }: { profile: ProfileData; onEditClick: () => void }) => {
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    return (
        <aside className="space-y-6 lg:space-y-8">
            {/* Performance Stats Card */}
            <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stitch-primary/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <h2 className="text-xl font-black tracking-tight text-stitch-primary mb-6 uppercase">Performance</h2>
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Platform Reputation</span>
                            <span className="text-stitch-primary font-bold">Excellent</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full">
                            <div className="bg-stitch-primary h-2 rounded-full w-full"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                            <span className="block text-2xl font-black text-white">{profile.user?.ratingsRecv?.length || 0}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Total Reviews</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                            <span className="block text-2xl font-black text-white">0</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Jobs Taken</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-stitch-primary/5 shadow-sm">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-6">Contact Info</h2>
                <ul className="space-y-5">
                    <li className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-stitch-primary/10 flex items-center justify-center text-stitch-primary shrink-0">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Email</span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{profile.user.email}</span>
                        </div>
                    </li>
                    <li className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-stitch-primary/10 flex items-center justify-center text-stitch-primary shrink-0">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mobile</span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{profile.user.phone || "Not provided"}</span>
                        </div>
                    </li>
                </ul>
                
                <div className="mt-8 pt-8 border-t border-stitch-primary/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-500 font-medium">Availability Status</span>
                        <button 
                            onClick={() => {
                                updateProfile({ availabilityStatus: !profile.availabilityStatus });
                                toast.success(`Status updated to ${!profile.availabilityStatus ? 'Available' : 'Busy'}`);
                            }}
                            disabled={isUpdating}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${profile.availabilityStatus ? 'bg-stitch-primary' : 'bg-slate-200 dark:bg-slate-700'} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            aria-label="Toggle availability"
                        >
                            <span 
                                className={`absolute top-1 bg-white w-5 h-5 rounded-full transition-all duration-300 shadow-sm ${profile.availabilityStatus ? 'left-[30px]' : 'left-1'}`}
                            ></span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Quick Actions / Management Actions */}
            <section className="space-y-3">
                <Button variant="outline" className="w-full flex items-center justify-between p-6 bg-stitch-card-pink text-stitch-primary rounded-xl border-stitch-primary/20 font-black tracking-tight hover:bg-stitch-primary hover:text-white transition-all group">
                    Request Verification
                    <ShieldQuestion className="w-5 h-5 group-hover:text-white" />
                </Button>
                <Button onClick={onEditClick} variant="outline" className="w-full flex items-center justify-between p-6 bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border-slate-200 dark:border-slate-700 font-black tracking-tight hover:border-stitch-primary transition-all">
                    Profile Settings
                    <Share2 className="w-5 h-5" />
                </Button>
            </section>
        </aside>
    );
};
