import { Download, Wallet, ClipboardCheck, Star, Search, ArrowRight, Briefcase, MapPin, Landmark, ShieldCheck, ChevronRight, PlusCircle, Sheet } from "lucide-react";

export default function EmployerDashboard() {
  return (
    <>
      <header className="bg-accent-dark text-white pt-10 pb-20 dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera rounded-full blur-3xl"></div>
            <div className="absolute left-20 bottom-10 w-64 h-64 bg-accent-text rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Welcome back, Employer!</h1>
                    <p className="text-gray-400">Overview of your hiring activity.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <button className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                        <Sheet className="w-6 h-6 text-white mr-2" />
                        Full Report
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Spend (Month)</p>
                            <h3 className="text-3xl font-bold text-white group-hover:text-primary-wera transition-colors">KES 45,200</h3>
                        </div>
                        <div className="bg-primary-wera/20 p-2 rounded-lg">
                            <Wallet className="w-6 h-6 text-primary-wera" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Active Gigs</p>
                            <h3 className="text-3xl font-bold text-white group-hover:text-primary-wera transition-colors">3</h3>
                        </div>
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Completion Rate</p>
                            <h3 className="text-3xl font-bold text-white group-hover:text-primary-wera transition-colors">98%</h3>
                        </div>
                        <div className="bg-green-500/20 p-2 rounded-lg">
                            <ClipboardCheck className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <main className="flex-grow -mt-10 pb-16 z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-3/4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100 dark:border-gray-700">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search active assignments..." className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:border-primary-wera bg-background-light dark:bg-background-dark-wera dark:text-white" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-accent-dark dark:text-white">Active Assignments</h2>
                            <span className="bg-primary-wera/10 text-primary-wera text-xs font-semibold px-2.5 py-0.5 rounded-full">3 Active</span>
                        </div>
                        
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gray-300 dark:bg-gray-700 overflow-hidden flex-shrink-0"></div>
                                        <div>
                                            <h3 className="text-lg font-bold text-text-main dark:text-white">Simple Website Update</h3>
                                            <p className="text-sm text-gray-500 mt-1">Assigned to: <span className="text-accent-dark font-medium dark:text-gray-300">John Kamau</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                        <p className="font-bold text-lg text-accent-text">KES 3,000</p>
                                        <button className="w-full bg-primary-wera hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Review & Pay</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <aside className="w-full lg:w-1/4 flex flex-col gap-6">
                    <button className="w-full bg-primary-wera hover:bg-primary-dark text-white p-4 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                        <PlusCircle className="w-6 h-6 text-white mr-2" />
                        Post a New Gig
                    </button>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-accent-dark dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-6">
                            <div className="flex gap-3 relative">
                                <div className="absolute left-2 top-2 bottom-[-24px] w-0.5 bg-gray-100 dark:bg-gray-700"></div>
                                <div className="relative z-10 w-4 h-4 mt-1 rounded-full bg-green-100 border-2 border-green-500"></div>
                                <div>
                                    <p className="text-sm text-text-main dark:text-gray-200">Payment released to Kevin M.</p>
                                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
      </main>
    </>
  );
}
