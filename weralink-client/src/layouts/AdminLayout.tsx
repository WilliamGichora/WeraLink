import { Outlet, NavLink } from "react-router-dom";
import { AppNavbar } from "../components/layout/AppNavbar";
import { AppFooter } from "../components/layout/AppFooter";
import { LayoutDashboard, BarChart3, FileText, Shield, Users, Scale, LifeBuoy } from "lucide-react";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/disputes", label: "Disputes", icon: Scale },
  { to: "/admin/support", label: "Support", icon: LifeBuoy },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Reports", icon: FileText },
];

export function AdminLayout() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main font-sans antialiased min-h-screen flex flex-col">
      <AppNavbar />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-60 bg-accent-dark text-white shrink-0 hidden md:flex flex-col border-r border-white/5">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-wera" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-wera">
                Admin Panel
              </span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-primary-wera/20 text-primary-wera"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
