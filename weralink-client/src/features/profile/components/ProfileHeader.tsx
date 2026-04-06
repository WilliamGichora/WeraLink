import type { ProfileData } from '@/features/profile/types';
import { BadgeCheck, MapPin, Star, Clock, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
    profile: ProfileData;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
    const { user } = profile;

    return (
        <header className="bg-stitch-bg-dark pt-12 pb-24 px-4 md:px-12 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stitch-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-6 md:gap-8">
                {/* Avatar with Badges */}
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full md:rounded-xl overflow-hidden border-4 border-stitch-primary shadow-2xl scale-100 group-hover:scale-105 transition-transform duration-300 bg-slate-800">
                        {/* Placeholder fallback for no photo */}
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                             <span className="text-4xl font-bold uppercase">{user.name.charAt(0)}</span>
                        </div>
                    </div>
                    {profile.verified && (
                        <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-stitch-primary text-white p-2 rounded-full md:rounded-lg shadow-xl border-4 border-stitch-bg-dark">
                            <BadgeCheck className="w-5 h-5 fill-white text-stitch-primary" />
                        </div>
                    )}
                </div>

                {/* Info Text */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white md:text-stitch-primary">
                            {user.name}
                        </h1>
                        <span className="px-3 py-1 bg-stitch-primary/10 border border-stitch-primary/20 rounded-full text-[10px] uppercase tracking-widest text-stitch-primary font-bold">
                            Top Rated
                        </span>
                    </div>
                    
                    <p className="text-slate-300 text-lg font-medium">
                        {profile.bio ? profile.bio.substring(0, 50) + "..." : "Skilled Professional"}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stitch-primary" />
                            <span className="text-slate-400 text-sm md:text-base">{profile.location || "Location Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                            <span className="text-slate-100 font-bold">4.9/5.0</span>
                            <span className="text-slate-400 text-sm">(124 reviews)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-stitch-primary" />
                            <span className="text-slate-400 text-sm md:text-base">
                                {profile.availabilityStatus ? "Available Now" : "Busy"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Worker Owner Management Actions */}
                <div className="flex gap-4 mt-6 md:mt-0 w-full md:w-auto px-4 md:px-0">
                    <Button className="flex-1 md:flex-none bg-stitch-primary text-white px-8 py-6 rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all text-base gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                    </Button>
                    <Button variant="outline" className="flex-none bg-white/10 backdrop-blur-md text-white border-white/20 px-6 py-6 rounded-xl hover:bg-white/20 transition-all">
                         <Search className="w-5 h-5 text-white" />
                    </Button>
                </div>
            </div>
        </header>
    );
};
