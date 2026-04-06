import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A0D0E] border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 xl:gap-12 pb-12">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-2xl tracking-tight text-white">
                WeraLink
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Empowering Kenyan youth through micro-gigs. Match your skills with employers, earn trust with badges, and get paid securely.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary-wera hover:bg-white/5">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary-wera hover:bg-white/5">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary-wera hover:bg-white/5">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary-wera hover:bg-white/5">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white mb-2">Platform</h4>
            <Link to="/how-it-works" className="text-gray-400 hover:text-primary-wera transition-colors">How it Works</Link>
            <Link to="/gigs" className="text-gray-400 hover:text-primary-wera transition-colors">Browse Gigs</Link>
            <Link to="/badges" className="text-gray-400 hover:text-primary-wera transition-colors">Skill Badges</Link>
            <Link to="/pricing" className="text-gray-400 hover:text-primary-wera transition-colors">Pricing & Escrow</Link>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white mb-2">Resources</h4>
            <Link to="/help" className="text-gray-400 hover:text-primary-wera transition-colors">Help Center</Link>
            <Link to="/disputes" className="text-gray-400 hover:text-primary-wera transition-colors">Dispute Resolution</Link>
            <Link to="/blog" className="text-gray-400 hover:text-primary-wera transition-colors">Blog & Guides</Link>
            <Link to="/contact" className="text-gray-400 hover:text-primary-wera transition-colors">Contact Us</Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white mb-2">Legal</h4>
            <Link to="/terms" className="text-gray-400 hover:text-primary-wera transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-primary-wera transition-colors">Privacy Policy</Link>
            <Link to="/trust" className="text-gray-400 hover:text-primary-wera transition-colors">Trust & Safety</Link>
          </div>

        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {currentYear} WeraLink Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>support@weralink.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
