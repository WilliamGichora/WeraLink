import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "@/features/auth/context/AuthContext";
import { AccountSuspendedView } from "@/pages/shared/AccountSuspendedView";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

// Routes that suspended users can still visit
const SUSPENDED_ALLOWED_SUFFIXES = ['/support', '/notifications'];

function isSuspendedAllowedPath(pathname: string): boolean {
    return SUSPENDED_ALLOWED_SUFFIXES.some(s => pathname.endsWith(s));
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark-wera">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-wera"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'WORKER') return <Navigate to="/worker" replace />;
        if (user.role === 'EMPLOYER') return <Navigate to="/employer" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        return <Navigate to="/auth" replace />;
    }

    // Suspension gate: show restriction view instead of dashboard
    if (user.status === 'SUSPENDED' && !isSuspendedAllowedPath(location.pathname)) {
        return <AccountSuspendedView />;
    }

    return <Outlet />;
}

export function PublicRoute() {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark-wera">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-wera"></div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        if (user.role === 'WORKER') return <Navigate to="/worker" replace />;
        if (user.role === 'EMPLOYER') return <Navigate to="/employer" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
}
