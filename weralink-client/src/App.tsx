import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/public/AuthPage";
import WorkerDashboard from "./pages/worker/Dashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import MarketplacePage from "./pages/worker/Marketplace";
import GigDetailPage from "./pages/worker/GigDetail";
import EmployerDashboard from "./pages/employer/Dashboard";
import CreateGigPage from "./pages/employer/CreateGig";
import ManageGigsPage from "./pages/employer/ManageGigs";
import EmployerGigDetailPage from "./pages/employer/GigDetail";
import EditGigPage from "./pages/employer/EditGig";
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
              <Route path="gigs" element={<MarketplacePage />} />
              <Route path="gigs/:id" element={<GigDetailPage />} />
              <Route path="profile" element={<WorkerProfile />} />
            </Route>
          </Route>

          {/* Employer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
            <Route path="/employer" element={<EmployerLayout />}>
              <Route index element={<EmployerDashboard />} />
              <Route path="gigs" element={<ManageGigsPage />} />
              <Route path="gigs/new" element={<CreateGigPage />} />
              <Route path="gigs/:id" element={<EmployerGigDetailPage />} />
              <Route path="gigs/:id/edit" element={<EditGigPage />} />
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
