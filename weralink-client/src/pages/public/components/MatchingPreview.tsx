import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const MatchingPreview: React.FC = () => {
  return (
    <section className="py-32 bg-accent-dark relative overflow-hidden px-4 md:px-8">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-wera/10 rounded-full blur-[150px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -ml-32 -mb-32" />
      
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-wera/10 border border-primary-wera/20 mb-6">
                <Brain className="h-4 w-4 text-primary-wera" />
                <span className="text-[10px] font-black tracking-widest uppercase text-primary-wera">Advanced recommendations and matching</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-8">
                Intelligent Matching. <br />
                <span className="text-primary-wera">Zero Bias.</span>
              </h2>
              <p className="text-gray-400 text-xl font-medium leading-relaxed mb-10 max-w-xl">
                Our bidirectional matching engine uses objective data to connect the right talent with the right task. No noise, no guesswork — just merit.
              </p>
              
              <div className="space-y-6 mb-12">
                {[
                  { icon: Target, title: "Precision Targeting", desc: "45% weight on core skill alignment and expertise levels." },
                  { icon: ShieldCheck, title: "Verified Merit", desc: "Performance boosts for verified skills and top-tier ratings." },
                  { icon: TrendingUp, title: "Fair Discovery", desc: "Anti-bias algorithms ensure everyone has a path to the top." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="bg-primary-wera/20 p-2 rounded-xl">
                      <item.icon className="h-5 w-5 text-primary-wera" />
                    </div>
                    <div>
                      <h4 className="font-black text-white">{item.title}</h4>
                      <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" className="h-16 px-10 bg-primary-wera hover:bg-primary-dark text-white rounded-2xl text-lg font-black group shadow-2xl" asChild>
                <Link to="/why-weralink">
                  How the Engine Works <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="flex-1 w-full max-w-xl">
             {/* Mock Score Visualization */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="bg-[#1a0d0e] border border-white/10 rounded-[40px] p-8 md:p-12 relative shadow-2xl"
             >
                <div className="text-center mb-10">
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={552.92}
                        initial={{ strokeDashoffset: 552.92 }}
                        whileInView={{ strokeDashoffset: 552.92 * (1 - 0.94) }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="text-primary-wera"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white">94%</span>
                      <span className="text-[10px] font-black text-primary-wera uppercase tracking-widest">Match Score</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                     <span className="text-sm font-bold text-gray-400">Skill Alignment</span>
                     <span className="text-emerald-400 font-black">+45%</span>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                     <span className="text-sm font-bold text-gray-400">Historical Reliability</span>
                     <span className="text-emerald-400 font-black">+25%</span>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                     <span className="text-sm font-bold text-gray-400">LMS Mastery Boost</span>
                     <span className="text-emerald-400 font-black">+15%</span>
                   </div>
                   <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-primary-wera/60 uppercase tracking-widest justify-center">
                     <ShieldCheck className="w-3 h-3" /> System Verified Match
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
