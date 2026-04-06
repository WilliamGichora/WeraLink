import { Outlet } from "react-router-dom";
import { AppNavbar } from "../components/layout/AppNavbar";
import { AppFooter } from "../components/layout/AppFooter";

export function AdminLayout() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main font-sans antialiased min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 flex flex-col relative z-0">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
