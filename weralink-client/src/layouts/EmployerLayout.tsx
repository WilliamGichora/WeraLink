import { Outlet, useNavigate } from "react-router-dom";
import { Bell, LinkIcon, LogOut } from "lucide-react";
import { useAuth } from "../features/auth/context/AuthContext";
import { LogoutConfirmDialog } from "../features/auth/components/LogoutConfirmDialog";
import { useState } from "react";

export function EmployerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main font-sans antialiased min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm dark:bg-black dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-wera/10 p-2 rounded-lg">
                <LinkIcon className="w-6 h-6 text-primary-wera" />
              </div>
              <span className="font-bold text-xl tracking-tight text-accent-dark dark:text-white">Wera<span className="text-primary-wera">Link</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-primary-wera font-medium border-b-2 border-primary-wera px-1 py-5">Dashboard</a>
              <a href="#" className="text-gray-500 hover:text-accent-text font-medium px-1 py-5 transition-colors dark:text-gray-400">Posted Gigs</a>
              <a href="#" className="text-gray-500 hover:text-accent-text font-medium px-1 py-5 transition-colors dark:text-gray-400">Talent Pool</a>
              <a href="#" className="text-gray-500 hover:text-accent-text font-medium px-1 py-5 transition-colors dark:text-gray-400">Payments</a>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-primary-wera transition-colors relative" title="Notifications">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-wera ring-2 ring-white"></span>
              </button>
              <button onClick={() => setIsLogoutDialogOpen(true)} className="text-gray-400 hover:text-red-500 transition-colors" title="Log out">
                <LogOut className="w-6 h-6" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary-wera/20 overflow-hidden border border-primary-wera/20 cursor-pointer">
                <div className="h-full w-full bg-gray-400 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <Outlet />

      <LogoutConfirmDialog 
        isOpen={isLogoutDialogOpen} 
        onClose={() => setIsLogoutDialogOpen(false)} 
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      <footer className="bg-white border-t border-gray-200 py-8 dark:bg-black dark:border-gray-800 mt-auto relative z-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} WeraLink. Connecting Talent & Opportunity.</p>
        </div>
      </footer>
    </div>
  );
}
