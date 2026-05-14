import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Target, TrendingUp, 
  Award, BookOpen, Scale, Sparkles,
  CheckCircle2, ArrowRight, Star, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link ,useNavigate} from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/context/AuthContext';

const WhyWeraLink: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="bg-accent-dark text-white pt-32 pb-24 relative overflow-hidden px-4 md:px-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-wera/20 rounded-full blur-[150px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] -ml-32 -mb-32" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-wera/20 border border-primary-wera/30 mb-8">
              <Sparkles className="h-4 w-4 text-primary-wera" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-wera">Intelligent Marketplace</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
              A Meritocratic <br /><span className="text-primary-wera">Ecosystem</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              I built WeraLink to eliminate bias and ensure that the best talent always finds the best opportunities through objective, weight-based matching.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Algorithm Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Algorithm Breakdown */}
          <div className="lg:col-span-7">
            <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] rounded-[40px] p-10 md:p-12 bg-white">
              <h2 className="text-3xl font-black text-accent-dark mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-wera/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-wera" />
                </div>
                The Matching DNA
              </h2>
              
              <div className="space-y-8">
                {[
                  { label: "Core Skills & Expertise", weight: 45, color: "bg-primary-wera", desc: "A deep-dive analysis of your verified skills against gig requirements." },
                  { label: "Category Experience", weight: 25, color: "bg-blue-500", desc: "Historical performance and success rate within specific industries." },
                  { label: "Reliability & Availability", weight: 15, color: "bg-indigo-500", desc: "Your track record of finishing what you start and your current capacity." },
                  { label: "Location & Logistics", weight: 15, color: "bg-slate-400", desc: "Optimal proximity for on-site tasks or global compatibility for remote work." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h3 className="font-black text-accent-dark text-lg">{item.label}</h3>
                        <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                      </div>
                      <span className="text-2xl font-black text-accent-dark">{item.weight}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.weight}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <Scale className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-accent-dark mb-1">Zero-Bias Commitment</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Our algorithm ignores names, gender, and background. It focuses purely on **Verified Skills**, **Historical Performance**, and **Merit**. Every score is auditable and transparent.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Boosting Score Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] p-10 bg-white">
              <h3 className="text-2xl font-black text-accent-dark mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" /> Boost Your Score
              </h3>
              <div className="space-y-6">
                {[
                  { icon: BookOpen, title: "LMS Certification", plus: "+8%", desc: "Complete training modules to earn verified badges." },
                  { icon: Star, title: "Top Performance", plus: "+10%", desc: "Maintain a 4.8+ rating for a multiplier boost." },
                  { icon: Clock, title: "Fast Response", plus: "+5%", desc: "Accept offers within 2 hours of notification." },
                  { icon: ShieldCheck, title: "Skill Verification", plus: "1.2x", desc: "Get your skills manually verified by experts." }
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-wera/10 group-hover:text-primary-wera transition-all">
                      <tip.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-accent-dark">{tip.title}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {tip.plus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[40px] p-10 bg-accent-dark text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-wera/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h3 className="text-2xl font-black mb-4 relative z-10">Newcomer Boost</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8 relative z-10">
                Starting fresh? WeraLink applies a **Cold Start Boost** to new accounts, ensuring your profile gets initial visibility alongside seasoned pros. We believe in potential as much as experience.
              </p>
              <Button className="w-full bg-white text-accent-dark hover:bg-gray-100 rounded-2xl font-black h-14" asChild>
                <Link to="/auth?tab=register">Start Growing <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Hub Spotlight */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black tracking-widest uppercase text-blue-600">Learning Management System</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-accent-dark tracking-tight leading-tight">
                Skill Mastery <br /><span className="text-primary-wera">Built-In.</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                Our built-in Learning Hub isn't just for reading — it's for proving. Complete research-backed modules, pass expert-level assessments, and watch your platform reputation skyrocket.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "Comprehensive Video lessons", "pdf/ website resources", 
                  "Quizzes", "Platform Badges"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-bold text-accent-dark">{f}</span>
                  </div>
                ))}
              </div>
              {user?.role === "WORKER" ?
                <Button onClick={() => navigate("/worker/learning-hub")} size="lg" className="h-16 px-10 bg-accent-dark hover:bg-black text-white rounded-2xl text-lg font-black group shadow-2xl">
                  Explore Learning Hub <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button> : <Button onClick={() => navigate("/auth?tab=register")} size="lg" className="h-16 px-10 bg-accent-dark hover:bg-black text-white rounded-2xl text-lg font-black group shadow-2xl">
                  Explore Learning Hub <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>}
              
            </div>

            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-primary-wera/10 rounded-full blur-[100px] scale-150" />
               <div className="relative grid grid-cols-2 gap-4">
                 {[
                   { name: "Expert Digital Marketer", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
                   { name: "Intermediate Translator", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
                   { name: "Verified Video Editor", icon: Star, color: "text-emerald-500", bg: "bg-emerald-50" },
                   { name: "Expert Data Entry Specialist", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" }
                 ].map((badge, i) => (
                   <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className={`${badge.bg} p-8 rounded-[32px] border border-white flex flex-col items-center text-center shadow-xl`}
                   >
                     <badge.icon className={`w-12 h-12 ${badge.color} mb-4`} />
                     <p className="font-black text-accent-dark leading-tight">{badge.name}</p>
                     <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Earned Achievement</p>
                   </motion.div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyWeraLink;
