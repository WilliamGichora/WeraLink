import React from 'react';
import { motion } from 'framer-motion';
import { discoveryHooks } from '@/features/discovery/api/discovery.api';
import { TrendingUp, Users, Briefcase, Award } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sublabel }: any) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
    <div className="w-12 h-12 rounded-2xl bg-primary-wera/10 flex items-center justify-center mb-6 border border-primary-wera/20">
      <Icon className="h-6 w-6 text-primary-wera" />
    </div>
    <motion.h3 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold mb-2 text-white"
    >
      {value}
    </motion.h3>
    <p className="text-gray-400 font-medium uppercase tracking-wider text-sm">{label}</p>
    {sublabel && <p className="text-primary-wera/60 text-xs mt-2">{sublabel}</p>}
  </div>
);

export const StatsSection: React.FC = () => {
  const { data: stats, isLoading } = discoveryHooks.useGetStats();

  if (isLoading) return null;

  const kpis = [
    { icon: Briefcase, label: "Total Opportunities", value: stats?.totalGigs?.toLocaleString() || "0", sublabel: "Active and completed gigs" },
    { icon: Users, label: "Verified Elite", value: stats?.totalWorkers?.toLocaleString() || "0", sublabel: "Workers vetted for excellence" },
    { icon: TrendingUp, label: "Total Volume", value: stats?.totalEarnings > 1000000 ? `KES ${(stats?.totalEarnings / 1000000).toFixed(1)}M` : `KES ${stats?.totalEarnings?.toLocaleString()}`, sublabel: "Paid directly to workers" },
    { icon: Award, label: "Average Rating", value: stats?.avgRating || "4.8", sublabel: "Across all completed tasks" }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Platform Transparency</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Real-time metrics that define our ecosystem's growth and trust.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <StatCard key={i} {...kpi} />
          ))}
        </div>
      </div>
    </section>
  );
};
