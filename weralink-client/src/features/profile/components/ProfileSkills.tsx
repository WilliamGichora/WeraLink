import type { ProfileData } from '@/features/profile/types';
import { Award, Plus, ShieldCheck, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProfileSkills = ({ profile }: { profile: ProfileData }) => {
    const { user } = profile;
    const skills = user.skills || [];
    
    return (
        <section className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-stitch-primary/10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-8 h-1 bg-stitch-primary rounded-full"></span>
                    Skills & Attributes
                </h2>
                <Button variant="ghost" size="sm" className="text-stitch-primary hover:bg-stitch-primary/10 rounded-full h-8 px-3 text-xs font-bold gap-1">
                    <Plus className="w-4 h-4" /> Add Skill
                </Button>
            </div>
            
            {skills.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-500">
                    <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm">You haven't highlighted any skills yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {skills.map((s: any) => (
                        <div key={s.id} className="p-4 bg-stitch-card-pink dark:bg-slate-900/50 rounded-xl border border-stitch-primary/10 flex flex-col items-center text-center group hover:shadow-md transition-all relative">
                            {s.verified && (
                                <ShieldCheck className="w-4 h-4 text-green-500 absolute top-2 right-2" />
                            )}
                            <div className="w-12 h-12 bg-stitch-primary/20 dark:bg-stitch-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6 text-stitch-primary" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-stitch-primary">{s.skill?.name || "Skill"}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Hardcoded system badging representation based on Stitch */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                     <Trophy className="w-4 h-4" /> System Badges
                 </h3>
                 <div className="flex flex-wrap gap-3">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                         <ShieldCheck className="w-4 h-4 text-green-600" />
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Identity Verified</span>
                     </div>
                 </div>
            </div>
        </section>
    );
};
