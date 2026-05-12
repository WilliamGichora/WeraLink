import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discoveryHooks } from '@/features/discovery/api/discovery.api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, MapPin, Calendar, CheckCircle2, 
  Award, Briefcase, ShieldCheck, ArrowLeft,
  Mail, Phone, Lock, Sparkles, ArrowRight
} from 'lucide-react';

const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading } = discoveryHooks.useGetPublicProfile(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-accent-dark">Profile Not Found</h2>
        <p className="text-slate-500 mb-8">This professional profile may be private or does not exist.</p>
        <Button onClick={() => navigate('/talent')}>Back to Discovery</Button>
      </div>
    );
  }

  const isWorker = profile.role === 'WORKER';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* Header Banner */}
      <div className="h-64 md:h-80 bg-accent-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-wera/20 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col justify-between py-8 relative z-10">
          <Button 
            variant="ghost" 
            className="self-start text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discovery
          </Button>

          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-primary-wera/20 text-primary-wera text-[10px] font-black uppercase tracking-widest border border-primary-wera/30">
                {profile.role} Profile
              </span>
              {profile.verified && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Verified Member
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {profile.name}
            </h1>
            <p className="text-white/50 text-lg font-medium flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" /> {profile.location}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] rounded-[40px] overflow-hidden bg-white">
              <CardContent className="pt-12 pb-10 flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <Avatar className="h-40 w-40 border-8 border-white shadow-2xl">
                    <AvatarFallback className="bg-linear-to-br from-primary-wera to-primary-dark text-white text-5xl font-black">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.verified && (
                    <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-lg">
                      <div className="bg-primary-wera text-white p-1 rounded-full">
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-black text-accent-dark tracking-tight mb-1">{profile.name}</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8">{profile.role} EXPERT</p>
                
                <div className="grid grid-cols-2 gap-4 w-full px-4">
                  <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 group hover:border-primary-wera/20 transition-all">
                    <p className="text-3xl font-black text-accent-dark group-hover:text-primary-wera transition-colors">{profile.stats.completions}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Gigs Completed</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 group hover:border-amber-200 transition-all">
                    <p className="text-3xl font-black text-accent-dark group-hover:text-amber-500 transition-colors flex items-center justify-center gap-1">
                      4.9 <Star className="w-4 h-4 fill-current" />
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Professional Rating</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-8 mx-8" />

                <div className="w-full space-y-4 px-4">
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Member Since</p>
                      <p className="text-accent-dark">{new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Operating From</p>
                      <p className="text-accent-dark">{profile.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {isWorker && (
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <Button className="w-full h-16 bg-primary-wera hover:bg-primary-dark text-white rounded-[20px] font-black text-lg shadow-xl shadow-primary-wera/20 transition-all hover:scale-[1.02] active:scale-95 group">
                    Hire This Talent <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Privacy Card */}
            <Card className="border-none shadow-xl rounded-[32px] bg-white p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-primary-wera/5 transition-colors" />
              
              <h3 className="font-black text-accent-dark mb-6 flex items-center gap-3 relative z-10">
                <ShieldCheck className="w-6 h-6 text-primary-wera" /> Privacy First
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Direct Email</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-400 italic text-[10px] font-bold">
                    <Lock className="w-3 h-3" /> PROTECTED
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Phone Number</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-400 italic text-[10px] font-bold">
                    <Lock className="w-3 h-3" /> PROTECTED
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Bio, Skills, Badges */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Bio */}
            <Card className="border-none shadow-xl rounded-[40px] p-10 md:p-12 bg-white relative overflow-hidden group">
              <div className="absolute top-10 right-10 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                <Sparkles className="w-32 h-32 text-primary-wera" />
              </div>
              
              <h2 className="text-3xl font-black text-accent-dark mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-wera/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary-wera" />
                </div>
                Professional Journey
              </h2>
              <p className="text-slate-600 text-xl leading-[1.8] font-medium whitespace-pre-wrap relative z-10">
                {profile.bio || "This professional is a verified member of the WeraLink community with a track record of high-performance task execution and consistent reliability."}
              </p>
            </Card>

            {/* Skills & Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skills */}
              <Card className="border-none shadow-xl rounded-[40px] p-10 bg-white">
                <h3 className="text-2xl font-black text-accent-dark mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  Core Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill: any) => (
                    <div 
                      key={skill.name}
                      className={`px-5 py-2.5 rounded-2xl border-2 text-sm font-black flex items-center gap-2.5 transition-all ${
                        skill.verified 
                          ? 'bg-primary-wera/5 border-primary-wera/10 text-primary-wera shadow-sm' 
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      {skill.name}
                      {skill.verified && <CheckCircle2 className="w-4 h-4 fill-current" />}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Badges */}
              <Card className="border-none shadow-xl rounded-[40px] p-10 bg-white">
                <h3 className="text-2xl font-black text-accent-dark mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  Accomplishments
                </h3>
                <div className="space-y-6">
                  {profile.badges.length > 0 ? profile.badges.map((b: any) => (
                    <div key={b.name} className="flex items-start gap-4 group">
                      <div className="bg-amber-100 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="pt-1">
                        <p className="font-black text-accent-dark text-base tracking-tight">{b.name}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{b.description}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <Award className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Leveling Up...</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Active Gigs (For Employers) */}
            {profile.role === 'EMPLOYER' && profile.activeGigs && profile.activeGigs.length > 0 && (
              <Card className="border-none shadow-2xl rounded-[40px] p-10 md:p-12 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary-wera to-blue-600" />
                
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black text-accent-dark flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    Open Opportunities
                  </h2>
                  <Button variant="ghost" className="text-primary-wera font-black hover:bg-primary-wera/10 rounded-xl" onClick={() => navigate('/marketplace')}>
                    Explore All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {profile.activeGigs.map((gig: any) => (
                    <div 
                      key={gig.id}
                      className="group p-8 rounded-[32px] border-2 border-slate-50 hover:border-primary-wera/30 hover:bg-primary-wera/2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                      onClick={() => navigate(`/gigs/${gig.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            {gig.category}
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                            {gig.workType}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-accent-dark group-hover:text-primary-wera transition-colors leading-tight mb-2">
                          {gig.title}
                        </h3>
                        <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {gig.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-10">
                        <div className="text-right">
                          <p className="text-3xl font-black text-primary-wera tracking-tighter">
                            {gig.currency} {Number(gig.payAmount).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Guaranteed Escrow</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-wera group-hover:text-white group-hover:rotate-45 transition-all shadow-sm">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Ratings & Reviews */}
            <Card className="border-none shadow-xl rounded-[40px] p-10 md:p-12 bg-white">
              <h2 className="text-3xl font-black text-accent-dark mb-12 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                Reputation in WeraLink
              </h2>
              
              <div className="space-y-10">
                {profile.ratings.length > 0 ? profile.ratings.map((rating: any, i: number) => (
                  <div key={i} className="relative pl-12 group">
                    <div className="absolute left-0 top-0 w-1 h-full bg-slate-100 group-hover:bg-primary-wera/30 transition-colors rounded-full" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex text-amber-400 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                          {Array.from({ length: 5 }).map((_, star) => (
                            <Star key={star} className={`h-4 w-4 ${star < rating.score ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(rating.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Verified Review by</span>
                         <span className="text-sm font-black text-accent-dark">{rating.rater.name}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed italic font-medium">
                      "{rating.comment || 'Outstanding professional contribution to the project.'}"
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                     <Star className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                     <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Building Reputation...</p>
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
