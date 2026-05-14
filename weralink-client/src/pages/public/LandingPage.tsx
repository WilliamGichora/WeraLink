import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Wallet, Zap, Sparkles } from 'lucide-react';
import { Hero3D } from './components/Hero3D';
import { StatsSection } from './components/StatsSection';
import { MatchingPreview } from './components/MatchingPreview';
import { LearningHubPreview } from './components/LearningHubPreview';
import { FeaturedShowcase } from './components/FeaturedShowcase';
import { useAuth } from '@/features/auth/context/AuthContext';
import { WeraLinkLogo } from '@/components/ui/WeraLinkLogo';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-accent-dark text-white overflow-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 px-4 overflow-hidden">
        <Hero3D />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-wera/10 border border-primary-wera/20 mb-8">
                <Sparkles className="h-4 w-4 text-primary-wera" />
                <span className="text-xs font-bold tracking-widest uppercase text-primary-wera">The Future of Kenya Gig Economy</span>
              </div>

              <div className="mb-6">
                <WeraLinkLogo variant="primary" size="lg" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
                Where <span className="text-primary-wera">Elite</span> <br />
                Talent Meets <br />
                <span className="text-primary-wera">Impact</span>.
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed font-medium">
                WeraLink is the premium marketplace for verified professionals. 
                Experience seamless hiring, secure payments, and uncompromised quality.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 md:ml-2">
                <Button size="lg" className="h-16 px-10 bg-primary-wera hover:bg-primary-wera/90 text-white rounded-2xl text-xl font-bold shadow-2xl shadow-primary-wera/40 group transition-all hover:scale-105" asChild>
                  {user?.role !== "EMPLOYER" && (
                    <Link to="/marketplace">
                      Explore Marketplace <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )} 
                </Button>
                <Link to="/talent" className="text-white hover:text-primary-wera font-bold text-lg flex items-center gap-2 transition-colors group">
                   Find Elite Talent <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Blur */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary-wera/10 blur-[150px] rounded-full pointer-events-none" />
      </section>

      {/* STATS SECTION */}
      <StatsSection />

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 bg-[#1a0d0e] relative border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ecosystem Mastery</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Designed for maximum speed, absolute security, and verified results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
             {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 z-0" />

            {[
              { icon: Search, title: "Discover", desc: "Browse high-impact gigs or elite talent profiles using our advanced matching engine." },
              { icon: Zap, title: "Execute", desc: "Collaborate securely. Our built-in verification ensures work meets elite standards." },
              { icon: Wallet, title: "Payout", desc: "Instant M-Pesa releases via escrow once work is verified and approved." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-[32px] bg-accent-dark border border-white/10 flex items-center justify-center mb-8 group-hover:border-primary-wera/50 group-hover:bg-primary-wera/5 transition-all shadow-2xl">
                   <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary-wera flex items-center justify-center font-bold text-white shadow-lg">
                     {i + 1}
                   </div>
                   <step.icon className="h-10 w-10 text-primary-wera" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI MATCHING PREVIEW */}
      <MatchingPreview />

      {/* LEARNING HUB PREVIEW */}
      <LearningHubPreview />

      {/* FEATURED SHOWCASE */}
      <FeaturedShowcase />

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-wera/5" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Ready to join the elite?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              Join thousands of professionals and businesses scaling with WeraLink. 
              The future of African work starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="h-16 px-12 bg-white text-accent-dark hover:bg-gray-200 rounded-2xl text-xl font-bold shadow-2xl" asChild>
                <Link to="/auth?tab=register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-12 border-white/20 hover:bg-white/10 text-white rounded-2xl text-xl font-bold bg-transparent" asChild>
                <Link to="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-white/5 opacity-50">
        <div className="container mx-auto px-4 flex flex-wrap justify-center items-center gap-12 grayscale">
           <span className="text-xl font-bold tracking-widest uppercase">M-Pesa Verified</span>
           <span className="text-xl font-bold tracking-widest uppercase">Gig recommendations</span>
           <span className="text-xl font-bold tracking-widest uppercase">Skill Certified</span>
           <span className="text-xl font-bold tracking-widest uppercase">24/7 Support</span>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
