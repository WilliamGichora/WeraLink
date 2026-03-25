import { useState } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { Link as LinkIcon } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot-password">("login");

  return (
    <div className="bg-card-bg-wera font-display text-text-main font-sans antialiased min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[700px]">
        
        <div className="w-full md:w-1/2 bg-accent-dark relative p-8 md:p-12 flex flex-col justify-between text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-wera opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-text opacity-20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10 flex items-center gap-2 mb-8">
            <div className="bg-primary-wera p-2 rounded-lg">
                <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Wera<span className="text-primary-wera">Link</span></span>
          </div>
          
          <div className="relative z-10 grow flex flex-col justify-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Empowering Kenyan Youth through Opportunity.</h2>
            <p className="text-gray-400 text-lg mb-8">Connect with micro-gigs, showcase your skills, and build your future one job at a time.</p>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
               <div className="flex items-center gap-4 mb-3">
                   <div className="flex -space-x-2">
                       <div className="w-10 h-10 rounded-full border-2 border-accent-dark bg-gray-500 shadow-sm"></div>
                       <div className="w-10 h-10 rounded-full border-2 border-accent-dark bg-gray-600 shadow-sm"></div>
                       <div className="w-10 h-10 rounded-full border-2 border-accent-dark bg-gray-700 shadow-sm"></div>
                   </div>
                   <div className="text-sm font-medium">
                        <span className="text-primary-wera font-bold pb-2 pr-1">5,000+</span> active workers
                   </div>
               </div>
               <div className="text-xs text-gray-400">Join a growing community of skilled professionals across Kenya.</div>
            </div>
          </div>
          
          <div className="relative z-10 text-xs text-gray-500">
               &copy; {new Date().getFullYear()} WeraLink. All rights reserved.
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col overflow-y-auto">
           <div className="max-w-md mx-auto w-full">
               {activeTab !== 'forgot-password' && (
                 <div className="flex border-b border-gray-100 mb-8">
                     <button 
                       className={`flex-1 pb-4 text-sm font-semibold text-center border-b-2 transition-all ${activeTab === 'login' ? 'border-primary-wera text-primary-wera' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                       onClick={() => setActiveTab('login')}
                     >
                         Sign In
                     </button>
                     <button 
                       className={`flex-1 pb-4 text-sm font-semibold text-center border-b-2 transition-all ${activeTab === 'register' ? 'border-primary-wera text-primary-wera' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                       onClick={() => setActiveTab('register')}
                     >
                         Register
                     </button>
                 </div>
               )}

               {activeTab === 'login' && <LoginForm onForgotClick={() => setActiveTab('forgot-password')} />}
               {activeTab === 'register' && <RegisterForm />}
               {activeTab === 'forgot-password' && <ForgotPasswordForm onBackToLogin={() => setActiveTab('login')} />}

               <div className="mt-8 pt-6 border-t border-gray-50">
                    <p className="text-center text-xs text-gray-400">
                        By continuing, you agree to WeraLink's 
                        <a href="#" className="text-primary-wera hover:underline ml-1 mr-1">Terms of Service</a> and 
                        <a href="#" className="text-primary-wera hover:underline ml-1">Privacy Policy</a>.
                    </p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
