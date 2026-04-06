import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/public/AuthPage";
import WorkerDashboard from "./pages/worker/Dashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import EmployerDashboard from "./pages/employer/Dashboard";
import { WorkerLayout } from "./layouts/WorkerLayout";
import { EmployerLayout } from "./layouts/EmployerLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>
          </Route>
          
          {/* Worker Routes */}
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker" element={<WorkerLayout />}>
              <Route index element={<WorkerDashboard />} />
              <Route path="profile" element={<WorkerProfile />} />
            </Route>
          </Route>

          {/* Employer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
            <Route path="/employer" element={<EmployerLayout />}>
              <Route index element={<EmployerDashboard />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div className="p-8">Admin Dashboard Scaffold</div>} />
            </Route>
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
