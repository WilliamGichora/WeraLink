import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '@/features/profile/api/profile.api';
import { Building, MapPin, Globe, Mail, Phone, Calendar, Edit3, Star, Briefcase, AlignLeft } from 'lucide-react';
import { EditEmployerProfileModal } from '@/features/profile/components/EditEmployerProfileModal';

export default function EmployerProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-wera/30 border-t-primary-wera rounded-full animate-spin mb-4" />
        <p className="font-bold text-accent-dark">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-accent-dark mb-2">Profile Not Found</h2>
        <p className="text-text-main/50">There was an issue loading your profile data.</p>
      </div>
    );
  }

  const user = profile.user;
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
  
  const ratings = user?.ratingsRecv || [];
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length).toFixed(1)
    : 'New';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8 font-sans space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
        <div className="h-32 bg-linear-to-r from-slate-900 to-accent-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-md text-sm font-bold flex items-center gap-2 transition-all border border-white/20"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>
        
        <div className="px-8 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
              {profile.companyLogo ? (
                <img src={profile.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-wera/10 text-primary-wera flex flex-col items-center justify-center">
                  <Building className="w-10 h-10 mb-1" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-accent-dark tracking-tight">
                {profile.companyName || user?.name || 'Company Name'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-text-main/60">
                {profile.industry && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.industry}</span>}
                {profile.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {joinDate}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                <div className="flex items-center justify-center gap-1.5 font-black text-lg text-accent-dark">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {avgRating}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reviews</p>
                <p className="font-black text-lg text-accent-dark">{ratings.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-primary-wera" /> About the Company
                </h3>
                {profile.companyDescription ? (
                  <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{profile.companyDescription}</p>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-sm font-medium mb-3">No company description provided yet.</p>
                    <button onClick={() => setIsEditModalOpen(true)} className="text-primary-wera text-sm font-bold hover:underline">Add Description</button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm">
                    <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-accent-dark block">Email</p>
                      <p className="text-slate-600">{user?.email}</p>
                    </div>
                  </li>
                  {user?.phone && (
                    <li className="flex items-start gap-3 text-sm">
                      <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-accent-dark block">Phone</p>
                        <p className="text-slate-600">{user?.phone}</p>
                      </div>
                    </li>
                  )}
                  {profile.website && (
                    <li className="flex items-start gap-3 text-sm">
                      <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-accent-dark block">Website</p>
                        <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="text-primary-wera hover:underline break-all">
                          {profile.website}
                        </a>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditEmployerProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}
