import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeraLinkLogo } from '@/components/ui/WeraLinkLogo';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // If logged in but NOT admin, redirect to their respective dashboards
  if (isAuthenticated && user?.role !== 'ADMIN') {
     return <Navigate to={`/${user?.role.toLowerCase()}`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await adminLogin(email, password);
      toast.success('Admin authentication successful.');
      navigate('/admin');
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.message || 'Authentication failed. Please verify credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <WeraLinkLogo size="lg" variant="light" />
        </div>
        
        <div className="bg-[#2A1618]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-wera/10 blur-[50px] pointer-events-none rounded-full" />
          
          <div className="mb-8 text-center relative z-10">
            <div className="mx-auto w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-primary-wera" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
            <p className="text-sm text-gray-400">Restricted access. Authorized personnel only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-white">Administrator Email</Label>
              <Input
                type="email"
                placeholder="admin@weralink.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-primary-wera/50 focus:ring-primary-wera/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Password</Label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-primary-wera/50 focus:ring-primary-wera/20 pl-10"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-4" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-wera hover:bg-primary-dark text-white font-bold h-12 rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Access Portal <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-500">
            <p>Protected by WeraLink Security Protocol. Unauthorized access is strictly prohibited and monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
