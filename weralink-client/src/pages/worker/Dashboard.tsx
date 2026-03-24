import { Download, Wallet, ClipboardCheck, Star, Search, ArrowRight, Briefcase, MapPin, Landmark, ShieldCheck, ChevronRight } from "lucide-react";

export default function WorkerDashboard() {
  return (
    <>
      <header className="bg-accent-dark text-white pt-10 pb-20 dark:bg-black relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-wera rounded-full blur-3xl"></div>
            <div className="absolute left-20 bottom-10 w-64 h-64 bg-accent-text rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Habari, Worker!</h1>
                    <p className="text-gray-400">Here's how you are performing today on WeraLink.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <button className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Statement
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Earnings (Month)</p>
                            <h3 className="text-3xl font-bold text-white group-hover:text-primary-wera transition-colors">KES 15,400</h3>
                        </div>
                        <div className="bg-primary-wera/20 p-2 rounded-lg">
                            <Wallet className="w-6 h-6 text-primary-wera" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-400">
                        <span className="material-icons text-xs mr-1">trending_up</span>
                        <span>+12% from last month</span>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Active Jobs</p>
                            <h3 className="text-3xl font-bold text-white group-hover:text-primary-wera transition-colors">3</h3>
                        </div>
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <ClipboardCheck className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <span>2 due today</span>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Rating</p>
                            <h3 className="text-3xl font-bold text-white group-hover:text-primary-wera transition-colors">4.8<span className="text-lg text-gray-500 font-normal">/5.0</span></h3>
                        </div>
                        <div className="bg-yellow-500/20 p-2 rounded-lg">
                            <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <span>Based on 42 reviews</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <main className="grow -mt-10 pb-16 z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100 dark:border-gray-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search gigs by title or location..." className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:border-primary-wera focus:ring focus:ring-primary-wera/20 transition-shadow bg-background-light dark:bg-background-dark-wera dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <button className="px-4 py-2 rounded-full bg-accent-dark text-white text-sm font-medium whitespace-nowrap shadow-sm hover:bg-accent-dark/90 transition-colors">All Gigs</button>
                    <button className="px-4 py-2 rounded-full bg-gray-100 text-text-main text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Delivery</button>
                    <button className="px-4 py-2 rounded-full bg-gray-100 text-text-main text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Writing</button>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-3/4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-accent-dark dark:text-white">Recommended For You</h2>
                        <a href="#" className="text-primary-wera text-sm font-medium hover:underline flex items-center">
                            View all
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Gig Card 1 */}
                        <div className="bg-card-bg-wera dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary-wera/20 flex flex-col h-full">
                            <div className="relative h-32 w-full overflow-hidden bg-gray-300">
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-accent-text uppercase tracking-wider shadow-sm">Data Entry</div>
                            </div>
                            <div className="p-5 flex flex-col grow text-text-main">
                                <h3 className="font-bold text-lg dark:text-white line-clamp-1 mb-2">Receipt Transcription</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1 text-gray-400" /> FastTrack Logistics
                                </p>
                                <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pay</p>
                                        <p className="text-lg font-bold text-primary-wera">KES 500</p>
                                    </div>
                                    <button className="bg-primary-wera hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary-wera/30">Apply</button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Gig Card 2 */}
                        <div className="bg-card-bg-wera dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary-wera/20 flex flex-col h-full">
                            <div className="relative h-32 w-full overflow-hidden bg-gray-300">
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-accent-text uppercase tracking-wider shadow-sm">Delivery</div>
                            </div>
                            <div className="p-5 flex flex-col grow text-text-main">
                                <h3 className="font-bold text-lg dark:text-white line-clamp-1 mb-2">Westlands Package Drop</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Westlands, Nairobi
                                </p>
                                <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pay</p>
                                        <p className="text-lg font-bold text-primary-wera">KES 850</p>
                                    </div>
                                    <button className="bg-primary-wera hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary-wera/30">Apply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <aside className="w-full lg:w-1/4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-accent-dark dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-card-bg-wera dark:hover:bg-gray-600 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-600 p-2 rounded-md shadow-sm group-hover:text-primary-wera transition-colors">
                                        <Landmark className="w-4 h-4 text-text-main" />
                                    </div>
                                    <span className="text-sm font-medium text-text-main dark:text-gray-200">Withdraw Funds</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-card-bg-wera dark:hover:bg-gray-600 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-600 p-2 rounded-md shadow-sm group-hover:text-primary-wera transition-colors">
                                        <ShieldCheck className="w-4 h-4 text-text-main" />
                                    </div>
                                    <span className="text-sm font-medium text-text-main dark:text-gray-200">Update Profile</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-linear-to-br from-accent-dark to-black rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-wera/20 rounded-bl-full -mr-4 -mt-4"></div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Boost your earnings!</h3>
                        <p className="text-gray-300 text-sm mb-4 relative z-10">Complete 5 gigs this week on WeraLink to earn a <span className="text-primary-wera font-bold">KES 1,000 bonus</span>.</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2 relative z-10">
                            <div className="bg-primary-wera h-2 rounded-full w-[60%]"></div>
                        </div>
                        <p className="text-xs text-gray-400 relative z-10">3/5 gigs completed</p>
                    </div>
                </aside>
            </div>
        </div>
      </main>
    </>
  );
}
