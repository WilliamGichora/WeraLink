import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Briefcase, UserPlus, ShieldCheck, Zap } from 'lucide-react';

interface IntermediaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
  actionType?: 'apply' | 'hire' | 'save';
}

export const IntermediaryModal: React.FC<IntermediaryModalProps> = ({
  isOpen,
  onClose,
  redirectPath = '/',
  actionType = 'apply'
}) => {
  const navigate = useNavigate();

  const handleAuth = (tab: 'login' | 'register') => {
    const searchParams = new URLSearchParams();
    searchParams.set('tab', tab);
    searchParams.set('redirect', redirectPath);
    navigate(`/auth?${searchParams.toString()}`);
    onClose();
  };

  const content = {
    apply: {
      title: "Join to Apply",
      description: "You're one step away from your next gig. Create an account to submit your application and start earning.",
      icon: <Briefcase className="h-12 w-12 text-primary-wera" />,
      benefits: [
        "Direct payouts to M-Pesa",
        "Verified skill badges",
        "Secure escrow protection"
      ]
    },
    hire: {
      title: "Sign Up to Hire",
      description: "Found the perfect talent? Register as an employer to post gigs and hire verified workers.",
      icon: <UserPlus className="h-12 w-12 text-primary-wera" />,
      benefits: [
        "Algorithmic match scores",
        "Secure payment escrow",
        "Verified worker profiles"
      ]
    },
    save: {
      title: "Save for Later",
      description: "Don't lose this opportunity. Sign in to save gigs and get notified of similar matches.",
      icon: <Zap className="h-12 w-12 text-primary-wera" />,
      benefits: [
        "Custom gig alerts",
        "Personalized recommendations",
        "Application tracking"
      ]
    }
  }[actionType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[#211112]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-4 p-4 rounded-full bg-primary-wera/10 border border-primary-wera/20">
            {content.icon}
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            {content.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                <ShieldCheck className="h-4 w-4 text-primary-wera" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1 border-white/10 hover:bg-white/5 text-white bg-transparent"
            onClick={() => handleAuth('login')}
          >
            Sign In
          </Button>
          <Button 
            className="flex-1 bg-primary-wera hover:bg-primary-wera/90 text-white shadow-lg shadow-primary-wera/20"
            onClick={() => handleAuth('register')}
          >
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
