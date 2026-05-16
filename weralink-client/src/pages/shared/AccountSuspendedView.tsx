import { AlertTriangle, LifeBuoy, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AccountSuspendedView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSupport = () => {
    const basePath = user?.role === 'WORKER' ? '/worker' : user?.role === 'EMPLOYER' ? '/employer' : '/admin';
    navigate(`${basePath}/support`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark-wera flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-red-500 p-8 flex flex-col items-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-display">Account Restricted</h1>
          <p className="opacity-90 mt-2">Security Enforcement</p>
        </div>
        
        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed">
            Your WeraLink account has been suspended for violating our platform's community guidelines or safety policies. 
            During this period, access to the marketplace and active assignments is restricted.
          </p>

          <div className="space-y-4">
            <button 
              onClick={handleSupport}
              className="w-full flex items-center justify-center gap-3 bg-accent-dark hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-accent-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              <LifeBuoy className="w-5 h-5" />
              Contact Support
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-4 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              Reference ID: {user?.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
