import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthPage from "./pages/public/AuthPage";
import LandingPage from "./pages/public/LandingPage";
import TalentDiscoveryPage from "./pages/public/TalentDiscovery";
import PublicProfilePage from "./pages/public/PublicProfileView";
import WhyWeraLink from "./pages/public/WhyWeraLink";
import WorkerDashboard from "./pages/worker/Dashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import MarketplacePage from "./pages/worker/Marketplace";
import GigDetailPage from "./pages/worker/GigDetail";
import RecommendedGigsPage from "./pages/worker/RecommendedGigs";
import MyApplications from "./pages/worker/MyApplications";
import ActiveAssignments from "./pages/worker/ActiveAssignments";
import CompletedGigs from "./pages/worker/CompletedGigs";
import {SubmitEvidence} from "./pages/worker/SubmitEvidence";
import LearningHubPage from "./pages/worker/LearningHub";
import ModuleViewPage from "./pages/worker/ModuleView";
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerProfile from "./pages/employer/EmployerProfile";
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
import SupportPage from "./pages/common/SupportPage";
import { WorkerLayout } from "./layouts/WorkerLayout";
import { EmployerLayout } from "./layouts/EmployerLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

// Lazy-loaded pages
const WorkerAnalytics = lazy(() => import("./pages/worker/WorkerAnalytics"));
const WorkerReports = lazy(() => import("./pages/worker/WorkerReports"));
const EmployerAnalytics = lazy(() => import("./pages/employer/EmployerAnalytics"));
const EmployerReports = lazy(() => import("./pages/employer/EmployerReports"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminGigs = lazy(() => import("./pages/admin/AdminGigs"));
const AdminLms = lazy(() => import("./pages/admin/AdminLms"));
const WorkerRatings = lazy(() => import("./pages/worker/WorkerRatings"));
const EmployerHistory = lazy(() => import("./pages/employer/EmployerHistory"));
const EmployerRatings = lazy(() => import("./pages/employer/EmployerRatings"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-primary-wera border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/gigs/:id" element={<GigDetailPage />} />
            <Route path="/talent" element={<TalentDiscoveryPage />} />
            <Route path="/profile/:id" element={<PublicProfilePage />} />
            <Route path="/why-weralink" element={<WhyWeraLink />} />
            
            
            <Route element={<PublicRoute />}>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker" element={<WorkerLayout />}>
              <Route index element={<WorkerDashboard />} />
              <Route path="gigs" element={<Navigate to="/marketplace" replace />} />
              <Route path="gigs/recommended" element={<RecommendedGigsPage />} />
              <Route path="gigs/:id" element={<GigDetailPage />} />
              <Route path="profile" element={<WorkerProfile />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="assignments" element={<ActiveAssignments />} />
              <Route path="history" element={<CompletedGigs />} />
               <Route path="assignments/:id/submit" element={<SubmitEvidence />} />
               <Route path="notifications" element={<NotificationsPage />} />
               <Route path="support" element={<SupportPage />} />
               <Route path="profile/ratings" element={<Suspense fallback={<PageLoader />}><WorkerRatings /></Suspense>} />
               <Route path="analytics" element={<Suspense fallback={<PageLoader />}><WorkerAnalytics /></Suspense>} />
               <Route path="reports" element={<Suspense fallback={<PageLoader />}><WorkerReports /></Suspense>} />
               <Route path="learning-hub" element={<LearningHubPage />} />
               <Route path="learning-hub/:id" element={<ModuleViewPage />} />
             </Route>
           </Route>

           <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
             <Route path="/employer" element={<EmployerLayout />}>
               <Route index element={<EmployerDashboard />} />
               <Route path="profile" element={<EmployerProfile />} />
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
               <Route path="support" element={<SupportPage />} />
               <Route path="analytics" element={<Suspense fallback={<PageLoader />}><EmployerAnalytics /></Suspense>} />
               <Route path="reports" element={<Suspense fallback={<PageLoader />}><EmployerReports /></Suspense>} />
                <Route path="history" element={<Suspense fallback={<PageLoader />}><EmployerHistory /></Suspense>} />
                <Route path="profile/ratings" element={<Suspense fallback={<PageLoader />}><EmployerRatings /></Suspense>} />
             </Route>
           </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<PageLoader />}><AdminReports /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
              <Route path="gigs" element={<Suspense fallback={<PageLoader />}><AdminGigs /></Suspense>} />
              <Route path="lms" element={<Suspense fallback={<PageLoader />}><AdminLms /></Suspense>} />
              <Route path="disputes" element={<Suspense fallback={<PageLoader />}><AdminDisputes /></Suspense>} />
              <Route path="support" element={<Suspense fallback={<PageLoader />}><AdminSupport /></Suspense>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
