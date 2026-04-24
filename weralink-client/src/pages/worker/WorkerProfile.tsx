import { useState } from 'react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { ProfileHeader, ProfileContact, ProfileSkills, PortfolioGrid, EditProfileModal } from '@/features/profile/components';
import { Loader2 } from 'lucide-react';

const WorkerProfile = () => {
    const { data: profile, isLoading, isError } = useProfile();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-wera" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <p>Failed to load profile. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stitch-soft-pink dark:bg-stitch-bg-dark font-sans pb-20">
            <ProfileHeader profile={profile!} onEditClick={() => setIsEditModalOpen(true)} />
            
            <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-10 lg:-mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-20">
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    <section className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-stitch-primary/10">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-stitch-primary rounded-full"></span>
                            About Me
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                            {profile!.bio || "No bio added yet. Tell clients about yourself!"}
                        </p>
                    </section>
                    
                    <ProfileSkills profile={profile!} />

                    <PortfolioGrid profile={profile!} />
                </div>

                <div className="w-full space-y-6 lg:space-y-8 shrink-0 lg:col-span-1">
                    <ProfileContact profile={profile!} onEditClick={() => setIsEditModalOpen(true)} />
                </div>
            </div>

            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                profile={profile!} 
            />
        </div>
    );
};

export default WorkerProfile;
