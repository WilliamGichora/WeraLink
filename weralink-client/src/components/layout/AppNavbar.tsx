import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LogoutConfirmDialog } from '@/features/auth/components/LogoutConfirmDialog';
import { NAV_CONFIG } from '@/config/navConfig';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AppNavbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const currentRole = isAuthenticated && user ? user.role : 'PUBLIC';
  const navItems = NAV_CONFIG[currentRole];

  return (
    <header className="sticky top-0 z-50 w-full bg-accent-dark/98 backdrop-blur-xl border-b border-white/10 transition-all shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        
        {/* LOGO */}
        <div className="mr-8 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-white">
              WeraLink
            </span>
          </Link>
        </div>

        {/* DESKTOP MEGA-MENU */}
        <div className="hidden md:flex flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item, idx) => (
                <NavigationMenuItem key={idx}>
                  {item.categories ? (
                    <>
                      <NavigationMenuTrigger className="bg-transparent! text-gray-200 hover:text-white! hover:bg-white/10! focus:bg-white/10! focus:text-white! data-[state=open]:bg-white/10! data-[state=open]:text-white!">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className='bg-linear-to-br from-slate-900 to-accent-dark'>
                        <div className="w-[400px] md:w-[500px] lg:w-[600px] p-5 flex gap-6 bg-linear-to-br from-slate-900 to-accent-dark relative z-50">
                          {item.categories.map((category, catIdx) => (
                            <div key={catIdx} className="flex-1 flex flex-col gap-3">
                              {category.title && (
                                <h4 className="text-sm font-bold text-primary-wera mb-1 ml-3 tracking-widest uppercase opacity-90">
                                  {category.title}
                                </h4>
                              )}
                              <ul className="flex flex-col gap-1.5">
                                {category.items.map((subLink, subIdx) => {
                                  const IconComponent = subLink.icon;
                                  return (
                                    <li key={subIdx}>
                                      <NavigationMenuLink asChild>
                                        <Link
                                          to={subLink.href}
                                          className={cn(
                                            "flex items-start gap-4 p-3 rounded-lg transition-all duration-200 outline-none group border border-transparent",
                                            location.pathname === subLink.href 
                                              ? "bg-white/10 border-white/5 shadow-sm" 
                                              : "hover:bg-white/5 hover:border-white/5 focus:bg-white/5"
                                          )}
                                        >
                                          {IconComponent && (
                                            <div className="mt-0.5 bg-black/20 group-hover:bg-primary-wera/10 group-hover:scale-105 p-2 rounded-md text-primary-wera transition-all shadow-inner">
                                              <IconComponent className="h-5 w-5 opacity-90" />
                                            </div>
                                          )}
                                          <div className="flex flex-col">
                                            <span className="text-sm font-semibold leading-tight text-slate-200 group-hover:text-white transition-colors">
                                              {subLink.title}
                                            </span>
                                            {subLink.description && (
                                              <p className="line-clamp-2 text-[13px] leading-snug text-slate-400 mt-1.5 group-hover:text-slate-300 transition-colors">
                                                {subLink.description}
                                              </p>
                                            )}
                                          </div>
                                        </Link>
                                      </NavigationMenuLink>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent! text-gray-200 hover:text-white! hover:bg-white/10! focus:bg-white/10! focus:text-white!")}>
                      <Link to={item.href || "#"}>
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center ml-auto gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2 hover:opacity-80">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary-wera text-white">
                        {user?.name.charAt(0).toUpperCase() || <User size={16} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#2A1618]/98 backdrop-blur-2xl border border-white/10 text-white shadow-2xl relative z-50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                      <p className="text-xs leading-none text-gray-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <Link to={`/${user?.role.toLowerCase()}/profile`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)} className="cursor-pointer text-primary-wera focus:text-white focus:bg-primary-wera/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="text-gray-200 hover:text-white hover:bg-white/10" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary-wera hover:bg-primary-wera/90 text-white border border-primary-wera/50 shadow-lg shadow-primary-wera/20">
                <Link to="/auth?tab=register">Join WeraLink</Link>
              </Button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-200 hover:text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-accent-dark/98 backdrop-blur-2xl border-r border-white/10 text-white">
                <div className="flex items-center gap-2 mb-6 mt-4">
                  <span className="font-bold text-xl tracking-tight text-white ml-2">WeraLink</span>
                </div>
                <ScrollArea className="h-[calc(100vh-8rem)] pb-10">
                  <div className="flex flex-col gap-4">
                    {navItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col space-y-3">
                        {item.categories ? (
                          <>
                            <h4 className="font-semibold text-lg text-white border-b border-white/10 pb-1 ml-2">{item.title}</h4>
                            {item.categories.map((category, catIdx) => (
                              <div key={catIdx} className="flex flex-col gap-2 mt-2">
                                {category.title && (
                                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-2">{category.title}</h5>
                                )}
                                <div className="flex flex-col gap-1 ml-2">
                                  {category.items.map((subLink, subIdx) => {
                                    const IconComponent = subLink.icon;
                                    return (
                                      <Link
                                        key={subIdx}
                                        to={subLink.href}
                                        className={cn(
                                          "flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors",
                                          location.pathname === subLink.href ? "bg-white/5 font-medium text-white" : "text-gray-300"
                                        )}
                                      >
                                        {IconComponent && <IconComponent className="h-4 w-4" />}
                                          <span className="text-sm">{subLink.title}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <Link 
                            to={item.href || "#"} 
                            className="font-semibold text-lg text-white hover:text-gray-300 border-b border-white/10 pb-1"
                          >
                            {item.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {!isAuthenticated && (
                  <div className="absolute flex flex-col gap-2 w-full p-6 bottom-0 left-0 bg-accent-dark border-t border-white/10 z-50">
                     <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent" asChild>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                      <Button className="w-full bg-primary-wera hover:bg-primary-wera/90 text-white border border-primary-wera/50 shadow-lg" asChild>
                        <Link to="/auth?tab=register">Join WeraLink</Link>
                      </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <LogoutConfirmDialog 
        isOpen={isLogoutDialogOpen} 
        onClose={() => setIsLogoutDialogOpen(false)} 
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </header>
  );
};
