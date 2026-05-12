import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { discoveryHooks } from '@/features/discovery/api/discovery.api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Star, CheckCircle2, Users, Award, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const TalentDiscoveryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { data: featured, isLoading } = discoveryHooks.useGetFeatured();

  // Roles that are allowed to see other workers
  const canSeeWorkers = !user || user.role === 'EMPLOYER' || user.role === 'ADMIN';

  const filteredWorkers = canSeeWorkers ? (featured?.featuredWorkers?.filter((w: any) => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.bio?.toLowerCase().includes(search.toLowerCase()) ||
    w.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  ) || []) : [];

  const filteredEmployers = featured?.featuredEmployers?.filter((e: any) => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.bio?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background-light pb-24 font-sans">
      {/* Hero Header */}
      <div className="bg-accent-dark text-white pt-20 pb-24 relative overflow-hidden px-4 md:px-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="bg-primary-wera/20 p-2 rounded-lg">
              <Users className="w-6 h-6 text-primary-wera" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">Workers and Employers Directory</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {user?.role === 'WORKER' ? (
              <>Find <span className="text-primary-wera">Top</span> Employers</>
            ) : (
              <>Discover <span className="text-primary-wera">Elite</span> Talent</>
            )}
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl leading-relaxed mx-auto md:mx-0">
            {user?.role === 'WORKER' 
              ? "Connect with high-impact employers on WeraLink who are looking for verified professionals to execute critical projects."
              : "Connect with verified professionals who have proven their expertise through our platform's rigorous verification and marketplace execution."
            }
          </p>
        </div>
      </div>

      {/* Simplified Search Bar */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-2xl flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by skill, name or bio..." 
              className="w-full pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="h-12 px-8 bg-primary-wera hover:bg-primary-dark text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-wera/20">
            Find
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="h-80 bg-white rounded-[32px] border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (!filteredWorkers.length && !filteredEmployers.length) ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-accent-dark mb-2">No Talent Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any professionals or employers matching "{search}" at this moment.
            </p>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Workers Section */}
            {filteredWorkers.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-accent-dark mb-10 flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary-wera" /> Elite Workers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredWorkers.map((worker: any) => (
                    <motion.div 
                      key={worker.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-2xl hover:border-primary-wera/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <Avatar className="h-20 w-20 border-2 border-slate-50 group-hover:border-primary-wera/20 transition-colors">
                          <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-bold">
                            {worker.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {worker.verified && (
                          <div className="bg-green-50 text-green-600 p-2 rounded-full border border-green-100">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-accent-dark mb-1">{worker.name}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <MapPin className="w-4 h-4" /> {worker.location}
                      </div>

                      <p className="text-slate-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {worker.bio || 'WeraLink certified professional with a focus on delivering high-performance results for every task.'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {worker.skills.slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-amber-500 mb-1">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-bold text-accent-dark">4.9</span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{worker.completions} Gigs Done</p>
                        </div>
                        <Button variant="outline" className="border-primary-wera/20 text-primary-wera hover:bg-primary-wera hover:text-white font-bold rounded-xl" asChild>
                          <Link to={`/profile/${worker.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Employers Section */}
            {filteredEmployers.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-accent-dark mb-10 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-primary-wera" /> Top Employers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEmployers.map((employer: any) => (
                    <motion.div 
                      key={employer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-2xl hover:border-primary-wera/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:border-primary-wera/20 transition-colors">
                          <Users className="w-10 h-10 text-slate-300" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-accent-dark mb-1">{employer.name}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <MapPin className="w-4 h-4" /> {employer.location || 'Nairobi, Kenya'}
                      </div>

                      <p className="text-slate-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {employer.bio || 'Verified employer on WeraLink, consistently posting high-impact opportunities for the Kenyan gig economy.'}
                      </p>

                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary-wera">{employer.gigCount}</p>
                          <p className="text-xs text-slate-400 font-medium">Gigs Posted</p>
                        </div>
                        <Button variant="outline" className="border-primary-wera/20 text-primary-wera hover:bg-primary-wera hover:text-white font-bold rounded-xl" asChild>
                          <Link to={`/profile/${employer.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentDiscoveryPage;
