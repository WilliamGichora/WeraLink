import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/public/AuthPage";
import WorkerDashboard from "./pages/worker/Dashboard";
import EmployerDashboard from "./pages/employer/Dashboard";
import { WorkerLayout } from "./layouts/WorkerLayout";
import { EmployerLayout } from "./layouts/EmployerLayout";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          
          {/* Worker Routes */}
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker" element={<WorkerLayout />}>
              <Route index element={<WorkerDashboard />} />
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
            <Route path="/admin" element={<div>Admin Dashboard Scaffold</div>} />
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
