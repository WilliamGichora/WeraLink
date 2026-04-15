import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "@/features/auth/context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

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
        return <Navigate to="/auth" replace />;
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
    }

    return <Outlet />;
}
