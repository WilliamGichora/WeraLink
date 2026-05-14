import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, CheckCircle2, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearningHubPreview: React.FC = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden px-4 md:px-8">
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
          <div className="flex-1 space-y-8 text-right lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items items-center gap-2 md:px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black tracking-widest uppercase text-blue-600">Continuous Mastery</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-accent-dark tracking-tight leading-tight mb-8">
                Learn. Upskill. <br />
                <span className="text-primary-wera">Earn.</span>
              </h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed mb-10 max-w-xl ml-auto lg:ml-0">
                WeraLink isn't just a marketplace; it's an incubator for excellence. Access high-impact training and earn badges that verify your expertise.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                {[
                  { icon: Award, title: "Tiered Badges", desc: "Unlock exclusive badges as you master new skills." },
                  { icon: Star, title: "Score Multiplier", desc: "Certifications directly increase your match percentage." },
                  { icon: Sparkles, title: "Expert Content", desc: "Curated learning paths designed for the Kenyan market." },
                  { icon: CheckCircle2, title: "Social Proof", desc: "Showcase your achievements on your public profile." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <item.icon className="h-5 w-5 text-accent-dark" />
                    </div>
                    <div>
                      <h4 className="font-black text-accent-dark">{item.title}</h4>
                      <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-end lg:justify-start">
                {/*<Button size="lg" className="h-16 px-10 bg-accent-dark hover:bg-black text-white rounded-2xl text-lg font-black group shadow-2xl" asChild>
                  <Link to="/learning-hub">
                    Visit Learning Hub <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>*/}
                <Link to="/why-weralink" className="text-accent-dark hover:text-primary-wera font-black text-lg flex items-center gap-2 transition-colors group">
                  About Learning Hub <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative">
             <div className="absolute inset-0 bg-primary-wera/5 rounded-full blur-[100px] scale-150" />
             
             {/* Badge Showcase Animation */}
             <div className="relative grid grid-cols-2 gap-6 p-4">
                {[
                  { name: "Expert Admin", delay: 0.1, rotate: -5 },
                  { name: "Verified Python Pro", delay: 0.2, rotate: 3 },
                  { name: "Top-Tier Marketer", delay: 0.3, rotate: -2 },
                  { name: "Platform Strategist", delay: 0.4, rotate: 6 }
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: badge.rotate }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
                    transition={{ delay: badge.delay, duration: 0.6 }}
                    className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-xl flex flex-col items-center text-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary-wera/10 transition-colors">
                      <Award className="w-8 h-8 text-primary-wera" />
                    </div>
                    <span className="font-black text-accent-dark text-sm leading-tight mb-2">{badge.name}</span>
                    <div className="flex items-center gap-1">
                       {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2 h-2 fill-amber-400 text-amber-400" />)}
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
