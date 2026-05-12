import React from 'react';
import { motion } from 'framer-motion';
import { discoveryHooks } from '@/features/discovery/api/discovery.api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedShowcase: React.FC = () => {
  const { data: featured, isLoading } = discoveryHooks.useGetFeatured();

  if (isLoading || !featured) return null;

  return (
    <section className="py-24 bg-[#140809]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Elite Talent Showcase</h2>
            <p className="text-gray-400">Discover the top-rated professionals driving impact on WeraLink.</p>
          </div>
          <Link to="/talent" className="text-primary-wera flex items-center gap-2 font-bold hover:underline">
            View All Professionals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.featuredWorkers.map((worker: any) => (
            <motion.div 
              key={worker.id}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 rounded-[32px] p-8 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                 {worker.verified && <CheckCircle2 className="text-primary-wera h-6 w-6" />}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-primary-wera/30">
                  <AvatarFallback className="bg-primary-wera text-white text-xl">
                    {worker.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{worker.name}</h3>
                  <p className="text-gray-400 text-sm">{worker.location}</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm line-clamp-2 mb-6 italic">
                "{worker.bio || 'WeraLink professional focused on delivering high-quality results.'}"
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {worker.skills.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="bg-white/5 border-white/10 text-white">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold text-white">Top Rated</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{worker.completions} Gigs Completed</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
