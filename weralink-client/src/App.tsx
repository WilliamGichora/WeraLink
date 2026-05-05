import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/public/AuthPage";
import WorkerDashboard from "./pages/worker/Dashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import MarketplacePage from "./pages/worker/Marketplace";
import GigDetailPage from "./pages/worker/GigDetail";
import RecommendedGigsPage from "./pages/worker/RecommendedGigs";
import MyApplications from "./pages/worker/MyApplications";
import ActiveAssignments from "./pages/worker/ActiveAssignments";
import CompletedGigs from "./pages/worker/CompletedGigs";
import {SubmitEvidence} from "./pages/worker/SubmitEvidence";
import EmployerDashboard from "./pages/employer/Dashboard";
import CreateGigPage from "./pages/employer/CreateGig";
import ManageGigsPage from "./pages/employer/ManageGigs";
import EmployerGigDetailPage from "./pages/employer/GigDetail";
import EditGigPage from "./pages/employer/EditGig";
import ReviewSubmission from "./pages/employer/ReviewSubmission";
import ReviewListPage from "./pages/employer/ReviewListPage";
import GigApplicants from "./pages/employer/GigApplicants";
import ApplicantReview from "./pages/employer/ApplicantReview";
import EmployerApplicants from "./pages/employer/EmployerApplicants";
import NotificationsPage from "./pages/common/NotificationsPage";
import { WorkerLayout } from "./layouts/WorkerLayout";
import { EmployerLayout } from "./layouts/EmployerLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route element={<PublicRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker" element={<WorkerLayout />}>
              <Route index element={<WorkerDashboard />} />
              <Route path="gigs" element={<MarketplacePage />} />
              <Route path="gigs/recommended" element={<RecommendedGigsPage />} />
              <Route path="gigs/:id" element={<GigDetailPage />} />
              <Route path="profile" element={<WorkerProfile />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="assignments" element={<ActiveAssignments />} />
              <Route path="history" element={<CompletedGigs />} />
               <Route path="assignments/:id/submit" element={<SubmitEvidence />} />
               <Route path="notifications" element={<NotificationsPage />} />
             </Route>
           </Route>
 
           <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
             <Route path="/employer" element={<EmployerLayout />}>
               <Route index element={<EmployerDashboard />} />
               <Route path="gigs" element={<ManageGigsPage />} />
               <Route path="gigs/new" element={<CreateGigPage />} />
               <Route path="gigs/:id" element={<EmployerGigDetailPage />} />
               <Route path="gigs/:id/edit" element={<EditGigPage />} />
               <Route path="gigs/:id/applicants" element={<GigApplicants />} />
               <Route path="applicants-global" element={<EmployerApplicants />} />
               <Route path="applicants/:id/review" element={<ApplicantReview />} />
               <Route path="reviews" element={<ReviewListPage />} />
               <Route path="assignments/review/:id" element={<ReviewSubmission />} />
               <Route path="notifications" element={<NotificationsPage />} />
             </Route>
           </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div className="p-8">Admin Dashboard Scaffold</div>} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
